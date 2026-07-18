import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { X, Loader2, Plus, Trash2, CheckCircle2, ArrowLeft, ArrowRight, Copy } from "lucide-react";
import { toast } from "sonner";
import { launchClinic } from "@/lib/superadmin.functions";
import { INDIAN_STATES } from "@/lib/indian-states";
import { supabase } from "@/integrations/supabase/client";
import { SpecialityPicker } from "@/components/SpecialityPicker";
import type { Speciality } from "@/types/database";
import { saCard, saInput, saLabel } from "./tokens";

type Plan = "starter" | "pro" | "enterprise";
type TeamRole = "Doctor" | "Receptionist" | "Lab Technician" | "Pharmacist";


interface ClinicForm {
  name: string; address_line1: string; address_line2: string;
  city: string; state: string; pincode: string;
  phone: string; email: string;
  gst_number: string; registration_number: string;
  plan: Plan; abdm_connected: boolean;
}
interface AdminForm { name: string; email: string; phone: string; password: string }
interface TeamMember { name: string; role: TeamRole; phone: string; email: string; tempPassword: string }
interface InventoryRow {
  medicine_name: string; category: string;
  current_stock: number; unit: string;
  expiry_date: string; unit_price: number;
}

const STEPS = ["Clinic Details", "Specialities", "Admin Account", "Team Members", "Initial Inventory", "Review & Launch"] as const;

function rndPw(len = 16) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#$%&!";
  const arr = crypto.getRandomValues(new Uint8Array(len));
  return Array.from(arr, (b) => chars[b % chars.length]).join("");
}

