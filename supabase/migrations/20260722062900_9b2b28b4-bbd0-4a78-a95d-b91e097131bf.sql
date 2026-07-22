
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TABLE public.clinic_signup_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  city TEXT,
  state TEXT,
  speciality TEXT,
  clinic_size TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT INSERT ON public.clinic_signup_requests TO anon;
GRANT INSERT ON public.clinic_signup_requests TO authenticated;
GRANT ALL ON public.clinic_signup_requests TO service_role;

ALTER TABLE public.clinic_signup_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a signup request"
  ON public.clinic_signup_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Super admins can view signup requests"
  ON public.clinic_signup_requests
  FOR SELECT
  TO authenticated
  USING (public.is_super_admin());

CREATE POLICY "Super admins can update signup requests"
  ON public.clinic_signup_requests
  FOR UPDATE
  TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

CREATE POLICY "Super admins can delete signup requests"
  ON public.clinic_signup_requests
  FOR DELETE
  TO authenticated
  USING (public.is_super_admin());

CREATE TRIGGER update_clinic_signup_requests_updated_at
  BEFORE UPDATE ON public.clinic_signup_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
