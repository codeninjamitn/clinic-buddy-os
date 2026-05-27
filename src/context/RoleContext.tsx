import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { can, type Permission, type StaffRole } from "@/lib/permissions";

interface RoleContextValue {
  role: StaffRole | null;
  staffName: string;
  staffId: string | null;
  loading: boolean;
  can: (permission: Permission) => boolean;
}

const RoleContext = createContext<RoleContextValue>({
  role: null, staffName: "", staffId: null, loading: true, can: () => false,
});

export function RoleProvider({ children }: { children: ReactNode }) {
  const { user, session } = useAuth();
  const [role, setRole] = useState<StaffRole | null>(null);
  const [staffName, setStaffName] = useState("");
  const [staffId, setStaffId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!user || !session) {
        setRole(null); setStaffName(""); setStaffId(null); setLoading(false);
        return;
      }
      setLoading(true);
      const { data } = await supabase
        .from("staff")
        .select("id, name, role")
        .eq("auth_user_id", user.id)
        .maybeSingle();
      if (cancelled) return;
      if (data) {
        setStaffId(data.id);
        setStaffName(data.name);
        setRole(data.role as StaffRole);
      } else {
        // No staff record → treat as Admin (e.g. seeded admin account)
        setStaffId(null);
        setStaffName(user.email?.split("@")[0] ?? "Admin");
        setRole("Admin");
      }
      setLoading(false);
    }
    run();
    return () => { cancelled = true; };
  }, [user, session]);

  return (
    <RoleContext.Provider value={{
      role, staffName, staffId, loading,
      can: (p) => can(role, p),
    }}>
      {children}
    </RoleContext.Provider>
  );
}

export const useRole = () => useContext(RoleContext);
