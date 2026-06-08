"""
dataset.py — Audio Deepfake Detection Dataset Loader
Supports: ASVspoof 2019 LA, In-The-Wild, and local folder structure (real/fake)
"""

import os
import random
import numpy as np
import torch
import torchaudio
from torch.utils.data import Dataset, DataLoader
import torchaudio.transforms as T


SAMPLE_RATE = 16000
MAX_DURATION_SEC = 4
MAX_SAMPLES = SAMPLE_RATE * MAX_DURATION_SEC  # 64000


# ─── Helpers ─────────────────────────────────────────────────────────────────

def load_audio(path: str, target_sr: int = SAMPLE_RATE) -> torch.Tensor:
    """Load audio file, resample to target_sr, return [1, T] mono tensor."""
    waveform, sr = torchaudio.load(path)
    if sr != target_sr:
        waveform = T.Resample(orig_freq=sr, new_freq=target_sr)(waveform)
    if waveform.shape[0] > 1:
        waveform = waveform.mean(dim=0, keepdim=True)
    return waveform  # [1, T]


def pad_or_trim(waveform: torch.Tensor, max_samples: int = MAX_SAMPLES) -> torch.Tensor:
    """
    ALWAYS return exactly [1, max_samples].
    This fixes the 'stack expects each tensor to be equal size' error.
    """
    # Ensure 2D [1, T]
    if waveform.dim() == 1:
        waveform = waveform.unsqueeze(0)

    T_len = waveform.shape[-1]

    if T_len == max_samples:
        return waveform

    elif T_len < max_samples:
        # Pad with zeros on the right
        pad = max_samples - T_len
        waveform = torch.nn.functional.pad(waveform, (0, pad))

    else:
        # Random crop — always results in exactly max_samples
        start = random.randint(0, T_len - max_samples)
        waveform = waveform[..., start: start + max_samples]

    # Final safety clamp — guarantees exact size no matter what
    waveform = waveform[..., :max_samples]
    if waveform.shape[-1] < max_samples:
        waveform = torch.nn.functional.pad(waveform, (0, max_samples - waveform.shape[-1]))

    assert waveform.shape[-1] == max_samples, \
        f"pad_or_trim failed: got {waveform.shape[-1]}, expected {max_samples}"

    return waveform  # [1, max_samples]


def compute_mel_spectrogram(waveform: torch.Tensor, sr: int = SAMPLE_RATE) -> torch.Tensor:
    """
    Compute log-Mel spectrogram for the CNN branch.
    Uses n_fft=1024 to avoid 'mel filterbank all zero values' warning.
    Returns [1, 128, T']
    """
    mel_transform = T.MelSpectrogram(
        sample_rate=sr,
        n_fft=1024,       # fixed from 512 — avoids mel filterbank warning
        hop_length=160,
        win_length=400,
        n_mels=128,
        f_min=20,
        f_max=8000,
    )
    amplitude_to_db = T.AmplitudeToDB(stype="power", top_db=80)
    mel = mel_transform(waveform)
    mel = amplitude_to_db(mel)
    mel = (mel - mel.mean()) / (mel.std() + 1e-9)
    return mel  # [1, 128, T']


# ─── Dataset classes ─────────────────────────────────────────────────────────

