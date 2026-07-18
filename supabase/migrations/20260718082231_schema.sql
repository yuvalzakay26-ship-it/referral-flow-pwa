-- ===========================================================================
-- ReferralFlow — 0001 schema
-- Tables, enums, indexes and updated_at triggers.
-- Source of truth: src/types/index.ts. Single-owner private CRM — there is NO
-- public submission path. RLS + storage policies are defined in later migrations.
-- ===========================================================================

create extension if not exists "pgcrypto";

-- Enums ---------------------------------------------------------------------
do $$ begin
  create type candidate_status as enum (
    'new', 'pending_review', 'missing_details', 'possible_duplicate',
    'transferred', 'in_recruitment', 'not_suitable', 'accepted',
    'bonus_pending', 'bonus_received', 'closed'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type eligibility_status as enum ('eligible', 'review', 'likely_existing');
exception when duplicate_object then null; end $$;

do $$ begin
  create type yes_no_unsure as enum ('yes', 'no', 'unsure');
exception when duplicate_object then null; end $$;

do $$ begin
  create type bonus_status as enum ('none', 'not_eligible', 'pending', 'received');
exception when duplicate_object then null; end $$;

do $$ begin
  create type job_type as enum ('full_time', 'part_time', 'student', 'shifts', 'flexible');
exception when duplicate_object then null; end $$;

do $$ begin
  create type job_priority as enum ('low', 'medium', 'high');
exception when duplicate_object then null; end $$;

do $$ begin
  create type job_status as enum ('draft', 'published');
exception when duplicate_object then null; end $$;

-- updated_at trigger helper -------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- candidates
-- ---------------------------------------------------------------------------
create table if not exists public.candidates (
  id                           uuid primary key default gen_random_uuid(),
  reference_number             text unique not null,
  full_name                    text not null,
  phone                        text not null,
  email                        text not null,
  city                         text not null,
  linkedin_url                 text,
  whatsapp_number              text,
  professional_field           text not null,
  "current_role"               text not null default '',
  years_of_experience          int  not null default 0,
  education                    text not null default '',
  study_year                   text,
  preferred_job_types          job_type[] not null default '{}',
  preferred_locations          text[]     not null default '{}',
  preferred_job_categories     text[]     not null default '{}',
  technical_skills             text[]     not null default '{}',
  professional_summary         text not null default '',
  cv_file_name                 text,
  cv_storage_path              text,
  cv_mime_type                 text,
  cv_size_bytes                bigint,
  applied_last_12_months       yes_no_unsure not null,
  referred_by_another_employee yes_no_unsure not null,
  contacted_recruiter_before   yes_no_unsure not null,
  eligibility_status           eligibility_status not null default 'review',
  source                       text not null default 'direct-link',
  source_details               text not null default '',
  date_received                date,
  status                       candidate_status not null default 'new',
  internal_notes               text not null default '',
  referral_date                date,
  referred_position            text,
  general_category             text,
  follow_up_date               date,
  bonus_status                 bonus_status not null default 'none',
  bonus_amount                 numeric,
  closure_reason               text,
  created_at                   timestamptz not null default now(),
  updated_at                   timestamptz not null default now()
);

create index if not exists candidates_status_idx        on public.candidates (status);
create index if not exists candidates_follow_up_idx      on public.candidates (follow_up_date);
create index if not exists candidates_source_idx         on public.candidates (source);
create index if not exists candidates_field_idx          on public.candidates (professional_field);
create index if not exists candidates_created_at_idx     on public.candidates (created_at desc);
create index if not exists candidates_updated_at_idx     on public.candidates (updated_at desc);
create index if not exists candidates_phone_idx          on public.candidates (phone);
create index if not exists candidates_email_idx          on public.candidates (email);

drop trigger if exists candidates_updated_at on public.candidates;
create trigger candidates_updated_at
  before update on public.candidates
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- candidate_status_history
-- ---------------------------------------------------------------------------
create table if not exists public.candidate_status_history (
  id           uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.candidates (id) on delete cascade,
  from_status  candidate_status,
  to_status    candidate_status not null,
  changed_by   text not null,
  note         text,
  created_at   timestamptz not null default now()
);
create index if not exists csh_candidate_idx
  on public.candidate_status_history (candidate_id, created_at desc);

-- ---------------------------------------------------------------------------
-- candidate_notes (internal only — never exposed to applicants)
-- ---------------------------------------------------------------------------
create table if not exists public.candidate_notes (
  id           uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.candidates (id) on delete cascade,
  author       text not null,
  body         text not null,
  created_at   timestamptz not null default now()
);
create index if not exists notes_candidate_idx
  on public.candidate_notes (candidate_id, created_at desc);

-- ---------------------------------------------------------------------------
-- follow_ups
-- ---------------------------------------------------------------------------
create table if not exists public.follow_ups (
  id           uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.candidates (id) on delete cascade,
  due_date     date not null,
  note         text not null default '',
  done         boolean not null default false,
  completed_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists follow_ups_candidate_idx
  on public.follow_ups (candidate_id, due_date);

drop trigger if exists follow_ups_updated_at on public.follow_ups;
create trigger follow_ups_updated_at
  before update on public.follow_ups
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- jobs
-- ---------------------------------------------------------------------------
create table if not exists public.jobs (
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
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create index if not exists jobs_active_idx on public.jobs (is_active, created_at desc);

drop trigger if exists jobs_updated_at on public.jobs;
create trigger jobs_updated_at
  before update on public.jobs
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- message_templates
-- ---------------------------------------------------------------------------
create table if not exists public.message_templates (
  key        text primary key,
  title      text not null,
  body       text not null,
  updated_at timestamptz not null default now()
);

drop trigger if exists message_templates_updated_at on public.message_templates;
create trigger message_templates_updated_at
  before update on public.message_templates
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- app_settings (single row, id = 1)
-- ---------------------------------------------------------------------------
create table if not exists public.app_settings (
  id                      int primary key default 1 check (id = 1),
  app_name                text not null default 'ReferralFlow',
  admin_display_name      text not null default '',
  default_whatsapp_number text not null default '',
  whatsapp_channel_url    text not null default '',
  default_job_post_ending text not null default '',
  disclaimer_text         text not null default '',
  default_follow_up_days   int  not null default 7,
  default_bonus_amount    numeric,
  updated_at              timestamptz not null default now()
);

drop trigger if exists app_settings_updated_at on public.app_settings;
create trigger app_settings_updated_at
  before update on public.app_settings
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- admin_users (authorized owner allow-list, maps to auth.users)
-- ---------------------------------------------------------------------------
create table if not exists public.admin_users (
  user_id      uuid primary key references auth.users (id) on delete cascade,
  created_at   timestamptz not null default now()
);
