import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Building2, Pencil, Power, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  listClinicsWithStats, getPlatformMetrics,
  updateClinicStatus, logClinicEntered,
} from "@/lib/superadmin.functions";
import { useSuperAdmin } from "@/context/SuperAdminContext";
import { EditClinicModal } from "./EditClinicModal";
import { saCard, saBadge, saChip } from "./tokens";
import type { SAClinic } from "./types";

export function OverviewPage({ onAdd }: { onAdd: () => void }) {
  const fetchMetrics = useServerFn(getPlatformMetrics);
  const fetchList = useServerFn(listClinicsWithStats);
  const updateStatus = useServerFn(updateClinicStatus);
  const logEnter = useServerFn(logClinicEntered);

  const { enterClinic } = useSuperAdmin();
  const [editing, setEditing] = useState<SAClinic | null>(null);

  const metrics = useQuery({ queryKey: ["sa-metrics"], queryFn: () => fetchMetrics(), refetchOnWindowFocus: false });
  const list = useQuery({ queryKey: ["sa-clinics"], queryFn: () => fetchList(), refetchOnWindowFocus: false });

  const toggle = async (c: SAClinic & { status?: string }) => {
    const next = c.status === "active" ? "suspended" : "active";
    await updateStatus({ data: { id: c.id, status: next as "active" | "suspended" } });
    toast.success(`Clinic ${next}`);
    metrics.refetch(); list.refetch();
  };
  const onEnter = async (c: SAClinic) => {
    await logEnter({ data: { id: c.id } });
    enterClinic(c.id, c.name);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Platform Overview</h1>
          <p className="text-[13px]" style={{ color: "#7FBBC5" }}>Manage every clinic on ClinicOS</p>
        </div>
        <button onClick={onAdd} className="px-4 py-2 rounded-md text-[13px] font-semibold inline-flex items-center gap-2" style={{ background: "#02C39A", color: "#0A2535" }}>
          + Add New Clinic
        </button>
      </div>

      {/* metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Metric label="Total Clinics" value={metrics.data?.totalClinics} />
        <Metric label="Active Clinics" value={metrics.data?.activeClinics} accent />
        <Metric label="Total Patients" value={metrics.data?.totalPatients} />
        <Metric label="Appointments This Month" value={metrics.data?.appointmentsThisMonth} />
      </div>

      <div>
        <h2 className="text-base font-semibold mb-3">Clinics at a Glance</h2>
        {list.isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin" style={{ color: "#02C39A" }} /></div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {(list.data?.clinics ?? []).map((c) => {
              const s = list.data?.stats[c.id] ?? { patients: 0, staff: 0, appointmentsToday: 0 };
              const status = (c as { status?: string }).status ?? "active";
              const plan = (c as { plan?: string }).plan ?? "starter";
              const city = (c.address ?? "").split(",").slice(-3, -2)[0]?.trim() || "—";
              const isActive = status === "active";
              return (
                <div key={c.id} className="p-5" style={saCard}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-[15px] font-bold">{c.name}</h3>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase" style={saBadge(status)}>{status}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[12px]" style={{ color: "#7FBBC5" }}>
                        <span style={saChip}>{plan}</span>
                        <span>{city}</span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mt-4 text-center">
                    <Stat label="Patients" value={s.patients} />
                    <Stat label="Today" value={s.appointmentsToday} />
                    <Stat label="Staff" value={s.staff} />
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button onClick={() => onEnter(c)} className="flex-1 px-3 py-2 rounded-md text-[12px] font-semibold inline-flex items-center justify-center gap-1.5" style={{ background: "#02C39A", color: "#0A2535" }}>
                      <Building2 className="w-3.5 h-3.5" /> Enter Clinic
                    </button>
                    <button onClick={() => setEditing(c)} className="w-9 h-9 rounded-md flex items-center justify-center hover:bg-white/5" style={{ border: "1px solid #1A4055", color: "#7FBBC5" }} aria-label="Edit">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => toggle(c as SAClinic & { status?: string })} className="w-9 h-9 rounded-md flex items-center justify-center hover:bg-white/5" style={{ border: "1px solid #1A4055", color: isActive ? "#E05C5C" : "#02C39A" }} aria-label="Toggle">
                      <Power className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
            {list.data && list.data.clinics.length === 0 && (
              <div className="p-8 text-center col-span-full" style={saCard}>
                <p className="text-[13px]" style={{ color: "#7FBBC5" }}>No clinics yet. Create your first one.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {editing && <EditClinicModal clinic={editing} onClose={(saved) => { setEditing(null); if (saved) { list.refetch(); metrics.refetch(); } }} />}
    </div>
  );
}

function Metric({ label, value, accent }: { label: string; value: number | undefined; accent?: boolean }) {
  return (
    <div className="p-5" style={saCard}>
      <div className="text-[12px] uppercase tracking-wide" style={{ color: "#7FBBC5" }}>{label}</div>
      <div className="text-3xl font-bold mt-2" style={{ color: accent ? "#02C39A" : "#FFFFFF" }}>{value ?? "—"}</div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="p-2 rounded-md" style={{ background: "#0A2535", border: "1px solid #1A4055" }}>
      <div className="text-lg font-bold">{value}</div>
      <div className="text-[10px] uppercase" style={{ color: "#7FBBC5" }}>{label}</div>
    </div>
  );
}
