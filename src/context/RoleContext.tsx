import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { can, type Permission, type StaffRole } from "@/lib/permissions";

interface RoleContextValue {
  role: StaffRole | null;
  staffName: string;
  staffId: string | null;
  isSuperAdmin: boolean;
  loading: boolean;
  can: (permission: Permission) => boolean;
}

const RoleContext = createContext<RoleContextValue>({
  role: null, staffName: "", staffId: null, isSuperAdmin: false, loading: true, can: () => false,
});

export function RoleProvider({ children }: { children: ReactNode }) {
  const { user, session } = useAuth();
  const [role, setRole] = useState<StaffRole | null>(null);
  const [staffName, setStaffName] = useState("");
  const [staffId, setStaffId] = useState<string | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!user || !session) {
        setRole(null); setStaffName(""); setStaffId(null); setIsSuperAdmin(false); setLoading(false);
        return;
      }
      setLoading(true);
      const { data } = await supabase
        .from("staff")
        .select("id, name, role, is_super_admin")
        .eq("auth_user_id", user.id)
        .maybeSingle();
      if (cancelled) return;
      if (data) {
        setStaffId(data.id);
        setStaffName(data.name);
        const superFlag = !!(data as { is_super_admin?: boolean }).is_super_admin;
        setIsSuperAdmin(superFlag);
        setRole(superFlag ? "SuperAdmin" : (data.role as StaffRole));
      } else {
        setStaffId(null);
        setStaffName(user.email?.split("@")[0] ?? "");
        setIsSuperAdmin(false);
        setRole(null);
      }
      setLoading(false);
    }
    run();
    return () => { cancelled = true; };
  }, [user, session]);

  return (
    <RoleContext.Provider value={{
      role, staffName, staffId, isSuperAdmin, loading,
      can: (p) => can(role, p),
    }}>
      {children}
    </RoleContext.Provider>
  );
}

export const useRole = () => useContext(RoleContext);
