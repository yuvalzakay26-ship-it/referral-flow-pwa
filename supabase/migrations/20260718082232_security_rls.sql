-- ===========================================================================
-- ReferralFlow — 0002 security & RLS
-- is_admin() owner check + Row Level Security on every application table.
-- Only a user listed in public.admin_users (the single owner) may access data.
-- No anonymous access. No public submission path.
-- ===========================================================================

-- Owner check. SECURITY DEFINER so it can read admin_users regardless of the
-- caller's own RLS, with an empty search_path to prevent search-path hijacking.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1 from public.admin_users where user_id = (select auth.uid())
  );
$$;

-- Lock down who can call it: authenticated users only (never anon/public).
revoke all on function public.is_admin() from public;
revoke all on function public.is_admin() from anon;
grant execute on function public.is_admin() to authenticated;

-- Enable RLS -----------------------------------------------------------------
alter table public.candidates               enable row level security;
alter table public.candidate_status_history enable row level security;
alter table public.candidate_notes          enable row level security;
alter table public.follow_ups               enable row level security;
alter table public.jobs                     enable row level security;
alter table public.message_templates        enable row level security;
alter table public.app_settings             enable row level security;
alter table public.admin_users              enable row level security;

-- Owner-only policies. FOR ALL covers select/insert/update/delete; both USING
-- (read/return rows) and WITH CHECK (write) require the owner. No using(true).
create policy "owner all candidates" on public.candidates
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "owner all status_history" on public.candidate_status_history
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "owner all notes" on public.candidate_notes
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "owner all follow_ups" on public.follow_ups
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "owner all jobs" on public.jobs
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "owner all templates" on public.message_templates
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "owner all settings" on public.app_settings
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- admin_users: the owner may read the allow-list (to confirm authorization).
-- Inserts/updates/deletes happen only via the one-time bootstrap SQL (service
-- role / SQL editor), never through the Data API.
create policy "owner read admin_users" on public.admin_users
  for select to authenticated using (public.is_admin());
