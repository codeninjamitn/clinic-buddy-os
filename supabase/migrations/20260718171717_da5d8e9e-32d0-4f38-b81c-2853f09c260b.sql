
-- ============ specialities catalogue ============
CREATE TABLE IF NOT EXISTS public.specialities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  icon text NOT NULL,
  color text NOT NULL,
  description text,
  sort_order integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.specialities TO authenticated;
GRANT ALL ON public.specialities TO service_role;
ALTER TABLE public.specialities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can read specialities" ON public.specialities
  FOR SELECT TO authenticated USING (true);

INSERT INTO public.specialities (name, slug, icon, color, description, sort_order) VALUES
  ('General Medicine',  'general',      '🩺', '#028090', 'Standard consultations, prescriptions, and follow-ups', 1),
  ('Dental',            'dental',       '🦷', '#E05C5C', 'Tooth charting, dental procedures, and treatment plans', 2),
  ('Physiotherapy',     'physio',       '🦴', '#854F0B', 'Body assessment, exercise protocols, and session tracking', 3),
  ('Pediatrics',        'pediatrics',   '👶', '#185FA5', 'Child growth charts, vaccinations, and milestones', 4),
  ('Maternity',         'maternity',    '🤰', '#7B3FA0', 'Antenatal visits, fetal monitoring, and trimester tracking', 5),
  ('Ophthalmology',     'ophthalmology','👁️', '#0F6E56', 'Visual acuity, IOP, and optical prescriptions', 6),
  ('Cardiology',        'cardiology',   '🫀', '#C0392B', 'ECG, BP trends, and cardiac risk assessment', 7),
  ('Dermatology',       'dermatology',  '🩹', '#6D4C41', 'Skin condition mapping, lesion photos, and protocols', 8)
ON CONFLICT (slug) DO NOTHING;

