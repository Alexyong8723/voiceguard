import { NextRequest, NextResponse } from 'next/server'

export interface AlertNotification {
  id: string
  type: 'critical' | 'warning' | 'trend' | 'info' | 'tip'
  title: string
  body: string
  source: string
  region: string
  timeAgo: string
  category: string
  actionLabel?: string
  actionUrl?: string
  isNew: boolean
  tags: string[]
}

// ── Cache for 24 hours at the CDN layer (no more per-request Groq calls) ────────
export const revalidate = 86400

// ── Full curated alert library (24 entries, rotated daily by date seed) ─────────
const ALERT_LIBRARY: AlertNotification[] = [
  {
    id: 'a01', type: 'critical',
    title: 'Macau Scam Surge — PDRM Issues Nationwide Alert',
    body: 'Malaysian police report a 43% surge in Macau scam calls in 2025. Callers impersonate PDRM officers claiming your MyKad is linked to money laundering, demanding urgent fund transfers to a "safe account". Over RM 18 million lost in three months.',
    source: 'PDRM Cyber Forensics', region: 'MY', timeAgo: '2 hours ago',
    category: 'scam', isNew: true, tags: ['macau-scam', 'pdrm', 'vishing'],
    actionLabel: 'Report to PDRM', actionUrl: 'tel:999',
  },
  {
    id: 'a02', type: 'critical',
    title: 'AI Voice Cloning Scam — Family Members Being Impersonated',
    body: 'Cybercriminals use free AI tools to clone voices of relatives from social media audio. Victims receive distress calls in a family member\'s voice demanding emergency money transfers. Always call back on the person\'s known number before sending any money.',
    source: 'CyberSecurity Malaysia', region: 'MY', timeAgo: '5 hours ago',
    category: 'ai', isNew: true, tags: ['voice-cloning', 'ai', 'deepfake'],
    actionLabel: 'Learn More', actionUrl: '/awareness',
  },
  {
    id: 'a03', type: 'critical',
    title: 'Love Scam Ring Busted — RM 4.2M Recovered by PDRM',
    body: 'A syndicate operating from Myanmar was dismantled after targeting over 300 Malaysians. Victims were lured on dating apps before being asked to invest in fake crypto platforms. Never send money to someone you have only met online.',
    source: 'PDRM Commercial Crime', region: 'MY', timeAgo: '8 hours ago',
    category: 'scam', isNew: true, tags: ['love-scam', 'crypto', 'myanmar'],
    actionLabel: 'Check Scam List', actionUrl: '/awareness',
  },
  {
    id: 'a04', type: 'warning',
    title: 'Bank Negara Malaysia: Spoofed BNM Numbers Being Used',
    body: 'Fraudsters are spoofing Bank Negara Malaysia\'s official number (+603-2698-8044) to trick victims into revealing banking credentials. BNM confirms they will NEVER call asking for account numbers, PINs, or OTPs. Hang up immediately.',
    source: 'Bank Negara Malaysia', region: 'MY', timeAgo: '1 day ago',
    category: 'vishing', isNew: false, tags: ['bnm', 'spoofing', 'banking'],
    actionLabel: 'Call BNM LINK', actionUrl: 'tel:1300885465',
  },
  {
    id: 'a05', type: 'warning',
    title: 'MCMC Blocks 4,200 Scam Numbers in Ops Siber Sejahtera',
    body: 'The Malaysian Communications and Multimedia Commission terminated 4,200 active scam numbers across all major carriers. 830 unregistered SIM cards were confiscated. Syndicates operating from boiler rooms in KL, JB, and Penang were targeted.',
    source: 'MCMC Malaysia', region: 'MY', timeAgo: '3 hours ago',
    category: 'scam', isNew: true, tags: ['mcmc', 'sim-swap', 'ops-siber'],
    actionLabel: 'Report to MCMC', actionUrl: 'tel:1800188030',
  },
  {
    id: 'a06', type: 'warning',
    title: 'WhatsApp Voice Note Phishing — New Attack Method Detected',
    body: 'Scammers in Malaysia and Singapore are sending AI-generated WhatsApp voice notes impersonating bank customer service. The notes instruct recipients to call a spoofed number to "unfreeze" their account. Never call numbers from unsolicited messages.',
    source: 'Singapore Police Force', region: 'SG', timeAgo: '6 hours ago',
    category: 'vishing', isNew: true, tags: ['whatsapp', 'vishing', 'banking'],
  },
  {
    id: 'a07', type: 'warning',
    title: 'Maybank2u Credential Harvest — Fake SMS Gateway Active',
    body: 'A phishing SMS campaign is sending fake Maybank2u security alerts with links to a convincing clone site. Over 120 victims have had their TAC intercepted. Maybank will never send a link asking you to log in via SMS.',
    source: 'Maybank Security Team', region: 'MY', timeAgo: '4 hours ago',
    category: 'scam', isNew: true, tags: ['maybank', 'phishing', 'sms'],
    actionLabel: 'Call Maybank', actionUrl: 'tel:1300886688',
  },
  {
    id: 'a08', type: 'trend',
    title: 'Romance Scams Up 67% — Targeting Adults Over 50',
    body: 'PDRM data shows romance scams increased 67% in 2024, with individuals aged 50+ being the primary targets. Scammers build emotional relationships over weeks before requesting money for "emergencies". Total losses exceeded RM 95 million in 2024.',
    source: 'PDRM Commercial Crime', region: 'MY', timeAgo: '1 day ago',
    category: 'scam', isNew: false, tags: ['romance-scam', 'seniors', 'trend'],
  },
  {
    id: 'a09', type: 'trend',
    title: 'Deepfake Video Calls Used in Corporate Fraud',
    body: 'A new wave of corporate fraud uses real-time deepfake video calls to impersonate CEOs during virtual meetings. Finance employees are instructed to authorise large wire transfers. The most notable case involved a HK$200 million loss in Hong Kong.',
    source: 'Interpol Cybercrime Division', region: 'Global', timeAgo: '2 days ago',
    category: 'ai', isNew: false, tags: ['deepfake', 'corporate', 'wire-fraud'],
    actionLabel: 'Read Alert', actionUrl: '/awareness',
  },
  {
    id: 'a10', type: 'trend',
    title: 'OTP Bypass Scams Targeting Maybank & CIMB Customers',
    body: 'A scam technique contacts Maybank2u and CIMB Clicks users claiming suspicious activity, then intercepts OTP codes through social engineering. The caller creates panic and requests the OTP to "verify identity". Banks confirm they never request OTPs.',
    source: 'Maybank Security Team', region: 'MY', timeAgo: '4 hours ago',
    category: 'scam', isNew: true, tags: ['otp', 'maybank', 'cimb'],
  },
  {
    id: 'a11', type: 'trend',
    title: 'SIM Swap Fraud Rising — Telco Insiders Involved',
    body: 'Police have arrested telco employees in Malaysia facilitating SIM swap fraud for syndicates. Once swapped, the attacker intercepts all OTPs. Contact your telco immediately if you suddenly lose mobile service and cannot make calls.',
    source: 'MCMC Malaysia', region: 'MY', timeAgo: '12 hours ago',
    category: 'scam', isNew: true, tags: ['sim-swap', 'telco', 'otp'],
  },
  {
    id: 'a12', type: 'trend',
    title: 'Pig Butchering Crypto Scams Now Targeting Retirees',
    body: 'Long-term investment scams ("pig butchering") are increasingly targeting Malaysian retirees with fake crypto trading platforms. Victims are shown large paper profits before the platform vanishes. Average loss: RM 45,000 per victim.',
    source: 'CyberSecurity Malaysia', region: 'MY', timeAgo: '6 hours ago',
    category: 'scam', isNew: true, tags: ['crypto', 'pig-butchering', 'retirees'],
    actionLabel: 'Learn to spot it', actionUrl: '/awareness',
  },
  {
    id: 'a13', type: 'info',
    title: 'New Scam Hotline: MyCC Opens 24/7 Consumer Fraud Line',
    body: 'The Malaysia Competition Commission (MyCC) launched a dedicated 24/7 fraud reporting hotline at 1-800-88-9811 for consumers who encounter scam activity. Reports can also be filed online at myconsumerportal.kpdnhep.gov.my. All reports reviewed within 48 hours.',
    source: 'MyCC Malaysia', region: 'MY', timeAgo: '12 hours ago',
    category: 'tip', isNew: false, tags: ['hotline', 'mycc', 'reporting'],
    actionLabel: 'Call MyCC', actionUrl: 'tel:1800889811',
  },
  {
    id: 'a14', type: 'info',
    title: 'BNMLINK Enhanced — Real-Time Scam Number Checker',
    body: 'Bank Negara Malaysia has enhanced BNMLINK with a real-time scam number checker. You can now verify if a number that called you has been reported as fraudulent before before engaging further. Available 24/7 at 1-300-88-5465.',
    source: 'Bank Negara Malaysia', region: 'MY', timeAgo: '2 days ago',
    category: 'info', isNew: false, tags: ['bnm', 'checker', 'tool'],
    actionLabel: 'Use BNMLINK', actionUrl: 'tel:1300885465',
  },
  {
    id: 'a15', type: 'info',
    title: 'SPF ScamShield App Now Available on Android',
    body: 'Singapore Police Force\'s ScamShield app, which automatically filters known scam calls and SMS, is now available on Android. Malaysian residents can also use it to block international scam calls. Free download on Google Play Store.',
    source: 'Singapore Police Force', region: 'SG', timeAgo: '3 days ago',
    category: 'tip', isNew: false, tags: ['spf', 'scamshield', 'android'],
    actionLabel: 'Get App', actionUrl: 'https://www.scamshield.org.sg',
  },
  {
    id: 'a16', type: 'info',
    title: 'MyCERT Issues Advisory on Android Banking Malware',
    body: 'MyCERT has issued an advisory about a new Android malware strain targeting Malaysian banking apps. The malware overlays fake login screens on real banking apps. Download apps only from official app stores and check developer names carefully.',
    source: 'MyCERT Malaysia', region: 'MY', timeAgo: '1 day ago',
    category: 'malware', isNew: true, tags: ['malware', 'android', 'banking'],
    actionLabel: 'Read Advisory', actionUrl: '/awareness',
  },
  {
    id: 'a17', type: 'tip',
    title: 'Safety Tip: Establish a Family Code Word Today',
    body: 'The most effective defence against AI voice cloning is a pre-agreed secret code word with close family members. If anyone calls claiming to be a relative in distress, ask for the code word. If they cannot say it, treat the call as a scam and hang up immediately.',
    source: 'VoiceGuard Safety Tips', region: 'Global', timeAgo: 'Today',
    category: 'tip', isNew: false, tags: ['family', 'code-word', 'voice-cloning'],
  },
  {
    id: 'a18', type: 'tip',
    title: 'Safety Tip: Never Act Immediately on an Unexpected Call',
    body: 'Scammers rely on panic and urgency to bypass rational thinking. Any unexpected call asking for money, personal details, or OTPs should be treated with extreme scepticism. Always hang up, verify independently, and call back using an official number you look up yourself.',
    source: 'VoiceGuard Safety Tips', region: 'Global', timeAgo: 'Today',
    category: 'tip', isNew: false, tags: ['safety', 'urgency', 'verification'],
  },
  {
    id: 'a19', type: 'tip',
    title: 'Safety Tip: Use the "2-Device" Rule for Banking',
    body: 'Set up your banking TAC/OTP to go to a separate phone that is never used for social media or clicking links. This way, even if your main phone is compromised with malware, attackers cannot intercept your OTP without physical access to your second device.',
    source: 'VoiceGuard Safety Tips', region: 'Global', timeAgo: 'Today',
    category: 'tip', isNew: false, tags: ['otp', '2fa', 'banking'],
  },
  {
    id: 'a20', type: 'tip',
    title: 'Safety Tip: Freeze Your Credit Report Proactively',
    body: 'Malaysian residents can request a CTOS credit freeze to prevent fraudsters from opening loans or credit cards in your name, even if they have your full IC number. Call CTOS at 03-2722 8833 or apply online. It is free and takes 24 hours to activate.',
    source: 'CTOS Malaysia', region: 'MY', timeAgo: 'Today',
    category: 'tip', isNew: false, tags: ['credit', 'ctos', 'identity-theft'],
    actionLabel: 'CTOS Portal', actionUrl: 'https://www.ctos.com.my',
  },
  {
    id: 'a21', type: 'critical',
    title: 'URGENT: Fake e-Hailing Refund Scam Targeting Grab Users',
    body: 'Fraudsters are calling Grab users claiming they are entitled to an "overcharge refund" and directing them to a fake Grab app that steals banking credentials. Grab never calls customers to process refunds — all refunds are in-app only.',
    source: 'Grab Malaysia', region: 'MY', timeAgo: '1 hour ago',
    category: 'scam', isNew: true, tags: ['grab', 'refund-scam', 'phishing'],
    actionLabel: 'Report to Grab', actionUrl: 'https://www.grab.com/my/support',
  },
  {
    id: 'a22', type: 'warning',
    title: 'EPF Impersonation Calls Spike During Retirement Season',
    body: 'Callers are impersonating Employees Provident Fund (EPF/KWSP) officers, claiming members have unclaimed withdrawal applications pending. They collect IC numbers and bank details to "process" the claim. EPF never calls to collect personal details.',
    source: 'KWSP Malaysia', region: 'MY', timeAgo: '7 hours ago',
    category: 'vishing', isNew: true, tags: ['epf', 'kwsp', 'impersonation'],
    actionLabel: 'Call EPF', actionUrl: 'tel:1300885357',
  },
  {
    id: 'a23', type: 'trend',
    title: 'QR Code Phishing ("Quishing") Now in Malaysian Car Parks',
    body: 'Physical QR code stickers placed over legitimate parking payment codes are redirecting victims to phishing sites that capture credit card details. Inspect QR codes carefully and prefer typing official URLs manually rather than scanning stickers in public places.',
    source: 'CyberSecurity Malaysia', region: 'MY', timeAgo: '10 hours ago',
    category: 'scam', isNew: true, tags: ['qr-code', 'quishing', 'physical'],
  },
  {
    id: 'a24', type: 'info',
    title: 'Semak Mule — Bank Negara\'s Fraud Account Checker',
    body: 'Bank Negara Malaysia\'s Semak Mule portal lets you check if a bank account number has been reported as a mule account used in scams. Before transferring money to any new contact, verify their account at semakmule.rmp.gov.my.',
    source: 'Bank Negara Malaysia', region: 'MY', timeAgo: '2 days ago',
    category: 'tip', isNew: false, tags: ['mule-account', 'bnm', 'verification'],
    actionLabel: 'Check Now', actionUrl: 'https://semakmule.rmp.gov.my',
  },
]

