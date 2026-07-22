DROP POLICY IF EXISTS "Anyone can submit a signup request" ON public.clinic_signup_requests;

CREATE POLICY "Anyone can submit a signup request"
ON public.clinic_signup_requests
FOR INSERT
TO anon, authenticated
WITH CHECK (
  status = 'new'
  AND length(trim(clinic_name)) BETWEEN 1 AND 200
  AND length(trim(contact_name)) BETWEEN 1 AND 200
  AND length(trim(email)) BETWEEN 3 AND 200
  AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  AND length(coalesce(phone,'')) <= 40
  AND length(coalesce(city,'')) <= 100
  AND length(coalesce(state,'')) <= 100
  AND length(coalesce(speciality,'')) <= 100
  AND length(coalesce(notes,'')) <= 2000
);