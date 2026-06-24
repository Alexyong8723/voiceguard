# VoiceGuard

VoiceGuard is a full-stack web application designed for deepfake audio detection. It provides a secure, user-friendly interface to upload audio files and analyze them using an advanced machine learning model to determine if the audio is REAL or FAKE.

## System Architecture

VoiceGuard operates on a dual-backend architecture:

1. **Next.js Web Application (Frontend & API)**:
   - Handles the user interface, routing, and state management using the App Router.
   - Manages user authentication, authorization, and database interactions securely via Supabase.
   - Provides features like a user dashboard, push notifications, an admin panel, and Multi-Factor Authentication (MFA).

2. **Python Inference API (FastAPI Backend)**:
   - A dedicated Python microservice (`api_server.py`) that hosts a trained PyTorch model (`best_model2.pt`).
   - Exposes a `/predict` endpoint that processes audio files (converting them to log-Mel spectrograms) and returns a deepfake probability score.
   - Protected by an internal shared secret to ensure it only accepts requests proxied securely from the Next.js backend.

## Key Features

- **Deepfake Audio Detection**: Upload audio files (WAV, MP3, FLAC, M4A, etc.) to receive an instant REAL/FAKE confidence score.
- **Secure Authentication**: Powered by Supabase, including Email/Password login, Multi-Factor Authentication (MFA), and secure password resets.
- **User Dashboard**: Track past detections and monitor personal activity.
- **Alerts & Push Notifications**: Integrated Web Push notifications to alert users of security events or suspicious audio.
- **Admin Panel**: Role-based access control (RBAC) allowing administrators to monitor system usage, audit logs, and manage the platform.
- **Awareness Center**: Educational resources to help users understand deepfakes and audio security.

## Technology Stack

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS v4
- **Web Backend**: Next.js Server Actions & Route Handlers, Node.js
- **ML Backend**: Python, FastAPI, PyTorch, Librosa, Pydub
- **Database & Auth**: Supabase (PostgreSQL, Supabase SSR Auth)
- **Emails & Notifications**: Web-Push, Resend, Nodemailer

## Getting Started & Running the System

Please refer to the detailed, step-by-step instructions in [how_to_run.md](./how_to_run.md).

### Quick Start Summary

1. Install Python dependencies:
   ```bash
   pip install fastapi uvicorn python-multipart torch transformers librosa pydub
   ```
2. Install Node.js dependencies:
   ```bash
   npm install
   ```
3. Run both servers concurrently using PowerShell:
   ```powershell
   $env:VOICEGUARD_INTERNAL_SECRET = "vg_a3f8d92c1e4b7056f3a21d8e9c0b5472f6d1e3a8c2b9f7d4e0a5c8b3f1e6d2"
   npx concurrently "python api_server.py" "npm run dev"
   ```

## Key Directory Structure

- `/src/app/` - Next.js frontend pages and API routes (`/dashboard`, `/admin`, `/auth`, etc.).
- `api_server.py` - FastAPI entry point for the PyTorch inference server.
- `model.py` / `inference.py` - ML model definitions and audio processing logic.
- `best_model2.pt` - The trained PyTorch model weights.
- `/supabase/` - Database migrations and schema definitions for Supabase.
