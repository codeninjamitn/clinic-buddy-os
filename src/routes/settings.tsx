import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { staff as initialStaff } from "@/lib/mockData2";
import { Upload, Plus, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/settings")({ component: SettingsPage });

function SettingsPage() {
  const [staff, setStaff] = useState(initialStaff);

  const toggle = (id: string) => setStaff(staff.map((s) => (s.id === id ? { ...s, active: !s.active } : s)));

  return (
    <div className="max-w-[1100px] mx-auto animate-fade-in space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-navy">Settings</h2>
        <p className="text-sm text-muted-foreground">Clinic profile, integrations and staff</p>
      </div>

      {/* Clinic Profile */}
      <section className="card-surface p-6">
        <h3 className="text-base font-semibold text-navy mb-4">Clinic Profile</h3>
        <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] gap-6">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-2">Logo</label>
            <button className="w-32 h-32 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors">
              <Upload className="w-6 h-6 mb-1" />
              <span className="text-xs">Upload logo</span>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Clinic Name" value="Ramaiah Clinic" />
            <Field label="Phone" value="+91 80 2345 6789" />
            <Field label="Registration Number" value="KMC-2018-04421" />
            <Field label="GST Number" value="29ABCDE1234F1Z5" />
            <div className="md:col-span-2">
              <Field label="Address" value="42, MG Road, Bengaluru, KA 560001" />
            </div>
            <div className="md:col-span-2">
              <button onClick={() => toast.success("Clinic profile saved")} className="px-4 py-2 rounded-md bg-primary text-white text-sm font-semibold hover:bg-primary/90">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ABDM */}
      <section className="card-surface p-6">
        <h3 className="text-base font-semibold text-navy mb-4">ABDM Integration</h3>
        <div className="flex flex-col md:flex-row gap-5 items-start">
          <div className="w-20 h-20 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-lg shrink-0">
            ABDM
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="text-sm font-semibold text-navy">Ayushman Bharat Digital Mission</h4>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-100 text-red-700">Not Connected</span>
            </div>
            <p className="text-sm text-muted-foreground mb-3">Connect your clinic to India's national digital health infrastructure.</p>
            <ul className="space-y-1.5 mb-4">
              {[
                "Issue and verify digital health IDs (ABHA) for every patient",
                "Interoperable health records across clinics, hospitals and labs",
                "Stay compliant with NHA data and consent standards",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2 text-sm text-navy/80">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" /> {t}
                </li>
              ))}
            </ul>
            <button onClick={() => toast.success("Redirecting to ABDM portal...")} className="px-4 py-2 rounded-md bg-primary text-white text-sm font-semibold hover:bg-primary/90">
              Connect to ABDM
            </button>
          </div>
        </div>
      </section>

      {/* Staff */}
      <section className="card-surface overflow-hidden">
        <div className="p-6 pb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-navy">Staff Management</h3>
          <button onClick={() => toast.success("New staff member added")} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-primary text-white text-sm font-semibold hover:bg-primary/90">
            <Plus className="w-4 h-4" /> Add Staff Member
          </button>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="text-left px-6 py-3">Name</th>
              <th className="text-left px-6 py-3">Role</th>
              <th className="text-left px-6 py-3">Phone</th>
              <th className="text-right px-6 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((s) => (
              <tr key={s.id} className="border-t border-border hover:bg-[#E1F5EE]/40 transition-colors">
                <td className="px-6 py-3 font-medium text-navy">{s.name}</td>
                <td className="px-6 py-3 text-muted-foreground">{s.role}</td>
                <td className="px-6 py-3 text-muted-foreground">{s.phone}</td>
                <td className="px-6 py-3">
                  <div className="flex justify-end">
                    <button
                      onClick={() => toggle(s.id)}
                      className={`relative w-11 h-6 rounded-full transition-colors ${s.active ? "bg-primary" : "bg-muted"}`}
                    >
                      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${s.active ? "translate-x-5" : "translate-x-0.5"}`} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground mb-1">{label}</label>
      <input defaultValue={value} className="w-full px-3 py-2 text-sm rounded-md border border-border focus:outline-none focus:ring-2 focus:ring-primary/30" />
    </div>
  );
}
