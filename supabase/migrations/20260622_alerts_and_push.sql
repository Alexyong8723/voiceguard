-- Migration: 20260622_alerts_and_push.sql
-- Creates the alerts table for admin management and push_subscriptions for notifications

-- ── 1. Alerts Table ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.alerts (
    id            BIGSERIAL PRIMARY KEY,
    type          TEXT NOT NULL CHECK (type IN ('critical', 'warning', 'trend', 'info', 'tip')),
    title         TEXT NOT NULL,
    body          TEXT NOT NULL,
    source        TEXT NOT NULL,
    region        TEXT NOT NULL,
    category      TEXT,
    action_label  TEXT,
    action_url    TEXT,
    is_new        BOOLEAN NOT NULL DEFAULT true,
    tags          TEXT[],
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON public.alerts (created_at DESC);

ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_select_alerts"
    ON public.alerts FOR SELECT TO public USING (true);

CREATE POLICY "admin_all_actions_alerts"
    ON public.alerts FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

DROP TRIGGER IF EXISTS update_alerts_updated_at ON public.alerts;
CREATE TRIGGER update_alerts_updated_at
BEFORE UPDATE ON public.alerts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Seed initial data
INSERT INTO public.alerts (type, title, body, source, region, category, action_label, action_url, is_new, tags) VALUES
('critical', 'Macau Scam Surge — PDRM Issues Nationwide Alert', 'Malaysian police report a 43% surge in Macau scam calls in 2025. Callers impersonate PDRM officers claiming your MyKad is linked to money laundering, demanding urgent fund transfers to a "safe account". Over RM 18 million lost in three months.', 'PDRM Cyber Forensics', 'MY', 'scam', 'Report to PDRM', 'tel:999', true, ARRAY['macau-scam', 'pdrm', 'vishing']),
('critical', 'AI Voice Cloning Scam — Family Members Being Impersonated', 'Cybercriminals use free AI tools to clone voices of relatives from social media audio. Victims receive distress calls in a family member''s voice demanding emergency money transfers. Always call back on the person''s known number before sending any money.', 'CyberSecurity Malaysia', 'MY', 'ai', 'Learn More', '/awareness', true, ARRAY['voice-cloning', 'ai', 'deepfake']),
('warning', 'Bank Negara Malaysia: Spoofed BNM Numbers Being Used', 'Fraudsters are spoofing Bank Negara Malaysia''s official number (+603-2698-8044) to trick victims into revealing banking credentials. BNM confirms they will NEVER call asking for account numbers, PINs, or OTPs. Hang up immediately.', 'Bank Negara Malaysia', 'MY', 'vishing', 'Call BNM LINK', 'tel:1300885465', false, ARRAY['bnm', 'spoofing', 'banking']),
('trend', 'Romance Scams Up 67% — Targeting Adults Over 50', 'PDRM data shows romance scams increased 67% in 2024, with individuals aged 50+ being the primary targets. Scammers build emotional relationships over weeks before requesting money for "emergencies". Total losses exceeded RM 95 million in 2024.', 'PDRM Commercial Crime', 'MY', 'scam', NULL, NULL, false, ARRAY['romance-scam', 'seniors', 'trend']),
('tip', 'Safety Tip: Establish a Family Code Word Today', 'The most effective defence against AI voice cloning is a pre-agreed secret code word with close family members. If anyone calls claiming to be a relative in distress, ask for the code word. If they cannot say it, treat the call as a scam and hang up immediately.', 'VoiceGuard Safety Tips', 'Global', 'tip', NULL, NULL, false, ARRAY['family', 'code-word', 'voice-cloning']);


-- ── 2. Push Subscriptions Table ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.push_subscriptions (
    id          BIGSERIAL PRIMARY KEY,
    endpoint    TEXT UNIQUE NOT NULL,
    p256dh      TEXT NOT NULL,
    auth        TEXT NOT NULL,
    user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_push_sub_user ON public.push_subscriptions (user_id);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_insert_push"
    ON public.push_subscriptions FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "public_select_push"
    ON public.push_subscriptions FOR SELECT TO public USING (true);

CREATE POLICY "public_update_push"
    ON public.push_subscriptions FOR UPDATE TO public USING (true) WITH CHECK (true);

CREATE POLICY "public_delete_push"
    ON public.push_subscriptions FOR DELETE TO public USING (true);

CREATE POLICY "admin_all_actions_push"
    ON public.push_subscriptions FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

DROP TRIGGER IF EXISTS update_push_subscriptions_updated_at ON public.push_subscriptions;
CREATE TRIGGER update_push_subscriptions_updated_at
BEFORE UPDATE ON public.push_subscriptions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
