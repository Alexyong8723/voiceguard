import torch
import numpy as np
from pydub import AudioSegment
from model import VoiceGuardDualBranch

# =====================================================
# DEVICE
# =====================================================

device = "cuda" if torch.cuda.is_available() else "cpu"

# =====================================================
# LOAD MODEL
# =====================================================

model = VoiceGuardDualBranch(embed_dim=256).to(device)

checkpoint = torch.load("best_model2.pt", map_location=device)

if "model_state" in checkpoint:
    model.load_state_dict(checkpoint["model_state"])
else:
    model.load_state_dict(checkpoint)

model.eval()

print("Model loaded ✓")

# =====================================================
# SETTINGS
# =====================================================

SR = 16000
MAX_LEN = 5  # seconds

# =====================================================
# AUDIO LOADER (M4A SAFE - FFmpeg REQUIRED)
# =====================================================

def load_audio(path):

    audio = AudioSegment.from_file(path)  # works for m4a, mp3, wav, flac

    # convert to mono + resample
    audio = audio.set_frame_rate(SR).set_channels(1)

    samples = np.array(audio.get_array_of_samples()).astype(np.float32)

    # normalize
    max_val = np.max(np.abs(samples))
    if max_val > 0:
        samples = samples / max_val

    max_samples = SR * MAX_LEN

    # trim or pad
    if len(samples) > max_samples:
        samples = samples[:max_samples]
    else:
        samples = np.pad(samples, (0, max_samples - len(samples)))

    return samples

# =====================================================
# MEL SPECTROGRAM
# =====================================================

import librosa

def make_mel(audio):

    mel = librosa.feature.melspectrogram(
        y=audio,
        sr=SR,
        n_mels=128,
        n_fft=1024,
        hop_length=512
    )

    mel = librosa.power_to_db(mel, ref=np.max)

    mel = (mel - mel.mean()) / (mel.std() + 1e-6)

    return mel

# =====================================================
# PREDICTION
# =====================================================

def predict(audio_path):

    audio = load_audio(audio_path)

    # waveform input
    waveform = torch.tensor(audio).float().unsqueeze(0).to(device)

    # mel input
    mel = make_mel(audio)
    mel = torch.tensor(mel).float().unsqueeze(0).unsqueeze(0).to(device)

    with torch.no_grad():
        logits = model(waveform, mel)
        probs = torch.softmax(logits, dim=-1)

    probs = probs.cpu().numpy()[0]

    pred = np.argmax(probs)
    confidence = probs[pred]

    label = "FAKE ❌" if pred == 1 else "REAL ✅"

    print("\n======================")
    print(f"Audio      : {audio_path}")
    print("======================")
    print(f"Prediction : {label}")
    print(f"Confidence : {confidence:.4f}")
    print(f"REAL prob  : {probs[0]:.4f}")
    print(f"FAKE prob  : {probs[1]:.4f}")

# =====================================================
# RUN TEST
# =====================================================

predict("LA_T_9983869.flac")