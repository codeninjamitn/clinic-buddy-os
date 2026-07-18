import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

// ---------- helpers ----------
async function assertSuperAdmin(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("staff")
    .select("id, is_super_admin")
    .eq("auth_user_id", userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data?.is_super_admin) throw new Error("Forbidden: super admin only");
}

const TeamMemberSchema = z.object({
  name: z.string().min(1).max(120),
  role: z.enum(["Doctor", "Receptionist", "Lab Technician", "Pharmacist"]),
  phone: z.string().min(1).max(40),
  email: z.string().email().max(200).optional().or(z.literal("")),
  tempPassword: z.string().min(8).max(64),
});

const InventoryRowSchema = z.object({
  medicine_name: z.string().min(1).max(200),
  category: z.string().min(1).max(80),
  current_stock: z.number().int().min(0).max(1000000),
  unit: z.string().min(1).max(40),
  expiry_date: z.string().nullable().optional(),
  unit_price: z.number().min(0).max(1000000),
});

const CreateClinicSchema = z.object({
  clinic: z.object({
    name: z.string().min(1).max(200),
    address_line1: z.string().min(1).max(200),
    address_line2: z.string().max(200).optional().or(z.literal("")),
    city: z.string().min(1).max(80),
    state: z.string().min(1).max(80),
    pincode: z.string().regex(/^\d{6}$/),
    phone: z.string().min(1).max(40),
    email: z.string().email().max(200).optional().or(z.literal("")),
    gst_number: z.string().max(40).optional().or(z.literal("")),
    registration_number: z.string().max(80).optional().or(z.literal("")),
    plan: z.enum(["starter", "pro", "enterprise"]),
    abdm_connected: z.boolean(),
  }),
  admin: z.object({
    name: z.string().min(1).max(120),
    email: z.string().email().max(200),
    password: z.string().min(8).max(64),
    phone: z.string().min(1).max(40),
  }),
  team: z.array(TeamMemberSchema).min(1).max(50),
  inventory: z.array(InventoryRowSchema).max(200),
  specialityIds: z.array(z.string().uuid()).min(1).max(20),
});


export type CreateClinicInput = z.infer<typeof CreateClinicSchema>;

// ---------- list clinics with stats ----------
export const listClinicsWithStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperAdmin(context.userId);
    const { data: clinics, error } = await supabaseAdmin
      .from("clinics").select("*").order("created_at", { ascending: false });
    if (error) throw new Error(error.message);

    const ids = (clinics ?? []).map((c) => c.id);
    if (ids.length === 0) return { clinics: [], stats: {} };

    const today = new Date(); const tz = today.getTimezoneOffset() * 60000;
    const todayISO = new Date(today.getTime() - tz).toISOString().slice(0, 10);

    const [patientsRes, staffRes, apptTodayRes] = await Promise.all([
      supabaseAdmin.from("patients").select("clinic_id").in("clinic_id", ids),
      supabaseAdmin.from("staff").select("clinic_id").in("clinic_id", ids),
      supabaseAdmin.from("appointments").select("clinic_id").in("clinic_id", ids).eq("appointment_date", todayISO),
    ]);
    const count = (rows: { clinic_id: string | null }[] | null, id: string) =>
      (rows ?? []).filter((r) => r.clinic_id === id).length;
    const stats: Record<string, { patients: number; staff: number; appointmentsToday: number }> = {};
    for (const id of ids) {
      stats[id] = {
        patients: count(patientsRes.data, id),
        staff: count(staffRes.data, id),
        appointmentsToday: count(apptTodayRes.data, id),
      };
    }
    return { clinics, stats };
  });

