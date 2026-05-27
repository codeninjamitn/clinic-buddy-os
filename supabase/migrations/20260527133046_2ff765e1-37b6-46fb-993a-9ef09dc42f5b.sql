-- Remove leftover broad lab-reports storage policies
DROP POLICY IF EXISTS "Public read lab-reports" ON storage.objects;
DROP POLICY IF EXISTS "Auth upload lab-reports" ON storage.objects;
DROP POLICY IF EXISTS "Auth update lab-reports" ON storage.objects;
DROP POLICY IF EXISTS "Auth delete lab-reports" ON storage.objects;

-- Tighten clinic-logos write policies with path scoping
DROP POLICY IF EXISTS "Authenticated upload clinic logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated update clinic logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete clinic logos" ON storage.objects;

CREATE POLICY "Clinic upload own logo"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'clinic-logos'
    AND (storage.foldername(name))[1] = (public.current_clinic_id())::text
  );

CREATE POLICY "Clinic update own logo"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'clinic-logos'
    AND (storage.foldername(name))[1] = (public.current_clinic_id())::text
  )
  WITH CHECK (
    bucket_id = 'clinic-logos'
    AND (storage.foldername(name))[1] = (public.current_clinic_id())::text
  );

CREATE POLICY "Clinic delete own logo"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'clinic-logos'
    AND (storage.foldername(name))[1] = (public.current_clinic_id())::text
  );