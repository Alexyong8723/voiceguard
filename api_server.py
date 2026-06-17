"""
api_server.py — VoiceGuard Python Inference API
===============================================
Exposes the trained deepfake-audio model (best_model2.pt) over HTTP so
the Next.js app can call it via a proxy route.

Usage:
    pip install fastapi uvicorn python-multipart torch transformers librosa pydub
    python api_server.py

Endpoints:
    GET  /health          — liveness check
    POST /predict         — accepts an audio file, returns REAL/FAKE prediction
"""

import io
import os
import tempfile
import traceback
import secrets

import numpy as np
import torch
import uvicorn
from fastapi import FastAPI, File, UploadFile, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# ─── Import model & helpers ───────────────────────────────────────────────────
# We reuse the same model definition file so there is no duplication.
from model import VoiceGuardDualBranch  # noqa: E402 (model.py in same dir)

# ─── Device ───────────────────────────────────────────────────────────────────
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
print(f"[api_server] Using device: {DEVICE}", flush=True)

# ─── Internal token (shared secret between Next.js and Python) ────────────────
# Set VOICEGUARD_INTERNAL_SECRET in your environment.
# The Next.js proxy sends this as X-Internal-Token on every request.
_INTERNAL_SECRET = os.environ.get("VOICEGUARD_INTERNAL_SECRET", "")
if not _INTERNAL_SECRET:
    print("[api_server] WARNING: VOICEGUARD_INTERNAL_SECRET is not set -- /predict and /health are DISABLED.", flush=True)
else:
    print("[api_server] Internal token configured OK", flush=True)


def verify_internal_token(request: Request):
    """
    FastAPI dependency: reject requests that don't carry the correct
    X-Internal-Token header. Returns HTTP 403 on mismatch.
    """
    if not _INTERNAL_SECRET:
        raise HTTPException(
            status_code=503,
            detail="API is not configured (missing VOICEGUARD_INTERNAL_SECRET). Contact the administrator.",
        )
    token = request.headers.get("X-Internal-Token", "")
    # Use constant-time comparison to prevent timing attacks
    if not secrets.compare_digest(token.encode(), _INTERNAL_SECRET.encode()):
        raise HTTPException(status_code=403, detail="Forbidden: invalid internal token.")


# ─── Load model once at startup ───────────────────────────────────────────────
MODEL_PATH = os.path.join(os.path.dirname(__file__), "best_model2.pt")

print(f"[api_server] Loading model from: {MODEL_PATH}", flush=True)
_model = VoiceGuardDualBranch(embed_dim=256).to(DEVICE)
_checkpoint = torch.load(MODEL_PATH, map_location=DEVICE)
if "model_state" in _checkpoint:
    _model.load_state_dict(_checkpoint["model_state"])
else:
    _model.load_state_dict(_checkpoint)
_model.eval()
print("[api_server] Model loaded OK", flush=True)

# ─── Audio processing settings ────────────────────────────────────────────────
SR = 16_000        # sample rate expected by the model
MAX_LEN_SEC = 5    # seconds (same as inference.py)
MAX_SAMPLES = SR * MAX_LEN_SEC

# ─── Audio helpers (mirrors inference.py but uses pydub for broad format support) ──

def _load_audio_bytes(data: bytes, suffix: str) -> np.ndarray:
    """
    Accept raw audio bytes (any format pydub/ffmpeg supports),
    return a float32 numpy array at 16 kHz mono, length == MAX_SAMPLES.
    """
    # Try pydub first (handles WAV, MP3, FLAC, M4A, OGG …)
    try:
        from pydub import AudioSegment

        with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
            tmp.write(data)
            tmp_path = tmp.name

        try:
            audio = AudioSegment.from_file(tmp_path)
        finally:
            os.unlink(tmp_path)

        audio = audio.set_frame_rate(SR).set_channels(1)
        samples = np.array(audio.get_array_of_samples()).astype(np.float32)

    except Exception:
        # Fallback: try scipy/soundfile for WAV
        import soundfile as sf
        samples, orig_sr = sf.read(io.BytesIO(data))
        if samples.ndim > 1:
            samples = samples.mean(axis=1)
        samples = samples.astype(np.float32)
        if orig_sr != SR:
            # simple linear resample (good enough for power-of-2 ratios)
            import librosa
            samples = librosa.resample(samples, orig_sr=orig_sr, target_sr=SR)

    # Normalise
    max_val = np.abs(samples).max()
    if max_val > 0:
        samples = samples / max_val

    # Pad or trim to exactly MAX_SAMPLES
    if len(samples) >= MAX_SAMPLES:
        samples = samples[:MAX_SAMPLES]
    else:
        samples = np.pad(samples, (0, MAX_SAMPLES - len(samples)))

    return samples


