import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // Use SSL for 465
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
})

interface EmailParams {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: EmailParams) {
  if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
    throw new Error('Missing SMTP_EMAIL or SMTP_PASSWORD in .env.local')
  }

  try {
    const info = await transporter.sendMail({
      from: `"VoiceGuard" <${process.env.SMTP_EMAIL}>`,
      to,
      subject,
      html,
    })
    console.log('Email sent: %s', info.messageId)
    return { success: true }
  } catch (error) {
    console.error('Error sending email:', error)
    throw error
  }
}

export async function sendMagicLinkEmail(email: string, linkOrCode: string) {
  // Parse out the OTP code and link if both are present
  const otpMatch = linkOrCode.match(/Your 6-digit code is: (\d{6})/)
  const linkMatch = linkOrCode.match(/Or click here: (.+)/)
  const otp  = otpMatch?.[1] ?? null
  const link = linkMatch?.[1] ?? linkOrCode

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>VoiceGuard Login</title></head>
<body style="margin:0;padding:0;background-color:#f0f4ff;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f0f4ff;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:580px;background:#ffffff;border-radius:20px;box-shadow:0 8px 30px rgba(0,53,128,0.10);overflow:hidden;">
        <!-- Header -->
        <tr><td align="center" style="background:linear-gradient(135deg,#1e1b4b 0%,#312e81 100%);padding:40px 30px;">
          <div style="font-size:40px;margin-bottom:12px;">🛡️</div>
          <h1 style="margin:0;color:#fff;font-size:26px;font-weight:800;letter-spacing:-0.5px;">VoiceGuard</h1>
          <p style="margin:8px 0 0;color:#a5b4fc;font-size:14px;font-weight:500;">Secure Authentication</p>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:36px 40px 28px;">
          <p style="margin:0 0 18px;font-size:16px;color:#374151;line-height:1.6;">Hello,</p>
          <p style="margin:0 0 28px;font-size:16px;color:#374151;line-height:1.6;">You requested a secure sign-in link for your VoiceGuard account. ${otp ? 'Use the 6-digit code below or click the button to sign in instantly.' : 'Click the button below to sign in instantly.'}</p>
          ${otp ? `
          <div style="text-align:center;margin-bottom:28px;">
            <div style="display:inline-block;background:#f8faff;border:2px dashed #c7d2fe;border-radius:14px;padding:20px 32px;">
              <p style="margin:0 0 6px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#6366f1;">Your One-Time Code</p>
              <span style="font-family:'Courier New',monospace;font-size:36px;font-weight:800;color:#312e81;letter-spacing:10px;">${otp}</span>
            </div>
          </div>` : ''}
          <div style="text-align:center;margin-bottom:28px;">
            <a href="${link}" style="display:inline-block;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;text-decoration:none;padding:16px 36px;border-radius:12px;font-size:16px;font-weight:700;box-shadow:0 4px 14px rgba(79,70,229,0.3);">Sign In to VoiceGuard →</a>
          </div>
          <p style="margin:0 0 8px;font-size:13px;color:#94a3b8;line-height:1.5;">If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="margin:0;font-size:12px;color:#6366f1;word-break:break-all;">${link}</p>
        </td></tr>
        <!-- Footer -->
        <tr><td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:22px 40px;text-align:center;">
          <p style="margin:0 0 6px;font-size:13px;color:#64748b;">If you didn't request this email, you can safely ignore it. Your account remains secure.</p>
          <p style="margin:0;font-size:12px;color:#94a3b8;font-weight:600;">© 2026 VoiceGuard · AI-Powered Voice Security</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`

  return sendEmail({ to: email, subject: 'Your VoiceGuard Sign-In Link', html })
}

export async function sendPasswordResetEmail(email: string, linkOrCode: string) {
  const otpMatch = linkOrCode.match(/Your 6-digit code is: (\d{6})/)
  const linkMatch = linkOrCode.match(/Or click here: (.+)/)
  const otp  = otpMatch?.[1] ?? null
  const link = linkMatch?.[1] ?? linkOrCode

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Reset Your VoiceGuard Password</title></head>
<body style="margin:0;padding:0;background-color:#f0f4ff;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f0f4ff;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:580px;background:#ffffff;border-radius:20px;box-shadow:0 8px 30px rgba(0,53,128,0.10);overflow:hidden;">
        <tr><td align="center" style="background:linear-gradient(135deg,#1e1b4b 0%,#312e81 100%);padding:40px 30px;">
          <div style="font-size:40px;margin-bottom:12px;">🔐</div>
          <h1 style="margin:0;color:#fff;font-size:26px;font-weight:800;letter-spacing:-0.5px;">Password Reset</h1>
          <p style="margin:8px 0 0;color:#a5b4fc;font-size:14px;font-weight:500;">VoiceGuard Security</p>
        </td></tr>
        <tr><td style="padding:36px 40px 28px;">
          <p style="margin:0 0 18px;font-size:16px;color:#374151;line-height:1.6;">Hello,</p>
          <p style="margin:0 0 28px;font-size:16px;color:#374151;line-height:1.6;">We received a request to reset your VoiceGuard password. ${otp ? 'Enter the code below or click the button to set a new password.' : 'Click the button below to choose a new password.'}</p>
          ${otp ? `
          <div style="text-align:center;margin-bottom:28px;">
            <div style="display:inline-block;background:#f8faff;border:2px dashed #c7d2fe;border-radius:14px;padding:20px 32px;">
              <p style="margin:0 0 6px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#6366f1;">Reset Code</p>
              <span style="font-family:'Courier New',monospace;font-size:36px;font-weight:800;color:#312e81;letter-spacing:10px;">${otp}</span>
            </div>
          </div>` : ''}
          <div style="text-align:center;margin-bottom:28px;">
            <a href="${link}" style="display:inline-block;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;text-decoration:none;padding:16px 36px;border-radius:12px;font-size:16px;font-weight:700;box-shadow:0 4px 14px rgba(79,70,229,0.3);">Reset My Password →</a>
          </div>
          <p style="margin:0 0 8px;font-size:13px;color:#94a3b8;line-height:1.5;">If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="margin:0;font-size:12px;color:#6366f1;word-break:break-all;">${link}</p>
        </td></tr>
        <tr><td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:22px 40px;text-align:center;">
          <p style="margin:0 0 6px;font-size:13px;color:#64748b;">If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.</p>
          <p style="margin:0;font-size:12px;color:#94a3b8;font-weight:600;">© 2026 VoiceGuard · AI-Powered Voice Security</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`

  return sendEmail({ to: email, subject: 'Reset Your VoiceGuard Password', html })
}

