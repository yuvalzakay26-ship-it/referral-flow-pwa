-- ===========================================================================
-- ReferralFlow — Supabase schema (planning / reference)
-- Run in the Supabase SQL editor once you are ready to move off mock mode.
-- Mirrors the TypeScript types in src/types/index.ts.
-- ===========================================================================

-- Extensions ----------------------------------------------------------------
create extension if not exists "pgcrypto";

-- Enums ---------------------------------------------------------------------
create type candidate_status as enum (
  'new', 'pending_review', 'missing_details', 'possible_duplicate',
  'transferred', 'in_recruitment', 'not_suitable', 'accepted',
  'bonus_pending', 'bonus_received', 'closed'
);

create type eligibility_status as enum ('eligible', 'review', 'likely_existing');
create type yes_no_unsure     as enum ('yes', 'no', 'unsure');
create type bonus_status      as enum ('none', 'not_eligible', 'pending', 'received');
create type job_type          as enum ('full_time', 'part_time', 'student', 'shifts', 'flexible');
create type job_priority      as enum ('low', 'medium', 'high');
create type job_status        as enum ('draft', 'published');

-- ---------------------------------------------------------------------------
-- candidates
-- ---------------------------------------------------------------------------
create table candidates (
  id                          uuid primary key default gen_random_uuid(),
  reference_number            text unique not null,
  full_name                   text not null,
  phone                       text not null,
  email                       text not null,
  city                        text not null,
  linkedin_url                text,
  whatsapp_number             text,
  professional_field          text not null,
  current_role                text not null default '',
  years_of_experience         int  not null default 0,
  education                   text not null default '',
  study_year                  text,
  preferred_job_types         job_type[] not null default '{}',
  preferred_locations         text[]     not null default '{}',
  preferred_job_categories    text[]     not null default '{}',
  technical_skills            text[]     not null default '{}',
  professional_summary        text not null default '',
  cv_file_name                text,
  cv_storage_path             text,               -- path in the private bucket
  applied_last_12_months      yes_no_unsure not null,
  referred_by_another_employee yes_no_unsure not null,
  contacted_recruiter_before  yes_no_unsure not null,
  eligibility_status          eligibility_status not null default 'review',
  source                      text not null default 'direct-link',
  source_details              text not null default '',
  date_received               date,
  status                      candidate_status not null default 'new',
  internal_notes              text not null default '',
  referral_date               date,
  referred_position           text,
  general_category            text,
  follow_up_date              date,
  bonus_status                bonus_status not null default 'none',
  bonus_amount                numeric,
  closure_reason              text,
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now()
);
create index candidates_status_idx     on candidates (status);
create index candidates_created_at_idx on candidates (created_at desc);

-- ---------------------------------------------------------------------------
-- candidate_status_history
-- ---------------------------------------------------------------------------
create table candidate_status_history (
  id           uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references candidates (id) on delete cascade,
  from_status  candidate_status,
  to_status    candidate_status not null,
  changed_by   text not null,
  note         text,
  created_at   timestamptz not null default now()
);
create index csh_candidate_idx on candidate_status_history (candidate_id);

-- ---------------------------------------------------------------------------
-- candidate_notes  (internal only — never exposed to applicants)
-- ---------------------------------------------------------------------------
create table candidate_notes (
  id           uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references candidates (id) on delete cascade,
  author       text not null,
  body         text not null,
  created_at   timestamptz not null default now()
);
create index notes_candidate_idx on candidate_notes (candidate_id);

