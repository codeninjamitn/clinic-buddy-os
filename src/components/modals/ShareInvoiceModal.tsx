import { useEffect } from "react";
import { X, Download, Mail, MessageSquare, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { useClinic } from "@/lib/auth";
import type { Invoice } from "@/types/database";
import { downloadInvoicePdf, invoiceNumber, invoiceShareMessage } from "@/lib/invoicePdf";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
}

function digitsOnly(v?: string | null) {
  return (v ?? "").replace(/[^\d]/g, "");
}

export function ShareInvoiceModal({ isOpen, onClose, invoice }: Props) {
  const { clinic } = useClinic();

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen || !invoice) return null;

  const phone = digitsOnly(invoice.patients?.phone);
  const email = invoice.patients?.email ?? "";
  const message = invoiceShareMessage(invoice, clinic);

  const doDownload = () => {
    downloadInvoicePdf(invoice, clinic);
    toast.success("Invoice PDF downloaded");
  };

  const openEmail = () => {
    if (!email) { toast.error("Patient has no email on file"); return; }
    const subject = `Invoice ${invoiceNumber(invoice)} from ${clinic?.name ?? "our clinic"}`;
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message + "\n\n(PDF attached separately — please download and attach it before sending.)")}`;
  };

  const openSms = () => {
    if (!phone) { toast.error("Patient has no phone on file"); return; }
    window.location.href = `sms:+91${phone.slice(-10)}?&body=${encodeURIComponent(message)}`;
  };

  const openWhatsApp = () => {
    if (!phone) { toast.error("Patient has no phone on file"); return; }
    const num = phone.length === 10 ? `91${phone}` : phone;
    window.open(`https://wa.me/${num}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-xl w-full max-w-md p-6 animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-navy">Share Invoice</h3>
            <p className="text-xs text-muted-foreground">{invoiceNumber(invoice)} · {invoice.patients?.name ?? "—"}</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded"><X className="w-5 h-5" /></button>
        </div>

        <div className="space-y-2">
          <button onClick={doDownload} className="w-full flex items-center gap-3 px-3 py-3 rounded-md border border-border hover:bg-muted text-left">
            <Download className="w-5 h-5 text-primary" />
            <div>
              <div className="text-sm font-semibold text-navy">Download PDF</div>
              <div className="text-xs text-muted-foreground">Save invoice to this device</div>
            </div>
          </button>

          <button onClick={openEmail} className="w-full flex items-center gap-3 px-3 py-3 rounded-md border border-border hover:bg-muted text-left">
            <Mail className="w-5 h-5 text-blue-600" />
            <div className="min-w-0">
              <div className="text-sm font-semibold text-navy">Email</div>
              <div className="text-xs text-muted-foreground truncate">{email || "No email on file"}</div>
            </div>
          </button>

          <button onClick={openWhatsApp} className="w-full flex items-center gap-3 px-3 py-3 rounded-md border border-border hover:bg-muted text-left">
            <MessageCircle className="w-5 h-5 text-emerald-600" />
            <div className="min-w-0">
              <div className="text-sm font-semibold text-navy">WhatsApp</div>
              <div className="text-xs text-muted-foreground truncate">{phone ? `+91 ${phone.slice(-10)}` : "No phone on file"}</div>
            </div>
          </button>

          <button onClick={openSms} className="w-full flex items-center gap-3 px-3 py-3 rounded-md border border-border hover:bg-muted text-left">
            <MessageSquare className="w-5 h-5 text-violet-600" />
            <div className="min-w-0">
              <div className="text-sm font-semibold text-navy">SMS</div>
              <div className="text-xs text-muted-foreground truncate">{phone ? `+91 ${phone.slice(-10)}` : "No phone on file"}</div>
            </div>
          </button>
        </div>

        <p className="mt-4 text-[11px] text-muted-foreground leading-relaxed">
          Email, WhatsApp, and SMS open your device's default app pre-filled with the invoice summary. Download the PDF first if you want to attach it.
        </p>
      </div>
    </div>
  );
}
