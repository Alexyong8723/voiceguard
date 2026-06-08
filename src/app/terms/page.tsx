import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service — VoiceGuard',
  description: 'Read the VoiceGuard Terms of Service. Understand your rights and responsibilities when using our voice scam detection and awareness platform.',
}

const SECTIONS = [
  {
    id: '1',
    title: '1. Acceptance of Terms',
    body: [
      'By registering for, accessing, or using VoiceGuard ("the Service", "Platform", "we", "us", or "our"), you ("User", "you") agree to be legally bound by these Terms of Service ("Terms"). Please read them carefully before using the Platform.',
      'If you do not agree to these Terms in their entirety, you must not register, access, or use VoiceGuard. Your continued use of the Platform following any update to these Terms constitutes your acceptance of the revised Terms.',
      'These Terms apply to all visitors, registered users, and contributors of the Platform, regardless of how they access or use the Service.',
    ],
  },
  {
    id: '2',
    title: '2. Description of Service',
    body: [
      'VoiceGuard is a cybersecurity awareness and scam detection platform designed to help users — with a focus on senior citizens and vulnerable groups in Malaysia — identify, understand, and protect themselves from voice phishing (vishing) attacks and related scam threats.',
      'The Platform provides the following features:',
      '• AI-powered voice scam detection using a trained deep learning model\n• Daily safety quizzes and a gamified learning experience\n• Curated cybersecurity news and AI-generated threat intelligence\n• Educational video recommendations\n• Trusted Contact management\n• Scam alert notifications and trend awareness',
      'All features are provided for educational and protective awareness purposes only and do not constitute professional cybersecurity, legal, financial, or investment advice.',
    ],
  },
  {
    id: '3',
    title: '3. Eligibility & Account Registration',
    body: [
      'To register for VoiceGuard, you must be at least 13 years of age. Users under the age of 18 should use the Platform with the supervision of a parent or legal guardian.',
      'You agree to provide accurate, current, and complete information during registration and to keep your account information updated at all times. You are responsible for all activity that occurs under your account.',
      'You must not share your account credentials with any other person. You must notify us immediately at support@voiceguard.my if you become aware of any unauthorised access to or use of your account.',
      'We reserve the right to suspend or terminate accounts that provide false information, violate these Terms, or are involved in any fraudulent activity.',
    ],
  },
  {
    id: '4',
    title: '4. Acceptable Use Policy',
    body: [
      'You agree to use VoiceGuard only for lawful purposes and in a manner consistent with these Terms. You specifically agree NOT to:',
      '• Attempt to reverse-engineer, decompile, disassemble, or extract source code from VoiceGuard\n• Scrape, crawl, or spider any part of the Platform using automated tools without written consent\n• Transmit malware, viruses, or any malicious code through the Platform\n• Attempt to gain unauthorised access to any system or network associated with VoiceGuard\n• Use the Platform to harass, intimidate, or harm other users\n• Submit false, misleading, or deceptive content\n• Use the Platform for any commercial purpose without express written authorisation from us\n• Attempt to interfere with or disrupt the integrity or performance of the Platform',
      'Violation of the Acceptable Use Policy may result in immediate account suspension, termination, and where applicable, referral to law enforcement authorities.',
    ],
  },
  {
    id: '5',
    title: '5. User-Submitted Content',
    body: [
      'The Platform may permit you to submit, upload, or otherwise provide content, including but not limited to voice recordings for analysis, quiz responses, and trusted contact information ("User Content").',
      'You retain ownership of your User Content. By submitting User Content, you grant VoiceGuard a non-exclusive, royalty-free, worldwide licence to use, process, and store your content solely to provide the Service, improve detection accuracy, and comply with applicable law.',
      'You represent and warrant that your User Content does not violate any third-party rights, including intellectual property rights or privacy rights, and does not violate any applicable law.',
      'Voice recordings submitted to the Voice Detector are processed locally or transmitted securely for analysis and are not shared with third parties except as required by law.',
    ],
  },
  {
    id: '6',
    title: '6. Educational Content Disclaimer',
    body: [
      'All cybersecurity content, news articles, quiz questions, scam alerts, and video recommendations provided on VoiceGuard are for educational and informational purposes only.',
      'This content does NOT constitute professional legal, financial, cybersecurity, or medical advice. You should always consult a qualified professional for advice specific to your situation.',
      'While we strive to keep content accurate and up to date, VoiceGuard does not guarantee the completeness, accuracy, or timeliness of any information published on the Platform. AI-generated content in particular may contain errors or inaccuracies.',
      "VoiceGuard's voice scam detection feature provides a probability score as guidance only. It is not infallible and should not be treated as a definitive judgement. Always use human judgement alongside our tools.",
    ],
  },
  {
    id: '7',
    title: '7. Points, Gamification & Rewards',
    body: [
      'VoiceGuard includes a gamified learning system whereby users can earn points ("Safety Points") by completing the Daily Safety Quiz and other activities.',
      'Safety Points are for educational gamification and motivational purposes only. They have no monetary value and cannot be exchanged for cash, products, services, discounts, or any tangible reward unless explicitly announced by VoiceGuard in a separate Rewards Programme with its own terms.',
      'We reserve the right to modify, reset, or discontinue the points system at any time without prior notice or liability.',
    ],
  },
  {
    id: '8',
    title: '8. Third-Party Services & Links',
    body: [
      'VoiceGuard integrates with and links to third-party services including but not limited to:',
      '• Supabase — database and authentication infrastructure\n• Google Gemini AI — AI-powered content generation and enrichment\n• YouTube — educational video recommendations\n• NewsAPI — news article sourcing\n• Groq — AI inference services',
      'Your use of these third-party services is subject to their respective terms of service and privacy policies. VoiceGuard is not responsible for the content, accuracy, privacy practices, or availability of third-party services.',
      'The inclusion of any link or third-party integration does not imply endorsement by VoiceGuard.',
    ],
  },
  {
    id: '9',
    title: '9. Intellectual Property',
    body: [
      'All content, features, functionality, design, trademarks, logos, and software on VoiceGuard — excluding User Content — are owned by or licensed to VoiceGuard and are protected by applicable intellectual property laws.',
      'You are granted a limited, non-exclusive, non-transferable licence to access and use the Platform for personal, non-commercial purposes only. This licence does not include the right to reproduce, modify, distribute, sell, or create derivative works from any part of the Platform.',
      'The VoiceGuard name, logo, and associated marks may not be used without prior written consent.',
    ],
  },
  {
    id: '10',
    title: '10. Privacy & Data Protection',
    body: [
      'Your privacy is important to us. Our collection, use, and protection of your personal data is governed by our Privacy Policy, which is incorporated into these Terms by reference.',
      'By using VoiceGuard, you consent to the data practices described in our Privacy Policy.',
      'We comply with applicable data protection laws, including the Malaysian Personal Data Protection Act 2010 (PDPA). Your data is stored securely via Supabase infrastructure and is never sold to third parties.',
    ],
  },
  {
    id: '11',
    title: '11. Limitation of Liability',
    body: [
      'To the fullest extent permitted by applicable law, VoiceGuard, its developers, affiliates, officers, and agents shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of or inability to use the Platform.',
      'VoiceGuard is provided on an "as is" and "as available" basis without warranties of any kind, either express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement.',
      'VoiceGuard does not warrant that (a) the Platform will be uninterrupted, error-free, or secure; (b) the voice detection results will be accurate or complete; or (c) any defects or errors will be corrected.',
      'Our total liability to you for any claims arising from your use of the Platform shall not exceed MYR 100 or the amount you paid to us in the three months preceding the claim, whichever is greater.',
    ],
  },
  {
    id: '12',
    title: '12. Indemnification',
    body: [
      'You agree to indemnify, defend, and hold harmless VoiceGuard and its developers from and against any claims, liabilities, damages, losses, and expenses — including reasonable legal fees — arising out of or in connection with:',
      '• Your violation of these Terms\n• Your use of the Platform in a manner not authorised by these Terms\n• Your submission of User Content that violates any third-party right or applicable law\n• Your wilful misconduct or negligence',
    ],
  },
  {
    id: '13',
    title: '13. Termination',
    body: [
      'We reserve the right to suspend or terminate your account and access to VoiceGuard at any time, with or without notice, for any reason including but not limited to breach of these Terms.',
      'You may delete your account at any time via the Settings panel within the Platform. Upon deletion, your personal data will be removed in accordance with our data retention policy as described in the Privacy Policy.',
      'Provisions of these Terms that by their nature should survive termination shall survive, including ownership provisions, warranty disclaimers, indemnity, and limitations of liability.',
    ],
  },
  {
    id: '14',
    title: '14. Governing Law & Dispute Resolution',
    body: [
      'These Terms are governed by and construed in accordance with the laws of Malaysia, without regard to its conflict of law provisions.',
      'Any dispute arising out of or relating to these Terms or your use of VoiceGuard shall first be attempted to be resolved through good-faith negotiation. If not resolved within 30 days, disputes shall be submitted to the courts of Malaysia, and you consent to the exclusive jurisdiction of such courts.',
    ],
  },
  {
    id: '15',
    title: '15. Changes to These Terms',
    body: [
      'We reserve the right to modify these Terms at any time. We will notify users of material changes by updating the "Last Updated" date at the top of this page and, where appropriate, by sending a notification via the Platform.',
      'Your continued use of VoiceGuard after the effective date of any revised Terms constitutes your acceptance of those Terms. If you do not agree with the revised Terms, you must discontinue using the Platform.',
    ],
  },
  {
    id: '16',
    title: '16. Contact Us',
    body: [
      'If you have any questions, concerns, or requests regarding these Terms of Service, please contact us:',
      '📧 Email: support@voiceguard.my\n📍 Address: Faculty of Computing & Informatics, Multimedia University, Cyberjaya, Selangor, Malaysia',
      'We aim to respond to all enquiries within 5 business days.',
    ],
  },
]