class FolderAudioDataset(Dataset):
    """
    Expects layout:
        root/train/real/*.flac
        root/train/fake/*.flac
        root/val/real/*.flac
        root/val/fake/*.flac
        root/test/real/*.flac
        root/test/fake/*.flac

    Labels: real=0, fake=1
    Returns: (waveform [T], mel [1,128,T'], label)
    """

    EXTENSIONS = {".wav", ".flac", ".mp3", ".ogg"}

    def __init__(self, root: str, split: str = "train", augment: bool = True):
        assert split in ("train", "val", "test")
        self.split = split
        self.augment = augment and (split == "train")

        split_dir = os.path.join(root, split)
        assert os.path.isdir(split_dir), f"Directory not found: {split_dir}"

        self.samples = []
        for label_name, label_idx in [("real", 0), ("fake", 1)]:
            label_dir = os.path.join(split_dir, label_name)
            if not os.path.isdir(label_dir):
                print(f"[WARNING] Missing: {label_dir}")
                continue
            for fname in os.listdir(label_dir):
                if os.path.splitext(fname)[1].lower() in self.EXTENSIONS:
                    self.samples.append((os.path.join(label_dir, fname), label_idx))

        print(f"[{split.upper()}] Loaded {len(self.samples)} samples "
              f"({sum(1 for _,l in self.samples if l==0)} real / "
              f"{sum(1 for _,l in self.samples if l==1)} fake)")

    def __len__(self):
        return len(self.samples)

    def _augment(self, waveform: torch.Tensor) -> torch.Tensor:
        gain = 10 ** (random.uniform(-0.3, 0.3) / 20)
        waveform = waveform * gain
        if random.random() < 0.3:
            noise = torch.randn_like(waveform) * 0.005
            waveform = waveform + noise
        return waveform.clamp(-1.0, 1.0)

    def __getitem__(self, idx):
        path, label = self.samples[idx]
        try:
            waveform = load_audio(path)           # [1, T]
            waveform = pad_or_trim(waveform)      # [1, 64000] guaranteed
            if self.augment:
                waveform = self._augment(waveform)
            mel = compute_mel_spectrogram(waveform)  # [1, 128, T']
            return waveform.squeeze(0), mel, label   # [64000], [1,128,T'], int
        except Exception as e:
            # If a file is corrupt, return silence instead of crashing
            print(f"[WARN] Error loading {path}: {e} — returning silence")
            waveform = torch.zeros(MAX_SAMPLES)
            mel = torch.zeros(1, 128, 401)
            return waveform, mel, label


class ASVspoof2019Dataset(Dataset):
    """ASVspoof 2019 LA protocol-based loader."""

    SPLIT_MAP = {
        "train": ("ASVspoof2019_LA_train", "ASVspoof2019.LA.cm.train.trn.txt"),
        "val":   ("ASVspoof2019_LA_dev",   "ASVspoof2019.LA.cm.dev.trl.txt"),
        "test":  ("ASVspoof2019_LA_eval",  "ASVspoof2019.LA.cm.eval.trl.txt"),
    }

    def __init__(self, root: str, split: str = "train", augment: bool = True):
        assert split in self.SPLIT_MAP
        self.augment = augment and (split == "train")

        audio_dir_name, protocol_name = self.SPLIT_MAP[split]
        audio_dir = os.path.join(root, "LA", audio_dir_name, "flac")
        protocol_path = os.path.join(root, "LA", "ASVspoof2019_LA_cm_protocols", protocol_name)

        self.samples = []
        with open(protocol_path, "r") as f:
            for line in f:
                parts = line.strip().split()
                audio_id = parts[1]
                label = 0 if parts[4] == "bonafide" else 1
                audio_path = os.path.join(audio_dir, audio_id + ".flac")
                if os.path.isfile(audio_path):
                    self.samples.append((audio_path, label))

        print(f"[ASVspoof2019-{split.upper()}] {len(self.samples)} samples")

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx):
        path, label = self.samples[idx]
        try:
            waveform = load_audio(path)
            waveform = pad_or_trim(waveform)
            if self.augment and random.random() < 0.5:
                gain = 10 ** (random.uniform(-0.3, 0.3) / 20)
                waveform = (waveform * gain).clamp(-1.0, 1.0)
            mel = compute_mel_spectrogram(waveform)
            return waveform.squeeze(0), mel, label
        except Exception as e:
            print(f"[WARN] Error loading {path}: {e} — returning silence")
            waveform = torch.zeros(MAX_SAMPLES)
            mel = torch.zeros(1, 128, 401)
            return waveform, mel, label


# ─── DataLoader factory ───────────────────────────────────────────────────────

def get_dataloaders(
    dataset_root: str,
    dataset_type: str = "folder",
    batch_size: int = 16,
    num_workers: int = 2,
):
    Cls = FolderAudioDataset if dataset_type == "folder" else ASVspoof2019Dataset

    train_ds = Cls(dataset_root, split="train", augment=True)
    val_ds   = Cls(dataset_root, split="val",   augment=False)
    test_ds  = Cls(dataset_root, split="test",  augment=False)

    train_loader = DataLoader(train_ds, batch_size=batch_size, shuffle=True,
                              num_workers=num_workers, pin_memory=True, drop_last=True)
    val_loader   = DataLoader(val_ds,   batch_size=batch_size, shuffle=False,
                              num_workers=num_workers, pin_memory=True)
    test_loader  = DataLoader(test_ds,  batch_size=batch_size, shuffle=False,
                              num_workers=num_workers, pin_memory=True)

    return train_loader, val_loader, test_loader
