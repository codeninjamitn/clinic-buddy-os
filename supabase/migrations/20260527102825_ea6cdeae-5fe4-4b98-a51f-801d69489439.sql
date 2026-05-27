
REVOKE EXECUTE ON FUNCTION public.current_clinic_id() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.current_clinic_id() FROM anon;
GRANT EXECUTE ON FUNCTION public.current_clinic_id() TO authenticated;
