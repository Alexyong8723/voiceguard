/**
 * admin.ts — Service-role Supabase client
 * =========================================
 * Bypasses Row Level Security. Use ONLY in server-side admin actions.
 * NEVER import this in client components or expose to the browser.
 */

import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export function createAdminClient() {
  const url    = process.env.NEXT_PUBLIC_SUPABASE_URL
  const svcKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !svcKey) {
    throw new Error('[admin] Missing SUPABASE_SERVICE_ROLE_KEY or SUPABASE_URL env vars.')
  }

  return createSupabaseClient(url, svcKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
