import { createFileRoute } from "@tanstack/react-router";
import {
  Calendar, Users, IndianRupee, AlertCircle, Plus, UserPlus, FileText, FlaskConical,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid,
} from "recharts";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  useClinic, todayISO, startOfMonthISO, endOfMonthISO, initials as initialsOf, colorFor, formatINR,
} from "@/lib/auth";
import { useModals } from "@/lib/modals";
import type { Appointment, ApptStatus } from "@/types/database";

export const Route = createFileRoute("/")({ component: Dashboard });

const statusStyles: Record<string, string> = {
  Confirmed: "bg-[#E1F5EE] text-primary",
  Pending: "bg-amber-50 text-amber-700",
  Completed: "bg-gray-100 text-gray-600",
  Cancelled: "bg-red-50 text-red-700",
};

function Dashboard() {
  const { clinic } = useClinic();
  const { open: openModal, version } = useModals();
  const clinicId = clinic?.id;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [todayCount, setTodayCount] = useState(0);
  const [monthPatients, setMonthPatients] = useState(0);
  const [monthRevenue, setMonthRevenue] = useState(0);
  const [pendingDues, setPendingDues] = useState(0);
  const [todayAppts, setTodayAppts] = useState<Appointment[]>([]);
  const [revenue7d, setRevenue7d] = useState<{ day: string; revenue: number }[]>([]);

  const load = async () => {
    if (!clinicId) return;
    setError(null);
    try {
      const today = todayISO();
      const som = startOfMonthISO();
      const eom = endOfMonthISO();
      const sevenAgo = new Date();
      sevenAgo.setDate(sevenAgo.getDate() - 6);
      const sevenStr = sevenAgo.toISOString().slice(0, 10);

      const [{ count: aCount }, { count: pCount }, revM, dues, todayList, rev7] = await Promise.all([
        supabase.from("appointments").select("id", { count: "exact", head: true })
          .eq("clinic_id", clinicId).eq("appointment_date", today),
        supabase.from("patients").select("id", { count: "exact", head: true })
          .eq("clinic_id", clinicId).gte("created_at", som + "T00:00:00").lte("created_at", eom + "T23:59:59"),
        supabase.from("invoices").select("total")
          .eq("clinic_id", clinicId).eq("status", "Paid").gte("invoice_date", som),
        supabase.from("invoices").select("total")
          .eq("clinic_id", clinicId).in("status", ["Pending", "Overdue"]),
        supabase.from("appointments")
          .select("*, patients(name, phone), staff(name)")
          .eq("clinic_id", clinicId).eq("appointment_date", today)
          .order("appointment_time", { ascending: true }),
        supabase.from("invoices").select("invoice_date, total")
          .eq("clinic_id", clinicId).eq("status", "Paid").gte("invoice_date", sevenStr),
      ]);

      setTodayCount(aCount ?? 0);
      setMonthPatients(pCount ?? 0);
      setMonthRevenue((revM.data ?? []).reduce((s, r: any) => s + Number(r.total || 0), 0));
      setPendingDues((dues.data ?? []).reduce((s, r: any) => s + Number(r.total || 0), 0));
      setTodayAppts((todayList.data as Appointment[]) ?? []);

      // Build 7-day bucket
      const buckets: Record<string, number> = {};
      for (let i = 6; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        buckets[d.toISOString().slice(0, 10)] = 0;
      }
      (rev7.data ?? []).forEach((r: any) => {
        const k = r.invoice_date;
        if (k in buckets) buckets[k] += Number(r.total || 0);
      });
      setRevenue7d(Object.entries(buckets).map(([k, v]) => ({
        day: new Date(k).toLocaleDateString("en-IN", { weekday: "short" }),
        revenue: v,
      })));
    } catch (e: any) {
      setError(e.message ?? "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [clinicId, version]);

  useEffect(() => {
    if (!clinicId) return;
    const ch = supabase.channel("dash-appts")
      .on("postgres_changes", { event: "*", schema: "public", table: "appointments" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
    // eslint-disable-next-line
  }, [clinicId]);

  const metrics = [
    { label: "Today's Appointments", value: String(todayCount), Icon: Calendar, tint: "bg-[#E1F5EE] text-primary" },
    { label: "Patients This Month", value: String(monthPatients), Icon: Users, tint: "bg-blue-50 text-blue-600" },
    { label: "Revenue This Month", value: formatINR(monthRevenue), Icon: IndianRupee, tint: "bg-green-50 text-green-600" },
    { label: "Pending Dues", value: formatINR(pendingDues), Icon: AlertCircle, tint: "bg-amber-50 text-amber-600" },
  ];

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-navy">Good morning, Dr. Ramaiah</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Here's what's happening at your clinic today.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <div key={m.label} className="card-surface p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{m.label}</p>
                {loading ? (
                  <div className="h-8 mt-2 w-24 bg-muted rounded animate-pulse" />
                ) : (
                  <p className="text-[26px] font-bold text-navy mt-2 leading-none">{m.value}</p>
                )}
              </div>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${m.tint}`}>
                <m.Icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <section className="card-surface lg:col-span-3 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-navy">Appointments Today</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {todayAppts.filter(a => a.status === "Completed").length} of {todayCount} completed
              </p>
            </div>
            <button
              onClick={() => openModal("book-appointment")}
              className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-white text-sm font-medium px-3.5 py-2 rounded-md transition-colors"
            >
              <Plus className="w-4 h-4" /> Book New
            </button>
          </div>
          {error && (
            <div className="text-sm bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md mb-3 flex justify-between items-center">
              <span>{error}</span>
              <button onClick={load} className="text-xs font-semibold underline">Retry</button>
            </div>
          )}
          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => <div key={i} className="h-12 bg-muted rounded animate-pulse" />)}
            </div>
          ) : todayAppts.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">No appointments today.</div>
          ) : (
            <ul className="divide-y divide-border">
              {todayAppts.map((a) => {
                const pname = a.patients?.name ?? "—";
                const dname = a.staff?.name ?? "—";
                const status = (a.status as ApptStatus) ?? "Pending";
                return (
                  <li key={a.id} className="py-3 flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0"
                      style={{ backgroundColor: colorFor(pname) }}
                    >
                      {initialsOf(pname)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-navy text-sm truncate">{pname}</p>
                        <span className="text-xs text-muted-foreground">· {a.type ?? "Visit"}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{dname}</p>
                    </div>
                    <div className="text-sm font-medium text-navy tabular-nums w-20 text-right">
                      {a.appointment_time?.slice(0, 5)}
                    </div>
                    <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${statusStyles[status]} w-[88px] text-center`}>
                      {status}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <div className="lg:col-span-2 space-y-6">
          <section className="card-surface p-5">
            <h3 className="font-semibold text-navy">Revenue This Week</h3>
            <p className="text-xs text-muted-foreground mt-0.5 mb-4">Daily collections (₹)</p>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenue7d} margin={{ top: 6, right: 6, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E0EFF2" vertical={false} />
                  <XAxis dataKey="day" stroke="#6B7C85" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#6B7C85" fontSize={11} tickLine={false} axisLine={false}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    cursor={{ fill: "#E1F5EE" }}
                    contentStyle={{ borderRadius: 8, border: "1px solid #E0EFF2", fontSize: 12 }}
                    formatter={(v: number) => [`₹${v.toLocaleString("en-IN")}`, "Revenue"]}
                  />
                  <Bar dataKey="revenue" fill="#028090" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="card-surface p-5">
            <h3 className="font-semibold text-navy">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3 mt-4">
              {[
                { label: "New Appointment", Icon: Calendar },
                { label: "Add Patient", Icon: UserPlus },
                { label: "Create Invoice", Icon: FileText },
                { label: "Upload Lab Report", Icon: FlaskConical },
              ].map((q) => (
                <button
                  key={q.label}
                  className="border border-border rounded-lg p-3 flex flex-col items-start gap-2 hover:border-primary hover:bg-[#E1F5EE]/40 transition-colors text-left"
                >
                  <div className="w-9 h-9 rounded-md bg-[#E1F5EE] flex items-center justify-center">
                    <q.Icon className="w-4.5 h-4.5 text-primary" />
                  </div>
                  <span className="text-xs font-medium text-navy leading-tight">{q.label}</span>
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