-- ---------------------------------------------------------------------------
-- jobs
-- ---------------------------------------------------------------------------
create table jobs (
  id                 uuid primary key default gen_random_uuid(),
  title              text not null,
  category           text not null,
  location           text not null,
  employment_type    job_type not null,
  short_description  text not null default '',
  requirements       text[] not null default '{}',
  priority           job_priority not null default 'medium',
  status             job_status not null default 'draft',
  internal_notes     text not null default '',
  external_reference text not null default '',
  is_active          boolean not null default true,
  created_at         timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- message_templates
-- ---------------------------------------------------------------------------
create table message_templates (
  key        text primary key,
  title      text not null,
  body       text not null,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- sources  (reference table for known acquisition sources)
-- ---------------------------------------------------------------------------
create table sources (
  key   text primary key,
  label text not null
);

-- ---------------------------------------------------------------------------
-- follow_ups
-- ---------------------------------------------------------------------------
create table follow_ups (
  id           uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references candidates (id) on delete cascade,
  due_date     date not null,
  note         text not null default '',
  done         boolean not null default false,
  created_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- app_settings  (single row)
-- ---------------------------------------------------------------------------
create table app_settings (
  id                      int primary key default 1 check (id = 1),
  app_name                text not null default 'ReferralFlow',
  admin_display_name      text not null,
  default_whatsapp_number text not null,
  whatsapp_channel_url    text not null,
  default_job_post_ending text not null default '',
  disclaimer_text         text not null default '',
  default_follow_up_days   int  not null default 7,
  default_bonus_amount    numeric
);

-- ---------------------------------------------------------------------------
-- admin_users  (maps to auth.users)
-- ---------------------------------------------------------------------------
create table admin_users (
  id           uuid primary key references auth.users (id) on delete cascade,
  email        text not null,
  display_name text not null,
  created_at   timestamptz not null default now()
);

-- updated_at trigger --------------------------------------------------------
create or replace function set_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger candidates_updated_at
  before update on candidates
  for each row execute function set_updated_at();

-- ===========================================================================
-- Row Level Security (RLS)
-- ===========================================================================
alter table candidates               enable row level security;
alter table candidate_status_history enable row level security;
alter table candidate_notes          enable row level security;
alter table jobs                     enable row level security;
alter table message_templates        enable row level security;
alter table follow_ups               enable row level security;
alter table app_settings             enable row level security;
alter table admin_users              enable row level security;

-- Helper: is the current user an admin?
create or replace function is_admin() returns boolean as $$
  select exists (select 1 from admin_users where id = auth.uid());
$$ language sql security definer stable;

-- Admins can do everything on candidate data ...
create policy "admins manage candidates"
  on candidates for all using (is_admin()) with check (is_admin());
create policy "admins manage history"
  on candidate_status_history for all using (is_admin()) with check (is_admin());
create policy "admins manage notes"
  on candidate_notes for all using (is_admin()) with check (is_admin());
create policy "admins manage jobs"
  on jobs for all using (is_admin()) with check (is_admin());
create policy "admins manage templates"
  on message_templates for all using (is_admin()) with check (is_admin());
create policy "admins manage follow_ups"
  on follow_ups for all using (is_admin()) with check (is_admin());
create policy "admins manage settings"
  on app_settings for all using (is_admin()) with check (is_admin());
create policy "admins read admin_users"
  on admin_users for select using (is_admin());

-- This is an ADMIN-ONLY system. There is no public candidate submission path.
-- The public (anon) role must have NO access to any table here. All candidate
-- creation and updates happen server-side while authenticated as the admin.
-- (Never add a public INSERT/SELECT policy on `candidates` or `candidate_notes`.)
-- Do NOT expose a public "published jobs" policy — job posts are shared manually
-- by the administrator via WhatsApp, not served from a public endpoint.

-- ===========================================================================
-- Private CV storage bucket
-- ===========================================================================
-- In the Supabase dashboard (or via the storage API) create a PRIVATE bucket:
--   name: cvs   public: false
-- Never generate public URLs for CV files. Serve downloads to authenticated
-- admins via short-lived signed URLs created server-side:
--   supabase.storage.from('cvs').createSignedUrl(path, 60)
--
-- Storage RLS example (objects table):
-- create policy "admins read cvs"
--   on storage.objects for select
--   using (bucket_id = 'cvs' and is_admin());
