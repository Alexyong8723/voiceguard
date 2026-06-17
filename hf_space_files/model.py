"""
model.py — Dual-Branch Deepfake Audio Detection Model
Branch 1: Wav2Vec2.0 (pretrained feature extractor, fine-tuned)
Branch 2: CNN on Log-Mel Spectrogram (from scratch)
Fusion: Concatenation → MLP head
"""

import torch
import torch.nn as nn
import torch.nn.functional as F
from transformers import Wav2Vec2Model


# ─── CNN Spectrogram Branch ───────────────────────────────────────────────────

class ResidualBlock(nn.Module):
    """Basic 2-D residual block for the CNN branch."""

    def __init__(self, in_ch: int, out_ch: int, stride: int = 1):
        super().__init__()
        self.conv1 = nn.Conv2d(in_ch, out_ch, 3, stride=stride, padding=1, bias=False)
        self.bn1   = nn.BatchNorm2d(out_ch)
        self.conv2 = nn.Conv2d(out_ch, out_ch, 3, padding=1, bias=False)
        self.bn2   = nn.BatchNorm2d(out_ch)
        self.relu  = nn.ReLU(inplace=True)

        self.skip = nn.Sequential()
        if stride != 1 or in_ch != out_ch:
            self.skip = nn.Sequential(
                nn.Conv2d(in_ch, out_ch, 1, stride=stride, bias=False),
                nn.BatchNorm2d(out_ch),
            )

    def forward(self, x):
        out = self.relu(self.bn1(self.conv1(x)))
        out = self.bn2(self.conv2(out))
        return self.relu(out + self.skip(x))


class CNNSpectrogramBranch(nn.Module):
    """
    Input:  [B, 1, 128, T]  — log-Mel spectrogram
    Output: [B, embed_dim]
    """

    def __init__(self, embed_dim: int = 256):
        super().__init__()
        self.stem = nn.Sequential(
            nn.Conv2d(1, 32, kernel_size=7, stride=2, padding=3, bias=False),
            nn.BatchNorm2d(32),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(3, stride=2, padding=1),
        )
        self.layer1 = ResidualBlock(32,  64,  stride=2)
        self.layer2 = ResidualBlock(64,  128, stride=2)
        self.layer3 = ResidualBlock(128, 256, stride=2)
        self.pool   = nn.AdaptiveAvgPool2d((1, 1))
        self.proj   = nn.Linear(256, embed_dim)

    def forward(self, mel: torch.Tensor) -> torch.Tensor:
        x = self.stem(mel)        # [B, 32, H/4, W/4]
        x = self.layer1(x)
        x = self.layer2(x)
        x = self.layer3(x)
        x = self.pool(x)          # [B, 256, 1, 1]
        x = x.flatten(1)          # [B, 256]
        return self.proj(x)       # [B, embed_dim]


# ─── Wav2Vec2 Branch ──────────────────────────────────────────────────────────

class Wav2Vec2Branch(nn.Module):
    """
    Input:  [B, T]   — raw waveform at 16 kHz (T = 64000 for 4 s)
    Output: [B, embed_dim]

    We freeze the convolutional feature extractor (bottom 7 conv layers)
    and fine-tune the transformer layers.
    """

    MODEL_NAME = "facebook/wav2vec2-base"  # ~95 M params; swap to -large for more power

    def __init__(self, embed_dim: int = 256, freeze_feature_extractor: bool = True):
        super().__init__()
        self.wav2vec2 = Wav2Vec2Model.from_pretrained(self.MODEL_NAME)

        # Freeze the CNN feature extractor to save GPU memory
        if freeze_feature_extractor:
            for param in self.wav2vec2.feature_extractor.parameters():
                param.requires_grad = False

        hidden_size = self.wav2vec2.config.hidden_size  # 768 for base
        self.proj = nn.Sequential(
            nn.Linear(hidden_size, embed_dim),
            nn.GELU(),
        )

    def forward(self, waveform: torch.Tensor) -> torch.Tensor:
        # wav2vec2 expects normalised float32 waveform
        outputs = self.wav2vec2(waveform)       # outputs.last_hidden_state: [B, L, 768]
        hidden  = outputs.last_hidden_state     # [B, L, 768]
        pooled  = hidden.mean(dim=1)            # [B, 768]  temporal average pooling
        return self.proj(pooled)                # [B, embed_dim]


# ─── Fusion Head ─────────────────────────────────────────────────────────────

class FusionHead(nn.Module):
    """Concatenate both branches → MLP → 2-class output."""

    def __init__(self, embed_dim: int = 256, num_classes: int = 2, dropout: float = 0.3):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(embed_dim * 2, 256),
            nn.GELU(),
            nn.Dropout(dropout),
            nn.Linear(256, 128),
            nn.GELU(),
            nn.Dropout(dropout),
            nn.Linear(128, num_classes),
        )

    def forward(self, feat_w2v: torch.Tensor, feat_cnn: torch.Tensor) -> torch.Tensor:
        x = torch.cat([feat_w2v, feat_cnn], dim=-1)  # [B, 512]
        return self.net(x)                            # [B, 2]


# ─── Full Model ───────────────────────────────────────────────────────────────

class VoiceGuardDualBranch(nn.Module):
    """
    Dual-branch model:
      - Wav2Vec2.0 on raw waveform
      - CNN on log-Mel spectrogram
    Fused with a small MLP head for binary classification (real=0, fake=1).
    """

    def __init__(
        self,
        embed_dim: int = 256,
        dropout: float = 0.3,
        freeze_w2v_cnn: bool = True,
    ):
        super().__init__()
        self.wav2vec_branch = Wav2Vec2Branch(embed_dim=embed_dim,
                                             freeze_feature_extractor=freeze_w2v_cnn)
        self.cnn_branch     = CNNSpectrogramBranch(embed_dim=embed_dim)
        self.fusion         = FusionHead(embed_dim=embed_dim, dropout=dropout)

    def forward(self, waveform: torch.Tensor, mel: torch.Tensor) -> torch.Tensor:
        """
        waveform : [B, T]         raw audio
        mel      : [B, 1, 128, T] log-Mel spectrogram
        returns  : [B, 2]         logits
        """
        feat_w2v = self.wav2vec_branch(waveform)  # [B, embed_dim]
        feat_cnn = self.cnn_branch(mel)            # [B, embed_dim]
        return self.fusion(feat_w2v, feat_cnn)     # [B, 2]

    def predict(self, waveform: torch.Tensor, mel: torch.Tensor):
        """Returns (label, confidence)."""
        with torch.no_grad():
            logits = self.forward(waveform, mel)
            probs  = torch.softmax(logits, dim=-1)
            conf, pred = probs.max(dim=-1)
        return pred, conf


if __name__ == "__main__":
    # Quick sanity-check (runs without GPU)
    model = VoiceGuardDualBranch(embed_dim=128)
    model.eval()

    B, T, n_mels, T_frames = 2, 64000, 128, 251
    dummy_wav = torch.randn(B, T)
    dummy_mel = torch.randn(B, 1, n_mels, T_frames)

    out = model(dummy_wav, dummy_mel)
    print("Output shape:", out.shape)   # [2, 2]
    print("Model parameters: {:,}".format(sum(p.numel() for p in model.parameters())))
