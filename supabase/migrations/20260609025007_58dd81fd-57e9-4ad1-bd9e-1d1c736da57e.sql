
-- 1) Restrict staff DELETE to Admin role within the clinic
DROP POLICY IF EXISTS "clinic members delete staff" ON public.staff;

CREATE POLICY "clinic admins delete staff"
ON public.staff
FOR DELETE
TO authenticated
USING (
  clinic_id = public.current_clinic_id()
  AND public.get_current_staff_role() = 'Admin'
);

-- 2) Super admin can update any staff record
CREATE POLICY "super admin update any staff"
ON public.staff
FOR UPDATE
TO authenticated
USING (public.is_super_admin())
WITH CHECK (public.is_super_admin());

-- 3) Super admin can delete any staff record
CREATE POLICY "super admin delete any staff"
ON public.staff
FOR DELETE
TO authenticated
USING (public.is_super_admin());
