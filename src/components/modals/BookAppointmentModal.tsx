import { useEffect, useState } from "react";
import { X, Search, Calendar as CalIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useClinic, isoDate } from "@/lib/auth";
import type { Patient, Staff } from "@/types/database";
import { APPOINTMENT_TYPES, type SpecialitySlug } from "@/lib/specialities";

const slots = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  prefillPatientId?: string | null;
  prefillPatientName?: string | null;
}

export function BookAppointmentModal({ isOpen, onClose, onSuccess, prefillPatientId, prefillPatientName }: Props) {
  const { clinic, specialities } = useClinic();
  const clinicId = clinic?.id;
  // Union of appointment types from all clinic specialities (dedup, preserves order).
  const typesForClinic = Array.from(new Set(
    (specialities.length ? specialities : [{ specialities: { slug: "general" } } as never])
      .flatMap((cs) => APPOINTMENT_TYPES[(cs.specialities?.slug as SpecialitySlug) ?? "general"] ?? [])
  ));

  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Staff[]>([]);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);

  const [patientQuery, setPatientQuery] = useState("");
  const [patientId, setPatientId] = useState<string>("");
  const [patientName, setPatientName] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [date, setDate] = useState(isoDate(new Date()));
  const [slot, setSlot] = useState("10:00");
  const [type, setType] = useState<string>(typesForClinic[0] ?? "General Checkup");
  const [notes, setNotes] = useState("");
  const [reminder, setReminder] = useState(true);
  const [saving, setSaving] = useState(false);

  // Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  // Reset on open + apply prefill
  useEffect(() => {
    if (!isOpen) return;
    setPatientQuery("");
    setNotes("");
    setSlot("10:00");
    setType("General Checkup");
    setDate(isoDate(new Date()));
    if (prefillPatientId) {
      setPatientId(prefillPatientId);
      setPatientName(prefillPatientName ?? "");
    } else {
      setPatientId("");
      setPatientName("");
    }
  }, [isOpen, prefillPatientId, prefillPatientName]);

  // Load patients + doctors on open
  useEffect(() => {
    if (!isOpen || !clinicId) return;
    supabase.from("patients").select("*").eq("clinic_id", clinicId).order("name")
      .then(({ data }) => setPatients((data as Patient[]) ?? []));
    supabase.from("staff").select("*").eq("clinic_id", clinicId).eq("role", "Doctor").eq("is_active", true).order("name")
      .then(({ data }) => {
        const list = (data as Staff[]) ?? [];
        setDoctors(list);
        if (list[0]) setDoctorId(list[0].id);
      });
  }, [isOpen, clinicId]);

  // Booked slots for selected date
  useEffect(() => {
    if (!isOpen || !clinicId || !date) return;
    supabase.from("appointments").select("appointment_time")
      .eq("clinic_id", clinicId).eq("appointment_date", date).neq("status", "Cancelled")
      .then(({ data }) => setBookedSlots(((data ?? []) as { appointment_time: string }[]).map(r => r.appointment_time.slice(0, 5))));
  }, [isOpen, clinicId, date]);

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
      type, status: "Confirmed", notes: notes || null, whatsapp_reminder: reminder,
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(`Appointment booked for ${patientName} at ${slot}`);
    onSuccess?.();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <form onSubmit={submit} className="bg-white rounded-xl w-full max-w-lg p-6 animate-scale-in max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-navy">Book Appointment</h3>
          <button type="button" onClick={onClose} className="p-1 hover:bg-muted rounded"><X className="w-5 h-5" /></button>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Patient</label>
            {prefillPatientId ? (
              <div className="px-3 py-2 text-sm rounded-md border border-border bg-muted/40 text-navy font-medium">
                {patientName}
              </div>
            ) : (
              <>
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
              </>
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
            <select value={type} onChange={(e) => setType(e.target.value)} className="w-full px-3 py-2 text-sm rounded-md border border-border bg-white">
              {typesForClinic.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="w-full px-3 py-2 text-sm rounded-md border border-border resize-none" placeholder="Optional notes..." />
          </div>

          <label className="flex items-center gap-2 text-sm text-navy">
            <input type="checkbox" checked={reminder} onChange={(e) => setReminder(e.target.checked)} className="rounded" />
            Send WhatsApp reminder
          </label>

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-md border border-border text-navy text-sm font-semibold hover:bg-muted">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-md bg-primary text-white text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 inline-flex items-center justify-center gap-2">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />} Confirm Booking
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
