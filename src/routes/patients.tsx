import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Search, Eye, Pencil, UserPlus } from "lucide-react";
import { patients } from "@/lib/mockData";
import type { Patient } from "@/lib/mockData";
import { PatientDrawer } from "@/components/PatientDrawer";

export const Route = createFileRoute("/patients")({ component: PatientsPage });

const filters = ["All", "Active", "Inactive"] as const;
type Filter = (typeof filters)[number];

function PatientsPage() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("All");
  const [selected, setSelected] = useState<Patient | null>(null);

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return patients.filter((p) => {
      if (filter !== "All" && p.status !== filter) return false;
      if (!term) return true;
      return (
        p.name.toLowerCase().includes(term) ||
        p.phone.replace(/\s/g, "").includes(term.replace(/\s/g, "")) ||
        p.id.toLowerCase().includes(term)
      );
    });
  }, [q, filter]);

  return (
    <div className="space-y-5 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-navy">Patients</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {patients.length} total · {patients.filter((p) => p.status === "Active").length} active
          </p>
        </div>
        <button className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors">
          <UserPlus className="w-4 h-4" /> Add Patient
        </button>
      </div>

      <div className="card-surface p-4 space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[260px]">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search patients by name, phone, or ID..."
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

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-muted-foreground border-b border-border">
                <th className="py-3 pr-4 font-semibold">Patient ID</th>
                <th className="py-3 pr-4 font-semibold">Name</th>
                <th className="py-3 pr-4 font-semibold">Age / Gender</th>
                <th className="py-3 pr-4 font-semibold">Phone</th>
                <th className="py-3 pr-4 font-semibold">Last Visit</th>
                <th className="py-3 pr-4 font-semibold">Status</th>
                <th className="py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0 hover:bg-[#F4FAFB]">
                  <td className="py-3 pr-4 font-mono text-xs text-muted-foreground">{p.id}</td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-semibold shrink-0"
                        style={{ backgroundColor: p.color }}
                      >
                        {p.initials}
                      </div>
                      <span className="font-medium text-navy">{p.name}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-muted-foreground">
                    {p.age} · {p.gender}
                  </td>
                  <td className="py-3 pr-4 text-navy tabular-nums">{p.phone}</td>
                  <td className="py-3 pr-4 text-muted-foreground tabular-nums">{p.lastVisit}</td>
                  <td className="py-3 pr-4">
                    <span
                      className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${
                        p.status === "Active"
                          ? "bg-[#E1F5EE] text-primary"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {p.status}
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
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                    No patients match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <PatientDrawer patient={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
