import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Search, Eye, Pencil, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useClinic, initials as initialsOf, colorFor, ageFromDob } from "@/lib/auth";
import { useModals } from "@/lib/modals";
import { useRole } from "@/context/RoleContext";
import { PatientDrawer } from "@/components/PatientDrawer";
import type { Patient } from "@/types/database";

export const Route = createFileRoute("/patients")({ component: PatientsPage });

const filters = ["All", "Active", "Inactive"] as const;
type Filter = (typeof filters)[number];

function PatientsPage() {
  const { clinic } = useClinic();
  const { open: openModal, version } = useModals();
  const { can } = useRole();
  const clinicId = clinic?.id;
  const [q, setQ] = useState("");
  const [debounced, setDebounced] = useState("");
  const [filter, setFilter] = useState<Filter>("All");
  const [selected, setSelected] = useState<Patient | null>(null);
  const [rows, setRows] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(q), 300);
    return () => clearTimeout(t);
  }, [q]);

  const load = async () => {
    if (!clinicId) return;
    setLoading(true); setError(null);
    let query = supabase.from("patients").select("*").eq("clinic_id", clinicId).order("created_at", { ascending: false });
    if (debounced.trim()) query = query.ilike("name", `%${debounced.trim()}%`);
    const { data, error } = await query;
    if (error) setError(error.message);
    else setRows((data as Patient[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [clinicId, debounced, version]);

  const filtered = rows.filter((p) => {
    if (filter === "Active") return p.is_active;
    if (filter === "Inactive") return !p.is_active;
    return true;
  });

  return (
    <div className="space-y-5 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-navy">Patients</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {rows.length} total · {rows.filter((p) => p.is_active).length} active
          </p>
        </div>
        {can("register_patient") && (
          <button
            onClick={() => openModal("new-patient")}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
          >
            <UserPlus className="w-4 h-4" /> Add Patient
          </button>
        )}
      </div>

      <div className="card-surface p-4 space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[260px]">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search patients by name..."
              className="w-full pl-9 pr-3 py-2.5 text-sm rounded-md border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
          <div className="flex gap-1.5">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-xs font-medium px-3.5 py-2 rounded-full border transition-colors ${
                  filter === f
                    ? "bg-primary text-white border-primary"
                    : "bg-white text-muted-foreground border-border hover:border-primary/40 hover:text-navy"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="text-sm bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md flex justify-between items-center">
            <span>{error}</span>
            <button onClick={load} className="text-xs font-semibold underline">Retry</button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-muted-foreground border-b border-border">
                <th className="py-3 pr-4 font-semibold">Patient ID</th>
                <th className="py-3 pr-4 font-semibold">Name</th>
                <th className="py-3 pr-4 font-semibold">Age / Gender</th>
                <th className="py-3 pr-4 font-semibold">Phone</th>
                <th className="py-3 pr-4 font-semibold">Created</th>
                <th className="py-3 pr-4 font-semibold">Status</th>
                <th className="py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    <td colSpan={7} className="py-3"><div className="h-8 bg-muted rounded animate-pulse" /></td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                    No patients match your search.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="border-b border-border last:border-0 hover:bg-[#F4FAFB]">
                    <td className="py-3 pr-4 font-mono text-xs text-muted-foreground">{p.id.slice(0, 8)}</td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-semibold shrink-0"
                          style={{ backgroundColor: colorFor(p.name) }}
                        >
                          {initialsOf(p.name)}
                        </div>
                        <span className="font-medium text-navy">{p.name}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {ageFromDob(p.dob)} · {p.gender ?? "—"}
                    </td>
                    <td className="py-3 pr-4 text-navy tabular-nums">{p.phone}</td>
                    <td className="py-3 pr-4 text-muted-foreground tabular-nums">
                      {new Date(p.created_at).toLocaleDateString("en-IN")}
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${
                          p.is_active ? "bg-[#E1F5EE] text-primary" : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {p.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => setSelected(p)}
                          className="p-2 rounded-md hover:bg-[#E1F5EE] text-muted-foreground hover:text-primary transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 rounded-md hover:bg-[#E1F5EE] text-muted-foreground hover:text-primary transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <PatientDrawer patient={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
