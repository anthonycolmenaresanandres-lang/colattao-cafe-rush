-- Additive only. Apply to an authorized test project first. No existing CRM tables change.
begin;

create table public.owner_businesses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  display_name text not null,
  published_version bigint
);
create table public.owner_memberships (
  business_id uuid not null references public.owner_businesses(id),
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'editor', 'viewer')),
  primary key (business_id, user_id)
);
create table public.owner_menu_drafts (
  business_id uuid primary key references public.owner_businesses(id),
  content jsonb not null,
  revision bigint not null default 1 check (revision > 0),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);
create table public.owner_menu_publications (
  business_id uuid not null references public.owner_businesses(id),
  version bigint not null check (version > 0),
  content jsonb not null,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  restored_from bigint,
  primary key (business_id, version)
);
alter table public.owner_businesses add constraint owner_current_publication
  foreign key (id, published_version) references public.owner_menu_publications(business_id, version);

create function public.owner_menu_valid(doc jsonb) returns boolean
language plpgsql immutable set search_path = '' as $$
declare cat jsonb; item jsonb; cats text[] := '{}'; items text[] := '{}'; field text;
begin
  if doc is null or jsonb_typeof(doc) <> 'object' or doc->'schemaVersion' <> '1'::jsonb or not (doc ? 'schemaVersion')
    or jsonb_typeof(doc->'categories') is distinct from 'array' or octet_length(doc::text) > 200000
    or exists(select 1 from jsonb_object_keys(doc) k where k not in ('schemaVersion','categories')) then return false; end if;
  if jsonb_array_length(doc->'categories') not between 1 and 30 then return false; end if;
  for cat in select * from jsonb_array_elements(doc->'categories') loop
    if jsonb_typeof(cat) <> 'object' then return false; end if;
    if exists(select 1 from jsonb_object_keys(cat) k where k not in ('id','title','note','items')) then return false; end if;
    if jsonb_typeof(cat->'id') is distinct from 'string' or length(cat->>'id') not between 1 and 80
      or (cat->>'id') !~ '^[a-z0-9-]+$' or cat->>'id' = any(cats)
      or jsonb_typeof(cat->'title') is distinct from 'string' or length(btrim(cat->>'title')) < 1 or length(cat->>'title') > 100
      or jsonb_typeof(cat->'items') is distinct from 'array' then return false; end if;
    if cat ? 'note' and (jsonb_typeof(cat->'note') <> 'string' or length(cat->>'note') > 500) then return false; end if;
    if jsonb_array_length(cat->'items') > 100 then return false; end if;
    cats := array_append(cats, cat->>'id');
    for item in select * from jsonb_array_elements(cat->'items') loop
      if jsonb_typeof(item) <> 'object' then return false; end if;
      if exists(select 1 from jsonb_object_keys(item) k where k not in ('id','name','sourceName','price','description','available','needsConfirmation')) then return false; end if;
      if jsonb_typeof(item->'id') is distinct from 'string' or length(item->>'id') not between 1 and 100
        or (item->>'id') !~ '^[a-z0-9-]+$' or item->>'id' = any(items)
        or jsonb_typeof(item->'name') is distinct from 'string' or length(btrim(item->>'name')) < 1 or length(item->>'name') > 150
        or jsonb_typeof(item->'sourceName') is distinct from 'string' or length(btrim(item->>'sourceName')) < 1 or length(item->>'sourceName') > 150
        or jsonb_typeof(item->'available') is distinct from 'boolean' or not (item ? 'price') then return false; end if;
      if item->'price' <> 'null'::jsonb and (jsonb_typeof(item->'price') <> 'string' or length(btrim(item->>'price')) < 1 or length(item->>'price') > 100) then return false; end if;
      if item ? 'description' and (jsonb_typeof(item->'description') <> 'string' or length(item->>'description') > 1000) then return false; end if;
      if item ? 'needsConfirmation' and jsonb_typeof(item->'needsConfirmation') <> 'boolean' then return false; end if;
      -- PostgreSQL rejects NUL in JSON; reject the remaining non-printing controls.
      foreach field in array array['name','sourceName','price','description'] loop
        if coalesce(item->>field, '') ~ '[\x01-\x08\x0B\x0C\x0E-\x1F]' then return false; end if;
      end loop;
      items := array_append(items, item->>'id');
    end loop;
    if (cat->>'title') ~ '[\x01-\x08\x0B\x0C\x0E-\x1F]' or coalesce(cat->>'note','') ~ '[\x01-\x08\x0B\x0C\x0E-\x1F]' then return false; end if;
  end loop;
  return true;
