REVOKE EXECUTE ON FUNCTION public.current_clinic_id() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.get_current_staff_role() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.is_super_admin() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.staff_self_update_guard() FROM anon, public, authenticated;
GRANT EXECUTE ON FUNCTION public.current_clinic_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_current_staff_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_super_admin() TO authenticated;