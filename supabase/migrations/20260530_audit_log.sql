-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: 20260530_audit_log.sql
-- Creates the audit_logs table for VoiceGuard security event tracking.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id          BIGSERIAL PRIMARY KEY,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    event       TEXT        NOT NULL,          -- e.g. 'login_success', 'login_failure', 'detect_scan'
    user_id     UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
    ip_address  TEXT,
    user_agent  TEXT,
    meta        JSONB       DEFAULT '{}'::jsonb  -- extra context (filename, label, confidence, etc.)
);

-- Index for fast lookups by user and time
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id    ON public.audit_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event      ON public.audit_logs (event);

-- ── Row Level Security ────────────────────────────────────────────────────────
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only the service role (server-side) can insert audit rows.
-- End-users cannot read, modify, or delete audit logs.
CREATE POLICY "service_role_only_insert"
    ON public.audit_logs
    FOR INSERT
    TO service_role
    WITH CHECK (true);

-- Deny all access for authenticated / anonymous users
CREATE POLICY "deny_all_users"
    ON public.audit_logs
    FOR ALL
    TO authenticated, anon
    USING (false);
