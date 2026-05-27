
-- 1. Add user_id link on staff
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS user_id uuid;
CREATE INDEX IF NOT EXISTS staff_user_id_idx ON public.staff(user_id);
CREATE INDEX IF NOT EXISTS staff_clinic_id_idx ON public.staff(clinic_id);

-- 2. Helper: current user's clinic_id (security definer to avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.current_clinic_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT clinic_id FROM public.staff
  WHERE user_id = auth.uid() AND is_active = true
  LIMIT 1
$$;

GRANT EXECUTE ON FUNCTION public.current_clinic_id() TO authenticated;

-- 3. Replace permissive policies with clinic-scoped ones
DROP POLICY IF EXISTS "auth all clinics" ON public.clinics;
DROP POLICY IF EXISTS "auth all staff" ON public.staff;
DROP POLICY IF EXISTS "auth all patients" ON public.patients;
DROP POLICY IF EXISTS "auth all appointments" ON public.appointments;
DROP POLICY IF EXISTS "auth all invoices" ON public.invoices;
DROP POLICY IF EXISTS "auth all lab_reports" ON public.lab_reports;
DROP POLICY IF EXISTS "auth all inventory" ON public.inventory;

-- clinics: members can read/update their own clinic
CREATE POLICY "clinic members read clinic" ON public.clinics FOR SELECT TO authenticated
  USING (id = public.current_clinic_id());
CREATE POLICY "clinic members update clinic" ON public.clinics FOR UPDATE TO authenticated
  USING (id = public.current_clinic_id()) WITH CHECK (id = public.current_clinic_id());

-- staff: members can see staff in their clinic
CREATE POLICY "clinic members read staff" ON public.staff FOR SELECT TO authenticated
  USING (clinic_id = public.current_clinic_id());
CREATE POLICY "clinic members manage staff" ON public.staff FOR INSERT TO authenticated
  WITH CHECK (clinic_id = public.current_clinic_id());
CREATE POLICY "clinic members update staff" ON public.staff FOR UPDATE TO authenticated
  USING (clinic_id = public.current_clinic_id()) WITH CHECK (clinic_id = public.current_clinic_id());
CREATE POLICY "clinic members delete staff" ON public.staff FOR DELETE TO authenticated
  USING (clinic_id = public.current_clinic_id());

-- patients
CREATE POLICY "clinic patients select" ON public.patients FOR SELECT TO authenticated
  USING (clinic_id = public.current_clinic_id());
CREATE POLICY "clinic patients insert" ON public.patients FOR INSERT TO authenticated
  WITH CHECK (clinic_id = public.current_clinic_id());
CREATE POLICY "clinic patients update" ON public.patients FOR UPDATE TO authenticated
  USING (clinic_id = public.current_clinic_id()) WITH CHECK (clinic_id = public.current_clinic_id());
CREATE POLICY "clinic patients delete" ON public.patients FOR DELETE TO authenticated
  USING (clinic_id = public.current_clinic_id());

-- appointments
CREATE POLICY "clinic appts select" ON public.appointments FOR SELECT TO authenticated
  USING (clinic_id = public.current_clinic_id());
CREATE POLICY "clinic appts insert" ON public.appointments FOR INSERT TO authenticated
  WITH CHECK (clinic_id = public.current_clinic_id());
CREATE POLICY "clinic appts update" ON public.appointments FOR UPDATE TO authenticated
  USING (clinic_id = public.current_clinic_id()) WITH CHECK (clinic_id = public.current_clinic_id());
CREATE POLICY "clinic appts delete" ON public.appointments FOR DELETE TO authenticated
  USING (clinic_id = public.current_clinic_id());

-- invoices
CREATE POLICY "clinic invoices select" ON public.invoices FOR SELECT TO authenticated
  USING (clinic_id = public.current_clinic_id());
CREATE POLICY "clinic invoices insert" ON public.invoices FOR INSERT TO authenticated
  WITH CHECK (clinic_id = public.current_clinic_id());
CREATE POLICY "clinic invoices update" ON public.invoices FOR UPDATE TO authenticated
  USING (clinic_id = public.current_clinic_id()) WITH CHECK (clinic_id = public.current_clinic_id());
CREATE POLICY "clinic invoices delete" ON public.invoices FOR DELETE TO authenticated
  USING (clinic_id = public.current_clinic_id());

-- lab_reports
CREATE POLICY "clinic labs select" ON public.lab_reports FOR SELECT TO authenticated
  USING (clinic_id = public.current_clinic_id());
CREATE POLICY "clinic labs insert" ON public.lab_reports FOR INSERT TO authenticated
  WITH CHECK (clinic_id = public.current_clinic_id());
CREATE POLICY "clinic labs update" ON public.lab_reports FOR UPDATE TO authenticated
  USING (clinic_id = public.current_clinic_id()) WITH CHECK (clinic_id = public.current_clinic_id());
CREATE POLICY "clinic labs delete" ON public.lab_reports FOR DELETE TO authenticated
  USING (clinic_id = public.current_clinic_id());

-- inventory
CREATE POLICY "clinic inv select" ON public.inventory FOR SELECT TO authenticated
  USING (clinic_id = public.current_clinic_id());
CREATE POLICY "clinic inv insert" ON public.inventory FOR INSERT TO authenticated
  WITH CHECK (clinic_id = public.current_clinic_id());
CREATE POLICY "clinic inv update" ON public.inventory FOR UPDATE TO authenticated
  USING (clinic_id = public.current_clinic_id()) WITH CHECK (clinic_id = public.current_clinic_id());
CREATE POLICY "clinic inv delete" ON public.inventory FOR DELETE TO authenticated
  USING (clinic_id = public.current_clinic_id());

-- 4. Make lab-reports bucket private and lock down storage policies
UPDATE storage.buckets SET public = false WHERE id = 'lab-reports';

DROP POLICY IF EXISTS "Public read lab reports" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload lab reports" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated update lab reports" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete lab reports" ON storage.objects;
DROP POLICY IF EXISTS "lab reports public read" ON storage.objects;
DROP POLICY IF EXISTS "lab reports auth upload" ON storage.objects;
DROP POLICY IF EXISTS "lab reports auth update" ON storage.objects;
DROP POLICY IF EXISTS "lab reports auth delete" ON storage.objects;

CREATE POLICY "lab-reports clinic read" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'lab-reports' AND (storage.foldername(name))[1] = public.current_clinic_id()::text);
CREATE POLICY "lab-reports clinic insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'lab-reports' AND (storage.foldername(name))[1] = public.current_clinic_id()::text);
CREATE POLICY "lab-reports clinic update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'lab-reports' AND (storage.foldername(name))[1] = public.current_clinic_id()::text);
CREATE POLICY "lab-reports clinic delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'lab-reports' AND (storage.foldername(name))[1] = public.current_clinic_id()::text);

-- 5. Link demo admin account to seeded clinic so the existing demo login keeps working
UPDATE public.staff
SET user_id = (SELECT id FROM auth.users WHERE email = 'admin@ramaiaiclinic.in' LIMIT 1)
WHERE id = (
  SELECT id FROM public.staff
  WHERE clinic_id = '7be3d5cc-5687-4593-9608-84688368946e'
  ORDER BY created_at ASC LIMIT 1
)
AND EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@ramaiaiclinic.in');
