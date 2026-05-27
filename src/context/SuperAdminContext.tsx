import { createContext, useContext, useState, type ReactNode } from "react";

interface SuperAdminCtx {
  activeSuperAdminClinicId: string | null;
  activeSuperAdminClinicName: string;
  enterClinic: (id: string, name: string) => void;
  exitClinic: () => void;
}

const Ctx = createContext<SuperAdminCtx>({
  activeSuperAdminClinicId: null,
  activeSuperAdminClinicName: "",
  enterClinic: () => {},
  exitClinic: () => {},
});

export function SuperAdminProvider({ children }: { children: ReactNode }) {
  const [activeSuperAdminClinicId, setId] = useState<string | null>(null);
  const [activeSuperAdminClinicName, setName] = useState("");

  return (
    <Ctx.Provider value={{
      activeSuperAdminClinicId,
      activeSuperAdminClinicName,
      enterClinic: (id, name) => { setId(id); setName(name); },
      exitClinic: () => { setId(null); setName(""); },
    }}>{children}</Ctx.Provider>
  );
}

export const useSuperAdmin = () => useContext(Ctx);
