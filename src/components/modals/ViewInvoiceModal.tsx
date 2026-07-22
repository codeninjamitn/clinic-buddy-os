import { useEffect } from "react";
import { X, Printer } from "lucide-react";
import { formatINR } from "@/lib/auth";
import type { Invoice } from "@/types/database";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
}

export function ViewInvoiceModal({ isOpen, onClose, invoice }: Props) {
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen || !invoice) return null;
  const items = Array.isArray(invoice.line_items) ? invoice.line_items : [];

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-xl w-full max-w-lg p-6 animate-scale-in max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-navy">Invoice INV-{invoice.id.slice(0, 6).toUpperCase()}</h3>
            <p className="text-xs text-muted-foreground">{new Date(invoice.invoice_date).toLocaleDateString("en-IN")}</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded"><X className="w-5 h-5" /></button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-xs text-muted-foreground">Patient</div>
              <div className="font-medium text-navy">{invoice.patients?.name ?? "—"}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Doctor</div>
              <div className="font-medium text-navy">{invoice.staff?.name ?? "—"}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Status</div>
              <div className="font-medium text-navy">{invoice.status}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Payment</div>
              <div className="font-medium text-navy">{invoice.payment_method ?? "—"}</div>
            </div>
          </div>

          <div>
            <div className="text-xs font-medium text-muted-foreground mb-2">Line Items</div>
            <div className="border border-border rounded-md divide-y divide-border">
              {items.length === 0 ? (
                <div className="p-3 text-sm text-muted-foreground text-center">No items</div>
              ) : items.map((it, i) => (
                <div key={i} className="flex items-center justify-between px-3 py-2 text-sm">
                  <span>{it.name}</span>
                  <span className="font-medium">{formatINR(Number(it.amount) || 0)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-muted/40 rounded-md p-3 text-sm space-y-1">
            <div className="flex justify-between"><span>Subtotal</span><span>{formatINR(Number(invoice.subtotal))}</span></div>
            <div className="flex justify-between text-muted-foreground"><span>GST</span><span>{formatINR(Number(invoice.gst_amount))}</span></div>
            <div className="flex justify-between font-bold text-navy pt-1 border-t border-border"><span>Total</span><span>{formatINR(Number(invoice.total))}</span></div>
          </div>

          <div className="flex gap-2">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-md border border-border text-navy text-sm font-semibold hover:bg-muted">Close</button>
            <button
              onClick={() => window.print()}
              className="flex-1 py-2.5 rounded-md bg-primary text-white text-sm font-semibold hover:bg-primary/90 inline-flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" /> Print
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
