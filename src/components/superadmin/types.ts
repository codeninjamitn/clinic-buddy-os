import type { Database } from "@/integrations/supabase/types";

export type SAClinic = Database["public"]["Tables"]["clinics"]["Row"];
export type SAStaff = Database["public"]["Tables"]["staff"]["Row"];
export type SAInvite = Database["public"]["Tables"]["clinic_invites"]["Row"];
export type SALog = Database["public"]["Tables"]["super_admin_log"]["Row"];