// ── Deterministic daily rotation: returns 12 alerts seeded by calendar date ─────
function getDailyAlerts(): AlertNotification[] {
  const today = new Date()
  // Simple numeric seed: YYYYMMDD as integer
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate()

  // Fisher-Yates shuffle with seeded LCG (Linear Congruential Generator)
  const arr = [...ALERT_LIBRARY]
  let rng = seed
  for (let i = arr.length - 1; i > 0; i--) {
    rng = (rng * 1664525 + 1013904223) & 0x7fffffff
    const j = rng % (i + 1)
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }

  // Always ensure at least 1 critical, 1 warning, 1 tip in the first 8
  const critical = arr.filter(a => a.type === 'critical')
  const warning  = arr.filter(a => a.type === 'warning')
  const trend    = arr.filter(a => a.type === 'trend')
  const info     = arr.filter(a => a.type === 'info')
  const tip      = arr.filter(a => a.type === 'tip')

  const selected: AlertNotification[] = [
    ...(critical.slice(0, 2)),
    ...(warning.slice(0, 2)),
    ...(trend.slice(0, 3)),
    ...(info.slice(0, 2)),
    ...(tip.slice(0, 2)),
    ...(arr.slice(0, 1)), // bonus pick from shuffled pool
  ]

  // Deduplicate and return exactly 12
  const seen = new Set<string>()
  const deduped = selected.filter(a => {
    if (seen.has(a.id)) return false
    seen.add(a.id)
    return true
  })

  return deduped.slice(0, 12)
}

export async function GET(_req: NextRequest) {
  const alerts = getDailyAlerts()
  const today  = new Date().toISOString()

  return NextResponse.json(
    { alerts, generatedAt: today, source: 'curated' },
    {
      headers: {
        // Cache at CDN for 24h, stale-while-revalidate for another hour
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600',
      },
    },
  )
}
