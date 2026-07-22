import { useEffect, useState } from "react";
import { X, Phone, Mail, MapPin, AlertTriangle, Pill, Calendar, Stethoscope } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ageFromDob, colorFor, initials as initialsOf, formatINR } from "@/lib/auth";
import { useModals } from "@/lib/modals";
import { useRole } from "@/context/RoleContext";
import type { Patient, Appointment, Invoice } from "@/types/database";

type Tab = "Overview" | "Visit History" | "Prescriptions" | "Billing";

interface PrescriptionRow {
  id: string; diagnosis: string | null; symptoms: string | null; medicines: any; notes: string | null;
  follow_up_date: string | null; created_at: string;
}

export function PatientDrawer({ patient, onClose }: { patient: Patient | null; onClose: () => void }) {
  const [tab, setTab] = useState<Tab>("Overview");
  const [visits, setVisits] = useState<Appointment[]>([]);
  const [bills, setBills] = useState<Invoice[]>([]);
  const [rxs, setRxs] = useState<PrescriptionRow[]>([]);
  const [loadingTab, setLoadingTab] = useState(false);
  const { open: openModal, version } = useModals();
  const { can } = useRole();

  useEffect(() => {
    if (patient) setTab("Overview");
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [patient, onClose]);

  useEffect(() => {
    if (!patient) return;
    if (tab === "Visit History") {
      setLoadingTab(true);
      supabase.from("appointments").select("*, staff(name)")
        .eq("patient_id", patient.id)
        .order("appointment_date", { ascending: false })
        .limit(10)
        .then(({ data }) => { setVisits((data as Appointment[]) ?? []); setLoadingTab(false); });
    } else if (tab === "Billing") {
      setLoadingTab(true);
      supabase.from("invoices").select("*")
        .eq("patient_id", patient.id)
        .order("created_at", { ascending: false })
        .then(({ data }) => { setBills((data as unknown as Invoice[]) ?? []); setLoadingTab(false); });
    } else if (tab === "Prescriptions") {
      setLoadingTab(true);
      supabase.from("prescriptions").select("id, diagnosis, medicines, notes, follow_up_date, created_at")
        .eq("patient_id", patient.id)
        .order("created_at", { ascending: false })
        .then(({ data }) => { setRxs((data as PrescriptionRow[]) ?? []); setLoadingTab(false); });
    }
  }, [tab, patient, version]);

  const open = !!patient;
  const allergies = patient?.known_allergies ? patient.known_allergies.split(",").map(s => s.trim()).filter(Boolean) : [];
  const meds = patient?.current_medications ? patient.current_medications.split(",").map(s => s.trim()).filter(Boolean) : [];

  return (
    <>
      <div
        className={`fixed inset-0 bg-navy/30 z-30 transition-opacity ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />
      <aside
        className={`fixed top-0 right-0 bottom-0 w-[420px] bg-white z-40 shadow-2xl border-l border-border transition-transform duration-300 flex flex-col ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {patient && (
          <>
            <div className="p-5 border-b border-border">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[11px] font-medium text-muted-foreground font-mono">{patient.id.slice(0, 8)}</span>
                <button onClick={onClose} className="text-muted-foreground hover:text-navy">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex items-center gap-4">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-white text-lg font-semibold shrink-0"
                  style={{ backgroundColor: colorFor(patient.name) }}
                >
                  {initialsOf(patient.name)}
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg font-bold text-navy truncate">{patient.name}</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {ageFromDob(patient.dob)} yrs · {patient.gender ?? "—"} · Blood {patient.blood_group ?? "—"}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    ABDM: <span className="font-mono">{patient.abdm_health_id ?? "Not linked"}</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="border-b border-border px-5 flex gap-5 overflow-x-auto">
              {(["Overview", "Visit History", "Prescriptions", "Billing"] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    tab === t
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-navy"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {tab === "Overview" && (
                <div className="space-y-5">
                  <Section title="Contact">
                    <Row icon={Phone} label="Phone" value={patient.phone} />
                    {patient.email && <Row icon={Mail} label="Email" value={patient.email} />}
                    {patient.address && <Row icon={MapPin} label="Address" value={patient.address} />}
                  </Section>
                  {(patient.emergency_contact_name || patient.emergency_contact_phone) && (
                    <Section title="Emergency Contact">
                      <Row icon={Phone} label={patient.emergency_contact_name ?? "Contact"} value={patient.emergency_contact_phone ?? "—"} />
                    </Section>
                  )}
                  <Section title="Known Allergies">
                    {allergies.length === 0 ? (
                      <p className="text-sm text-muted-foreground">None recorded.</p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {allergies.map((a) => (
                          <span key={a} className="text-xs px-2.5 py-1 rounded-full bg-red-50 text-red-700 inline-flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> {a}
                          </span>
                        ))}
                      </div>
                    )}
                  </Section>
                  <Section title="Current Medications">
                    {meds.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No current medications.</p>
                    ) : (
                      <div className="space-y-1.5">
                        {meds.map((m) => (
                          <div key={m} className="flex items-center gap-2 text-sm text-navy">
                            <Pill className="w-3.5 h-3.5 text-primary" /> {m}
                          </div>
                        ))}
                      </div>
                    )}
                  </Section>
                </div>
              )}

              {tab === "Visit History" && (
                loadingTab ? (
                  <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-14 bg-muted rounded animate-pulse" />)}</div>
                ) : visits.length === 0 ? (
                  <div className="text-sm text-muted-foreground text-center py-10">No visit history.</div>
                ) : (
                  <ol className="relative border-l-2 border-border ml-2 space-y-5 pl-5">
                    {visits.map((v) => (
                      <li key={v.id} className="relative">
                        <span className="absolute -left-[27px] top-1 w-3 h-3 rounded-full bg-primary ring-4 ring-[#E1F5EE]" />
                        <p className="text-xs font-medium text-primary">
                          {new Date(v.appointment_date).toLocaleDateString("en-IN")} · {v.appointment_time?.slice(0, 5)}
                        </p>
                        <p className="text-sm font-medium text-navy mt-0.5">{v.notes || v.type || "Visit"}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{v.staff?.name ?? "—"}</p>
                      </li>
                    ))}
                  </ol>
                )
              )}

              {tab === "Prescriptions" && (
                loadingTab ? (
                  <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-muted rounded animate-pulse" />)}</div>
                ) : rxs.length === 0 ? (
                  <div className="text-sm text-muted-foreground text-center py-10">No prescriptions yet.</div>
                ) : (
                  <ul className="space-y-3">
                    {rxs.map((r) => {
                      const meds = Array.isArray(r.medicines) ? r.medicines : [];
                      return (
                        <li key={r.id} className="border border-border rounded-lg p-3">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-semibold text-navy">{r.diagnosis ?? "Consultation"}</p>
                            <span className="text-[11px] text-muted-foreground">{new Date(r.created_at).toLocaleDateString("en-IN")}</span>
                          </div>
                          {meds.length > 0 && (
                            <ul className="text-xs text-navy/80 space-y-0.5 mt-1.5">
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
                            <p className="text-[11px] text-primary mt-1.5">Follow-up: {new Date(r.follow_up_date).toLocaleDateString("en-IN")}</p>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )
              )}

              {tab === "Billing" && (
                loadingTab ? (
                  <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-14 bg-muted rounded animate-pulse" />)}</div>
                ) : bills.length === 0 ? (
                  <div className="text-sm text-muted-foreground text-center py-10">No outstanding bills.</div>
                ) : (
                  <ul className="divide-y divide-border">
                    {bills.map((b) => (
                      <li key={b.id} className="py-3 flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-navy">{new Date(b.invoice_date).toLocaleDateString("en-IN")}</div>
                          <div className="text-xs text-muted-foreground">{b.status}</div>
                        </div>
                        <div className="text-sm font-bold text-navy">{formatINR(Number(b.total))}</div>
                      </li>
                    ))}
                  </ul>
                )
              )}
            </div>

            <div className="p-5 border-t border-border space-y-2">
              {can("write_prescription") && (
                <button
                  onClick={() => openModal("consultation", { patientId: patient.id, patientName: patient.name })}
                  className="w-full bg-primary hover:bg-primary/90 text-white font-medium text-sm py-2.5 rounded-md inline-flex items-center justify-center gap-2 transition-colors"
                >
                  <Stethoscope className="w-4 h-4" /> Start Consultation
                </button>
              )}
              {can("book_appointment") && (
                <button
                  onClick={() => {
                    openModal("book-appointment", { patientId: patient.id, patientName: patient.name });
                    onClose();
                  }}
                  className="w-full border border-border text-navy font-medium text-sm py-2.5 rounded-md inline-flex items-center justify-center gap-2 hover:bg-muted transition-colors"
                >
                  <Calendar className="w-4 h-4" /> Book Appointment
                </button>
              )}
            </div>
          </>
        )}
      </aside>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-[11px] uppercase tracking-wide font-semibold text-muted-foreground mb-2">{title}</h4>
      {children}
    </div>
  );
}

function Row({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5 py-1.5">
      <Icon className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <p className="text-sm text-navy break-words">{value}</p>
      </div>
    </div>
  );
}
