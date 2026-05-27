import { Eye } from "lucide-react";
import { useSuperAdmin } from "@/context/SuperAdminContext";

export function SuperAdminBanner() {
  const { activeSuperAdminClinicName, exitClinic } = useSuperAdmin();
  return (
    <div className="h-9 w-full flex items-center justify-between px-4 sticky top-0 z-50" style={{ background: "#0C2D3E", borderBottom: "1px solid #1A4055" }}>
      <div className="flex items-center gap-2 mx-auto">
        <Eye className="w-3.5 h-3.5" style={{ color: "#02C39A" }} />
        <span className="text-[13px]" style={{ color: "#02C39A" }}>Viewing as Super Admin: {activeSuperAdminClinicName}</span>
      </div>
      <button onClick={exitClinic} className="text-[12px] px-2.5 py-1 rounded-md" style={{ color: "#FFFFFF", border: "1px solid rgba(255,255,255,0.3)" }}>
        ← Exit to Super Admin
      </button>
    </div>
  );
}
