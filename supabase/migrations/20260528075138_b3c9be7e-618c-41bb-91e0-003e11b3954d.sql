-- 1. Restrict SECURITY DEFINER helpers to authenticated users only
REVOKE EXECUTE ON FUNCTION public.current_clinic_id() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_current_staff_role() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_super_admin() FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.current_clinic_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_current_staff_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_super_admin() TO authenticated;

-- 2. Remove broad listing policy on clinic-logos bucket.
-- The bucket is public so logos are still served via their direct public URL;
-- removing the SELECT policy on storage.objects prevents clients from listing files.
DROP POLICY IF EXISTS "Public read clinic logos" ON storage.objects;
