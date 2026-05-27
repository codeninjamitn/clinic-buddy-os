
-- ============ TABLES ============
CREATE TABLE public.clinics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text,
  phone text,
  gst_number text,
  abdm_connected boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clinics TO authenticated;
GRANT ALL ON public.clinics TO service_role;
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth all clinics" ON public.clinics FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid REFERENCES public.clinics(id) ON DELETE CASCADE,
  name text NOT NULL,
  role text CHECK (role IN ('Doctor','Receptionist','Lab Technician','Pharmacist')),
  phone text,
  email text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.staff TO authenticated;
GRANT ALL ON public.staff TO service_role;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth all staff" ON public.staff FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid REFERENCES public.clinics(id) ON DELETE CASCADE,
  name text NOT NULL,
  dob date,
  gender text CHECK (gender IN ('Male','Female','Other')),
  blood_group text,
  phone text NOT NULL,
  alt_phone text,
  email text,
  address text,
  known_allergies text,
  current_medications text,
  emergency_contact_name text,
  emergency_contact_phone text,
  abdm_health_id text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.patients TO authenticated;
GRANT ALL ON public.patients TO service_role;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth all patients" ON public.patients FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid REFERENCES public.clinics(id) ON DELETE CASCADE,
  patient_id uuid REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id uuid REFERENCES public.staff(id) ON DELETE SET NULL,
  appointment_date date NOT NULL,
  appointment_time time NOT NULL,
  type text CHECK (type IN ('General Checkup','Follow-up','Procedure','Lab Consultation','Emergency')),
  status text DEFAULT 'Pending' CHECK (status IN ('Confirmed','Pending','Completed','Cancelled')),
  notes text,
  whatsapp_reminder boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.appointments TO authenticated;
GRANT ALL ON public.appointments TO service_role;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth all appointments" ON public.appointments FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid REFERENCES public.clinics(id) ON DELETE CASCADE,
  patient_id uuid REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id uuid REFERENCES public.staff(id) ON DELETE SET NULL,
  invoice_date date DEFAULT current_date,
  due_date date,
  line_items jsonb DEFAULT '[]'::jsonb,
  subtotal numeric(10,2) DEFAULT 0,
  gst_amount numeric(10,2) DEFAULT 0,
  total numeric(10,2) DEFAULT 0,
  payment_method text CHECK (payment_method IN ('Cash','UPI','Card','Insurance')),
  status text DEFAULT 'Pending' CHECK (status IN ('Paid','Pending','Overdue','Draft')),
  created_at timestamptz DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoices TO authenticated;
GRANT ALL ON public.invoices TO service_role;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth all invoices" ON public.invoices FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.lab_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid REFERENCES public.clinics(id) ON DELETE CASCADE,
  patient_id uuid REFERENCES public.patients(id) ON DELETE CASCADE,
  test_name text NOT NULL,
  lab_name text,
  test_date date,
  file_url text,
  status text DEFAULT 'Pending' CHECK (status IN ('Pending','Processing','Delivered')),
  delivered_whatsapp boolean DEFAULT true,
  delivered_email boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lab_reports TO authenticated;
GRANT ALL ON public.lab_reports TO service_role;
ALTER TABLE public.lab_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth all lab_reports" ON public.lab_reports FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid REFERENCES public.clinics(id) ON DELETE CASCADE,
  medicine_name text NOT NULL,
  category text,
  current_stock integer DEFAULT 0,
  unit text DEFAULT 'Strips',
  expiry_date date,
  reorder_level integer DEFAULT 20,
  unit_price numeric(8,2),
  created_at timestamptz DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.inventory TO authenticated;
GRANT ALL ON public.inventory TO service_role;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth all inventory" ON public.inventory FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============ STORAGE BUCKET ============
INSERT INTO storage.buckets (id, name, public) VALUES ('lab-reports', 'lab-reports', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read lab-reports" ON storage.objects FOR SELECT USING (bucket_id = 'lab-reports');
CREATE POLICY "Auth upload lab-reports" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'lab-reports');
CREATE POLICY "Auth update lab-reports" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'lab-reports');
CREATE POLICY "Auth delete lab-reports" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'lab-reports');

