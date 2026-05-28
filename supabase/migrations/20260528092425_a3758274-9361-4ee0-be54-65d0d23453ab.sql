-- Allow read on clinic-logos for any authenticated user (bucket is public anyway via direct URL).
-- This is required so that supabase-js upsert=true can perform its conflict check.
CREATE POLICY "Clinic logos authenticated read"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'clinic-logos');
