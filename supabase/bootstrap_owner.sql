-- ===========================================================================
-- ReferralFlow — ONE-TIME owner bootstrap
-- ===========================================================================
-- Run this ONCE, after the migrations are applied AND the single owner account
-- has been created in Supabase Authentication (Dashboard → Authentication →
-- Users → "Add user", or an authenticated admin tool). Passwords are managed by
-- Supabase Auth and are never stored here.
--
-- This inserts the existing owner's auth.users id into public.admin_users, which
-- is what is_admin() (and therefore every RLS policy) checks.
--
-- Usage: replace OWNER_EMAIL_HERE with the owner's email, then run in the
-- Supabase SQL editor. The real email is intentionally NOT committed to git.
-- ===========================================================================

insert into public.admin_users (user_id)
select id
from auth.users
where lower(email) = lower('OWNER_EMAIL_HERE')
on conflict (user_id) do nothing;

-- Verify exactly one owner is registered (should return 1 row):
-- select user_id, created_at from public.admin_users;
