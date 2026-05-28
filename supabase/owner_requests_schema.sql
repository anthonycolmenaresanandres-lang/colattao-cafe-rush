-- Colattao owner request schema (Phase 1)
-- Purpose: persist owner request submissions from /api/owner-requests.
-- Note: execute in Supabase SQL editor as a privileged role.

begin;

-- Keep enums explicit for strong validation at the database layer.
do $$
begin
  if not exists (select 1 from pg_type where typname = 'owner_request_type') then
    create type public.owner_request_type as enum (
      'Menú',
      'Precio',
      'Producto',
      'Foto',
      'Sticker',
      'Sitio web',
      'Juego',
      'Promoción',
      'Otro'
    );
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'owner_request_priority') then
    create type public.owner_request_priority as enum ('low', 'normal', 'urgent');
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'owner_request_status') then
    create type public.owner_request_status as enum ('new', 'in_progress', 'done', 'archived');
  end if;
end $$;

create table if not exists public.owner_requests (
  id uuid primary key default gen_random_uuid(),
  tenant text not null default 'colattao',
  request_type public.owner_request_type not null,
  priority public.owner_request_priority not null default 'normal',
  status public.owner_request_status not null default 'new',
  what_changes text not null check (char_length(what_changes) > 0),
  current_section text null,
  new_detail text null,
  notes text null,
  contact_name text null,
  contact_info text null,
  source_page text not null default 'request-update',
  user_agent text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Keep updated_at fresh on every update.
create or replace function public.set_owner_requests_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_owner_requests_updated_at on public.owner_requests;
create trigger trg_owner_requests_updated_at
before update on public.owner_requests
for each row
execute function public.set_owner_requests_updated_at();

-- Practical read/sort/filter indexes.
create index if not exists idx_owner_requests_created_at_desc
  on public.owner_requests (created_at desc);

create index if not exists idx_owner_requests_status
  on public.owner_requests (status);

create index if not exists idx_owner_requests_priority
  on public.owner_requests (priority);

create index if not exists idx_owner_requests_tenant_created
  on public.owner_requests (tenant, created_at desc);

-- RLS: enabled. No public read policy.
alter table public.owner_requests enable row level security;

-- Defensive revoke for client-facing roles.
revoke all on table public.owner_requests from anon;
revoke all on table public.owner_requests from authenticated;

-- Service role access policy only (used by server-side route handler).
drop policy if exists "service_role_all_owner_requests" on public.owner_requests;
create policy "service_role_all_owner_requests"
on public.owner_requests
as permissive
for all
to service_role
using (true)
with check (true);

commit;