// ---------- platform metrics ----------
export const getPlatformMetrics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperAdmin(context.userId);
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);
    const [c, ac, p, a] = await Promise.all([
      supabaseAdmin.from("clinics").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("clinics").select("id", { count: "exact", head: true }).eq("status", "active"),
      supabaseAdmin.from("patients").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("appointments").select("id", { count: "exact", head: true })
        .gte("appointment_date", monthStart).lte("appointment_date", monthEnd),
    ]);
    return {
      totalClinics: c.count ?? 0,
      activeClinics: ac.count ?? 0,
      totalPatients: p.count ?? 0,
      appointmentsThisMonth: a.count ?? 0,
    };
  });

// ---------- update / suspend / delete ----------
export const updateClinicStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid(), status: z.enum(["active","suspended","setup"]) }).parse(d))
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.userId);
    const { data: clinic } = await supabaseAdmin.from("clinics").select("name").eq("id", data.id).maybeSingle();
    const { error } = await supabaseAdmin.from("clinics").update({ status: data.status }).eq("id", data.id);
    if (error) throw new Error(error.message);
    await supabaseAdmin.from("super_admin_log").insert({
      action: data.status === "suspended" ? "clinic_suspended" : "clinic_activated",
      clinic_id: data.id, clinic_name: clinic?.name ?? null, performed_by: context.userId,
    });
    return { ok: true };
  });

export const deleteClinic = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.userId);
    const { data: clinic } = await supabaseAdmin.from("clinics").select("name").eq("id", data.id).maybeSingle();
    const { error } = await supabaseAdmin.from("clinics").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    await supabaseAdmin.from("super_admin_log").insert({
      action: "clinic_deleted", clinic_id: null, clinic_name: clinic?.name ?? null, performed_by: context.userId,
    });
    return { ok: true };
  });

export const updateClinicProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    id: z.string().uuid(),
    patch: z.object({
      name: z.string().min(1).max(200).optional(),
      address: z.string().max(500).optional().nullable(),
      phone: z.string().max(40).optional().nullable(),
      email: z.string().email().max(200).optional().nullable().or(z.literal("")),
      gst_number: z.string().max(40).optional().nullable().or(z.literal("")),
      registration_number: z.string().max(80).optional().nullable().or(z.literal("")),
      plan: z.enum(["starter","pro","enterprise"]).optional(),
      status: z.enum(["active","suspended","setup"]).optional(),
      abdm_connected: z.boolean().optional(),
    }),
  }).parse(d))
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.userId);
    const { error } = await supabaseAdmin.from("clinics").update(data.patch).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const logClinicEntered = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.userId);
    const { data: clinic } = await supabaseAdmin.from("clinics").select("name").eq("id", data.id).maybeSingle();
    await supabaseAdmin.from("super_admin_log").insert({
      action: "clinic_entered", clinic_id: data.id, clinic_name: clinic?.name ?? null, performed_by: context.userId,
    });
    return { ok: true };
  });

// ---------- launch new clinic (mega flow) ----------
type LaunchStep = "clinic" | "admin" | "team" | "inventory";

