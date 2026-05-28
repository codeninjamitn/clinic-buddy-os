
-- 1. clinic_invites: allow clinic Admins to manage their clinic's invites
CREATE POLICY "clinic admins manage invites"
ON public.clinic_invites
FOR ALL
TO authenticated
USING (
  clinic_id = public.current_clinic_id()
  AND public.get_current_staff_role() = 'Admin'
)
WITH CHECK (
  clinic_id = public.current_clinic_id()
  AND public.get_current_staff_role() = 'Admin'
);

-- 2. current_clinic_id(): deterministic ordering
CREATE OR REPLACE FUNCTION public.current_clinic_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT clinic_id FROM public.staff
  WHERE (auth_user_id = auth.uid() OR user_id = auth.uid())
    AND is_active = true
  ORDER BY created_at ASC
  LIMIT 1
$function$;

-- 3. staff updates: restrict to admins / self
DROP POLICY IF EXISTS "clinic members update staff" ON public.staff;

-- Admins can update any staff in their clinic (except super admin flag)
CREATE POLICY "clinic admins update staff"
ON public.staff
FOR UPDATE
TO authenticated
USING (
  clinic_id = public.current_clinic_id()
  AND public.get_current_staff_role() = 'Admin'
)
WITH CHECK (
  clinic_id = public.current_clinic_id()
  AND COALESCE(is_super_admin, false) = false
);

-- Non-admin staff can update only their own row, and cannot change role/clinic/admin flags
CREATE POLICY "staff update own row"
ON public.staff
FOR UPDATE
TO authenticated
USING (
  auth_user_id = auth.uid()
  AND clinic_id = public.current_clinic_id()
)
WITH CHECK (
  auth_user_id = auth.uid()
  AND clinic_id = public.current_clinic_id()
  AND COALESCE(is_super_admin, false) = false
);

-- Trigger guard: non-admin self-updates cannot change role / clinic_id / is_super_admin
CREATE OR REPLACE FUNCTION public.staff_self_update_guard()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_role text;
  caller_is_super boolean;
BEGIN
  SELECT role, COALESCE(is_super_admin, false)
    INTO caller_role, caller_is_super
  FROM public.staff
  WHERE auth_user_id = auth.uid() AND is_active = true
  ORDER BY created_at ASC
  LIMIT 1;

  IF caller_is_super OR caller_role = 'Admin' THEN
    RETURN NEW;
  END IF;

  IF NEW.role IS DISTINCT FROM OLD.role
     OR NEW.clinic_id IS DISTINCT FROM OLD.clinic_id
     OR COALESCE(NEW.is_super_admin, false) IS DISTINCT FROM COALESCE(OLD.is_super_admin, false) THEN
    RAISE EXCEPTION 'Only Admins can change role, clinic, or super admin flag';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS staff_self_update_guard_trg ON public.staff;
CREATE TRIGGER staff_self_update_guard_trg
BEFORE UPDATE ON public.staff
FOR EACH ROW
EXECUTE FUNCTION public.staff_self_update_guard();
