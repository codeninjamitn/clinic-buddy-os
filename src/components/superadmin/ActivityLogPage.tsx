import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2 } from "lucide-react";
import { getActivityLog, listClinicsWithStats } from "@/lib/superadmin.functions";
import { saCard, saInput, saActionBadge } from "./tokens";

export function ActivityLogPage() {
  const fetchLog = useServerFn(getActivityLog);
  const fetchList = useServerFn(listClinicsWithStats);
  const [clinicId, setClinicId] = useState<string>("");
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");

  const list = useQuery({ queryKey: ["sa-clinics"], queryFn: () => fetchList(), refetchOnWindowFocus: false });
  const log = useQuery({
    queryKey: ["sa-log", clinicId, from, to],
    queryFn: () => fetchLog({ data: { clinicId: clinicId || null, from: from || null, to: to || null } }),
    refetchOnWindowFocus: false,
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Activity Log</h1>
        <p className="text-[13px]" style={{ color: "#7FBBC5" }}>All Super Admin actions across the platform.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <select value={clinicId} onChange={(e) => setClinicId(e.target.value)} style={{ ...saInput, maxWidth: 240 }}>
          <option value="">All clinics</option>
          {(list.data?.clinics ?? []).map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} style={{ ...saInput, maxWidth: 180 }} />
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} style={{ ...saInput, maxWidth: 180 }} />
      </div>

      <div className="overflow-hidden" style={saCard}>
        {log.isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin" style={{ color: "#02C39A" }} /></div>
        ) : (
          <table className="w-full text-[13px]">
            <thead>
              <tr style={{ background: "#0A2535", color: "#7FBBC5" }}>
                <th className="text-left px-4 py-3 text-[11px] uppercase">Timestamp</th>
                <th className="text-left px-4 py-3 text-[11px] uppercase">Action</th>
                <th className="text-left px-4 py-3 text-[11px] uppercase">Clinic</th>
                <th className="text-left px-4 py-3 text-[11px] uppercase">Details</th>
              </tr>
            </thead>
            <tbody>
              {(log.data?.rows ?? []).map((r) => (
                <tr key={r.id} style={{ borderTop: "1px solid #1A4055" }}>
                  <td className="px-4 py-3" style={{ color: "#7FBBC5" }}>{new Date(r.created_at ?? "").toLocaleString()}</td>
                  <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={saActionBadge(r.action)}>{r.action.replace("clinic_", "")}</span></td>
                  <td className="px-4 py-3 font-semibold">{r.clinic_name ?? "—"}</td>
                  <td className="px-4 py-3 text-[12px]" style={{ color: "#7FBBC5" }}>{JSON.stringify(r.metadata ?? {})}</td>
                </tr>
              ))}
              {(log.data?.rows ?? []).length === 0 && (
                <tr><td colSpan={4} className="text-center py-10" style={{ color: "#7FBBC5" }}>No activity yet.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
