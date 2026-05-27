
-- 1. Add auth_user_id column and backfill from existing user_id
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS auth_user_id uuid REFERENCES auth.users(id);
UPDATE public.staff SET auth_user_id = user_id WHERE auth_user_id IS NULL AND user_id IS NOT NULL;

-- 2. Role lookup function
CREATE OR REPLACE FUNCTION public.get_current_staff_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.staff WHERE auth_user_id = auth.uid() AND is_active = true LIMIT 1;
$$;
REVOKE EXECUTE ON FUNCTION public.get_current_staff_role() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_current_staff_role() FROM anon;
GRANT EXECUTE ON FUNCTION public.get_current_staff_role() TO authenticated;

-- Keep current_clinic_id() compatible with auth_user_id too
CREATE OR REPLACE FUNCTION public.current_clinic_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT clinic_id FROM public.staff
  WHERE (auth_user_id = auth.uid() OR user_id = auth.uid()) AND is_active = true
  LIMIT 1
$$;

-- 3. Create test auth users via a helper procedure
CREATE OR REPLACE FUNCTION public._seed_auth_user(p_email text, p_password text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
  v_uid uuid;
BEGIN
  SELECT id INTO v_uid FROM auth.users WHERE email = p_email;
  IF v_uid IS NULL THEN
    v_uid := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data, is_super_admin,
      confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', v_uid, 'authenticated', 'authenticated',
      p_email, crypt(p_password, gen_salt('bf')),
      now(), now(), now(),
      '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, false,
      '', '', '', ''
    );
    INSERT INTO auth.identities (
      id, user_id, identity_data, provider, provider_id,
      last_sign_in_at, created_at, updated_at
    ) VALUES (
      gen_random_uuid(), v_uid,
      jsonb_build_object('sub', v_uid::text, 'email', p_email),
      'email', v_uid::text, now(), now(), now()
    );
  END IF;
  RETURN v_uid;
END
$$;

DO $$
DECLARE
  v_clinic_id uuid;
  v_doctor uuid;
  v_recep uuid;
  v_lab uuid;
  v_pharma uuid;
BEGIN
  SELECT id INTO v_clinic_id FROM public.clinics ORDER BY created_at ASC LIMIT 1;

  v_doctor := public._seed_auth_user('doctor@ramaiaiclinic.in', 'Doctor@1234');
  v_recep  := public._seed_auth_user('reception@ramaiaiclinic.in', 'Staff@1234');
  v_lab    := public._seed_auth_user('lab@ramaiaiclinic.in', 'Lab@1234');
  v_pharma := public._seed_auth_user('pharmacy@ramaiaiclinic.in', 'Pharma@1234');

  -- Doctor -> Dr. Meera Reddy
  UPDATE public.staff
     SET auth_user_id = v_doctor, user_id = v_doctor
   WHERE clinic_id = v_clinic_id AND name = 'Dr. Meera Reddy';

  -- Receptionist -> Kavitha R
  UPDATE public.staff
     SET auth_user_id = v_recep, user_id = v_recep
   WHERE clinic_id = v_clinic_id AND name = 'Kavitha R';

  -- Lab Technician staff (create if missing)
  IF NOT EXISTS (SELECT 1 FROM public.staff WHERE clinic_id = v_clinic_id AND name = 'Rajan T') THEN
    INSERT INTO public.staff (clinic_id, name, role, phone, is_active, auth_user_id, user_id)
    VALUES (v_clinic_id, 'Rajan T', 'Lab Technician', '+91 98451 00005', true, v_lab, v_lab);
  ELSE
    UPDATE public.staff SET auth_user_id = v_lab, user_id = v_lab
     WHERE clinic_id = v_clinic_id AND name = 'Rajan T';
  END IF;

  -- Pharmacist (create if missing)
  IF NOT EXISTS (SELECT 1 FROM public.staff WHERE clinic_id = v_clinic_id AND name = 'Divya S') THEN
    INSERT INTO public.staff (clinic_id, name, role, phone, is_active, auth_user_id, user_id)
    VALUES (v_clinic_id, 'Divya S', 'Pharmacist', '+91 98451 00006', true, v_pharma, v_pharma);
  ELSE
    UPDATE public.staff SET auth_user_id = v_pharma, user_id = v_pharma
     WHERE clinic_id = v_clinic_id AND name = 'Divya S';
  END IF;
END $$;

DROP FUNCTION public._seed_auth_user(text, text);

-- 4. Prescriptions table
CREATE TABLE IF NOT EXISTS public.prescriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid REFERENCES public.clinics(id) ON DELETE CASCADE,
  appointment_id uuid REFERENCES public.appointments(id) ON DELETE SET NULL,
  patient_id uuid REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id uuid REFERENCES public.staff(id) ON DELETE SET NULL,
  diagnosis text,
  medicines jsonb DEFAULT '[]'::jsonb,
  notes text,
  follow_up_date date,
  created_at timestamptz DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.prescriptions TO authenticated;
GRANT ALL ON public.prescriptions TO service_role;

ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clinic rx select" ON public.prescriptions
  FOR SELECT TO authenticated USING (clinic_id = public.current_clinic_id());
CREATE POLICY "clinic rx insert" ON public.prescriptions
  FOR INSERT TO authenticated WITH CHECK (clinic_id = public.current_clinic_id());
CREATE POLICY "clinic rx update" ON public.prescriptions
  FOR UPDATE TO authenticated
  USING (clinic_id = public.current_clinic_id())
  WITH CHECK (clinic_id = public.current_clinic_id());
CREATE POLICY "clinic rx delete" ON public.prescriptions
  FOR DELETE TO authenticated USING (clinic_id = public.current_clinic_id());