export const launchClinic = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => CreateClinicSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.userId);
    const result: {
      clinicId?: string;
      teamCount: number;
      inventoryCount: number;
      failedStep?: LaunchStep;
      error?: string;
    } = { teamCount: 0, inventoryCount: 0 };

    try {
      // STEP 1: clinic
      const fullAddress = [
        data.clinic.address_line1,
        data.clinic.address_line2 || null,
        data.clinic.city,
        data.clinic.state,
        data.clinic.pincode,
      ].filter(Boolean).join(", ");

      const { data: clinicRow, error: cErr } = await supabaseAdmin.from("clinics").insert({
        name: data.clinic.name,
        address: fullAddress,
        phone: data.clinic.phone,
        email: data.clinic.email || null,
        gst_number: data.clinic.gst_number || null,
        registration_number: data.clinic.registration_number || null,
        plan: data.clinic.plan,
        status: "active",
        abdm_connected: data.clinic.abdm_connected,
        created_by: context.userId,
      }).select().single();
      if (cErr || !clinicRow) { result.failedStep = "clinic"; result.error = cErr?.message ?? "Failed"; return result; }
      result.clinicId = clinicRow.id;

      // STEP 2: admin
      try {
        const { data: u, error: uErr } = await supabaseAdmin.auth.admin.createUser({
          email: data.admin.email, password: data.admin.password, email_confirm: true,
        });
        if (uErr || !u.user) throw new Error(uErr?.message ?? "User creation failed");
        const { error: sErr } = await supabaseAdmin.from("staff").insert({
          clinic_id: clinicRow.id, name: data.admin.name, role: "Admin",
          phone: data.admin.phone, email: data.admin.email,
          auth_user_id: u.user.id, is_active: true,
        });
        if (sErr) throw new Error(sErr.message);
      } catch (e) {
        result.failedStep = "admin"; result.error = (e as Error).message; return result;
      }

      // STEP 3: team
      try {
        for (const m of data.team) {
          let teamAuthId: string | null = null;
          if (m.email) {
            const { data: u, error: uErr } = await supabaseAdmin.auth.admin.createUser({
              email: m.email, password: m.tempPassword, email_confirm: true,
            });
            if (uErr) throw new Error(`${m.email}: ${uErr.message}`);
            teamAuthId = u.user?.id ?? null;
          }
          const { error: sErr } = await supabaseAdmin.from("staff").insert({
            clinic_id: clinicRow.id, name: m.name, role: m.role,
            phone: m.phone, email: m.email || null,
            auth_user_id: teamAuthId, is_active: true,
          });
          if (sErr) throw new Error(`${m.name}: ${sErr.message}`);
          if (m.email) {
            // Hash a single-use token derived from the temp password rather than
            // storing the plaintext credential. Token expires in 7 days.
            const tokenBytes = new TextEncoder().encode(`${m.email}:${m.tempPassword}`);
            const digest = await crypto.subtle.digest("SHA-256", tokenBytes);
            const tokenHash = Array.from(new Uint8Array(digest))
              .map((b) => b.toString(16).padStart(2, "0")).join("");
            await supabaseAdmin.from("clinic_invites").insert({
              clinic_id: clinicRow.id, email: m.email, role: m.role,
              name: m.name, token_hash: tokenHash,
              token_expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            });
          }
          result.teamCount++;
        }
      } catch (e) {
        result.failedStep = "team"; result.error = (e as Error).message; return result;
      }

      // STEP 4: inventory
      try {
        if (data.inventory.length > 0) {
          const rows = data.inventory.map((r) => ({
            clinic_id: clinicRow.id,
            medicine_name: r.medicine_name,
            category: r.category,
            current_stock: r.current_stock,
            unit: r.unit,
            expiry_date: r.expiry_date || null,
            unit_price: r.unit_price,
          }));
          const { error: iErr } = await supabaseAdmin.from("inventory").insert(rows);
          if (iErr) throw new Error(iErr.message);
          result.inventoryCount = rows.length;
        }
      } catch (e) {
        result.failedStep = "inventory"; result.error = (e as Error).message; return result;
      }

      await supabaseAdmin.from("super_admin_log").insert({
        action: "clinic_created",
        clinic_id: clinicRow.id,
        clinic_name: data.clinic.name,
        performed_by: context.userId,
        metadata: { plan: data.clinic.plan, team: result.teamCount, inventory: result.inventoryCount },
      });

      return result;
    } catch (e) {
      result.error = (e as Error).message; return result;
    }
  });

// ---------- activity log ----------
export const getActivityLog = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    clinicId: z.string().uuid().nullable().optional(),
    from: z.string().nullable().optional(),
    to: z.string().nullable().optional(),
  }).parse(d ?? {}))
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.userId);
    let q = supabaseAdmin.from("super_admin_log").select("*").order("created_at", { ascending: false }).limit(500);
    if (data.clinicId) q = q.eq("clinic_id", data.clinicId);
    if (data.from) q = q.gte("created_at", data.from);
    if (data.to) q = q.lte("created_at", data.to + "T23:59:59");
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return { rows: rows ?? [] };
  });