-- ============ clinic_specialities ============
CREATE TABLE IF NOT EXISTS public.clinic_specialities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  speciality_id uuid NOT NULL REFERENCES public.specialities(id) ON DELETE CASCADE,
  is_primary boolean NOT NULL DEFAULT false,
  added_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(clinic_id, speciality_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clinic_specialities TO authenticated;
GRANT ALL ON public.clinic_specialities TO service_role;
ALTER TABLE public.clinic_specialities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff read own clinic specialities" ON public.clinic_specialities
  FOR SELECT TO authenticated USING (clinic_id = public.current_clinic_id() OR public.is_super_admin());
CREATE POLICY "Admins manage own clinic specialities" ON public.clinic_specialities
  FOR ALL TO authenticated
  USING ((clinic_id = public.current_clinic_id() AND public.get_current_staff_role() = 'Admin') OR public.is_super_admin())
  WITH CHECK ((clinic_id = public.current_clinic_id() AND public.get_current_staff_role() = 'Admin') OR public.is_super_admin());

-- ============ generic RLS helper block for record tables ============
-- Applied per table below

-- dental_records
CREATE TABLE IF NOT EXISTS public.dental_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  appointment_id uuid REFERENCES public.appointments(id) ON DELETE SET NULL,
  chief_complaint text,
  clinical_findings text,
  tooth_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  treatment_plan text,
  next_visit_notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.dental_records TO authenticated;
GRANT ALL ON public.dental_records TO service_role;
ALTER TABLE public.dental_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Clinic scope dental" ON public.dental_records FOR ALL TO authenticated
  USING (clinic_id = public.current_clinic_id() OR public.is_super_admin())
  WITH CHECK (clinic_id = public.current_clinic_id() OR public.is_super_admin());

-- physio_records
CREATE TABLE IF NOT EXISTS public.physio_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  appointment_id uuid REFERENCES public.appointments(id) ON DELETE SET NULL,
  body_region text,
  pain_score integer CHECK (pain_score BETWEEN 0 AND 10),
  rom_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  exercise_protocol jsonb NOT NULL DEFAULT '[]'::jsonb,
  session_notes text,
  session_number integer DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.physio_records TO authenticated;
GRANT ALL ON public.physio_records TO service_role;
ALTER TABLE public.physio_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Clinic scope physio" ON public.physio_records FOR ALL TO authenticated
  USING (clinic_id = public.current_clinic_id() OR public.is_super_admin())
  WITH CHECK (clinic_id = public.current_clinic_id() OR public.is_super_admin());

-- pediatric_records
CREATE TABLE IF NOT EXISTS public.pediatric_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  visit_date date NOT NULL DEFAULT current_date,
  weight_kg numeric(5,2),
  height_cm numeric(5,1),
  head_circumference_cm numeric(4,1),
  temperature_c numeric(4,1),
  vaccination_given text,
  milestone_notes text,
  developmental_concerns text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pediatric_records TO authenticated;
GRANT ALL ON public.pediatric_records TO service_role;
ALTER TABLE public.pediatric_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Clinic scope pediatric" ON public.pediatric_records FOR ALL TO authenticated
  USING (clinic_id = public.current_clinic_id() OR public.is_super_admin())
  WITH CHECK (clinic_id = public.current_clinic_id() OR public.is_super_admin());

-- antenatal_records
CREATE TABLE IF NOT EXISTS public.antenatal_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  lmp date,
  edd date,
  gestational_weeks integer,
  visit_date date NOT NULL DEFAULT current_date,
  weight_kg numeric(5,2),
  bp_systolic integer,
  bp_diastolic integer,
  fundal_height_cm numeric(4,1),
  fetal_heart_rate integer,
  fetal_presentation text,
  oedema boolean DEFAULT false,
  scan_report_url text,
  remarks text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.antenatal_records TO authenticated;
GRANT ALL ON public.antenatal_records TO service_role;
ALTER TABLE public.antenatal_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Clinic scope antenatal" ON public.antenatal_records FOR ALL TO authenticated
  USING (clinic_id = public.current_clinic_id() OR public.is_super_admin())
  WITH CHECK (clinic_id = public.current_clinic_id() OR public.is_super_admin());

-- ophthal_records
CREATE TABLE IF NOT EXISTS public.ophthal_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  appointment_id uuid REFERENCES public.appointments(id) ON DELETE SET NULL,
  va_right text,
  va_left text,
  iop_right numeric(4,1),
  iop_left numeric(4,1),
  sph_right numeric(5,2), cyl_right numeric(5,2), axis_right integer,
  sph_left numeric(5,2), cyl_left numeric(5,2), axis_left integer,
  add_right numeric(4,2), add_left numeric(4,2),
  clinical_notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ophthal_records TO authenticated;
GRANT ALL ON public.ophthal_records TO service_role;
ALTER TABLE public.ophthal_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Clinic scope ophthal" ON public.ophthal_records FOR ALL TO authenticated
  USING (clinic_id = public.current_clinic_id() OR public.is_super_admin())
  WITH CHECK (clinic_id = public.current_clinic_id() OR public.is_super_admin());

-- cardio_records
CREATE TABLE IF NOT EXISTS public.cardio_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  appointment_id uuid REFERENCES public.appointments(id) ON DELETE SET NULL,
  bp_systolic integer,
  bp_diastolic integer,
  heart_rate integer,
  ecg_url text,
  cardiac_risk_score text CHECK (cardiac_risk_score IN ('Low','Moderate','High','Very High')),
  chest_pain boolean DEFAULT false,
  clinical_notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cardio_records TO authenticated;
GRANT ALL ON public.cardio_records TO service_role;
ALTER TABLE public.cardio_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Clinic scope cardio" ON public.cardio_records FOR ALL TO authenticated
  USING (clinic_id = public.current_clinic_id() OR public.is_super_admin())
  WITH CHECK (clinic_id = public.current_clinic_id() OR public.is_super_admin());

-- derma_records
CREATE TABLE IF NOT EXISTS public.derma_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  appointment_id uuid REFERENCES public.appointments(id) ON DELETE SET NULL,
  affected_body_regions jsonb NOT NULL DEFAULT '[]'::jsonb,
  lesion_type text,
  duration text,
  photo_urls jsonb NOT NULL DEFAULT '[]'::jsonb,
  treatment_protocol text,
  clinical_notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.derma_records TO authenticated;
GRANT ALL ON public.derma_records TO service_role;
ALTER TABLE public.derma_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Clinic scope derma" ON public.derma_records FOR ALL TO authenticated
  USING (clinic_id = public.current_clinic_id() OR public.is_super_admin())
  WITH CHECK (clinic_id = public.current_clinic_id() OR public.is_super_admin());

-- ============ Seed clinic specialities ============
-- Dental clinic → dental (primary)
INSERT INTO public.clinic_specialities (clinic_id, speciality_id, is_primary)
SELECT c.id, s.id, true
FROM public.clinics c CROSS JOIN public.specialities s
WHERE s.slug = 'dental' AND c.name ILIKE '%dental%'
ON CONFLICT (clinic_id, speciality_id) DO NOTHING;

-- All other clinics → general (primary)
INSERT INTO public.clinic_specialities (clinic_id, speciality_id, is_primary)
SELECT c.id, s.id, true
FROM public.clinics c CROSS JOIN public.specialities s
WHERE s.slug = 'general'
  AND c.id NOT IN (SELECT clinic_id FROM public.clinic_specialities)
ON CONFLICT (clinic_id, speciality_id) DO NOTHING;

-- Dental clinic also gets general (secondary)
INSERT INTO public.clinic_specialities (clinic_id, speciality_id, is_primary)
SELECT c.id, s.id, false
FROM public.clinics c CROSS JOIN public.specialities s
WHERE s.slug = 'general' AND c.name ILIKE '%dental%'
ON CONFLICT (clinic_id, speciality_id) DO NOTHING;
