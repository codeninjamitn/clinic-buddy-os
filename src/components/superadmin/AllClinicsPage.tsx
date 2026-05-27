import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Search, MoreVertical, Pencil, PlusCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  listClinicsWithStats, updateClinicStatus, logClinicEntered,
} from "@/lib/superadmin.functions";
import { useSuperAdmin } from "@/context/SuperAdminContext";
import { saCard, saBadge, saChip, saInput } from "./tokens";
import { EditClinicModal } from "./EditClinicModal";
import { DeleteClinicModal } from "./DeleteClinicModal";
import type { Clinic } from "@/types/database";

type Filter = "all" | "active" | "suspended" | "setup";

export function AllClinicsPage({ onAdd }: { onAdd: () => void }) {
  const fetchList = useServerFn(listClinicsWithStats);
  const updateStatus = useServerFn(updateClinicStatus);
  const logEnter = useServerFn(logClinicEntered);
  const { enterClinic } = useSuperAdmin();

  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [editing, setEditing] = useState<Clinic | null>(null);
  const [deleting, setDeleting] = useState<Clinic | null>(null);

  const list = useQuery({ queryKey: ["sa-clinics"], queryFn: () => fetchList(), refetchOnWindowFocus: false });

  const rows = useMemo(() => {
    const data = list.data?.clinics ?? [];
    return data.filter((c) => {
      const status = (c as { status?: string }).status ?? "active";
      if (filter !== "all" && status !== filter) return false;
      if (!q) return true;
      const needle = q.toLowerCase();
      return c.name.toLowerCase().includes(needle) || (c.address ?? "").toLowerCase().includes(needle);
    });
  }, [list.data, filter, q]);

  const onEnter = async (c: Clinic) => {
    await logEnter({ data: { id: c.id } });
    enterClinic(c.id, c.name);
  };
  const onSuspend = async (c: Clinic & { status?: string }) => {
    const next = c.status === "active" ? "suspended" : "active";
    await updateStatus({ data: { id: c.id, status: next as "active" | "suspended" } });
    toast.success(`Clinic ${next}`);
    list.refetch(); setOpenMenu(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">All Clinics</h1>
          <p className="text-[13px]" style={{ color: "#7FBBC5" }}>Browse, search and manage every clinic.</p>
        </div>
        <button onClick={onAdd} className="px-4 py-2 rounded-md text-[13px] font-semibold inline-flex items-center gap-2" style={{ background: "#02C39A", color: "#0A2535" }}>
          <PlusCircle className="w-4 h-4" /> Add New Clinic
        </button>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#7FBBC5" }} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search clinics by name or city..."
            style={{ ...saInput, paddingLeft: 36 }}
          />
        </div>
        <div className="flex gap-1">
          {(["all", "active", "suspended", "setup"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-3 py-2 rounded-md text-[12px] font-semibold capitalize"
              style={filter === f ? { background: "#02C39A", color: "#0A2535" } : { background: "#102F40", color: "#7FBBC5", border: "1px solid #1A4055" }}
            >{f}</button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden" style={saCard}>
        {list.isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin" style={{ color: "#02C39A" }} /></div>
        ) : (
          <table className="w-full text-[13px]">
            <thead>
              <tr style={{ background: "#0A2535", color: "#7FBBC5" }}>
                <Th>Clinic Name</Th><Th>City</Th><Th>Plan</Th><Th>Status</Th>
                <Th>Patients</Th><Th>Staff</Th><Th>Created</Th><Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => {
                const s = list.data?.stats[c.id] ?? { patients: 0, staff: 0, appointmentsToday: 0 };
                const status = (c as { status?: string }).status ?? "active";
                const plan = (c as { plan?: string }).plan ?? "starter";
                const city = (c.address ?? "").split(",").slice(-3, -2)[0]?.trim() || "—";
                return (
                  <tr key={c.id} className="hover:bg-white/[0.03]" style={{ borderTop: "1px solid #1A4055" }}>
                    <Td className="font-semibold">{c.name}</Td>
                    <Td>{city}</Td>
                    <Td><span style={saChip}>{plan}</span></Td>
                    <Td><span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase" style={saBadge(status)}>{status}</span></Td>
                    <Td>{s.patients}</Td>
                    <Td>{s.staff}</Td>
                    <Td>{new Date(c.created_at).toLocaleDateString()}</Td>
                    <Td className="text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button onClick={() => onEnter(c)} className="px-2.5 py-1 rounded-md text-[11px] font-semibold" style={{ background: "#02C39A", color: "#0A2535" }}>Enter</button>
                        <button onClick={() => setEditing(c)} className="w-7 h-7 rounded-md inline-flex items-center justify-center hover:bg-white/5" style={{ border: "1px solid #1A4055", color: "#7FBBC5" }}>
                          <Pencil className="w-3 h-3" />
                        </button>
                        <div className="relative">
                          <button onClick={() => setOpenMenu((m) => (m === c.id ? null : c.id))} className="w-7 h-7 rounded-md inline-flex items-center justify-center hover:bg-white/5" style={{ border: "1px solid #1A4055", color: "#7FBBC5" }}>
                            <MoreVertical className="w-3 h-3" />
                          </button>
                          {openMenu === c.id && (
                            <div className="absolute right-0 top-8 w-40 z-20 rounded-md py-1" style={{ background: "#102F40", border: "1px solid #1A4055" }}>
                              <button onClick={() => onSuspend(c as Clinic & { status?: string })} className="w-full text-left px-3 py-1.5 text-[12px] hover:bg-white/5">
                                {status === "active" ? "Suspend" : "Activate"}
                              </button>
                              <button onClick={() => { setDeleting(c); setOpenMenu(null); }} className="w-full text-left px-3 py-1.5 text-[12px] hover:bg-white/5" style={{ color: "#E05C5C" }}>
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </Td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr><td colSpan={8} className="text-center py-10" style={{ color: "#7FBBC5" }}>No clinics match.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {editing && <EditClinicModal clinic={editing} onClose={(saved) => { setEditing(null); if (saved) list.refetch(); }} />}
      {deleting && <DeleteClinicModal clinic={deleting} onClose={(deleted) => { setDeleting(null); if (deleted) list.refetch(); }} />}
    </div>
  );
}

function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return <th className={`text-left px-4 py-3 text-[11px] uppercase tracking-wide ${className ?? ""}`}>{children}</th>;
}
function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 ${className ?? ""}`}>{children}</td>;
}
