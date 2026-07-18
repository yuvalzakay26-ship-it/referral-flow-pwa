-- ===========================================================================
-- ReferralFlow — 0003 private CV storage
-- Private 'cvs' bucket + owner-only storage RLS. Files are served ONLY through
-- short-lived signed URLs generated server-side; never public URLs.
-- Object path convention: <owner-user-id>/<candidate-id>/<uuid>-<filename>
-- ===========================================================================

-- Private bucket with allowed MIME types and an 8 MB size cap.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'cvs',
  'cvs',
  false,
  8388608, -- 8 MB
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Storage RLS: only the owner (is_admin) may touch objects in the cvs bucket,
-- and only under their own user-id folder. Anonymous users are denied even if
-- they know a path. Upsert needs INSERT + SELECT + UPDATE.
create policy "owner select cvs" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'cvs'
    and public.is_admin()
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "owner insert cvs" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'cvs'
    and public.is_admin()
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "owner update cvs" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'cvs'
    and public.is_admin()
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'cvs'
    and public.is_admin()
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "owner delete cvs" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'cvs'
    and public.is_admin()
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
