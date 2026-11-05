-- Nova Covenant: enquiry leads table.
-- Run once in Supabase → SQL Editor → New query → paste → Run.
-- Safe to re-run: every statement is idempotent.
-- No login is required to submit a lead; nobody can read leads through the public API.

create table if not exists public.leads (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  -- What the buyer submitted (limits match lib/validation.ts)
  full_name       text not null check (char_length(full_name) between 1 and 120),
  company_name    text not null check (char_length(company_name) between 1 and 160),
  business_email  text not null check (char_length(business_email) between 3 and 200),
  country         text not null check (char_length(country) between 1 and 80),
  division        text not null check (division in ('Automotive & Mobility', 'Food & Agriculture', 'General Trading Enquiry')),
  requirement     text not null check (char_length(requirement) between 1 and 200),
  message         text not null check (char_length(message) between 1 and 4000),

  -- Your sales pipeline: edit these in the Supabase Table Editor
  status          text not null default 'new'
                  check (status in ('new', 'contacted', 'quoted', 'won', 'lost', 'spam')),
  notes           text,

  -- Housekeeping
  email_notified  boolean not null default false,
  source          text not null default 'website',
  ip_hash         text,          -- salted hash, never the raw IP (used only for rate limiting)
  user_agent      text
);

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_status_idx     on public.leads (status);
create index if not exists leads_ip_recent_idx  on public.leads (ip_hash, created_at desc);

-- Keep updated_at current when you edit a lead
create or replace function public.leads_set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists leads_set_updated_at on public.leads;
create trigger leads_set_updated_at
  before update on public.leads
  for each row execute function public.leads_set_updated_at();

-- Security: lock the table. Row Level Security is ON with NO policies, so the
-- public API roles (anon = the publishable key, authenticated) can't read, edit
-- or delete leads directly. Leads can only be ADDED, through submit_lead() below.
alter table public.leads enable row level security;
revoke all on table public.leads from anon, authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- submit_lead(): the only way the public can add a lead (no login required).
-- Runs with the table owner's rights (security definer), validates input via the
-- table's CHECK constraints, and enforces rate limits inside the database, so the
-- limits hold even if someone calls the API directly with the publishable key.
-- Returns the new lead's id. Raises 'RATE_LIMITED' when a limit is hit.
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.submit_lead(
  p_full_name      text,
  p_company_name   text,
  p_business_email text,
  p_country        text,
  p_division       text,
  p_requirement    text,
  p_message        text,
  p_ip_hash        text default null,
  p_user_agent     text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
begin
  -- Per connection: 5 leads per 10 minutes
  if p_ip_hash is not null and (
    select count(*) from public.leads
    where ip_hash = p_ip_hash and created_at > now() - interval '10 minutes'
  ) >= 5 then
    raise exception 'RATE_LIMITED: too many enquiries from this connection';
  end if;

  -- Per email address: 5 leads per hour
  if (
    select count(*) from public.leads
    where lower(business_email) = lower(trim(p_business_email))
      and created_at > now() - interval '1 hour'
  ) >= 5 then
    raise exception 'RATE_LIMITED: too many enquiries from this email address';
  end if;

  -- Whole site: 200 leads per hour (flood protection)
  if (select count(*) from public.leads where created_at > now() - interval '1 hour') >= 200 then
    raise exception 'RATE_LIMITED: enquiry volume limit reached';
  end if;

  insert into public.leads (
    full_name, company_name, business_email, country, division,
    requirement, message, ip_hash, user_agent
  ) values (
    trim(p_full_name), trim(p_company_name), lower(trim(p_business_email)), trim(p_country), p_division,
    trim(p_requirement), trim(p_message), left(p_ip_hash, 64), left(p_user_agent, 300)
  )
  returning id into v_id;

  return v_id;
end;
$$;

-- Marks that the email alert for a lead was sent (the only field the public can change).
create or replace function public.mark_lead_notified(p_id uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.leads set email_notified = true where id = p_id;
$$;

create index if not exists leads_email_recent_idx on public.leads (lower(business_email), created_at desc);

revoke all on function public.submit_lead(text, text, text, text, text, text, text, text, text) from public;
revoke all on function public.mark_lead_notified(uuid) from public;
grant execute on function public.submit_lead(text, text, text, text, text, text, text, text, text) to anon, authenticated, service_role;
grant execute on function public.mark_lead_notified(uuid) to anon, authenticated, service_role;
