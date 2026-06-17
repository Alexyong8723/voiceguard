-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: 20260617_educational_videos.sql
-- Creates the educational_videos table, enables RLS, sets policies, and seeds
-- initial videos.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.educational_videos (
    id          BIGSERIAL PRIMARY KEY,
    video_id    TEXT NOT NULL UNIQUE,
    title       TEXT NOT NULL,
    channel     TEXT NOT NULL,
    tag         TEXT NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for ordering by creation time
CREATE INDEX IF NOT EXISTS idx_educational_videos_created_at ON public.educational_videos (created_at DESC);

-- ── Row Level Security ────────────────────────────────────────────────────────
ALTER TABLE public.educational_videos ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to select/read educational videos
CREATE POLICY "authenticated_select_videos"
    ON public.educational_videos
    FOR SELECT
    TO authenticated
    USING (true);

-- Allow admins to perform all actions
CREATE POLICY "admin_all_actions"
    ON public.educational_videos
    FOR ALL
    TO authenticated
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

-- Trigger to update updated_at automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_educational_videos_updated_at ON public.educational_videos;
CREATE TRIGGER update_educational_videos_updated_at
BEFORE UPDATE ON public.educational_videos
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ── Seed Data ────────────────────────────────────────────────────────────────
INSERT INTO public.educational_videos (video_id, title, channel, tag) VALUES
('3x1fy6LQNKU', 'Jangan Jadi Mangsa Scam Telefon - MCMC Malaysia', 'MCMC Malaysia', '🇲🇾 Malay'),
('sQMTkJGBGxc', 'Penipuan Scam Macau - Cara Elak & Lapor', 'BNM Malaysia', '🇲🇾 Malay'),
('9Y3QGJF6tYk', 'Awas Scam - PDRM Beri Amaran Kepada Rakyat Malaysia', 'PDRM Malaysia', '🇲🇾 Malay'),
('R8nHSMnETkA', 'Skim Cepat Kaya - Kenali & Elakkan Penipuan', 'MyCC Malaysia', '🇲🇾 Malay'),
('kIkEMIj1ULc', 'Lindungi Diri Daripada Penipuan Dalam Talian', 'CyberSecurity Malaysia', '🇲🇾 Malay'),
('XqS0bBGxMjg', 'Scam Pelaburan - Bagaimana Ia Berlaku Di Malaysia', 'Astro Awani', '🇲🇾 Malay'),
('nWNOFGSMFXM', 'Waspada Panggilan Scam - Tips Keselamatan Siber', 'RTM Malaysia', '🇲🇾 Malay'),
('d2JB4UZKIB0', 'Penipuan Whatsapp & Telegram - Cara Kesan & Lapor', 'MCMC Malaysia', '🇲🇾 Malay'),
('H3aNAfG2TUI', 'Scam SMS & Panggilan Bank Palsu Di Malaysia', 'BNM Malaysia', '🇲🇾 Malay'),
('Yz7pOF4-ybk', 'Keselamatan Siber Untuk Warga Emas Malaysia', 'CyberSecurity Malaysia', '🇲🇾 Senior'),
('5DdtKsaMwkY', 'Bagaimana Penipu Menggunakan AI Klon Suara', 'Astro Awani', '🇲🇾 AI Scam'),
('vBkBS7WMDNQ', 'Laporan Khas: Scam Dalam Talian Di Malaysia 2024', 'TV3 Malaysia', '🇲🇾 Berita'),
('yJeH5P9KFmo', 'Tips Keselamatan Digital - Jangan Kongsi OTP', 'CIMB Malaysia', '🇲🇾 Banking'),
('tGLFfMC4lHM', 'Scam Melalui Panggilan Telefon - Kisah Benar', 'Bernama TV', '🇲🇾 True Story'),
('U9PY0tKxDCA', 'Cara Laporkan Scam Kepada PDRM & MCMC', 'PDRM Malaysia', '🇲🇾 Laporan'),
('Y7zNlEMDmI4', 'Voice Phishing (Vishing) - How It Works', 'Abnormal Security', 'Vishing'),
('AuYNXoSfJpg', 'What is Phishing? How to Protect Yourself', 'Simplilearn', 'Phishing'),
('GWON1dVdoMg', 'How to Spot a Scam Call Immediately', 'Scam Detector', 'Detection'),
('F7xKKMFRWMs', 'Robocall Scams and How to Stop Them', 'Consumer Reports', 'Robocall'),
('VqA6N0_WVDU', 'Bank Impersonation Scams - True Stories', 'Which? Consumer Group', 'Bank Scam'),
('u9dBGWVwMMA', 'Grandparent Scam - How It Really Works', 'AARP Fraud Watch', 'Elder Scam'),
('1EBfxNEKTyU', 'Protect Yourself from Phone Scams', 'AARP', 'Protection'),
('opRMrEfAIiI', 'How Scammers Steal Your Money (Documentary)', 'Fraud Fighter', 'Documentary'),
('M2KqoWTlBZs', 'Social Engineering Attacks Explained', 'Professor Messer', 'Tactics'),
('sdpxddDzXfE', 'Top 5 Ways Scammers Steal Your Identity', 'All Things Secured', 'Identity'),
('aO858HyFbKI', 'How AI Voice Cloning Is Used in Scams', 'CNBC', 'AI Threat'),
('KpBMJ6KLKHA', 'Deepfake Voice Scams - What You Must Know', 'CBC News', 'Deepfake'),
('sRsxFcBCy9E', 'AI-Generated Scam Calls Are Fooling Everyone', 'NBC News', 'AI Scam'),
('vGYnLTj02bE', 'How Criminals Clone Voices Using Free AI Tools', 'Sky News', 'AI Clone'),
('N1oJ53UQRJM', 'The Rise of AI Deepfake Fraud - Expert Explains', 'BBC Newsnight', 'AI Fraud'),
('QR8nSFSf5OA', 'Real Story: Family Tricked by AI Voice Clone', 'Good Morning America', 'True Story'),
('9tIAFBX5dHs', 'Cyber Security Full Course for Beginners', 'Simplilearn', 'Education'),
('inWWhr5tnEA', 'How to Protect Your Personal Data Online', 'NordVPN', 'Privacy'),
('Sa2knr2uFEY', 'What Hackers Do With Stolen Data', 'Hak5', 'Hacking'),
('3Kq1MIfTWCE', 'Two-Factor Authentication Explained Simply', 'All Things Secured', '2FA'),
('eCmKMEuNMjU', 'How to Create Strong Passwords - Beginner Guide', 'Safety Detectives', 'Passwords'),
('wTgt3QB93gs', 'Recognising Fake Websites & Phishing Links', 'Cybrary', 'Phishing'),
('XBkzBrXlle0', 'Top 10 Cybersecurity Tips for Seniors', 'AARP Technology', 'Senior'),
('OiOoNgmhRCk', 'What is Social Engineering? Simple Explanation', 'Simply Explained', 'Education'),
('V7_tJdxFjAk', 'I Got Scammed - Real Victim Story', 'CNBC Make It', 'True Story'),
('pySFMLaFnZ0', 'Inside a Scam Call Centre (Hidden Camera)', 'BBC Panorama', 'Documentary'),
('lc7scxvKQOo', 'Warning: IRS & Government Impersonation Calls', 'FTC Consumer Info', 'Gov Scam'),
('n8mbzU0X2nQ', 'How Romance Scammers Target Lonely People', 'CBC Marketplace', 'Romance Scam'),
('YjL5oPFniMs', 'The $200 Million Deepfake CFO Scam Explained', 'Tech Insider', 'Deepfake'),
('9q4KcADtWEg', 'Warning Signs Your Elderly Parent Is Being Scammed', 'Consumer Reports', 'Elder Scam'),
('OB76rKhCVf4', 'How to Talk to Elderly Parents About Scams', 'AARP', 'Senior'),
('wSxQP-UYzpA', 'Scam Awareness Week - Protect Your Family', 'Australian ACCC', 'Awareness'),
('WQe7RHBhP6o', 'What To Do Immediately If You Got Scammed', 'All Things Secured', 'Action'),
('tGSuRXLOFi0', 'How to Report a Scam - Step by Step Guide', 'FTC Consumer Info', 'Reporting'),
('lNeG-BuFOHk', 'Freezing Your Bank Account After a Scam', 'Clark Howard', 'Banking'),
('YqRNALQCBJs', 'Recovering from Identity Theft - Full Guide', 'Identity Theft Resource', 'Recovery')
ON CONFLICT (video_id) DO NOTHING;
