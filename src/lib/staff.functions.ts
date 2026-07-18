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

    const { data: caller, error: callerErr } = await supabase
      .from("staff")
      .select("id, role, clinic_id, is_super_admin")
      .eq("auth_user_id", userId)
      .maybeSingle();
    if (callerErr) throw new Error(callerErr.message);
    if (!caller) throw new Error("Forbidden: no staff profile");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

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

const RemoveStaffSchema = z.object({
  staffId: z.string().uuid(),
  /** When true, also disables the auth account if this was their only active clinic membership. */
  revokeAuth: z.boolean().optional().default(true),
});

/**
 * Admin action: remove a staff member from their clinic and revoke access.
 * - Verifies caller is SuperAdmin, or an Admin of the same clinic as target.
 * - Blocks self-removal.
 * - Deletes the staff row (dependent records like appointments/invoices reference staff via SET NULL/keep history).
 * - If the auth user has no other active staff rows anywhere, disables sign-in by setting a random unknown password.
 */
export const removeStaffMember = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => RemoveStaffSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: caller, error: callerErr } = await supabase
      .from("staff")
      .select("id, role, clinic_id, is_super_admin")
      .eq("auth_user_id", userId)
      .maybeSingle();
    if (callerErr) throw new Error(callerErr.message);
    if (!caller) throw new Error("Forbidden: no staff profile");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: target, error: tErr } = await supabaseAdmin
      .from("staff")
      .select("id, clinic_id, auth_user_id, name, role, is_super_admin")
      .eq("id", data.staffId)
      .maybeSingle();
    if (tErr) throw new Error(tErr.message);
    if (!target) throw new Error("Staff member not found");

    const isSuper = !!caller.is_super_admin;
    const isClinicAdmin = caller.role === "Admin" && caller.clinic_id === target.clinic_id;
    if (!isSuper && !isClinicAdmin) throw new Error("Forbidden: admin only");

    if (target.id === caller.id) throw new Error("You cannot remove your own account.");
    if (target.is_super_admin && !isSuper) throw new Error("Only a Super Admin can remove another Super Admin.");

    const targetAuthId = target.auth_user_id;

    // Delete the staff membership.
    const { error: delErr } = await supabaseAdmin
      .from("staff")
      .delete()
      .eq("id", target.id);
    if (delErr) throw new Error(delErr.message);

    // Optionally revoke sign-in if this was their last clinic membership.
    let authRevoked = false;
    if (data.revokeAuth && targetAuthId) {
      const { data: remaining, error: remErr } = await supabaseAdmin
        .from("staff")
        .select("id")
        .eq("auth_user_id", targetAuthId)
        .limit(1);
      if (remErr) throw new Error(remErr.message);

      if (!remaining || remaining.length === 0) {
        // Randomise their password so old credentials no longer work.
        const random = crypto.randomUUID() + crypto.randomUUID();
        const { error: uErr } = await supabaseAdmin.auth.admin.updateUserById(targetAuthId, {
          password: random,
        });
        if (!uErr) authRevoked = true;
      }
    }

    return { ok: true as const, name: target.name, authRevoked };
  });
