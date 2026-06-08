import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy — VoiceGuard',
  description: 'Learn how VoiceGuard collects, uses, and protects your personal data in compliance with the Malaysian PDPA and global privacy standards.',
}

const SECTIONS = [
  {
    id: '1',
    title: '1. Introduction & Who We Are',
    body: [
      'VoiceGuard ("we", "us", "our") is a cybersecurity awareness and voice scam detection platform developed in Malaysia. We are committed to protecting your personal data and respecting your privacy.',
      'This Privacy Policy explains how we collect, use, disclose, and safeguard your personal information when you use the VoiceGuard platform, in accordance with the Malaysian Personal Data Protection Act 2010 (PDPA) and other applicable laws.',
      'If you have any questions about this policy, please contact us at support@voiceguard.my before using the Platform.',
    ],
  },
  {
    id: '2',
    title: '2. Information We Collect',
    body: [
      'We collect the following categories of personal data:',
      '**Account Information**\n• Full name (provided during registration)\n• Email address\n• Encrypted password (stored via Supabase Auth — we never see your plain-text password)',
      '**Usage & Activity Data**\n• Quiz answers and scores\n• Safety points and level progress\n• Features accessed and pages visited\n• Timestamps of logins and actions',
      '**User-Provided Content**\n• Voice recordings submitted to the Voice Detector feature\n• Trusted Contact names and phone numbers you voluntarily add\n• Feedback or support messages you send us',
      '**Technical Data**\n• IP address (collected for rate limiting, fraud prevention, and audit logging)\n• Browser type and operating system (from request headers)\n• Device type and screen resolution (approximate, from browser)\n• Cookies and session tokens required for authentication',
      'We do NOT collect: national ID numbers, financial account details, biometric data beyond submitted voice recordings, or location data beyond country-level inference from IP address.',
    ],
  },
  {
    id: '3',
    title: '3. How We Use Your Information',
    body: [
      'We use your personal data for the following purposes, in accordance with PDPA requirements:',
      '**Service Delivery**\n• To authenticate your identity and maintain your session\n• To deliver quiz questions, track your progress, and award Safety Points\n• To process voice recordings through our AI model for scam detection\n• To display news, alerts, and educational content personalised to your preferences',
      '**Safety & Security**\n• To detect and prevent fraud, abuse, and unauthorised access\n• To rate-limit login attempts and block brute-force attacks\n• To maintain audit logs of critical security events',
      '**Service Improvement**\n• To understand which features are used most (aggregate, anonymised analytics)\n• To improve the accuracy of our AI scam detection model using anonymised data\n• To identify and fix bugs and performance issues',
      '**Communications**\n• To send account-related emails (e.g. email verification, password reset)\n• To notify you of significant changes to our Terms or Privacy Policy',
      'We do NOT use your data for advertising, profiling for commercial purposes, or selling to third parties.',
    ],
  },
  {
    id: '4',
    title: '4. Legal Basis for Processing',
    body: [
      'Under the Malaysian PDPA, we process your personal data under the following grounds:',
      '• **Contractual Necessity**: Processing your account data, quiz history, and trusted contacts is necessary to provide the service you registered for.\n• **Legitimate Interests**: Processing IP addresses and technical logs to ensure platform security and fraud prevention.\n• **Consent**: Processing usage analytics and anonymised quiz data, which you can withdraw at any time via Settings.\n• **Legal Obligation**: Retaining certain records where required by Malaysian law.',
    ],
  },
  {
    id: '5',
    title: '5. Voice Recording Data',
    body: [
      'The Voice Detector feature processes audio you submit for the purpose of detecting potential voice scam characteristics.',
      'Voice recordings are transmitted securely (HTTPS/TLS) to our inference server for analysis. The result (a probability score) is returned to you. Recordings are processed in memory and are NOT persistently stored on our servers after the analysis is complete.',
      'We do not use your voice recordings to build voice profiles or for any purpose other than providing you with the detection result for that specific submission.',
      'By submitting a voice recording, you consent to this temporary processing. If you do not wish to submit audio, you may use all other features of VoiceGuard without the Voice Detector.',
    ],
  },
  {
    id: '6',
    title: '6. Cookies & Session Tokens',
    body: [
      'VoiceGuard uses the following types of cookies and storage:',
      '**Strictly Necessary Cookies**\n• Supabase authentication session cookies — required to keep you logged in. Without these, you cannot use authenticated features. These cannot be disabled.',
      '**Local Storage**\n• `vg_settings` — stores your display and notification preferences locally in your browser. This data never leaves your device.',
      'We do NOT use advertising cookies, cross-site tracking cookies, or third-party analytics cookies (e.g. Google Analytics) without explicit consent.',
      'You can clear cookies and local storage at any time via your browser settings. Clearing authentication cookies will log you out.',
    ],
  },
  {
    id: '7',
    title: '7. Data Sharing & Disclosure',
    body: [
      'We do not sell, rent, or trade your personal data to any third party.',
      'We share data only in the following limited circumstances:',
      '**Service Providers (Data Processors)**\n• Supabase Inc. — provides our database, authentication, and storage infrastructure. Your data is stored in Supabase\'s infrastructure under their DPA and security standards.\n• Groq Inc. / Google (Gemini API) — receives anonymised text prompts for AI content generation. No personally identifiable information is included in these prompts.\n• NewsAPI — receives no personal data; used only to fetch public news articles.\n• YouTube — video embeds are loaded from YouTube. YouTube\'s privacy policy applies when you interact with embedded videos.',
      '**Legal Requirements**\n• We may disclose your data if required by Malaysian law, court order, or government authority — for example, under the Communications and Multimedia Act 1998 or PDPA enforcement.',
      '**Business Transfers**\n• In the event of a merger, acquisition, or asset sale, your data may be transferred as part of that transaction. We will notify you via the Platform and give you the opportunity to delete your account before such a transfer.',
    ],
  },
  {
    id: '8',
    title: '8. Data Retention',
    body: [
      'We retain your personal data for as long as your account is active or as needed to provide you with the service.',
      'Specific retention periods:',
      '• **Account data** (name, email, password hash): Retained until you delete your account.\n• **Quiz scores and points**: Retained until you delete your account.\n• **Trusted contacts**: Retained until you manually delete them or delete your account.\n• **Security audit logs** (login events, IP addresses): Retained for 90 days for fraud prevention purposes.\n• **Voice recordings**: Not persistently retained — deleted after each analysis session.\n• **Anonymised analytics**: May be retained indefinitely in aggregated, non-identifiable form.',
      'When you delete your account via Settings, we will permanently delete your personally identifiable data within 30 days, except where retention is required by law.',
    ],
  },
  {
    id: '9',
    title: '9. Data Security',
    body: [
      'We implement appropriate technical and organisational measures to protect your personal data against unauthorised access, disclosure, alteration, and destruction:',
      '• **Encryption in transit**: All data transmitted between your browser and our servers is encrypted using TLS 1.2 or higher (HTTPS).\n• **Encryption at rest**: Database contents are encrypted at rest by Supabase\'s infrastructure.\n• **Password security**: Passwords are hashed using bcrypt and are never stored in plain text.\n• **Access control**: Database access is restricted via Row Level Security (RLS) policies — users can only access their own data.\n• **Rate limiting**: Login attempts are rate-limited per IP address to prevent brute-force attacks.\n• **Audit logging**: All security-sensitive actions (login, logout, signup, password reset) are logged with timestamps and IP addresses.',
      'While we take all reasonable steps to protect your data, no method of transmission over the internet or electronic storage is 100% secure. We cannot guarantee absolute security.',
    ],
  },
  {
    id: '10',
    title: '10. Your Rights Under PDPA',
    body: [
      'Under the Malaysian Personal Data Protection Act 2010, you have the following rights:',
      '• **Right of Access**: You may request a copy of the personal data we hold about you.\n• **Right of Correction**: You may request correction of inaccurate or incomplete data.\n• **Right to Withdraw Consent**: Where processing is based on consent (e.g. analytics), you may withdraw consent at any time via Settings.\n• **Right to Limit Processing**: You may request that we restrict the processing of your data in certain circumstances.\n• **Right to Erasure**: You may delete your account and associated data at any time via the Settings panel.',
      'To exercise any of the above rights (other than account deletion, which is self-serve), please contact us at support@voiceguard.my with the subject line "PDPA Data Request". We will respond within 21 days as required by the PDPA.',
      'You also have the right to lodge a complaint with the Personal Data Protection Commissioner of Malaysia if you believe your data has been processed unlawfully.',
    ],
  },
  {
    id: '11',
    title: '11. Children\'s Privacy',
    body: [
      'VoiceGuard is not directed at children under the age of 13. We do not knowingly collect personal data from children under 13.',
      'If you are between 13 and 18 years old, you should use VoiceGuard only with the knowledge and consent of your parent or legal guardian.',
      'If we become aware that we have inadvertently collected personal data from a child under 13, we will promptly delete that data. If you believe we may have collected data from a child under 13, please contact us immediately at support@voiceguard.my.',
    ],
  },
  {
    id: '12',
    title: '12. International Data Transfers',
    body: [
      'VoiceGuard is operated from Malaysia. Your data may be processed on servers located in other countries (for example, Supabase infrastructure may be hosted in the United States or Singapore) where data protection laws may differ from those in Malaysia.',
      'Where we transfer data internationally, we do so only to service providers who have committed to adequate data protection standards through Data Processing Agreements (DPAs) or equivalent contractual safeguards.',
      'By using VoiceGuard, you consent to the transfer of your data to these countries as described in this Policy.',
    ],
  },
  {
    id: '13',
    title: '13. Third-Party Links & Integrations',
    body: [
      'VoiceGuard may contain links to external websites and embed content from third-party services (e.g. YouTube videos). This Privacy Policy does not apply to those external sites.',
      'We encourage you to review the privacy policies of any third-party services you interact with through VoiceGuard, including:',
      '• Google Privacy Policy: https://policies.google.com/privacy\n• Supabase Privacy Policy: https://supabase.com/privacy\n• YouTube Privacy Policy: https://www.youtube.com/howyoutubeworks/user-settings/privacy/',
    ],
  },
  {
    id: '14',
    title: '14. Changes to This Privacy Policy',
    body: [
      'We may update this Privacy Policy from time to time to reflect changes in our practices, technology, or legal requirements. We will notify you of material changes by:',
      '• Updating the "Last Updated" date at the top of this page\n• Displaying a notification within the Platform\n• Sending an email notification for significant changes that affect your rights',
      'Your continued use of VoiceGuard after the effective date of the revised Policy constitutes your acceptance of those changes.',
    ],
  },
  {
    id: '15',
    title: '15. Contact & Data Protection Enquiries',
    body: [
      'If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:',
      '📧 Email: support@voiceguard.my\n📍 Address: Faculty of Computing & Informatics, Multimedia University, Cyberjaya, Selangor, Malaysia\n⏱ Response time: Within 5 business days for general enquiries; within 21 days for PDPA data requests.',
      'For formal PDPA complaints, you may also contact the Personal Data Protection Department of Malaysia:\n🌐 https://www.pdp.gov.my\n📞 +603-8911 5000',
    ],
  },
]

