import { useEffect, useState } from "react";
import { X, CreditCard, Smartphone, Banknote, Landmark, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { formatINR } from "@/lib/auth";
import type { Invoice, PaymentMethod } from "@/types/database";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  onSuccess?: () => void;
}

const METHODS: { key: PaymentMethod; label: string; hint: string; icon: React.ComponentType<{ className?: string }>; accent: string }[] = [
  { key: "UPI", label: "UPI", hint: "Razorpay / Paytm / PhonePe QR", icon: Smartphone, accent: "bg-violet-50 text-violet-700 border-violet-200" },
  { key: "Card", label: "Card", hint: "Tap / swipe on POS terminal", icon: CreditCard, accent: "bg-blue-50 text-blue-700 border-blue-200" },
  { key: "Cash", label: "Cash", hint: "Counter collection", icon: Banknote, accent: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { key: "Insurance", label: "Insurance", hint: "TPA / cashless", icon: Landmark, accent: "bg-amber-50 text-amber-700 border-amber-200" },
];

export function CollectPaymentModal({ isOpen, onClose, invoice, onSuccess }: Props) {
  const [method, setMethod] = useState<PaymentMethod>("UPI");
  const [ref, setRef] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setMethod((invoice?.payment_method as PaymentMethod) ?? "UPI");
    setRef("");
    setDone(false);
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose, invoice]);

  if (!isOpen || !invoice) return null;

  const confirm = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("invoices")
      .update({ status: "Paid", payment_method: method, payment_reference: ref.trim() || null })
      .eq("id", invoice.id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    setDone(true);
    toast.success(`Payment of ${formatINR(Number(invoice.total))} collected via ${method}`);
    setTimeout(() => { onSuccess?.(); onClose(); }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-xl w-full max-w-md p-6 animate-scale-in max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-navy">Collect Payment</h3>
            <p className="text-xs text-muted-foreground">INV-{invoice.id.slice(0, 6).toUpperCase()} · {invoice.patients?.name ?? "—"}</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded"><X className="w-5 h-5" /></button>
        </div>

        <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-4 mb-4 text-center">
          <div className="text-xs text-muted-foreground uppercase tracking-wide">Amount Due</div>
          <div className="text-3xl font-bold text-navy mt-1">{formatINR(Number(invoice.total))}</div>
        </div>

        {done ? (
          <div className="text-center py-6">
            <CheckCircle2 className="w-14 h-14 text-primary mx-auto mb-2" />
            <div className="font-semibold text-navy">Payment collected</div>
            <div className="text-xs text-muted-foreground">Invoice marked as Paid</div>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <label className="block text-xs font-medium text-muted-foreground mb-2">Payment method</label>
              <div className="grid grid-cols-2 gap-2">
                {METHODS.map((m) => {
                  const Icon = m.icon;
                  const active = method === m.key;
                  return (
                    <button
                      key={m.key}
                      onClick={() => setMethod(m.key)}
                      className={`p-3 rounded-lg border text-left transition-all ${active ? `${m.accent} border-current ring-2 ring-current/20` : "border-border hover:bg-muted"}`}
                    >
                      <Icon className="w-5 h-5 mb-1" />
                      <div className="text-sm font-semibold">{m.label}</div>
                      <div className="text-[11px] opacity-75">{m.hint}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Reference / Txn ID (optional)</label>
              <input
                value={ref}
                onChange={(e) => setRef(e.target.value)}
                placeholder={method === "UPI" ? "e.g. UPI ref 4218..." : method === "Card" ? "Last 4 digits / auth code" : "Receipt no."}
                className="w-full px-3 py-2 text-sm rounded-md border border-border"
              />
            </div>

            <div className="flex gap-2">
              <button onClick={onClose} className="flex-1 py-2.5 rounded-md border border-border text-navy text-sm font-semibold hover:bg-muted">Cancel</button>
              <button
                onClick={confirm}
                disabled={saving}
                className="flex-1 py-2.5 rounded-md bg-primary text-white text-sm font-semibold hover:bg-primary/90 inline-flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Mark as Paid
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
