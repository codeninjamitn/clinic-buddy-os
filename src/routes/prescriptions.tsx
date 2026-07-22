import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search, Stethoscope, Pill, ClipboardList } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useClinic, colorFor, initials as initialsOf, ageFromDob } from "@/lib/auth";
import { useModals } from "@/lib/modals";
import { useRole } from "@/context/RoleContext";
import type { Patient } from "@/types/database";

export const Route = createFileRoute("/prescriptions")({ component: PrescriptionsPage });

interface RxRow {
  id: string;
  diagnosis: string | null;
  symptoms: string | null;
  medicines: any;
  notes: string | null;
  follow_up_date: string | null;
  created_at: string;
  doctor?: { name: string | null } | null;
}

function PrescriptionsPage() {
  const { clinic } = useClinic();
  const { open: openModal, version } = useModals();
  const { can } = useRole();
  const clinicId = clinic?.id;

  const [q, setQ] = useState("");
  const [debounced, setDebounced] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selected, setSelected] = useState<Patient | null>(null);
  const [rxs, setRxs] = useState<RxRow[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [loadingRx, setLoadingRx] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(q), 250);
    return () => clearTimeout(t);
  }, [q]);

  // Load patient search list
  useEffect(() => {
    if (!clinicId) return;
    setLoadingList(true);
    let query = supabase.from("patients").select("*").eq("clinic_id", clinicId).order("name").limit(50);
    if (debounced.trim()) query = query.ilike("name", `%${debounced.trim()}%`);
    query.then(({ data }) => {
      setPatients((data as Patient[]) ?? []);
      setLoadingList(false);
    });
  }, [clinicId, debounced, version]);

  // Load prescriptions for selected patient
  useEffect(() => {
    if (!selected) { setRxs([]); return; }
    setLoadingRx(true);
    supabase
      .from("prescriptions")
      .select("id, diagnosis, symptoms, medicines, notes, follow_up_date, created_at, doctor:staff!prescriptions_doctor_id_fkey(name)")
      .eq("patient_id", selected.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setRxs((data as unknown as RxRow[]) ?? []);
        setLoadingRx(false);
      });
  }, [selected, version]);

  const canWrite = can("write_prescription");

  const summary = useMemo(() => {
    if (!rxs.length) return null;
    const total = rxs.length;
    const last = rxs[0]?.created_at ? new Date(rxs[0].created_at).toLocaleDateString("en-IN") : "—";
    return { total, last };
  }, [rxs]);

  return (
    <div className="max-w-[1400px] mx-auto space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-navy">Diagnosis & Prescriptions</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Search a patient and pull their full consultation history.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-5">
        {/* Patient search list */}
        <div className="card-surface p-4 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search patient by name..."
              className="w-full pl-9 pr-3 py-2.5 text-sm rounded-md border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
          <div className="max-h-[70vh] overflow-y-auto -mx-1">
            {loadingList ? (
              <div className="space-y-2 px-1">
                {[...Array(6)].map((_, i) => <div key={i} className="h-12 bg-muted rounded animate-pulse" />)}
              </div>
            ) : patients.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-8">No patients found.</div>
            ) : (
              <ul className="space-y-1 px-1">
                {patients.map((p) => {
                  const active = selected?.id === p.id;
                  return (
                    <li key={p.id}>
                      <button
                        onClick={() => setSelected(p)}
                        className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-left transition-colors ${
                          active ? "bg-[#E1F5EE]" : "hover:bg-muted/60"
                        }`}
                      >
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[11px] font-semibold shrink-0"
                          style={{ backgroundColor: colorFor(p.name) }}
                        >
                          {initialsOf(p.name)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className={`text-sm font-medium truncate ${active ? "text-primary" : "text-navy"}`}>{p.name}</div>
                          <div className="text-[11px] text-muted-foreground truncate">
                            {ageFromDob(p.dob)} yrs · {p.gender ?? "—"} · {p.phone}
                          </div>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        {/* History panel */}
        <div className="card-surface p-5 min-h-[400px]">
          {!selected ? (
            <div className="flex flex-col items-center justify-center h-full py-16 text-center">
              <ClipboardList className="w-10 h-10 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">Select a patient to view their consultation history.</p>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-border">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0"
                    style={{ backgroundColor: colorFor(selected.name) }}
                  >
                    {initialsOf(selected.name)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg font-bold text-navy truncate">{selected.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {ageFromDob(selected.dob)} yrs · {selected.gender ?? "—"} · Blood {selected.blood_group ?? "—"} · {selected.phone}
                    </p>
                    {summary && (
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {summary.total} consultation{summary.total === 1 ? "" : "s"} · Last visit {summary.last}
                      </p>
                    )}
                  </div>
                </div>
                {canWrite && (
                  <button
                    onClick={() => openModal("consultation", { patientId: selected.id, patientName: selected.name })}
                    className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white text-sm font-medium px-3.5 py-2 rounded-md transition-colors shrink-0"
                  >
                    <Stethoscope className="w-4 h-4" /> New Consultation
                  </button>
                )}
              </div>

              <div className="pt-4">
                {loadingRx ? (
                  <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-muted rounded animate-pulse" />)}</div>
                ) : rxs.length === 0 ? (
                  <div className="text-sm text-muted-foreground text-center py-12">No consultations recorded yet.</div>
                ) : (
                  <ul className="space-y-3">
                    {rxs.map((r) => {
                      const meds = Array.isArray(r.medicines) ? r.medicines : [];
                      return (
                        <li key={r.id} className="border border-border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-semibold text-navy">{r.diagnosis ?? "Consultation"}</p>
                            <span className="text-[11px] text-muted-foreground">
                              {new Date(r.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                              {r.doctor?.name && ` · ${r.doctor.name}`}
                            </span>
                          </div>
                          {r.symptoms && (
                            <p className="text-xs text-navy/80 mt-1">
                              <span className="font-semibold text-muted-foreground">Symptoms: </span>{r.symptoms}
                            </p>
                          )}
                          {meds.length > 0 && (
                            <ul className="text-xs text-navy/80 space-y-0.5 mt-2">
                              {meds.map((m: any, i: number) => (
                                <li key={i} className="flex items-center gap-1.5">
                                  <Pill className="w-3 h-3 text-primary" />
                                  <span className="font-medium">{m.name}</span>
                                  {m.dose && <span className="text-muted-foreground">· {m.dose}</span>}
                                  {m.frequency && <span className="text-muted-foreground">· {m.frequency}</span>}
                                  {m.days && <span className="text-muted-foreground">· {m.days}d</span>}
                                </li>
                              ))}
                            </ul>
                          )}
                          {r.notes && <p className="text-xs text-muted-foreground mt-2">{r.notes}</p>}
                          {r.follow_up_date && (
                            <p className="text-[11px] text-primary mt-2">
                              Follow-up: {new Date(r.follow_up_date).toLocaleDateString("en-IN")}
                            </p>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