export function AddClinicWizard({ onClose }: { onClose: (created: boolean) => void }) {
  const launch = useServerFn(launchClinic);
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<Awaited<ReturnType<typeof launch>> | null>(null);

  const [clinic, setClinic] = useState<ClinicForm>({
    name: "", address_line1: "", address_line2: "", city: "", state: "",
    pincode: "", phone: "", email: "", gst_number: "", registration_number: "",
    plan: "starter", abdm_connected: false,
  });
  const [admin, setAdmin] = useState<AdminForm>({ name: "", email: "", phone: "", password: rndPw() });
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [inventory, setInventory] = useState<InventoryRow[]>([]);
  const [allSpecs, setAllSpecs] = useState<Speciality[]>([]);
  const [specialityIds, setSpecialityIds] = useState<string[]>([]);

  useEffect(() => {
    supabase.from("specialities").select("*").order("sort_order").then(({ data, error }) => {
      if (error) { toast.error("Failed to load specialities"); return; }
      const rows = (data ?? []) as Speciality[];
      setAllSpecs(rows);
      const general = rows.find((r) => r.slug === "general");
      if (general) setSpecialityIds((cur) => (cur.length ? cur : [general.id]));
    });
  }, []);


  const validateStep = (): string | null => {
    if (step === 0) {
      if (!clinic.name) return "Clinic name is required";
      if (!clinic.address_line1) return "Address line 1 is required";
      if (!clinic.city) return "City is required";
      if (!clinic.state) return "State is required";
      if (!/^\d{6}$/.test(clinic.pincode)) return "Pincode must be 6 digits";
      if (!clinic.phone) return "Clinic phone is required";
    }
    if (step === 1) {
      if (specialityIds.length === 0) return "Select at least one speciality";
    }
    if (step === 2) {
      if (!admin.name) return "Admin name is required";
      if (!admin.email || !/^[^@]+@[^@]+\.[^@]+$/.test(admin.email)) return "Valid admin email is required";
      if (!admin.phone) return "Admin phone is required";
      if (admin.password.length < 8) return "Password must be at least 8 characters";
    }
    if (step === 3) {
      for (const m of team) {
        if (!m.name) return "All team members need a name";
        if (!m.phone) return `${m.name}: phone required`;
        if (m.email && !/^[^@]+@[^@]+\.[^@]+$/.test(m.email)) return `${m.name}: invalid email`;
        if (m.email && m.tempPassword.length < 8) return `${m.name}: password ≥ 8 chars`;
      }
    }
    if (step === 4) {
      for (const r of inventory) {
        if (!r.medicine_name) return "Medicine name required for all inventory rows";
        if (!r.unit) return `${r.medicine_name}: unit required`;
      }
    }

    return null;
  };

  const next = () => {
    const err = validateStep();
    if (err) return toast.error(err);
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  };
  const prev = () => setStep((s) => Math.max(0, s - 1));

  const submit = async () => {
    setSubmitting(true);
    try {
      const r = await launch({
        data: {
          clinic,
          admin,
          team: team.map((m) => ({ ...m, email: m.email || "" })),
          inventory: inventory.map((r) => ({
            ...r,
            expiry_date: r.expiry_date || null,
          })),
          specialityIds,
        },
      });

      setResult(r);
      if (r.failedStep) toast.error(`Failed at ${r.failedStep}: ${r.error}`);
      else toast.success("Clinic launched");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  if (result && !result.failedStep) {
    return (
      <ResultModal
        title="Clinic launched"
        result={result}
        adminEmail={admin.email}
        adminPassword={admin.password}
        onClose={() => onClose(true)}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto" style={{ background: "rgba(10,37,53,0.75)" }} onClick={() => onClose(false)}>
      <div className="w-full max-w-[820px] my-8 p-6" style={saCard} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold">Add New Clinic</h2>
            <p className="text-[12px]" style={{ color: "#7FBBC5" }}>Step {step + 1} of {STEPS.length} — {STEPS[step]}</p>
          </div>
          <button onClick={() => onClose(false)} className="p-1 rounded hover:bg-white/5"><X className="w-4 h-4" style={{ color: "#7FBBC5" }} /></button>
        </div>

        {/* Stepper */}
        <div className="flex items-center gap-1 mb-6">
          {STEPS.map((s, i) => (
            <div key={s} className="flex-1 flex items-center gap-1">
              <div className={`flex-1 h-1 rounded ${i <= step ? "" : ""}`} style={{ background: i <= step ? "#02C39A" : "#1A4055" }} />
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="min-h-[280px]">
          {step === 0 && <ClinicStep value={clinic} onChange={setClinic} />}
          {step === 1 && <SpecialityStep all={allSpecs} selected={specialityIds} onChange={setSpecialityIds} onCreated={(s) => { setAllSpecs((cur) => [...cur, s]); setSpecialityIds((cur) => (cur.includes(s.id) ? cur : [...cur, s.id])); }} />}
          {step === 2 && <AdminStep value={admin} onChange={setAdmin} />}
          {step === 3 && <TeamStep value={team} onChange={setTeam} />}
          {step === 4 && <InventoryStep value={inventory} onChange={setInventory} />}
          {step === 5 && <ReviewStep clinic={clinic} admin={admin} team={team} inventory={inventory} specialityIds={specialityIds} allSpecs={allSpecs} />}
        </div>


        {/* Footer */}
        <div className="flex items-center justify-between mt-6 pt-4" style={{ borderTop: "1px solid #1A4055" }}>
          <button onClick={prev} disabled={step === 0} className="px-3 py-2 rounded-md text-[12px] inline-flex items-center gap-1.5 disabled:opacity-40" style={{ background: "#0A2535", color: "#7FBBC5", border: "1px solid #1A4055" }}>
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
          {step < STEPS.length - 1 ? (
            <button onClick={next} className="px-4 py-2 rounded-md text-[12px] font-semibold inline-flex items-center gap-1.5" style={{ background: "#02C39A", color: "#0A2535" }}>
              Next <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button onClick={submit} disabled={submitting} className="px-4 py-2 rounded-md text-[12px] font-semibold inline-flex items-center gap-1.5" style={{ background: "#02C39A", color: "#0A2535", opacity: submitting ? 0.6 : 1 }}>
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <CheckCircle2 className="w-3.5 h-3.5" /> Launch Clinic
            </button>
          )}
        </div>

        {result?.failedStep && (
          <div className="mt-4 p-3 rounded-md text-[12px]" style={{ background: "rgba(224,92,92,0.12)", color: "#E05C5C", border: "1px solid rgba(224,92,92,0.3)" }}>
            Failed at <b>{result.failedStep}</b>: {result.error}. Clinic ID: {result.clinicId ?? "—"}. You can edit or delete from the All Clinics page.
          </div>
        )}
      </div>
    </div>
  );
}

// ---------- Step components ----------
function Field({ label, children, span }: { label: string; children: React.ReactNode; span?: number }) {
  return <div style={{ gridColumn: span ? `span ${span}` : undefined }}><label style={saLabel}>{label}</label>{children}</div>;
}

function ClinicStep({ value, onChange }: { value: ClinicForm; onChange: (v: ClinicForm) => void }) {
  const u = (p: Partial<ClinicForm>) => onChange({ ...value, ...p });
  return (
    <div className="grid grid-cols-2 gap-3">
      <Field label="Clinic name *" span={2}><input style={saInput} value={value.name} onChange={(e) => u({ name: e.target.value })} /></Field>
      <Field label="Address line 1 *" span={2}><input style={saInput} value={value.address_line1} onChange={(e) => u({ address_line1: e.target.value })} /></Field>
      <Field label="Address line 2" span={2}><input style={saInput} value={value.address_line2} onChange={(e) => u({ address_line2: e.target.value })} /></Field>
      <Field label="City *"><input style={saInput} value={value.city} onChange={(e) => u({ city: e.target.value })} /></Field>
      <Field label="State *">
        <select style={saInput} value={value.state} onChange={(e) => u({ state: e.target.value })}>
          <option value="">Select state</option>
          {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </Field>
      <Field label="Pincode *"><input style={saInput} maxLength={6} value={value.pincode} onChange={(e) => u({ pincode: e.target.value.replace(/\D/g, "") })} /></Field>
      <Field label="Phone *"><input style={saInput} value={value.phone} onChange={(e) => u({ phone: e.target.value })} /></Field>
      <Field label="Clinic email"><input style={saInput} value={value.email} onChange={(e) => u({ email: e.target.value })} /></Field>
      <Field label="GST number"><input style={saInput} value={value.gst_number} onChange={(e) => u({ gst_number: e.target.value })} /></Field>
      <Field label="Registration number"><input style={saInput} value={value.registration_number} onChange={(e) => u({ registration_number: e.target.value })} /></Field>
      <Field label="Plan">
        <select style={saInput} value={value.plan} onChange={(e) => u({ plan: e.target.value as Plan })}>
          <option value="starter">Starter</option><option value="pro">Pro</option><option value="enterprise">Enterprise</option>
        </select>
      </Field>
      <Field label="ABDM Connected" span={2}>
        <label className="inline-flex items-center gap-2 text-[13px]" style={{ color: "#FFFFFF" }}>
          <input type="checkbox" checked={value.abdm_connected} onChange={(e) => u({ abdm_connected: e.target.checked })} />
          Mark this clinic as ABDM connected
        </label>
      </Field>
    </div>
  );
}

function AdminStep({ value, onChange }: { value: AdminForm; onChange: (v: AdminForm) => void }) {
  const u = (p: Partial<AdminForm>) => onChange({ ...value, ...p });
  return (
    <div className="grid grid-cols-2 gap-3">
      <Field label="Admin name *" span={2}><input style={saInput} value={value.name} onChange={(e) => u({ name: e.target.value })} /></Field>
      <Field label="Admin email *"><input style={saInput} type="email" value={value.email} onChange={(e) => u({ email: e.target.value })} /></Field>
      <Field label="Admin phone *"><input style={saInput} value={value.phone} onChange={(e) => u({ phone: e.target.value })} /></Field>
      <Field label="Temporary password *" span={2}>
        <div className="flex gap-2">
          <input style={saInput} value={value.password} onChange={(e) => u({ password: e.target.value })} />
          <button onClick={() => u({ password: rndPw() })} className="px-3 py-2 rounded-md text-[11px] font-semibold whitespace-nowrap" style={{ background: "#0A2535", color: "#02C39A", border: "1px solid #1A4055" }}>Regenerate</button>
        </div>
        <p className="text-[11px] mt-1" style={{ color: "#7FBBC5" }}>Share this password with the admin on first login.</p>
      </Field>
    </div>
  );
}

function TeamStep({ value, onChange }: { value: TeamMember[]; onChange: (v: TeamMember[]) => void }) {
  const add = () => onChange([...value, { name: "", role: "Doctor", phone: "", email: "", tempPassword: rndPw() }]);
  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i));
  const upd = (i: number, p: Partial<TeamMember>) => onChange(value.map((m, idx) => idx === i ? { ...m, ...p } : m));

  return (
    <div className="space-y-3">
      <p className="text-[12px]" style={{ color: "#7FBBC5" }}>Optional. Add doctors, receptionists, lab techs, pharmacists. Leave email empty to add without a login.</p>
      {value.map((m, i) => (
        <div key={i} className="p-3 rounded-md grid grid-cols-12 gap-2 items-end" style={{ background: "#0A2535", border: "1px solid #1A4055" }}>
          <div className="col-span-3"><label style={saLabel}>Name</label><input style={saInput} value={m.name} onChange={(e) => upd(i, { name: e.target.value })} /></div>
          <div className="col-span-2"><label style={saLabel}>Role</label>
            <select style={saInput} value={m.role} onChange={(e) => upd(i, { role: e.target.value as TeamRole })}>
              <option>Doctor</option><option>Receptionist</option><option>Lab Technician</option><option>Pharmacist</option>
            </select>
          </div>
          <div className="col-span-2"><label style={saLabel}>Phone</label><input style={saInput} value={m.phone} onChange={(e) => upd(i, { phone: e.target.value })} /></div>
          <div className="col-span-2"><label style={saLabel}>Email</label><input style={saInput} value={m.email} onChange={(e) => upd(i, { email: e.target.value })} /></div>
          <div className="col-span-2"><label style={saLabel}>Temp pwd</label><input style={saInput} value={m.tempPassword} onChange={(e) => upd(i, { tempPassword: e.target.value })} disabled={!m.email} /></div>
          <button onClick={() => remove(i)} className="col-span-1 h-9 rounded-md inline-flex items-center justify-center" style={{ color: "#E05C5C", border: "1px solid #1A4055" }}><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      ))}
      <button onClick={add} className="px-3 py-2 rounded-md text-[12px] inline-flex items-center gap-1.5" style={{ background: "#0A2535", color: "#02C39A", border: "1px dashed #1A4055" }}>
        <Plus className="w-3.5 h-3.5" /> Add team member
      </button>
    </div>
  );
}

function InventoryStep({ value, onChange }: { value: InventoryRow[]; onChange: (v: InventoryRow[]) => void }) {
  const add = () => onChange([...value, { medicine_name: "", category: "General", current_stock: 0, unit: "tab", expiry_date: "", unit_price: 0 }]);
  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i));
  const upd = (i: number, p: Partial<InventoryRow>) => onChange(value.map((r, idx) => idx === i ? { ...r, ...p } : r));

  return (
    <div className="space-y-3">
      <p className="text-[12px]" style={{ color: "#7FBBC5" }}>Optional. Seed the pharmacy with starting inventory.</p>
      {value.map((r, i) => (
        <div key={i} className="p-3 rounded-md grid grid-cols-12 gap-2 items-end" style={{ background: "#0A2535", border: "1px solid #1A4055" }}>
          <div className="col-span-3"><label style={saLabel}>Medicine</label><input style={saInput} value={r.medicine_name} onChange={(e) => upd(i, { medicine_name: e.target.value })} /></div>
          <div className="col-span-2"><label style={saLabel}>Category</label><input style={saInput} value={r.category} onChange={(e) => upd(i, { category: e.target.value })} /></div>
          <div className="col-span-1"><label style={saLabel}>Stock</label><input type="number" style={saInput} value={r.current_stock} onChange={(e) => upd(i, { current_stock: Number(e.target.value) || 0 })} /></div>
          <div className="col-span-1"><label style={saLabel}>Unit</label><input style={saInput} value={r.unit} onChange={(e) => upd(i, { unit: e.target.value })} /></div>
          <div className="col-span-2"><label style={saLabel}>Expiry</label><input type="date" style={saInput} value={r.expiry_date} onChange={(e) => upd(i, { expiry_date: e.target.value })} /></div>
          <div className="col-span-2"><label style={saLabel}>Unit price (₹)</label><input type="number" style={saInput} value={r.unit_price} onChange={(e) => upd(i, { unit_price: Number(e.target.value) || 0 })} /></div>
          <button onClick={() => remove(i)} className="col-span-1 h-9 rounded-md inline-flex items-center justify-center" style={{ color: "#E05C5C", border: "1px solid #1A4055" }}><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      ))}
      <button onClick={add} className="px-3 py-2 rounded-md text-[12px] inline-flex items-center gap-1.5" style={{ background: "#0A2535", color: "#02C39A", border: "1px dashed #1A4055" }}>
        <Plus className="w-3.5 h-3.5" /> Add inventory row
      </button>
    </div>
  );
}

function SpecialityStep({ all, selected, onChange, onCreated }: { all: Speciality[]; selected: string[]; onChange: (ids: string[]) => void; onCreated: (s: Speciality) => void }) {
  const [creating, setCreating] = useState(false);
  if (all.length === 0) {
    return <p className="text-[13px]" style={{ color: "#7FBBC5" }}>Loading specialities…</p>;
  }
  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[12px]" style={{ color: "#7FBBC5" }}>
          Select the disciplines this clinic offers. The first one you pick is the primary speciality.
        </p>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="shrink-0 text-[12px] font-semibold px-2.5 py-1.5 rounded-md border"
          style={{ borderColor: "#1F4A5C", color: "#E1F5EE" }}
        >
          + New speciality
        </button>
      </div>
      <SpecialityPicker dark all={all} selected={selected} onChange={onChange} />
      {creating && (
        <NewSpecialityModal
          onClose={() => setCreating(false)}
          onCreated={(s) => { onCreated(s); setCreating(false); }}
        />
      )}
    </div>
  );
}

const ICON_CHOICES = ["🩺", "🦷", "🏃", "👶", "🤰", "👁️", "❤️", "🧴", "🧠", "🦴", "🩻", "🧬"];
const COLOR_CHOICES = ["#0F3E4C", "#14B8A6", "#3B82F6", "#8B5CF6", "#EC4899", "#F59E0B", "#EF4444", "#10B981"];

function NewSpecialityModal({ onClose, onCreated }: { onClose: () => void; onCreated: (s: Speciality) => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState(ICON_CHOICES[0]);
  const [color, setColor] = useState(COLOR_CHOICES[0]);
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    const trimmed = name.trim();
    if (!trimmed) return toast.error("Speciality name is required");
    const slug = trimmed.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    setSaving(true);
    const { data, error } = await supabase
      .from("specialities")
      .insert({ name: trimmed, slug, icon, color, description: description.trim() || null, sort_order: 100 })
      .select("*")
      .single();
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(`${trimmed} added`);
    onCreated(data as Speciality);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div className="rounded-xl w-full max-w-md p-6" style={{ background: "#0B2A34", border: "1px solid #1F4A5C" }} onClick={(e) => e.stopPropagation()}>
        <h4 className="text-base font-semibold mb-3" style={{ color: "#E1F5EE" }}>Create new speciality</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-[11px] font-medium mb-1" style={{ color: "#7FBBC5" }}>Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. ENT" className="w-full px-3 py-2 text-sm rounded-md" style={{ background: "#08202A", border: "1px solid #1F4A5C", color: "#E1F5EE" }} />
          </div>
          <div>
            <label className="block text-[11px] font-medium mb-1" style={{ color: "#7FBBC5" }}>Description (optional)</label>
            <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short description" className="w-full px-3 py-2 text-sm rounded-md" style={{ background: "#08202A", border: "1px solid #1F4A5C", color: "#E1F5EE" }} />
          </div>
          <div>
            <label className="block text-[11px] font-medium mb-1" style={{ color: "#7FBBC5" }}>Icon</label>
            <div className="flex flex-wrap gap-1.5">
              {ICON_CHOICES.map((i) => (
                <button key={i} type="button" onClick={() => setIcon(i)} className="w-9 h-9 rounded-md text-lg" style={{ background: icon === i ? "#14B8A6" : "#08202A", border: "1px solid #1F4A5C" }}>{i}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-medium mb-1" style={{ color: "#7FBBC5" }}>Color</label>
            <div className="flex flex-wrap gap-1.5">
              {COLOR_CHOICES.map((c) => (
                <button key={c} type="button" onClick={() => setColor(c)} className="w-8 h-8 rounded-full" style={{ background: c, outline: color === c ? "2px solid #E1F5EE" : "none", outlineOffset: 2 }} />
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-2 pt-5">
          <button onClick={onClose} className="flex-1 py-2 rounded-md text-sm font-semibold" style={{ border: "1px solid #1F4A5C", color: "#E1F5EE" }}>Cancel</button>
          <button onClick={submit} disabled={saving} className="flex-1 py-2 rounded-md text-sm font-semibold text-white disabled:opacity-60" style={{ background: "#14B8A6" }}>
            {saving ? "Creating…" : "Create speciality"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ReviewStep({ clinic, admin, team, inventory, specialityIds, allSpecs }: { clinic: ClinicForm; admin: AdminForm; team: TeamMember[]; inventory: InventoryRow[]; specialityIds: string[]; allSpecs: Speciality[] }) {
  const specs = specialityIds.map((id) => allSpecs.find((s) => s.id === id)).filter(Boolean) as Speciality[];
  return (
    <div className="space-y-4 text-[13px]">
      <Section title="Clinic">
        <p><b>{clinic.name}</b></p>
        <p style={{ color: "#7FBBC5" }}>{[clinic.address_line1, clinic.address_line2, clinic.city, clinic.state, clinic.pincode].filter(Boolean).join(", ")}</p>
        <p style={{ color: "#7FBBC5" }}>{clinic.phone} {clinic.email && `· ${clinic.email}`}</p>
        <p style={{ color: "#7FBBC5" }}>Plan: <b style={{ color: "#02C39A" }}>{clinic.plan}</b> · ABDM: {clinic.abdm_connected ? "Yes" : "No"}</p>
      </Section>
      <Section title={`Specialities (${specs.length})`}>
        <p style={{ color: "#7FBBC5" }}>{specs.map((s, i) => `${s.icon} ${s.name}${i === 0 ? " (primary)" : ""}`).join(" · ") || "None"}</p>
      </Section>
      <Section title="Admin"><p>{admin.name} — {admin.email} — {admin.phone}</p></Section>

      <Section title={`Team (${team.length})`}>
        {team.length === 0 ? <p style={{ color: "#7FBBC5" }}>No team members.</p> : team.map((m, i) => (
          <p key={i} style={{ color: "#7FBBC5" }}>• {m.name} — {m.role} {m.email && `(${m.email})`}</p>
        ))}
      </Section>
      <Section title={`Inventory (${inventory.length})`}>
        {inventory.length === 0 ? <p style={{ color: "#7FBBC5" }}>No inventory rows.</p> : inventory.map((r, i) => (
          <p key={i} style={{ color: "#7FBBC5" }}>• {r.medicine_name} — {r.current_stock} {r.unit}</p>
        ))}
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="p-3 rounded-md" style={{ background: "#0A2535", border: "1px solid #1A4055" }}>
      <div className="text-[11px] uppercase tracking-wide mb-1.5" style={{ color: "#7FBBC5" }}>{title}</div>
      {children}
    </div>
  );
}

function ResultModal({ title, result, adminEmail, adminPassword, onClose }: { title: string; result: { teamCount: number; inventoryCount: number }; adminEmail?: string; adminPassword?: string; onClose: () => void }) {
  const copy = (s: string) => { navigator.clipboard.writeText(s); toast.success("Copied"); };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(10,37,53,0.75)" }}>
      <div className="w-full max-w-[480px] p-6" style={saCard}>
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle2 className="w-5 h-5" style={{ color: "#02C39A" }} />
          <h3 className="text-lg font-bold">{title}</h3>
        </div>
        <div className="space-y-2 text-[13px]">
          <p style={{ color: "#7FBBC5" }}>{result.teamCount} team members, {result.inventoryCount} inventory items added.</p>
          {adminEmail && (
            <div className="p-3 rounded-md" style={{ background: "#0A2535", border: "1px solid #1A4055" }}>
              <div className="text-[11px] uppercase mb-1" style={{ color: "#7FBBC5" }}>Admin Login</div>
              <div className="flex items-center justify-between gap-2">
                <code className="text-[12px]">{adminEmail}</code>
                <button onClick={() => copy(adminEmail)} className="p-1 rounded hover:bg-white/5"><Copy className="w-3 h-3" /></button>
              </div>
              <div className="flex items-center justify-between gap-2 mt-1">
                <code className="text-[12px]">{adminPassword}</code>
                <button onClick={() => copy(adminPassword!)} className="p-1 rounded hover:bg-white/5"><Copy className="w-3 h-3" /></button>
              </div>
            </div>
          )}
        </div>
        <div className="flex justify-end mt-5">
          <button onClick={onClose} className="px-4 py-2 rounded-md text-[12px] font-semibold" style={{ background: "#02C39A", color: "#0A2535" }}>Done</button>
        </div>
      </div>
    </div>
  );
}