def _make_mel(samples: np.ndarray) -> np.ndarray:
    """Compute log-Mel spectrogram identical to inference.py."""
    import librosa

    mel = librosa.feature.melspectrogram(
        y=samples,
        sr=SR,
        n_mels=128,
        n_fft=1024,
        hop_length=512,
    )
    mel = librosa.power_to_db(mel, ref=np.max)
    mel = (mel - mel.mean()) / (mel.std() + 1e-6)
    return mel


# ─── FastAPI app ──────────────────────────────────────────────────────────────
app = FastAPI(
    title="VoiceGuard Inference API",
    description="Deepfake audio detection — returns REAL/FAKE label + confidence.",
    version="1.0.0",
)

# Allow calls from local dev server and any deployed Vercel/HTTPS origin.
# VOICEGUARD_ALLOWED_ORIGINS env var can be a comma-separated list of
# additional origins (e.g. "https://voiceguard.vercel.app").
_extra_origins = [
    o.strip()
    for o in os.environ.get("VOICEGUARD_ALLOWED_ORIGINS", "").split(",")
    if o.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        *_extra_origins,
    ],
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


class PredictResponse(BaseModel):
    label: str           # "REAL" or "FAKE"
    confidence: float    # 0.0 – 1.0
    real_prob: float
    fake_prob: float
    device: str


@app.get("/health")
async def health(_: None = Depends(verify_internal_token)):
    return {"status": "ok", "device": DEVICE, "model": "VoiceGuardDualBranch"}


@app.post("/predict", response_model=PredictResponse)
async def predict(file: UploadFile = File(...), _: None = Depends(verify_internal_token)):
    """
    Accept an audio file and return a deepfake prediction.

    Supported formats: WAV, FLAC, MP3, M4A, OGG (requires FFmpeg for non-WAV).
    """
    content_type = file.content_type or ""
    filename = file.filename or "audio.wav"
    suffix = os.path.splitext(filename)[-1].lower()

    # Derive suffix from content-type when the filename has no extension
    # (common with browser Blob uploads from MediaRecorder)
    if not suffix:
        _ct_to_ext = {
            "audio/webm": ".webm",
            "audio/ogg":  ".ogg",
            "audio/wav":  ".wav",
            "audio/wave": ".wav",
            "audio/mpeg": ".mp3",
            "audio/mp4":  ".m4a",
            "audio/flac": ".flac",
        }
        # strip codec params: "audio/webm;codecs=opus" → "audio/webm"
        base_ct = content_type.split(";")[0].strip().lower()
        suffix = _ct_to_ext.get(base_ct, ".webm")  # default to webm for unknown audio/*


    # Accept any audio/* MIME type (including audio/webm;codecs=opus from MediaRecorder)
    # and empty content-type (common with blob/fetch uploads).
    if content_type and not content_type.startswith("audio/") and content_type != "application/octet-stream":
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported media type: {content_type}. "
                   "Please upload WAV, FLAC, MP3, M4A, OGG, or WebM audio.",
        )

    raw_bytes = await file.read()
    if len(raw_bytes) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    # Max file size: 50 MB
    if len(raw_bytes) > 50 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File too large (max 50 MB).")

    try:
        samples = _load_audio_bytes(raw_bytes, suffix)
    except Exception as exc:
        traceback.print_exc()
        raise HTTPException(
            status_code=422,
            detail=f"Could not decode audio: {exc}. "
                   "Ensure FFmpeg is installed for non-WAV formats.",
        )

    try:
        # Build tensors
        waveform = torch.tensor(samples).float().unsqueeze(0).to(DEVICE)   # [1, T]
        mel_arr  = _make_mel(samples)
        mel      = torch.tensor(mel_arr).float().unsqueeze(0).unsqueeze(0).to(DEVICE)  # [1, 1, 128, T']

        with torch.no_grad():
            logits = _model(waveform, mel)
            probs  = torch.softmax(logits, dim=-1).cpu().numpy()[0]

        pred       = int(np.argmax(probs))
        confidence = float(probs[pred])
        real_prob  = float(probs[0])
        fake_prob  = float(probs[1])
        label      = "FAKE" if pred == 1 else "REAL"

        print(f"[api_server] {filename!r:30s} → {label}  "
              f"(real={real_prob:.3f}, fake={fake_prob:.3f})")

        return PredictResponse(
            label=label,
            confidence=confidence,
            real_prob=real_prob,
            fake_prob=fake_prob,
            device=DEVICE,
        )

    except Exception as exc:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Inference error: {exc}")


# ─── Entry point ──────────────────────────────────────────────────────────────
if __name__ == "__main__":
    # Port 8000 is the default expected by Next.js.
    # Override with the PORT env var if your host requires a different port.
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(
        "api_server:app",
        host="0.0.0.0",   # bind to all interfaces for cloud deployment
        port=port,
        reload=False,
        log_level="info",
    )
