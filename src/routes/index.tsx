import { createFileRoute } from "@tanstack/react-router";
import {
  Calendar, Users, IndianRupee, AlertCircle, Plus, UserPlus, FileText, FlaskConical,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid,
} from "recharts";
import { todaysAppointments, revenueWeek } from "@/lib/mockData";
import type { Status } from "@/lib/mockData";

export const Route = createFileRoute("/")({ component: Dashboard });

const metrics = [
  { label: "Today's Appointments", value: "12", Icon: Calendar, tint: "bg-[#E1F5EE] text-primary" },
  { label: "Patients This Month", value: "284", Icon: Users, tint: "bg-blue-50 text-blue-600" },
  { label: "Revenue This Month", value: "₹1,24,500", Icon: IndianRupee, tint: "bg-green-50 text-green-600" },
  { label: "Pending Dues", value: "₹18,200", Icon: AlertCircle, tint: "bg-amber-50 text-amber-600" },
];

const statusStyles: Record<Status, string> = {
  Confirmed: "bg-[#E1F5EE] text-primary",
  Pending: "bg-amber-50 text-amber-700",
  Completed: "bg-gray-100 text-gray-600",
};

function Dashboard() {
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
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{m.label}</p>
                <p className="text-[26px] font-bold text-navy mt-2 leading-none">{m.value}</p>
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
              <p className="text-xs text-muted-foreground mt-0.5">6 of 12 scheduled</p>
            </div>
            <button className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-white text-sm font-medium px-3.5 py-2 rounded-md transition-colors">
              <Plus className="w-4 h-4" /> Book New
            </button>
          </div>
          <ul className="divide-y divide-border">
            {todaysAppointments.map((a) => (
              <li key={a.id} className="py-3 flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0"
                  style={{ backgroundColor: a.color }}
                >
                  {a.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-navy text-sm truncate">{a.patient}</p>
                    <span className="text-xs text-muted-foreground">· {a.type}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{a.doctor}</p>
                </div>
                <div className="text-sm font-medium text-navy tabular-nums w-20 text-right">{a.time}</div>
                <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${statusStyles[a.status]} w-[88px] text-center`}>
                  {a.status}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <div className="lg:col-span-2 space-y-6">
          <section className="card-surface p-5">
            <h3 className="font-semibold text-navy">Revenue This Week</h3>
            <p className="text-xs text-muted-foreground mt-0.5 mb-4">Daily collections (₹)</p>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueWeek} margin={{ top: 6, right: 6, left: -16, bottom: 0 }}>
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
