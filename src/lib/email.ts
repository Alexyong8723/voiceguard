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

export async function sendMagicLinkEmail(email: string, link: string) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #003580;">VoiceGuard Login</h2>
      <p>Hello,</p>
      <p>Click the button below to securely sign in to your VoiceGuard account. No password required.</p>
      <div style="margin: 30px 0;">
        <a href="${link}" style="background-color: #003580; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Sign In to VoiceGuard</a>
      </div>
      <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #555;">${link}</p>
      <p style="margin-top: 40px; font-size: 0.8em; color: #888;">If you didn't request this email, you can safely ignore it.</p>
    </div>
  `
  return sendEmail({ to: email, subject: 'Your VoiceGuard Magic Link', html })
}

export async function sendPasswordResetEmail(email: string, link: string) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #003580;">VoiceGuard Password Reset</h2>
      <p>Hello,</p>
      <p>We received a request to reset your password. Click the button below to choose a new password.</p>
      <div style="margin: 30px 0;">
        <a href="${link}" style="background-color: #003580; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
      </div>
      <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #555;">${link}</p>
      <p style="margin-top: 40px; font-size: 0.8em; color: #888;">If you didn't request this email, your password will not be changed.</p>
    </div>
  `
  return sendEmail({ to: email, subject: 'Reset Your VoiceGuard Password', html })
}

export async function sendMfaResetEmail(email: string, link: string) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #003580;">VoiceGuard Authenticator Reset</h2>
      <p>Hello,</p>
      <p>You requested to remove the Authenticator App from your account.</p>
      <div style="margin: 30px 0;">
        <a href="${link}" style="background-color: #CC0001; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Confirm Removing Authenticator App</a>
      </div>
      <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #555;">${link}</p>
      <p style="margin-top: 40px; font-size: 0.8em; color: #888;">If you didn't request this, please ignore this email. Your account remains secure.</p>
    </div>
  `
  return sendEmail({ to: email, subject: 'Reset Your VoiceGuard Authenticator App', html })
}
