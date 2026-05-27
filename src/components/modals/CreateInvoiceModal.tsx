import { useEffect, useState } from "react";
import { X, Trash2, MessageCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useClinic, formatINR } from "@/lib/auth";
import type { Patient, Staff } from "@/types/database";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (info: { patientName: string; total: number }) => void;
}

export function CreateInvoiceModal({ isOpen, onClose, onSuccess }: Props) {
  const { clinic } = useClinic();
  const clinicId = clinic?.id;

  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Staff[]>([]);
  const [patientId, setPatientId] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [items, setItems] = useState<{ name: string; amount: number }[]>([{ name: "Consultation", amount: 800 }]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setItems([{ name: "Consultation", amount: 800 }]);
    setPatientId("");
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || !clinicId) return;
    supabase.from("patients").select("*").eq("clinic_id", clinicId).order("name").then(({ data }) => setPatients((data as Patient[]) ?? []));
    supabase.from("staff").select("*").eq("clinic_id", clinicId).eq("role", "Doctor").order("name").then(({ data }) => {
      const list = (data as Staff[]) ?? [];
      setDoctors(list);
      if (list[0]) setDoctorId(list[0].id);
    });
  }, [isOpen, clinicId]);

  const subtotal = items.reduce((a, b) => a + (b.amount || 0), 0);
  const gst = Math.round(subtotal * 0.18);
  const total = subtotal + gst;

  const update = (i: number, k: "name" | "amount", v: string) =>
    setItems(items.map((it, idx) => (idx === i ? { ...it, [k]: k === "amount" ? Number(v) || 0 : v } : it)));

  const submit = async () => {
    if (!clinicId) return;
    if (!patientId) { toast.error("Please select a patient"); return; }
    setSaving(true);
    const { error } = await supabase.from("invoices").insert({
      clinic_id: clinicId, patient_id: patientId, doctor_id: doctorId || null,
      invoice_date: new Date().toISOString().slice(0, 10),
      line_items: items, subtotal, gst_amount: gst, total,
      payment_method: "UPI", status: "Pending",
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    const patientName = patients.find(p => p.id === patientId)?.name ?? "patient";
    toast.success(`Invoice created for ${patientName}`);
    onSuccess?.({ patientName, total });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-xl w-full max-w-lg p-6 animate-scale-in max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-navy">Create Invoice</h3>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Patient</label>
            <select value={patientId} onChange={(e) => setPatientId(e.target.value)} className="w-full px-3 py-2 text-sm rounded-md border border-border bg-white">
              <option value="">Select patient...</option>
              {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Doctor</label>
            <select value={doctorId} onChange={(e) => setDoctorId(e.target.value)} className="w-full px-3 py-2 text-sm rounded-md border border-border bg-white">
              {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-muted-foreground">Line Items</label>
              <button onClick={() => setItems([...items, { name: "", amount: 0 }])} className="text-xs text-primary font-semibold hover:underline">+ Add item</button>
            </div>
            <div className="space-y-2">
              {items.map((it, i) => (
                <div key={i} className="flex gap-2">
                  <input value={it.name} onChange={(e) => update(i, "name", e.target.value)} placeholder="Service" className="flex-1 px-3 py-2 text-sm rounded-md border border-border" />
                  <input type="number" value={it.amount} onChange={(e) => update(i, "amount", e.target.value)} className="w-28 px-3 py-2 text-sm rounded-md border border-border" />
                  <button onClick={() => setItems(items.filter((_, idx) => idx !== i))} className="p-2 text-muted-foreground hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-muted/40 rounded-md p-3 text-sm space-y-1">
            <div className="flex justify-between"><span>Subtotal</span><span>{formatINR(subtotal)}</span></div>
            <div className="flex justify-between text-muted-foreground"><span>GST (18%)</span><span>{formatINR(gst)}</span></div>
            <div className="flex justify-between font-bold text-navy pt-1 border-t border-border"><span>Total</span><span>{formatINR(total)}</span></div>
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-md border border-border text-navy text-sm font-semibold hover:bg-muted">Cancel</button>
            <button
              onClick={submit}
              disabled={saving}
              className="flex-1 py-2.5 rounded-md bg-primary text-white text-sm font-semibold hover:bg-primary/90 inline-flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageCircle className="w-4 h-4" />} Generate & Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
