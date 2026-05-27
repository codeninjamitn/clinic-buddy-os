import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import { Search, Calendar as CalIcon, Clock, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useClinic, startOfWeek, isoDate } from "@/lib/auth";
import { useRole } from "@/context/RoleContext";
import type { Appointment, Patient, Staff, ApptStatus, ApptType } from "@/types/database";

export const Route = createFileRoute("/appointments")({ component: AppointmentsPage });

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const hours = Array.from({ length: 11 }, (_, i) => 9 + i); // 9..19
const slots = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"];
const types: ApptType[] = ["General Checkup", "Follow-up", "Procedure", "Lab Consultation", "Emergency"];

function statusColor(s: ApptStatus) {
  if (s === "Confirmed") return "bg-primary/15 border-l-4 border-primary text-primary";
  if (s === "Pending") return "bg-amber-100 border-l-4 border-amber-500 text-amber-800";
  if (s === "Cancelled") return "bg-red-100 border-l-4 border-red-400 text-red-700";
  return "bg-gray-100 border-l-4 border-gray-400 text-gray-600";
}

function AppointmentsPage() {
  const { clinic } = useClinic();
  const { can } = useRole();
  const clinicId = clinic?.id;

  const [view, setView] = useState<"month" | "week" | "day">("week");
  const [weekStart] = useState(() => startOfWeek());
  const weekEnd = useMemo(() => { const d = new Date(weekStart); d.setDate(d.getDate() + 6); return d; }, [weekStart]);

  const [appts, setAppts] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Staff[]>([]);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const [patientQuery, setPatientQuery] = useState("");
  const [patientId, setPatientId] = useState<string>("");
  const [patientName, setPatientName] = useState("");
  const [doctorId, setDoctorId] = useState<string>("");
  const [date, setDate] = useState(isoDate(new Date()));
  const [slot, setSlot] = useState("10:00");
  const [type, setType] = useState<ApptType>("General Checkup");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const loadWeek = async () => {
    if (!clinicId) return;
    setLoading(true);
    const { data } = await supabase.from("appointments")
      .select("*, patients(name), staff(name)")
      .eq("clinic_id", clinicId)
      .gte("appointment_date", isoDate(weekStart))
      .lte("appointment_date", isoDate(weekEnd));
    setAppts((data as Appointment[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    if (!clinicId) return;
    loadWeek();
    supabase.from("patients").select("*").eq("clinic_id", clinicId).order("name").then(({ data }) => setPatients((data as Patient[]) ?? []));
    supabase.from("staff").select("*").eq("clinic_id", clinicId).eq("role", "Doctor").eq("is_active", true).order("name")
      .then(({ data }) => { const list = (data as Staff[]) ?? []; setDoctors(list); if (list[0]) setDoctorId(list[0].id); });
    // eslint-disable-next-line
  }, [clinicId]);

  useEffect(() => {
    if (!clinicId || !date) return;
    supabase.from("appointments").select("appointment_time")
      .eq("clinic_id", clinicId).eq("appointment_date", date).neq("status", "Cancelled")
      .then(({ data }) => setBookedSlots(((data ?? []) as { appointment_time: string }[]).map(r => r.appointment_time.slice(0, 5))));
  }, [clinicId, date, appts]);

  const matches = patientQuery
    ? patients.filter((p) => p.name.toLowerCase().includes(patientQuery.toLowerCase())).slice(0, 5)
    : [];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId) { toast.error("Please select a patient"); return; }
    if (!doctorId) { toast.error("Please select a doctor"); return; }
    setSaving(true);
    const { error } = await supabase.from("appointments").insert({
      clinic_id: clinicId, patient_id: patientId, doctor_id: doctorId,
      appointment_date: date, appointment_time: slot + ":00",
      type, status: "Confirmed", notes, whatsapp_reminder: true,
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(`Appointment booked for ${patientName} on ${date} at ${slot}`);
    setPatientId(""); setPatientName(""); setPatientQuery(""); setNotes("");
    loadWeek();
  };

  // map appt -> grid
  const gridAppts = appts.map((a) => {
    const d = new Date(a.appointment_date);
    const day = (d.getDay() + 6) % 7;
    const [h, m] = a.appointment_time.split(":").map(Number);
    const start = h + (m >= 30 ? 0.5 : 0);
    return { ...a, day, start };
  });

  return (
    <div className="max-w-[1600px] mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-2xl font-bold text-navy">Appointments</h2>
          <p className="text-sm text-muted-foreground">
            Week of {weekStart.toLocaleDateString("en-IN", { day: "numeric", month: "short" })} – {weekEnd.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </p>
        </div>
        <div className="inline-flex rounded-lg border border-border bg-white p-1">
          {(["month", "week", "day"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md capitalize transition-colors ${
                view === v ? "bg-primary text-white" : "text-muted-foreground hover:text-navy"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      <div className={`grid grid-cols-1 ${can("book_appointment") ? "lg:grid-cols-[280px_1fr]" : ""} gap-5`}>
        {can("book_appointment") && (
        <form onSubmit={submit} className="card-surface p-5 space-y-4 h-fit">
          <h3 className="text-sm font-semibold text-navy">Book Appointment</h3>

          <div className="relative">
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Patient</label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
              <input
                value={patientName || patientQuery}
                onChange={(e) => { setPatientQuery(e.target.value); setPatientId(""); setPatientName(""); }}
                placeholder="Search patient..."
                className="w-full pl-8 pr-3 py-2 text-sm rounded-md border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            {matches.length > 0 && !patientId && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-border rounded-md shadow-lg">
                {matches.map((p) => (
                  <button
                    type="button"
                    key={p.id}
                    onClick={() => { setPatientId(p.id); setPatientName(p.name); setPatientQuery(""); }}
                    className="block w-full text-left px-3 py-2 text-sm hover:bg-[#E1F5EE]"
                  >
                    {p.name} <span className="text-xs text-muted-foreground">· {p.phone}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Doctor</label>
            <select value={doctorId} onChange={(e) => setDoctorId(e.target.value)} className="w-full px-3 py-2 text-sm rounded-md border border-border bg-white">
              {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Date</label>
            <div className="relative">
              <CalIcon className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full pl-8 pr-3 py-2 text-sm rounded-md border border-border bg-white" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Time slot</label>
            <div className="flex flex-wrap gap-1.5">
              {slots.map((s) => {
                const booked = bookedSlots.includes(s);
                return (
                  <button
                    type="button"
                    key={s}
                    disabled={booked}
                    onClick={() => setSlot(s)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-full border transition-colors ${
                      booked ? "bg-muted text-muted-foreground/50 border-border cursor-not-allowed line-through" :
                      slot === s ? "bg-primary text-white border-primary" : "bg-white text-navy border-border hover:border-primary"
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Type</label>
            <select value={type} onChange={(e) => setType(e.target.value as ApptType)} className="w-full px-3 py-2 text-sm rounded-md border border-border bg-white">
              {types.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="w-full px-3 py-2 text-sm rounded-md border border-border resize-none" placeholder="Optional notes..." />
          </div>

          <button type="submit" disabled={saving} className="w-full py-2.5 rounded-md bg-primary text-white text-sm font-semibold hover:bg-primary/90 active:bg-primary/80 transition-colors disabled:opacity-60 inline-flex items-center justify-center gap-2">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />} Confirm Booking
          </button>
        </form>
        )}

        <div className="card-surface overflow-hidden">
          <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-border bg-muted/40">
            <div />
            {days.map((d, i) => {
              const dt = new Date(weekStart); dt.setDate(dt.getDate() + i);
              return (
                <div key={d} className="px-2 py-3 text-center">
                  <div className="text-[11px] text-muted-foreground uppercase tracking-wider">{d}</div>
                  <div className="text-sm font-semibold text-navy">{dt.getDate()}</div>
                </div>
              );
            })}
          </div>
          <div className="relative grid grid-cols-[60px_repeat(7,1fr)]">
            <div className="border-r border-border">
              {hours.map((h) => (
                <div key={h} className="h-16 px-2 pt-1 text-[10px] text-muted-foreground border-b border-border">
                  {h > 12 ? `${h - 12}:00 PM` : `${h}:00 AM`}
                </div>
              ))}
            </div>
            {days.map((_, dayIdx) => (
              <div key={dayIdx} className="relative border-r border-border last:border-r-0">
                {hours.map((h) => (
                  <div key={h} className="h-16 border-b border-border" />
                ))}
                {loading ? null : gridAppts
                  .filter((a) => a.day === dayIdx)
                  .map((a) => {
                    const top = (a.start - 9) * 64;
                    const height = 32;
                    return (
                      <div
                        key={a.id}
                        className={`absolute left-1 right-1 rounded-md px-2 py-1 text-[11px] shadow-sm cursor-pointer hover:shadow-md transition-shadow ${statusColor(a.status)}`}
                        style={{ top, height }}
                      >
                        <div className="font-semibold truncate">{a.patients?.name ?? "Patient"}</div>
                        <div className="flex items-center gap-1 opacity-80">
                          <Clock className="w-2.5 h-2.5" />
                          {a.appointment_time.slice(0, 5)}
                        </div>
                      </div>
                    );
                  })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
