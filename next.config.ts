import type { NextConfig } from 'next'
import path from 'path'

// ── Security headers applied to every response ────────────────────────────────
const securityHeaders = [
  // Prevent clickjacking — disallow iframing of any page
  { key: 'X-Frame-Options', value: 'DENY' },
  // Prevent MIME-sniffing attacks
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Control referrer information leak
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Enforce HTTPS for 1 year (HSTS)
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
  // Disable sensitive browser features not needed by the app
  {
    key: 'Permissions-Policy',
    value: [
      'camera=()',          // no camera access
      'geolocation=()',     // no geolocation
      'payment=()',         // no payment API
      'usb=()',             // no USB
      'microphone=(self)',  // microphone only on own origin (needed for audio recording)
    ].join(', '),
  },
  // Content Security Policy
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      // Scripts: unsafe-eval is required by React in development mode (error overlays, call-stack
      // reconstruction). It is intentionally absent in production so eval() is blocked there.
      process.env.NODE_ENV === 'development'
        ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
        : "script-src 'self' 'unsafe-inline'",
      // Styles: same-origin + inline (Next.js injects inline styles)
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      // Fonts
      "font-src 'self' https://fonts.gstatic.com",
      // Images: same-origin + data URIs
      "img-src 'self' data: blob: https://img.youtube.com https://i.ytimg.com",
      // Media: same-origin + blob (for recorded audio)
      "media-src 'self' blob:",
      // API connections: same-origin + Supabase + Google APIs + Groq
      "connect-src 'self' https://*.supabase.co https://generativelanguage.googleapis.com https://accounts.google.com https://oauth2.googleapis.com https://openidconnect.googleapis.com https://api.groq.com",
      // Frame source: allow Google OAuth
      "frame-src https://accounts.google.com https://www.youtube.com https://youtube.com",
      // No plugins, no objects
      "object-src 'none'",
      // Base URI restriction
      "base-uri 'self'",
      // Form submissions only to self
      "form-action 'self'",
      // Block mixed content
      "upgrade-insecure-requests",
    ].join('; '),
  },
]

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },

  // Attach security headers to every route
  async headers() {
    return [
      {
        source: '/(.*)',   // match all routes
        headers: securityHeaders,
      },
    ]
  },
}

export default nextConfig
