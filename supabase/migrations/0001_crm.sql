-- 0001_crm.sql — Phase 1 CRM: additive system-of-record for sales LEADS + client REQUESTS.
-- Service-role only. RLS is ENABLED with NO anon/public policies, so only the Supabase
-- service-role key (which bypasses RLS) can read/write. Never expose that key to the browser.
-- Safe to re-run: every statement is IF NOT EXISTS / additive. No destructive operations.

create extension if not exists "pgcrypto";

-- Door-to-door rep onboarding leads (source: POST /api/onboarding)
create table if not exists public.leads (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz not null default now(),
  client_slug    text not null default 'colattao',
  cafe_name      text not null,
  contact        text,                       -- email or phone captured by the rep
  contact_method text,
  plan_type      text,                       -- one of the route's ALLOWED_PLAN_TYPES
  city           text,
  notes          text,
  source         text not null default 'rep-intake',
  rep_id         text,
  missing_fields text[],                     -- follow-up checklist (computed in the route)
  blob_url       text,                       -- uploaded file in Vercel Blob, if any
  status         text not null default 'new' -- new | contacted | demo | won | lost
);

-- Post-sale client requests (source: POST /api/owner-requests)
create table if not exists public.requests (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  client_slug  text not null default 'colattao',
  request_type text,                          -- one of the route's ALLOWED_REQUEST_TYPES
  priority     text,                          -- Low | Normal | Urgent
  message      text,
  contact      text,
  blob_url     text,
  status       text not null default 'open'   -- open | in_progress | done
);

create index if not exists leads_created_at_idx    on public.leads    (created_at desc);
create index if not exists requests_created_at_idx on public.requests (created_at desc);

alter table public.leads    enable row level security;
alter table public.requests enable row level security;
-- Intentionally NO policies: with RLS on and zero policies, anon/public access is denied
-- and only the service-role client (server-side) can read or write. This is the desired
-- Phase 1 posture (dashboard reads happen server-side via the service-role key).