export default function TermsPage() {
  return (
    <main style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 100%)',
      fontFamily: "'Inter', sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        .tos-wrap { max-width: 860px; margin: 0 auto; padding: 3rem 1.5rem 5rem; }
        .tos-badge { display:inline-flex;align-items:center;gap:6px;font-size:.72rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;padding:5px 14px;border-radius:99px;background:rgba(0,53,128,.1);border:1px solid rgba(0,53,128,.2);color:#003580;margin-bottom:1.25rem; }
        .tos-h1 { font-size:2.25rem;font-weight:800;color:#0d1a3a;letter-spacing:-.03em;margin-bottom:.5rem;line-height:1.2; }
        .tos-updated { font-size:.85rem;color:#64748b;margin-bottom:2.5rem; }
        .tos-intro { background:#fff;border:1px solid rgba(0,53,128,.12);border-radius:16px;padding:1.5rem;margin-bottom:2.5rem;font-size:.95rem;color:#334155;line-height:1.7;border-left:4px solid #003580; }
        .tos-section { margin-bottom:2rem;background:#fff;border:1px solid rgba(0,53,128,.1);border-radius:14px;padding:1.5rem;box-shadow:0 1px 4px rgba(0,53,128,.04); }
        .tos-section-title { font-size:1.05rem;font-weight:700;color:#0d1a3a;margin-bottom:.875rem;display:flex;align-items:center;gap:10px; }
        .tos-section-title::before { content:'';display:inline-block;width:4px;height:18px;border-radius:2px;background:linear-gradient(135deg,#003580,#1a4fa0);flex-shrink:0; }
        .tos-para { font-size:.9rem;color:#334155;line-height:1.8;margin-bottom:.75rem; }
        .tos-para:last-child { margin-bottom:0; }
        .tos-para-pre { font-size:.88rem;color:#334155;line-height:1.75;white-space:pre-line;background:rgba(0,53,128,.03);border-radius:8px;padding:.75rem 1rem;margin-bottom:.75rem;border:1px solid rgba(0,53,128,.07); }
        .tos-toc { background:#fff;border:1px solid rgba(0,53,128,.12);border-radius:14px;padding:1.5rem;margin-bottom:2.5rem; }
        .tos-toc-title { font-size:.75rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#64748b;margin-bottom:.875rem; }
        .tos-toc-grid { display:grid;grid-template-columns:1fr 1fr;gap:4px 1rem; }
        @media(max-width:600px){ .tos-toc-grid{grid-template-columns:1fr} .tos-h1{font-size:1.6rem} }
        .tos-toc-link { font-size:.82rem;color:#003580;text-decoration:none;padding:3px 0;display:block;font-weight:500; }
        .tos-toc-link:hover { text-decoration:underline; }
        .tos-back { display:inline-flex;align-items:center;gap:7px;font-size:.88rem;font-weight:600;color:#003580;text-decoration:none;margin-bottom:2rem;padding:8px 16px;background:#fff;border:1px solid rgba(0,53,128,.2);border-radius:99px;transition:background .2s; }
        .tos-back:hover { background:rgba(0,53,128,.06); }
        .tos-footer { text-align:center;margin-top:3rem;padding-top:2rem;border-top:1px solid rgba(0,53,128,.12);font-size:.82rem;color:#94a3b8; }
        .tos-footer a { color:#003580;text-decoration:none;font-weight:600; }
        .tos-footer a:hover { text-decoration:underline; }
      `}</style>

      <div className="tos-wrap">
        {/* Back button */}
        <Link href="/signup" className="tos-back">
          ← Back to Sign Up
        </Link>

        {/* Header */}
        <div className="tos-badge">📋 Legal Document</div>
        <h1 className="tos-h1">Terms of Service</h1>
        <p className="tos-updated">Last Updated: 5 June 2025 &nbsp;·&nbsp; Effective: 5 June 2025 &nbsp;·&nbsp; Version 1.0</p>

        {/* Intro box */}
        <div className="tos-intro">
          <strong>Welcome to VoiceGuard.</strong> These Terms of Service govern your use of the VoiceGuard platform — a cybersecurity awareness and voice scam detection service developed to protect users from voice phishing (vishing) threats. Please read these Terms carefully. By creating an account, you agree to be bound by them.
        </div>

        {/* Table of Contents */}
        <div className="tos-toc">
          <div className="tos-toc-title">Table of Contents</div>
          <div className="tos-toc-grid">
            {SECTIONS.map(s => (
              <a key={s.id} href={`#section-${s.id}`} className="tos-toc-link">
                {s.title}
              </a>
            ))}
          </div>
        </div>

        {/* Sections */}
        {SECTIONS.map(s => (
          <div key={s.id} id={`section-${s.id}`} className="tos-section">
            <div className="tos-section-title">{s.title}</div>
            {s.body.map((para, i) =>
              para.startsWith('•') || para.includes('\n') ? (
                <div key={i} className="tos-para-pre">{para}</div>
              ) : (
                <p key={i} className="tos-para">{para}</p>
              )
            )}
          </div>
        ))}

        {/* Footer */}
        <div className="tos-footer">
          <p>© 2025 VoiceGuard. All rights reserved.</p>
          <p style={{ marginTop: 6 }}>
            <Link href="/privacy">Privacy Policy</Link>
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
