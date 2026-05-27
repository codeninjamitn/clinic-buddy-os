import { useState } from "react";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { updateClinicProfile } from "@/lib/superadmin.functions";
import { saCard, saInput, saLabel } from "./tokens";
import type { Clinic } from "@/types/database";

interface Props { clinic: Clinic; onClose: (saved: boolean) => void }
type Plan = "starter" | "pro" | "enterprise";
type Status = "active" | "suspended" | "setup";

export function EditClinicModal({ clinic, onClose }: Props) {
  const update = useServerFn(updateClinicProfile);
  const c = clinic as Clinic & { plan?: Plan; status?: Status; email?: string | null; registration_number?: string | null };
  const [name, setName] = useState(c.name);
  const [address, setAddress] = useState(c.address ?? "");
  const [phone, setPhone] = useState(c.phone ?? "");
  const [email, setEmail] = useState(c.email ?? "");
  const [gst, setGst] = useState(c.gst_number ?? "");
  const [reg, setReg] = useState(c.registration_number ?? "");
  const [plan, setPlan] = useState<Plan>((c.plan as Plan) ?? "starter");
  const [status, setStatus] = useState<Status>((c.status as Status) ?? "active");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await update({ data: { id: c.id, patch: { name, address, phone, email, gst_number: gst, registration_number: reg, plan, status } } });
      toast.success("Clinic updated");
      onClose(true);
    } catch (e) { toast.error((e as Error).message); setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(10,37,53,0.7)" }} onClick={() => onClose(false)}>
      <div className="w-full max-w-[560px] p-6 max-h-[90vh] overflow-y-auto" style={{ ...saCard }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Edit Clinic</h3>
          <button onClick={() => onClose(false)} className="p-1 rounded hover:bg-white/5"><X className="w-4 h-4" style={{ color: "#7FBBC5" }} /></button>
        </div>
        <div className="space-y-3">
          <Field label="Clinic name"><input style={saInput} value={name} onChange={(e) => setName(e.target.value)} /></Field>
          <Field label="Address"><input style={saInput} value={address} onChange={(e) => setAddress(e.target.value)} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Phone"><input style={saInput} value={phone} onChange={(e) => setPhone(e.target.value)} /></Field>
            <Field label="Email"><input style={saInput} value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
            <Field label="GST"><input style={saInput} value={gst} onChange={(e) => setGst(e.target.value)} /></Field>
            <Field label="Registration #"><input style={saInput} value={reg} onChange={(e) => setReg(e.target.value)} /></Field>
            <Field label="Plan">
              <select style={saInput} value={plan} onChange={(e) => setPlan(e.target.value as Plan)}>
                <option value="starter">Starter</option><option value="pro">Pro</option><option value="enterprise">Enterprise</option>
              </select>
            </Field>
            <Field label="Status">
              <select style={saInput} value={status} onChange={(e) => setStatus(e.target.value as Status)}>
                <option value="active">Active</option><option value="suspended">Suspended</option><option value="setup">Setup</option>
              </select>
            </Field>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button onClick={() => onClose(false)} className="px-4 py-2 rounded-md text-[12px]" style={{ background: "#0A2535", color: "#7FBBC5", border: "1px solid #1A4055" }}>Cancel</button>
          <button onClick={save} disabled={saving} className="px-4 py-2 rounded-md text-[12px] font-semibold inline-flex items-center gap-2" style={{ background: "#02C39A", color: "#0A2535", opacity: saving ? 0.6 : 1 }}>
            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label style={saLabel}>{label}</label>{children}</div>;
}
