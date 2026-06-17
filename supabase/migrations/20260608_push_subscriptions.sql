-- ── push_subscriptions ─────────────────────────────────────────────────────────
-- Stores Web Push (VAPID) subscription objects for each browser session.
-- One user can have multiple subscriptions (e.g. phone + laptop + different browsers).
-- Subscriptions are automatically removed when a user account is deleted (CASCADE).

create table if not exists public.push_subscriptions (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        references auth.users(id) on delete cascade,
  endpoint    text        not null unique,
  p256dh      text        not null,
  auth        text        not null,
  user_agent  text,
  created_at  timestamptz not null default now()
);

-- RLS: users can only read/insert/delete their own subscriptions
alter table public.push_subscriptions enable row level security;

create policy "Users can manage their own push subscriptions"
  on public.push_subscriptions
  for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Service-role (server-side) can read all subscriptions to send broadcasts
-- (This is handled via SUPABASE_SERVICE_ROLE_KEY on the server — no extra policy needed)

-- Index for fast per-user lookups
create index if not exists push_subscriptions_user_id_idx
  on public.push_subscriptions(user_id);
