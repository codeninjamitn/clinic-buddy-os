import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Eye, Download, Plus, X, Trash2, MessageCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useClinic, formatINR, initials as initialsOf } from "@/lib/auth";
import type { Invoice, InvoiceStatus, Patient, Staff } from "@/types/database";

export const Route = createFileRoute("/billing")({ component: BillingPage });

function statusBadge(s: InvoiceStatus) {
  const map: Record<InvoiceStatus, string> = {
    Paid: "bg-[#E1F5EE] text-primary",
    Pending: "bg-amber-100 text-amber-700",
    Overdue: "bg-red-100 text-red-700",
    Draft: "bg-gray-100 text-gray-700",
  };
  return <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${map[s]}`}>{s}</span>;
}

function methodBadge(m: string | null) {
  const map: Record<string, string> = {
    UPI: "bg-violet-100 text-violet-700",
    Cash: "bg-emerald-100 text-emerald-700",
    Card: "bg-blue-100 text-blue-700",
    Insurance: "bg-amber-100 text-amber-700",
  };
  return <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${map[m ?? ""] ?? "bg-gray-100 text-gray-700"}`}>{m ?? "—"}</span>;
}

function BillingPage() {
  const { clinic } = useClinic();
  const clinicId = clinic?.id;

  const [tab, setTab] = useState<"invoices" | "payments">("invoices");
  const [modalOpen, setModalOpen] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState({ paid: 0, pending: 0, overdue: 0 });

  const load = async () => {
    if (!clinicId) return;
    setLoading(true);
    const [list, paid, pending, overdue] = await Promise.all([
      supabase.from("invoices").select("*, patients(name), staff(name)").eq("clinic_id", clinicId).order("created_at", { ascending: false }),
      supabase.from("invoices").select("total").eq("clinic_id", clinicId).eq("status", "Paid"),
      supabase.from("invoices").select("total").eq("clinic_id", clinicId).eq("status", "Pending"),
      supabase.from("invoices").select("total").eq("clinic_id", clinicId).eq("status", "Overdue"),
    ]);
    setInvoices((list.data as unknown as Invoice[]) ?? []);
    const sum = (arr: any[] | null) => (arr ?? []).reduce((s, r) => s + Number(r.total || 0), 0);
    setTotals({ paid: sum(paid.data), pending: sum(pending.data), overdue: sum(overdue.data) });
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [clinicId]);

  const totalBilled = totals.paid + totals.pending + totals.overdue;
  const payments = invoices.filter(i => i.status === "Paid").slice(0, 20);

  return (
    <div className="max-w-[1500px] mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-2xl font-bold text-navy">Billing</h2>
          <p className="text-sm text-muted-foreground">Invoices, payments and collections</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary text-white text-sm font-semibold hover:bg-primary/90 active:bg-primary/80 transition-colors">
          <Plus className="w-4 h-4" /> Create Invoice
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        {[
          { l: "Total Billed", v: formatINR(totalBilled), c: "text-navy" },
          { l: "Collected", v: formatINR(totals.paid), c: "text-primary" },
          { l: "Pending", v: formatINR(totals.pending), c: "text-amber-600" },
          { l: "Overdue", v: formatINR(totals.overdue), c: "text-red-600" },
        ].map((s) => (
          <div key={s.l} className="card-surface p-4">
            <div className="text-xs text-muted-foreground">{s.l}</div>
            {loading ? <div className="h-6 mt-1 w-20 bg-muted rounded animate-pulse" /> : <div className={`text-xl font-bold mt-1 ${s.c}`}>{s.v}</div>}
          </div>
        ))}
      </div>

      <div className="flex gap-1 border-b border-border mb-4">
        {(["invoices", "payments"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition-colors ${
              tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-navy"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "invoices" ? (
        <div className="card-surface overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3">Invoice #</th>
                <th className="text-left px-4 py-3">Patient</th>
                <th className="text-left px-4 py-3">Date</th>
                <th className="text-left px-4 py-3">Services</th>
                <th className="text-right px-4 py-3">Amount</th>
                <th className="text-center px-4 py-3">Status</th>
                <th className="text-right px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-t border-border"><td colSpan={7} className="px-4 py-3"><div className="h-6 bg-muted rounded animate-pulse" /></td></tr>
                ))
              ) : invoices.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-muted-foreground">No invoices yet. Click "Create Invoice" to get started.</td></tr>
              ) : invoices.map((inv) => {
                const items = Array.isArray(inv.line_items) ? inv.line_items : [];
                return (
                  <tr key={inv.id} className="border-t border-border hover:bg-[#E1F5EE]/40 transition-colors">
                    <td className="px-4 py-3 font-medium text-navy">INV-{inv.id.slice(0, 6).toUpperCase()}</td>
                    <td className="px-4 py-3">{inv.patients?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{new Date(inv.invoice_date).toLocaleDateString("en-IN")}</td>
                    <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">{items.map(i => i.name).join(", ")}</td>
                    <td className="px-4 py-3 text-right font-semibold">{formatINR(Number(inv.total))}</td>
                    <td className="px-4 py-3 text-center">{statusBadge(inv.status)}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button className="p-1.5 rounded hover:bg-muted" title="View"><Eye className="w-4 h-4 text-muted-foreground" /></button>
                        <button className="p-1.5 rounded hover:bg-muted" title="Download"><Download className="w-4 h-4 text-muted-foreground" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card-surface divide-y divide-border">
          {loading ? (
            <div className="p-4 space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-12 bg-muted rounded animate-pulse" />)}</div>
          ) : payments.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground">No payments received yet.</div>
          ) : payments.map((p) => {
            const name = p.patients?.name ?? "—";
            return (
              <div key={p.id} className="flex items-center justify-between px-4 py-3 hover:bg-[#E1F5EE]/40 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/15 text-primary flex items-center justify-center text-sm font-semibold">
                    {initialsOf(name)}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-navy">{name}</div>
                    <div className="text-xs text-muted-foreground">{new Date(p.invoice_date).toLocaleDateString("en-IN")} · <span className="text-primary">INV-{p.id.slice(0, 6).toUpperCase()}</span></div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {methodBadge(p.payment_method)}
                  <div className="text-sm font-bold text-navy w-24 text-right">{formatINR(Number(p.total))}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modalOpen && clinicId && <CreateInvoiceModal clinicId={clinicId} onClose={() => setModalOpen(false)} onSaved={() => { setModalOpen(false); load(); }} />}
    </div>
  );
}

function CreateInvoiceModal({ clinicId, onClose, onSaved }: { clinicId: string; onClose: () => void; onSaved: () => void }) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Staff[]>([]);
  const [patientId, setPatientId] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [items, setItems] = useState<{ name: string; amount: number }[]>([{ name: "Consultation", amount: 800 }]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from("patients").select("*").eq("clinic_id", clinicId).order("name").then(({ data }) => setPatients((data as Patient[]) ?? []));
    supabase.from("staff").select("*").eq("clinic_id", clinicId).eq("role", "Doctor").order("name").then(({ data }) => { const list = (data as Staff[]) ?? []; setDoctors(list); if (list[0]) setDoctorId(list[0].id); });
  }, [clinicId]);

  const subtotal = items.reduce((a, b) => a + (b.amount || 0), 0);
  const gst = Math.round(subtotal * 0.18);
  const total = subtotal + gst;

  const update = (i: number, k: "name" | "amount", v: string) =>
    setItems(items.map((it, idx) => (idx === i ? { ...it, [k]: k === "amount" ? Number(v) || 0 : v } : it)));

  const submit = async () => {
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
    toast.success("Invoice generated & sent on WhatsApp");
    onSaved();
  };

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
          <button
            onClick={submit}
            disabled={saving}
            className="w-full py-2.5 rounded-md bg-primary text-white text-sm font-semibold hover:bg-primary/90 inline-flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageCircle className="w-4 h-4" />} Generate & Send on WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}
