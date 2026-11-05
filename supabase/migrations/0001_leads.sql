-- Nova Covenant: enquiry leads table.
-- Run once in Supabase → SQL Editor → New query → paste → Run.
-- Safe to re-run: every statement is idempotent.

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
-- public (anon) and signed-in (authenticated) API roles can neither read nor write.
-- Only the website's server, using the secret key, can insert leads.
alter table public.leads enable row level security;
revoke all on table public.leads from anon, authenticated;
