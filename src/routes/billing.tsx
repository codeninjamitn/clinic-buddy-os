import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { invoices, payments, type Invoice } from "@/lib/mockData2";
import { Eye, Download, Plus, X, Trash2, MessageCircle } from "lucide-react";

export const Route = createFileRoute("/billing")({ component: BillingPage });

function statusBadge(s: Invoice["status"]) {
  const map = {
    Paid: "bg-[#E1F5EE] text-primary",
    Pending: "bg-amber-100 text-amber-700",
    Overdue: "bg-red-100 text-red-700",
  };
  return <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${map[s]}`}>{s}</span>;
}

function methodBadge(m: "UPI" | "Cash" | "Card") {
  const map = { UPI: "bg-violet-100 text-violet-700", Cash: "bg-emerald-100 text-emerald-700", Card: "bg-blue-100 text-blue-700" };
  return <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${map[m]}`}>{m}</span>;
}

function BillingPage() {
  const [tab, setTab] = useState<"invoices" | "payments">("invoices");
  const [modalOpen, setModalOpen] = useState(false);

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
          { l: "Total Billed", v: "₹3,24,000", c: "text-navy" },
          { l: "Collected", v: "₹2,86,400", c: "text-primary" },
          { l: "Pending", v: "₹37,600", c: "text-amber-600" },
          { l: "Overdue", v: "₹18,200", c: "text-red-600" },
        ].map((s) => (
          <div key={s.l} className="card-surface p-4">
            <div className="text-xs text-muted-foreground">{s.l}</div>
            <div className={`text-xl font-bold mt-1 ${s.c}`}>{s.v}</div>
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
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-t border-border hover:bg-[#E1F5EE]/40 transition-colors">
                  <td className="px-4 py-3 font-medium text-navy">{inv.id}</td>
                  <td className="px-4 py-3">{inv.patient}</td>
                  <td className="px-4 py-3 text-muted-foreground">{inv.date}</td>
                  <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">{inv.services.join(", ")}</td>
                  <td className="px-4 py-3 text-right font-semibold">₹{inv.amount.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-center">{statusBadge(inv.status)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button className="p-1.5 rounded hover:bg-muted" title="View"><Eye className="w-4 h-4 text-muted-foreground" /></button>
                      <button className="p-1.5 rounded hover:bg-muted" title="Download"><Download className="w-4 h-4 text-muted-foreground" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card-surface divide-y divide-border">
          {payments.map((p) => (
            <div key={p.id} className="flex items-center justify-between px-4 py-3 hover:bg-[#E1F5EE]/40 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/15 text-primary flex items-center justify-center text-sm font-semibold">
                  {p.patient.split(" ").map((x) => x[0]).slice(0, 2).join("")}
                </div>
                <div>
                  <div className="text-sm font-semibold text-navy">{p.patient}</div>
                  <div className="text-xs text-muted-foreground">{p.date} · <a className="text-primary hover:underline" href="#">{p.invoice}</a></div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {methodBadge(p.method)}
                <div className="text-sm font-bold text-navy w-24 text-right">₹{p.amount.toLocaleString("en-IN")}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && <CreateInvoiceModal onClose={() => setModalOpen(false)} />}
    </div>
  );
}

function CreateInvoiceModal({ onClose }: { onClose: () => void }) {
  const [patient, setPatient] = useState("");
  const [items, setItems] = useState<{ name: string; amount: number }[]>([{ name: "Consultation", amount: 800 }]);

  const subtotal = items.reduce((a, b) => a + (b.amount || 0), 0);
  const gst = Math.round(subtotal * 0.18);
  const total = subtotal + gst;

  const update = (i: number, k: "name" | "amount", v: string) =>
    setItems(items.map((it, idx) => (idx === i ? { ...it, [k]: k === "amount" ? Number(v) || 0 : v } : it)));

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-xl w-full max-w-lg p-6 animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-navy">Create Invoice</h3>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Patient</label>
            <input value={patient} onChange={(e) => setPatient(e.target.value)} placeholder="Search patient..." className="w-full px-3 py-2 text-sm rounded-md border border-border" />
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
            <div className="flex justify-between"><span>Subtotal</span><span>₹{subtotal.toLocaleString("en-IN")}</span></div>
            <div className="flex justify-between text-muted-foreground"><span>GST (18%)</span><span>₹{gst.toLocaleString("en-IN")}</span></div>
            <div className="flex justify-between font-bold text-navy pt-1 border-t border-border"><span>Total</span><span>₹{total.toLocaleString("en-IN")}</span></div>
          </div>
          <button
            onClick={() => { toast.success("Invoice generated & sent on WhatsApp"); onClose(); }}
            className="w-full py-2.5 rounded-md bg-primary text-white text-sm font-semibold hover:bg-primary/90 inline-flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-4 h-4" /> Generate & Send on WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}
