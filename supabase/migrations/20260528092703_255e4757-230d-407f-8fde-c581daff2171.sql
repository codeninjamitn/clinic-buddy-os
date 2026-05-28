DROP POLICY IF EXISTS "Clinic logos authenticated read" ON storage.objects;

CREATE POLICY "Clinic members read own clinic logos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'clinic-logos'
  AND (
    (storage.foldername(name))[1] = (current_clinic_id())::text
    OR is_super_admin()
  )
);
