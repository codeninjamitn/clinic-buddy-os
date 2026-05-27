
-- 1. Super admin flag on staff
ALTER TABLE public.staff
  ADD COLUMN IF NOT EXISTS is_super_admin boolean DEFAULT false;

-- 2. Status/plan/created_by on clinics
ALTER TABLE public.clinics
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'clinics_status_check') THEN
    ALTER TABLE public.clinics ADD CONSTRAINT clinics_status_check
      CHECK (status IN ('active','suspended','setup'));
  END IF;
END $$;

ALTER TABLE public.clinics
  ADD COLUMN IF NOT EXISTS plan text DEFAULT 'starter';
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'clinics_plan_check') THEN
    ALTER TABLE public.clinics ADD CONSTRAINT clinics_plan_check
      CHECK (plan IN ('starter','pro','enterprise'));
  END IF;
END $$;

ALTER TABLE public.clinics
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS registration_number text,
  ADD COLUMN IF NOT EXISTS created_by uuid;

-- 3. Helper: is_super_admin()
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.staff
    WHERE (auth_user_id = auth.uid() OR user_id = auth.uid())
      AND is_super_admin = true
  );
$$;

-- 4. clinic_invites
CREATE TABLE IF NOT EXISTS public.clinic_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid REFERENCES public.clinics(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text NOT NULL,
  name text NOT NULL,
  temp_password text NOT NULL,
  accepted boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clinic_invites TO authenticated;
GRANT ALL ON public.clinic_invites TO service_role;
ALTER TABLE public.clinic_invites ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "super admin manage invites" ON public.clinic_invites;
CREATE POLICY "super admin manage invites" ON public.clinic_invites
  FOR ALL TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

-- 5. super_admin_log
CREATE TABLE IF NOT EXISTS public.super_admin_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action text NOT NULL,
  clinic_id uuid REFERENCES public.clinics(id) ON DELETE SET NULL,
  clinic_name text,
  performed_by uuid,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);
GRANT SELECT, INSERT ON public.super_admin_log TO authenticated;
GRANT ALL ON public.super_admin_log TO service_role;
ALTER TABLE public.super_admin_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "super admin read log" ON public.super_admin_log;
CREATE POLICY "super admin read log" ON public.super_admin_log
  FOR SELECT TO authenticated USING (public.is_super_admin());
DROP POLICY IF EXISTS "super admin insert log" ON public.super_admin_log;
CREATE POLICY "super admin insert log" ON public.super_admin_log
  FOR INSERT TO authenticated WITH CHECK (public.is_super_admin());

-- 6. Allow super admins to read/manage all clinics across the platform
DROP POLICY IF EXISTS "super admin all clinics select" ON public.clinics;
CREATE POLICY "super admin all clinics select" ON public.clinics
  FOR SELECT TO authenticated USING (public.is_super_admin());
DROP POLICY IF EXISTS "super admin all clinics insert" ON public.clinics;
CREATE POLICY "super admin all clinics insert" ON public.clinics
  FOR INSERT TO authenticated WITH CHECK (public.is_super_admin());
DROP POLICY IF EXISTS "super admin all clinics update" ON public.clinics;
CREATE POLICY "super admin all clinics update" ON public.clinics
  FOR UPDATE TO authenticated USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());
DROP POLICY IF EXISTS "super admin all clinics delete" ON public.clinics;
CREATE POLICY "super admin all clinics delete" ON public.clinics
  FOR DELETE TO authenticated USING (public.is_super_admin());

-- Super admin staff management across clinics (for reads in overview)
DROP POLICY IF EXISTS "super admin read all staff" ON public.staff;
CREATE POLICY "super admin read all staff" ON public.staff
  FOR SELECT TO authenticated USING (public.is_super_admin());
DROP POLICY IF EXISTS "super admin insert any staff" ON public.staff;
CREATE POLICY "super admin insert any staff" ON public.staff
  FOR INSERT TO authenticated WITH CHECK (public.is_super_admin());

DROP POLICY IF EXISTS "super admin read all patients" ON public.patients;
CREATE POLICY "super admin read all patients" ON public.patients
  FOR SELECT TO authenticated USING (public.is_super_admin());

DROP POLICY IF EXISTS "super admin read all appts" ON public.appointments;
CREATE POLICY "super admin read all appts" ON public.appointments
  FOR SELECT TO authenticated USING (public.is_super_admin());

DROP POLICY IF EXISTS "super admin insert any inventory" ON public.inventory;
CREATE POLICY "super admin insert any inventory" ON public.inventory
  FOR INSERT TO authenticated WITH CHECK (public.is_super_admin());

-- 7. Add ON DELETE CASCADE FKs so deleting a clinic removes its data
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'staff_clinic_fk') THEN
    ALTER TABLE public.staff ADD CONSTRAINT staff_clinic_fk
      FOREIGN KEY (clinic_id) REFERENCES public.clinics(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'patients_clinic_fk') THEN
    ALTER TABLE public.patients ADD CONSTRAINT patients_clinic_fk
      FOREIGN KEY (clinic_id) REFERENCES public.clinics(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'appointments_clinic_fk') THEN
    ALTER TABLE public.appointments ADD CONSTRAINT appointments_clinic_fk
      FOREIGN KEY (clinic_id) REFERENCES public.clinics(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'invoices_clinic_fk') THEN
    ALTER TABLE public.invoices ADD CONSTRAINT invoices_clinic_fk
      FOREIGN KEY (clinic_id) REFERENCES public.clinics(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'lab_reports_clinic_fk') THEN
    ALTER TABLE public.lab_reports ADD CONSTRAINT lab_reports_clinic_fk
      FOREIGN KEY (clinic_id) REFERENCES public.clinics(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'inventory_clinic_fk') THEN
    ALTER TABLE public.inventory ADD CONSTRAINT inventory_clinic_fk
      FOREIGN KEY (clinic_id) REFERENCES public.clinics(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'prescriptions_clinic_fk') THEN
    ALTER TABLE public.prescriptions ADD CONSTRAINT prescriptions_clinic_fk
      FOREIGN KEY (clinic_id) REFERENCES public.clinics(id) ON DELETE CASCADE;
  END IF;
END $$;
