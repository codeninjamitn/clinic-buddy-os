
-- 1) Fix privilege escalation on staff: forbid clinic-member writes that grant super admin
DROP POLICY IF EXISTS "clinic members manage staff" ON public.staff;
DROP POLICY IF EXISTS "clinic members update staff" ON public.staff;

CREATE POLICY "clinic members manage staff"
ON public.staff
FOR INSERT
TO authenticated
WITH CHECK (
  clinic_id = current_clinic_id()
  AND COALESCE(is_super_admin, false) = false
);

CREATE POLICY "clinic members update staff"
ON public.staff
FOR UPDATE
TO authenticated
USING (clinic_id = current_clinic_id())
WITH CHECK (
  clinic_id = current_clinic_id()
  AND COALESCE(is_super_admin, false) = false
);

-- 2) Remove plaintext temp_password from clinic_invites; use hashed token
ALTER TABLE public.clinic_invites
  DROP COLUMN IF EXISTS temp_password;

ALTER TABLE public.clinic_invites
  ADD COLUMN IF NOT EXISTS token_hash text,
  ADD COLUMN IF NOT EXISTS token_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS accepted_at timestamptz;