exception when others then return false;
end;
$$;
alter table public.owner_menu_drafts add constraint owner_valid_draft check (public.owner_menu_valid(content));
alter table public.owner_menu_publications add constraint owner_valid_publication check (public.owner_menu_valid(content));

create function public.owner_is_member(target uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.owner_memberships where business_id = target and user_id = auth.uid());
$$;
alter table public.owner_businesses enable row level security;
alter table public.owner_memberships enable row level security;
alter table public.owner_menu_drafts enable row level security;
alter table public.owner_menu_publications enable row level security;
create policy owner_business_read on public.owner_businesses for select to authenticated using (public.owner_is_member(id));
create policy owner_membership_read on public.owner_memberships for select to authenticated using (user_id = auth.uid());
create policy owner_draft_read on public.owner_menu_drafts for select to authenticated using (public.owner_is_member(business_id));
create policy owner_history_read on public.owner_menu_publications for select to authenticated using (public.owner_is_member(business_id));
revoke all on public.owner_businesses, public.owner_memberships, public.owner_menu_drafts, public.owner_menu_publications from anon, authenticated;
grant select on public.owner_businesses, public.owner_memberships, public.owner_menu_drafts, public.owner_menu_publications to authenticated;

-- The only anonymous entry point exposes the currently published snapshot, never a draft/history.
create function public.owner_public_menu(p_slug text) returns jsonb
language sql stable security definer set search_path = '' as $$
  select jsonb_build_object('version', p.version, 'content', p.content)
  from public.owner_businesses b join public.owner_menu_publications p
    on p.business_id = b.id and p.version = b.published_version where b.slug = p_slug;
$$;

-- All mutations serialize on the draft row. Revision checks stop silent overwrites.
-- Publication, pointer update and draft revision are one database transaction.
create function public.owner_menu_write(p_business uuid, p_revision bigint, p_operation text, p_content jsonb default null, p_restore bigint default null) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare member_role text; draft public.owner_menu_drafts; next_content jsonb; current_version bigint; next_version bigint;
begin
  if auth.uid() is null then raise exception 'Not authorized' using errcode = '42501'; end if;
  select role into member_role from public.owner_memberships where business_id = p_business and user_id = auth.uid() for share;
  if member_role is null or member_role = 'viewer' or (p_operation in ('publish','restore') and member_role <> 'owner') then
    raise exception 'Not authorized' using errcode = '42501';
  end if;
  if p_operation is null or p_operation not in ('save','publish','restore') then raise exception 'Invalid operation' using errcode = '22023'; end if;
  select * into draft from public.owner_menu_drafts where business_id = p_business for update;
  if not found then raise exception 'Menu setup is incomplete' using errcode = '22023'; end if;
  if p_revision is distinct from draft.revision then raise exception 'Draft changed. Reload before saving.' using errcode = '40001'; end if;
  select published_version into current_version from public.owner_businesses where id = p_business;
  if p_operation = 'save' then
    if not public.owner_menu_valid(p_content) then raise exception 'Invalid menu' using errcode = '22023'; end if;
    next_content := p_content;
  elsif p_operation = 'restore' then
    select content into next_content from public.owner_menu_publications where business_id = p_business and version = p_restore;
    if not found then raise exception 'Version not found' using errcode = '22023'; end if;
  else next_content := draft.content;
  end if;
  if p_operation in ('publish','restore') then
    -- A second publish of unchanged content does not create a duplicate version.
    if exists(select 1 from public.owner_menu_publications where business_id = p_business and version = current_version and content = next_content) then
      next_version := current_version;
    else
      select coalesce(max(version),0) + 1 into next_version from public.owner_menu_publications where business_id = p_business;
      insert into public.owner_menu_publications(business_id, version, content, created_by, restored_from)
        values(p_business, next_version, next_content, auth.uid(), case when p_operation = 'restore' then p_restore end);
      update public.owner_businesses set published_version = next_version where id = p_business;
    end if;
  end if;
  update public.owner_menu_drafts set content = next_content, revision = revision + 1, updated_at = now(), updated_by = auth.uid() where business_id = p_business;
  return jsonb_build_object('revision', draft.revision + 1, 'version', coalesce(next_version,current_version));
end;
$$;
revoke all on function public.owner_is_member(uuid), public.owner_menu_valid(jsonb), public.owner_public_menu(text), public.owner_menu_write(uuid,bigint,text,jsonb,bigint) from public, anon, authenticated;
grant execute on function public.owner_is_member(uuid), public.owner_menu_valid(jsonb) to authenticated;
grant execute on function public.owner_public_menu(text) to anon, authenticated;
grant execute on function public.owner_menu_write(uuid,bigint,text,jsonb,bigint) to authenticated;
commit;
