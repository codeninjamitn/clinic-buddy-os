ALTER TABLE public.staff DROP CONSTRAINT IF EXISTS staff_role_check;
ALTER TABLE public.staff ADD CONSTRAINT staff_role_check CHECK (role IN ('Doctor','Receptionist','Lab Technician','Pharmacist','Admin'));

INSERT INTO public.staff (clinic_id, name, role, email, auth_user_id, is_active)
SELECT '7be3d5cc-5687-4593-9608-84688368946e', 'Clinic Admin', 'Admin', 'admin@ramaiaiclinic.in', '84652c58-f27a-4446-b485-442159e5a2ca', true
WHERE NOT EXISTS (SELECT 1 FROM public.staff WHERE auth_user_id = '84652c58-f27a-4446-b485-442159e5a2ca');