-- ============ SEED DATA ============
WITH new_clinic AS (
  INSERT INTO public.clinics (name, address, phone)
  VALUES ('Ramaiah Clinic', '12, 3rd Cross, Jayanagar 4th Block, Bengaluru 560041', '+91 80 2345 6789')
  RETURNING id
)
INSERT INTO public.staff (clinic_id, name, role, phone)
SELECT id, v.name, v.role, v.phone FROM new_clinic, (VALUES
  ('Dr. Meera Reddy','Doctor','+91 98451 00001'),
  ('Dr. Suresh Mehta','Doctor','+91 98451 00002'),
  ('Dr. Priya Iyer','Doctor','+91 98451 00003'),
  ('Kavitha R','Receptionist','+91 98451 00004')
) AS v(name, role, phone);

INSERT INTO public.patients (clinic_id, name, dob, gender, blood_group, phone, address, known_allergies)
SELECT c.id, v.name, v.dob::date, v.gender, v.bg, v.phone, v.addr, v.allergy
FROM public.clinics c, (VALUES
  ('Arun Kumar','1985-04-12','Male','O+','+91 98451 23456','Bengaluru',NULL),
  ('Priya Sharma','1990-08-23','Female','A+','+91 87654 32109','Bengaluru','Penicillin'),
  ('Ravi Nair','1975-01-30','Male','B+','+91 99001 12345','Bengaluru',NULL),
  ('Sunita Patel','1968-11-15','Female','AB+','+91 76543 21098','Bengaluru','Sulfa drugs'),
  ('Mohammed Idrish','1995-06-02','Male','O-','+91 98765 43210','Bengaluru',NULL),
  ('Lakshmi Iyer','1982-03-19','Female','A-','+91 88001 23456','Bengaluru','Aspirin'),
  ('Deepak Verma','1978-09-07','Male','B-','+91 77001 34567','Bengaluru',NULL),
  ('Ananya Rao','2000-12-25','Female','AB-','+91 99123 45678','Bengaluru',NULL)
) AS v(name,dob,gender,bg,phone,addr,allergy)
WHERE c.name = 'Ramaiah Clinic';

INSERT INTO public.appointments (clinic_id, patient_id, doctor_id, appointment_date, appointment_time, type, status, notes)
SELECT
  (SELECT id FROM public.clinics WHERE name='Ramaiah Clinic'),
  (SELECT id FROM public.patients WHERE name=v.pname),
  (SELECT id FROM public.staff WHERE name=v.dname),
  current_date, v.t::time, v.tp, v.st, v.note
FROM (VALUES
  ('Arun Kumar','Dr. Meera Reddy','09:30','General Checkup','Confirmed','General Checkup'),
  ('Priya Sharma','Dr. Meera Reddy','10:00','Follow-up','Confirmed','Follow-up'),
  ('Ravi Nair','Dr. Suresh Mehta','10:30','Follow-up','Pending','Blood Pressure Review'),
  ('Sunita Patel','Dr. Suresh Mehta','11:00','Follow-up','Confirmed','Diabetes Review'),
  ('Mohammed Idrish','Dr. Priya Iyer','11:30','General Checkup','Completed','General Checkup'),
  ('Lakshmi Iyer','Dr. Priya Iyer','12:00','Lab Consultation','Pending','Thyroid Consult'),
  ('Deepak Verma','Dr. Meera Reddy','14:00','Procedure','Confirmed','Post-surgery'),
  ('Ananya Rao','Dr. Meera Reddy','14:30','General Checkup','Pending','Fever')
) AS v(pname,dname,t,tp,st,note);

INSERT INTO public.inventory (clinic_id, medicine_name, category, current_stock, expiry_date, reorder_level, unit_price)
SELECT (SELECT id FROM public.clinics WHERE name='Ramaiah Clinic'), v.n, v.c, v.s, v.e::date, v.r, v.p
FROM (VALUES
  ('Paracetamol 500mg','Analgesic',240,'2026-03-01',50,12.50),
  ('Amoxicillin 250mg','Antibiotic',18,'2025-11-01',30,45.00),
  ('Metformin 500mg','Antidiabetic',95,'2026-06-01',40,28.00),
  ('Omeprazole 20mg','Antacid',8,'2025-10-01',25,32.00),
  ('Atorvastatin 10mg','Statin',62,'2026-09-01',30,55.00)
) AS v(n,c,s,e,r,p);
