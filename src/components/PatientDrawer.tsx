import { useEffect } from "react";
import { X, Phone, Mail, MapPin, AlertTriangle, Pill, Calendar } from "lucide-react";
import { useState } from "react";
import type { Patient } from "@/lib/mockData";

type Tab = "Overview" | "Visit History" | "Prescriptions" | "Billing";

export function PatientDrawer({ patient, onClose }: { patient: Patient | null; onClose: () => void }) {
  const [tab, setTab] = useState<Tab>("Overview");

  useEffect(() => {
    if (patient) setTab("Overview");
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [patient, onClose]);

  const open = !!patient;

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
                <span className="text-[11px] font-medium text-muted-foreground">{patient.id}</span>
                <button onClick={onClose} className="text-muted-foreground hover:text-navy">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex items-center gap-4">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-white text-lg font-semibold shrink-0"
                  style={{ backgroundColor: patient.color }}
                >
                  {patient.initials}
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg font-bold text-navy truncate">{patient.name}</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {patient.age} yrs · {patient.gender === "M" ? "Male" : "Female"} · Blood {patient.bloodGroup}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    ABDM: <span className="font-mono">{patient.abdmId}</span>
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
                    <Row icon={Mail} label="Email" value={patient.email} />
                    <Row icon={MapPin} label="Address" value={patient.address} />
                  </Section>
                  <Section title="Emergency Contact">
                    <Row icon={Phone} label={patient.emergencyName} value={patient.emergencyPhone} />
                  </Section>
                  <Section title="Known Allergies">
                    <div className="flex flex-wrap gap-1.5">
                      {patient.allergies.map((a) => (
                        <span key={a} className="text-xs px-2.5 py-1 rounded-full bg-red-50 text-red-700 inline-flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> {a}
                        </span>
                      ))}
                    </div>
                  </Section>
                  <Section title="Current Medications">
                    <div className="space-y-1.5">
                      {patient.medications.map((m) => (
                        <div key={m} className="flex items-center gap-2 text-sm text-navy">
                          <Pill className="w-3.5 h-3.5 text-primary" /> {m}
                        </div>
                      ))}
                    </div>
                  </Section>
                </div>
              )}

              {tab === "Visit History" && (
                <ol className="relative border-l-2 border-border ml-2 space-y-5 pl-5">
                  {patient.visits.map((v, i) => (
                    <li key={i} className="relative">
                      <span className="absolute -left-[27px] top-1 w-3 h-3 rounded-full bg-primary ring-4 ring-[#E1F5EE]" />
                      <p className="text-xs font-medium text-primary">{v.date}</p>
                      <p className="text-sm font-medium text-navy mt-0.5">{v.diagnosis}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{v.doctor}</p>
                    </li>
                  ))}
                </ol>
              )}

              {tab === "Prescriptions" && (
                <div className="text-sm text-muted-foreground text-center py-10">
                  No prescriptions to display yet.
                </div>
              )}

              {tab === "Billing" && (
                <div className="text-sm text-muted-foreground text-center py-10">
                  No outstanding bills.
                </div>
              )}
            </div>

            <div className="p-5 border-t border-border">
              <button className="w-full bg-primary hover:bg-primary/90 text-white font-medium text-sm py-2.5 rounded-md inline-flex items-center justify-center gap-2 transition-colors">
                <Calendar className="w-4 h-4" /> Book Appointment
              </button>
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
