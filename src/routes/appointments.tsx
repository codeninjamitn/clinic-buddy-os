import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { weekAppointments, type WeekAppt } from "@/lib/mockData2";
import { patients } from "@/lib/mockData";
import { Search, Calendar as CalIcon, Clock } from "lucide-react";

export const Route = createFileRoute("/appointments")({ component: AppointmentsPage });

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const hours = Array.from({ length: 11 }, (_, i) => 9 + i); // 9..19
const slots = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"];

function statusColor(s: WeekAppt["status"]) {
  if (s === "Confirmed") return "bg-primary/15 border-l-4 border-primary text-primary";
  if (s === "Pending") return "bg-amber-100 border-l-4 border-amber-500 text-amber-800";
  return "bg-gray-100 border-l-4 border-gray-400 text-gray-600";
}

function AppointmentsPage() {
  const [view, setView] = useState<"month" | "week" | "day">("week");
  const [patientQuery, setPatientQuery] = useState("");
  const [patient, setPatient] = useState("");
  const [doctor, setDoctor] = useState("Dr. Mehta");
  const [date, setDate] = useState("2026-05-25");
  const [slot, setSlot] = useState("10:00");
  const [type, setType] = useState("General");
  const [notes, setNotes] = useState("");

  const matches = patientQuery
    ? patients.filter((p) => p.name.toLowerCase().includes(patientQuery.toLowerCase())).slice(0, 5)
    : [];

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient) {
      toast.error("Please select a patient");
      return;
    }
    toast.success(`Appointment booked for ${patient} on ${date} at ${slot}`);
    setPatient("");
    setPatientQuery("");
    setNotes("");
  };

  return (
    <div className="max-w-[1600px] mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-2xl font-bold text-navy">Appointments</h2>
          <p className="text-sm text-muted-foreground">Week of 25 May – 31 May 2026</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-5">
        {/* Booking form */}
        <form onSubmit={submit} className="card-surface p-5 space-y-4 h-fit">
          <h3 className="text-sm font-semibold text-navy">Book Appointment</h3>

          <div className="relative">
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Patient</label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
              <input
                value={patient || patientQuery}
                onChange={(e) => { setPatientQuery(e.target.value); setPatient(""); }}
                placeholder="Search patient..."
                className="w-full pl-8 pr-3 py-2 text-sm rounded-md border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            {matches.length > 0 && !patient && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-border rounded-md shadow-lg">
                {matches.map((p) => (
                  <button
                    type="button"
                    key={p.id}
                    onClick={() => { setPatient(p.name); setPatientQuery(""); }}
                    className="block w-full text-left px-3 py-2 text-sm hover:bg-[#E1F5EE]"
                  >
                    {p.name} <span className="text-xs text-muted-foreground">· {p.id}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Doctor</label>
            <select value={doctor} onChange={(e) => setDoctor(e.target.value)} className="w-full px-3 py-2 text-sm rounded-md border border-border bg-white">
              <option>Dr. Mehta</option>
              <option>Dr. Priya</option>
              <option>Dr. Ramesh</option>
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
              {slots.map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setSlot(s)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-full border transition-colors ${
                    slot === s ? "bg-primary text-white border-primary" : "bg-white text-navy border-border hover:border-primary"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Type</label>
            <select value={type} onChange={(e) => setType(e.target.value)} className="w-full px-3 py-2 text-sm rounded-md border border-border bg-white">
              <option>General</option><option>Follow-up</option><option>Procedure</option><option>Lab</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="w-full px-3 py-2 text-sm rounded-md border border-border resize-none" placeholder="Optional notes..." />
          </div>

          <button type="submit" className="w-full py-2.5 rounded-md bg-primary text-white text-sm font-semibold hover:bg-primary/90 active:bg-primary/80 transition-colors">
            Confirm Booking
          </button>
        </form>

        {/* Week grid */}
        <div className="card-surface overflow-hidden">
          <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-border bg-muted/40">
            <div />
            {days.map((d, i) => (
              <div key={d} className="px-2 py-3 text-center">
                <div className="text-[11px] text-muted-foreground uppercase tracking-wider">{d}</div>
                <div className="text-sm font-semibold text-navy">{25 + i}</div>
              </div>
            ))}
          </div>
          <div className="relative grid grid-cols-[60px_repeat(7,1fr)]">
            {/* hour labels + cells */}
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
                {weekAppointments
                  .filter((a) => a.day === dayIdx)
                  .map((a) => {
                    const top = (a.start - 9) * 64;
                    const height = a.duration * 64 - 4;
                    return (
                      <div
                        key={a.id}
                        className={`absolute left-1 right-1 rounded-md px-2 py-1 text-[11px] shadow-sm cursor-pointer hover:shadow-md transition-shadow ${statusColor(a.status)}`}
                        style={{ top, height }}
                      >
                        <div className="font-semibold truncate">{a.patient}</div>
                        <div className="flex items-center gap-1 opacity-80">
                          <Clock className="w-2.5 h-2.5" />
                          {Math.floor(a.start)}:{a.start % 1 ? "30" : "00"}
                        </div>
                        <div className="opacity-70 truncate">{a.type}</div>
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
