GRANT INSERT ON public.specialities TO authenticated;
CREATE POLICY "Super admins can create specialities" ON public.specialities FOR INSERT TO authenticated WITH CHECK (public.is_super_admin());