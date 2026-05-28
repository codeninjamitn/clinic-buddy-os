
CREATE POLICY "Public read clinic logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'clinic-logos');

CREATE POLICY "Super admin upload clinic logos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'clinic-logos' AND public.is_super_admin());

CREATE POLICY "Super admin update clinic logos"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'clinic-logos' AND public.is_super_admin())
WITH CHECK (bucket_id = 'clinic-logos' AND public.is_super_admin());

CREATE POLICY "Super admin delete clinic logos"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'clinic-logos' AND public.is_super_admin());
