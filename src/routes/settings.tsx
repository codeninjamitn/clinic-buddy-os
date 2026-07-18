import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useClinic } from "@/lib/auth";
import { useRole } from "@/context/RoleContext";
import type { Staff, Role } from "@/types/database";
import { Upload, Plus, CheckCircle2, X, Loader2, Lock, Star, Trash2 } from "lucide-react";
import { AddSpecialityModal } from "@/components/modals/AddSpecialityModal";

export const Route = createFileRoute("/settings")({ component: SettingsPage });

function SettingsPage() {
  const { clinic, refresh } = useClinic();
  const { can } = useRole();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [gst, setGst] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    if (!clinic) return;
    setName(clinic.name);
    setPhone(clinic.phone ?? "");
    setGst(clinic.gst_number ?? "");
    setAddress(clinic.address ?? "");
  }, [clinic]);

  const loadStaff = async () => {
    if (!clinic) return;
    const { data } = await supabase.from("staff").select("*").eq("clinic_id", clinic.id).order("name");
    setStaff((data as Staff[]) ?? []);
  };

  useEffect(() => { loadStaff(); /* eslint-disable-next-line */ }, [clinic?.id]);

  const saveProfile = async () => {
    if (!clinic) return;
    setSavingProfile(true);
    const { error } = await supabase.from("clinics").update({ name, phone, gst_number: gst, address }).eq("id", clinic.id);
    setSavingProfile(false);
    if (error) return toast.error(error.message);
    toast.success("Clinic profile saved");
    refresh();
  };

  const onPickLogo = () => fileRef.current?.click();

  const onLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !clinic) return;
    if (!file.type.startsWith("image/")) return toast.error("Please select an image file");
    if (file.size > 2 * 1024 * 1024) return toast.error("Logo must be under 2 MB");
    setUploadingLogo(true);
    const ext = file.name.split(".").pop() || "png";
    const path = `${clinic.id}/logo-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("clinic-logos").upload(path, file, { upsert: true, contentType: file.type });
    if (upErr) { setUploadingLogo(false); return toast.error(upErr.message); }
    const { data } = supabase.storage.from("clinic-logos").getPublicUrl(path);
    const { error: dbErr } = await supabase.from("clinics").update({ logo_url: data.publicUrl }).eq("id", clinic.id);
    setUploadingLogo(false);
    if (dbErr) return toast.error(dbErr.message);
    toast.success("Logo updated");
    refresh();
  };

  const toggle = async (s: Staff) => {
    const { error } = await supabase.from("staff").update({ is_active: !s.is_active }).eq("id", s.id);
    if (error) return toast.error(error.message);
    loadStaff();
  };

  if (!can("access_settings")) {
    return (
      <div className="max-w-[1100px] mx-auto animate-fade-in">
        <div className="card-surface p-10 text-center">
          <Lock className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-navy">No access</h2>
          <p className="text-sm text-muted-foreground mt-1">Your role doesn't have permission to view Settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1100px] mx-auto animate-fade-in space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-navy">Settings</h2>
        <p className="text-sm text-muted-foreground">Clinic profile, integrations and staff</p>
      </div>

      <section className="card-surface p-6">
        <h3 className="text-base font-semibold text-navy mb-4">Clinic Profile</h3>
        <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] gap-6">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-2">Logo</label>
            <button
              type="button"
              onClick={onPickLogo}
              disabled={uploadingLogo}
              className="w-32 h-32 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors overflow-hidden disabled:opacity-60"
            >
              {clinic?.logo_url ? (
                <img src={clinic.logo_url} alt="Clinic logo" className="w-full h-full object-contain" />
              ) : uploadingLogo ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <Upload className="w-6 h-6 mb-1" />
                  <span className="text-xs">Upload logo</span>
                </>
              )}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onLogoChange} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Clinic Name" value={name} onChange={setName} />
            <Field label="Phone" value={phone} onChange={setPhone} />
            <Field label="Registration Number" value="KMC-2018-04421" onChange={() => {}} />
            <Field label="GST Number" value={gst} onChange={setGst} />
            <div className="md:col-span-2">
              <Field label="Address" value={address} onChange={setAddress} />
            </div>
            <div className="md:col-span-2">
              <button onClick={saveProfile} disabled={savingProfile} className="px-4 py-2 rounded-md bg-primary text-white text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 inline-flex items-center gap-2">
                {savingProfile && <Loader2 className="w-4 h-4 animate-spin" />} Save Changes
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="card-surface p-6">
        <h3 className="text-base font-semibold text-navy mb-4">ABDM Integration</h3>
        {(() => {
          const plan = (clinic?.plan ?? "Starter").toString();
          const isStarter = plan.toLowerCase() === "starter";
          return (
            <div className="flex flex-col md:flex-row gap-5 items-start">
              <div className="w-20 h-20 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-lg shrink-0">ABDM</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <h4 className="text-sm font-semibold text-navy">Ayushman Bharat Digital Mission</h4>
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${clinic?.abdm_connected ? "bg-[#E1F5EE] text-primary" : "bg-red-100 text-red-700"}`}>
                    {clinic?.abdm_connected ? "Connected" : "Not Connected"}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-muted text-navy/70">
                    {plan} Plan
                  </span>
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

                {isStarter ? (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                    <div className="flex items-start gap-2 mb-2">
                      <Lock className="w-4 h-4 text-amber-700 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-amber-900">Available on Pro & Enterprise plans</p>
                        <p className="text-xs text-amber-800 mt-1">
                          ABDM Integration is not included in the Starter plan. Upgrade to Pro or Enterprise to issue ABHA IDs and exchange interoperable health records.
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-amber-800 ml-6">
                      To upgrade, please reach out to your Super Admin or Enterprise Administrator.
                    </p>
                    <div className="mt-3 ml-6 flex gap-2">
                      <button
                        onClick={() => toast.message("Upgrade request noted", { description: "Please contact your Super Admin or Enterprise Administrator to upgrade your plan." })}
                        className="px-3 py-1.5 rounded-md bg-primary text-white text-xs font-semibold hover:bg-primary/90"
                      >
                        Request Upgrade
                      </button>
                      <button
                        disabled
                        className="px-3 py-1.5 rounded-md bg-muted text-muted-foreground text-xs font-semibold cursor-not-allowed"
                      >
                        Connect to ABDM
                      </button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => toast.success("Redirecting to ABDM portal...")} className="px-4 py-2 rounded-md bg-primary text-white text-sm font-semibold hover:bg-primary/90">
                    Connect to ABDM
                  </button>
                )}
              </div>
            </div>
          );
        })()}
      </section>

      <SpecialitiesSection />

      <section className="card-surface overflow-hidden">

        <div className="p-6 pb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-navy">Staff Management</h3>
          <button onClick={() => setAddOpen(true)} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-primary text-white text-sm font-semibold hover:bg-primary/90">
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
                <td className="px-6 py-3 text-muted-foreground">{s.phone ?? "—"}</td>
                <td className="px-6 py-3">
                  <div className="flex justify-end">
                    <button
                      onClick={() => toggle(s)}
                      className={`relative w-11 h-6 rounded-full transition-colors ${s.is_active ? "bg-primary" : "bg-muted"}`}
                    >
                      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${s.is_active ? "translate-x-5" : "translate-x-0.5"}`} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {addOpen && clinic && <AddStaffModal clinicId={clinic.id} onClose={() => setAddOpen(false)} onSaved={() => { setAddOpen(false); loadStaff(); }} />}
    </div>
  );
}

function AddStaffModal({ clinicId, onClose, onSaved }: { clinicId: string; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState("");
  const [role, setRole] = useState<Role>("Doctor");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!name.trim()) { toast.error("Name required"); return; }
    setSaving(true);
    const { error } = await supabase.from("staff").insert({ clinic_id: clinicId, name, role, phone: phone || null, email: email || null });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Staff member added");
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-xl w-full max-w-md p-6 animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-navy">Add Staff Member</h3>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 text-sm rounded-md border border-border" />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value as Role)} className="w-full px-3 py-2 text-sm rounded-md border border-border bg-white">
              <option>Doctor</option><option>Receptionist</option><option>Lab Technician</option><option>Pharmacist</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Phone</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-3 py-2 text-sm rounded-md border border-border" />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 text-sm rounded-md border border-border" />
          </div>
          <button onClick={submit} disabled={saving} className="w-full py-2.5 rounded-md bg-primary text-white text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 inline-flex items-center justify-center gap-2">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />} Save Staff
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground mb-1">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} className="w-full px-3 py-2 text-sm rounded-md border border-border focus:outline-none focus:ring-2 focus:ring-primary/30" />
    </div>
  );
}