export default function PrivacyPage() {
  return (
    <main style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 100%)',
      fontFamily: "'Inter', sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        .pp-wrap { max-width: 860px; margin: 0 auto; padding: 3rem 1.5rem 5rem; }
        .pp-badge { display:inline-flex;align-items:center;gap:6px;font-size:.72rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;padding:5px 14px;border-radius:99px;background:rgba(0,135,90,.1);border:1px solid rgba(0,135,90,.25);color:#00875a;margin-bottom:1.25rem; }
        .pp-h1 { font-size:2.25rem;font-weight:800;color:#0d1a3a;letter-spacing:-.03em;margin-bottom:.5rem;line-height:1.2; }
        .pp-updated { font-size:.85rem;color:#64748b;margin-bottom:2.5rem; }
        .pp-intro { background:#fff;border:1px solid rgba(0,135,90,.2);border-radius:16px;padding:1.5rem;margin-bottom:2.5rem;font-size:.95rem;color:#334155;line-height:1.7;border-left:4px solid #00875a; }
        .pp-pdpa-badge { display:inline-flex;align-items:center;gap:6px;font-size:.78rem;font-weight:600;padding:6px 14px;border-radius:8px;background:rgba(0,135,90,.08);border:1px solid rgba(0,135,90,.2);color:#00875a;margin-top:.75rem; }
        .pp-section { margin-bottom:2rem;background:#fff;border:1px solid rgba(0,53,128,.1);border-radius:14px;padding:1.5rem;box-shadow:0 1px 4px rgba(0,53,128,.04); }
        .pp-section-title { font-size:1.05rem;font-weight:700;color:#0d1a3a;margin-bottom:.875rem;display:flex;align-items:center;gap:10px; }
        .pp-section-title::before { content:'';display:inline-block;width:4px;height:18px;border-radius:2px;background:linear-gradient(135deg,#00875a,#34d399);flex-shrink:0; }
        .pp-para { font-size:.9rem;color:#334155;line-height:1.8;margin-bottom:.75rem; }
        .pp-para:last-child { margin-bottom:0; }
        .pp-para-pre { font-size:.88rem;color:#334155;line-height:1.75;white-space:pre-line;background:rgba(0,53,128,.03);border-radius:8px;padding:.75rem 1rem;margin-bottom:.75rem;border:1px solid rgba(0,53,128,.07); }
        .pp-toc { background:#fff;border:1px solid rgba(0,53,128,.12);border-radius:14px;padding:1.5rem;margin-bottom:2.5rem; }
        .pp-toc-title { font-size:.75rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#64748b;margin-bottom:.875rem; }
        .pp-toc-grid { display:grid;grid-template-columns:1fr 1fr;gap:4px 1rem; }
        @media(max-width:600px){ .pp-toc-grid{grid-template-columns:1fr} .pp-h1{font-size:1.6rem} }
        .pp-toc-link { font-size:.82rem;color:#003580;text-decoration:none;padding:3px 0;display:block;font-weight:500; }
        .pp-toc-link:hover { text-decoration:underline; }
        .pp-back { display:inline-flex;align-items:center;gap:7px;font-size:.88rem;font-weight:600;color:#003580;text-decoration:none;margin-bottom:2rem;padding:8px 16px;background:#fff;border:1px solid rgba(0,53,128,.2);border-radius:99px;transition:background .2s; }
        .pp-back:hover { background:rgba(0,53,128,.06); }
        .pp-footer { text-align:center;margin-top:3rem;padding-top:2rem;border-top:1px solid rgba(0,53,128,.12);font-size:.82rem;color:#94a3b8; }
        .pp-footer a { color:#003580;text-decoration:none;font-weight:600; }
        .pp-footer a:hover { text-decoration:underline; }
      `}</style>

      <div className="pp-wrap">
        {/* Back button */}
        <Link href="/signup" className="pp-back">
          ← Back to Sign Up
        </Link>

        {/* Header */}
        <div className="pp-badge">🔒 Privacy & Data Protection</div>
        <h1 className="pp-h1">Privacy Policy</h1>
        <p className="pp-updated">Last Updated: 5 June 2025 &nbsp;·&nbsp; Effective: 5 June 2025 &nbsp;·&nbsp; Version 1.0</p>

        {/* Intro box */}
        <div className="pp-intro">
          <strong>Your privacy matters to us.</strong> This Privacy Policy describes how VoiceGuard collects, uses, and protects your personal information. We are committed to transparency and compliance with the <strong>Malaysian Personal Data Protection Act 2010 (PDPA)</strong>.
          <br /><br />
          We never sell your personal data. We collect only what is necessary to provide the service, and you have the right to access, correct, and delete your data at any time.
          <div className="pp-pdpa-badge">✓ PDPA 2010 Compliant &nbsp;·&nbsp; ✓ Data Never Sold &nbsp;·&nbsp; ✓ Encrypted Storage</div>
        </div>

        {/* Table of Contents */}
        <div className="pp-toc">
          <div className="pp-toc-title">Table of Contents</div>
          <div className="pp-toc-grid">
            {SECTIONS.map(s => (
              <a key={s.id} href={`#pp-section-${s.id}`} className="pp-toc-link">
                {s.title}
              </a>
            ))}
          </div>
        </div>

        {/* Sections */}
        {SECTIONS.map(s => (
          <div key={s.id} id={`pp-section-${s.id}`} className="pp-section">
            <div className="pp-section-title">{s.title}</div>
            {s.body.map((para, i) =>
              para.startsWith('•') || para.startsWith('**') || para.includes('\n') || para.startsWith('📧') || para.startsWith('🌐') ? (
                <div key={i} className="pp-para-pre">{para}</div>
              ) : (
                <p key={i} className="pp-para">{para}</p>
              )
            )}
          </div>
        ))}

        {/* Footer */}
        <div className="pp-footer">
          <p>© 2025 VoiceGuard. All rights reserved.</p>
          <p style={{ marginTop: 6 }}>
            <Link href="/terms">Terms of Service</Link>
            &nbsp;·&nbsp;
            <Link href="/signup">Create Account</Link>
            &nbsp;·&nbsp;
            <Link href="/login">Sign In</Link>
          </p>
        </div>
      </div>
    </main>
  )
}
