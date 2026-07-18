import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const SetPasswordSchema = z.object({
  staffId: z.string().uuid(),
  password: z.string().min(8).max(64),
});

/**
 * Admin action: force-set a staff member's login password (temp password).
 * Caller must be a SuperAdmin, or an Admin of the same clinic as the target staff.
 */
export const setStaffPassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => SetPasswordSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Load caller staff row (RLS scoped to caller)
    const { data: caller, error: callerErr } = await supabase
      .from("staff")
      .select("id, role, clinic_id, is_super_admin")
      .eq("auth_user_id", userId)
      .maybeSingle();
    if (callerErr) throw new Error(callerErr.message);
    if (!caller) throw new Error("Forbidden: no staff profile");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Load target staff via admin (may be outside caller's RLS scope in edge cases)
    const { data: target, error: tErr } = await supabaseAdmin
      .from("staff")
      .select("id, clinic_id, auth_user_id, email, name")
      .eq("id", data.staffId)
      .maybeSingle();
    if (tErr) throw new Error(tErr.message);
    if (!target) throw new Error("Staff member not found");

    const isSuper = !!caller.is_super_admin;
    const isClinicAdmin = caller.role === "Admin" && caller.clinic_id === target.clinic_id;
    if (!isSuper && !isClinicAdmin) throw new Error("Forbidden: admin only");

    if (!target.auth_user_id) {
      throw new Error("This staff member has no login account yet. Ask them to sign up with their email first.");
    }

    const { error: updErr } = await supabaseAdmin.auth.admin.updateUserById(target.auth_user_id, {
      password: data.password,
    });
    if (updErr) throw new Error(updErr.message);

    return { ok: true as const, email: target.email ?? null };
  });
