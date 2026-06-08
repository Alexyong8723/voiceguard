# ── Hugging Face Spaces Dockerfile ───────────────────────────────────────────
# Deploys the VoiceGuard Python inference API on HF Spaces (free tier).
# HF Spaces expects the app to listen on port 7860.

FROM python:3.11-slim

# Install system dependencies (ffmpeg needed by pydub for non-WAV formats)
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    libsndfile1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy and install Python dependencies first (layer caching)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy model and source files
COPY best_model2.pt .
COPY model.py .
COPY api_server.py .

# HF Spaces runs as a non-root user
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

# HF Spaces uses port 7860
EXPOSE 7860

CMD ["python", "api_server.py"]