export async function sendMfaResetEmail(email: string, link: string) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>VoiceGuard Authenticator Reset</title></head>
<body style="margin:0;padding:0;background-color:#f0f4ff;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f0f4ff;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:580px;background:#ffffff;border-radius:20px;box-shadow:0 8px 30px rgba(0,53,128,0.10);overflow:hidden;">
        <tr><td align="center" style="background:linear-gradient(135deg,#450a0a 0%,#7f1d1d 100%);padding:40px 30px;">
          <div style="font-size:40px;margin-bottom:12px;">⚠️</div>
          <h1 style="margin:0;color:#fff;font-size:26px;font-weight:800;letter-spacing:-0.5px;">Authenticator Reset</h1>
          <p style="margin:8px 0 0;color:#fca5a5;font-size:14px;font-weight:500;">VoiceGuard Security Alert</p>
        </td></tr>
        <tr><td style="padding:36px 40px 28px;">
          <p style="margin:0 0 18px;font-size:16px;color:#374151;line-height:1.6;">Hello,</p>
          <p style="margin:0 0 28px;font-size:16px;color:#374151;line-height:1.6;">You have requested to remove the Authenticator App from your VoiceGuard account. Click the button below to confirm this action.</p>
          <div style="background:#fff5f5;border:1px solid #fecaca;border-radius:12px;padding:16px 20px;margin-bottom:28px;">
            <p style="margin:0;font-size:14px;color:#991b1b;font-weight:600;">⚠️ Warning: This will disable two-factor authentication. You will need to set up a new Authenticator App on your next login.</p>
          </div>
          <div style="text-align:center;margin-bottom:28px;">
            <a href="${link}" style="display:inline-block;background:linear-gradient(135deg,#dc2626,#b91c1c);color:#fff;text-decoration:none;padding:16px 36px;border-radius:12px;font-size:16px;font-weight:700;box-shadow:0 4px 14px rgba(220,38,38,0.3);">Confirm Authenticator Removal →</a>
          </div>
          <p style="margin:0 0 8px;font-size:13px;color:#94a3b8;line-height:1.5;">This link expires in 15 minutes. If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="margin:0;font-size:12px;color:#dc2626;word-break:break-all;">${link}</p>
        </td></tr>
        <tr><td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:22px 40px;text-align:center;">
          <p style="margin:0 0 6px;font-size:13px;color:#64748b;">If you didn't request this, please ignore this email. Your account and authenticator remain active and secure.</p>
          <p style="margin:0;font-size:12px;color:#94a3b8;font-weight:600;">© 2026 VoiceGuard · AI-Powered Voice Security</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`

  return sendEmail({ to: email, subject: '⚠️ VoiceGuard Authenticator Removal Request', html })
}
