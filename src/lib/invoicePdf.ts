import jsPDF from "jspdf";
import type { Invoice, Clinic } from "@/types/database";

const inr = (n: number) =>
  "INR " + new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(n);

export function invoiceNumber(inv: Invoice) {
  return `INV-${inv.id.slice(0, 6).toUpperCase()}`;
}

export function buildInvoicePdf(inv: Invoice, clinic: Clinic | null): jsPDF {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const M = 40;
  let y = 50;

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(clinic?.name ?? "Clinic", M, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  y += 16;
  // Reserve room on the right for the invoice meta block (title/number/date/status)
  const leftMaxWidth = pageW - 2 * M - 180;
  if (clinic?.address) {
    const addressLines = doc.splitTextToSize(clinic.address, leftMaxWidth).slice(0, 3);
    addressLines.forEach((ln: string) => { doc.text(ln, M, y); y += 12; });
  }
  const line2 = [clinic?.phone, clinic?.gst_number ? `GSTIN: ${clinic.gst_number}` : null].filter(Boolean).join("  ·  ");
  if (line2) {
    const line2Wrapped = doc.splitTextToSize(line2, leftMaxWidth);
    line2Wrapped.forEach((ln: string) => { doc.text(ln, M, y); y += 12; });
  }

  // Invoice title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("TAX INVOICE", pageW - M, 50, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(invoiceNumber(inv), pageW - M, 68, { align: "right" });
  doc.text(new Date(inv.invoice_date).toLocaleDateString("en-IN"), pageW - M, 82, { align: "right" });
  doc.text(`Status: ${inv.status}`, pageW - M, 96, { align: "right" });

  y = Math.max(y, 110);
  doc.setDrawColor(220); doc.line(M, y, pageW - M, y); y += 20;

  // Bill to
  doc.setFont("helvetica", "bold"); doc.setFontSize(10);
  doc.text("Bill To", M, y);
  doc.text("Doctor", pageW / 2, y);
  doc.setFont("helvetica", "normal"); y += 14;
  doc.text(inv.patients?.name ?? "—", M, y);
  doc.text(inv.staff?.name ?? "—", pageW / 2, y);
  y += 24;

  // Items table
  doc.setFillColor(245, 245, 245); doc.rect(M, y, pageW - 2 * M, 22, "F");
  doc.setFont("helvetica", "bold"); doc.setFontSize(10);
  doc.text("Description", M + 10, y + 15);
  doc.text("Amount", pageW - M - 10, y + 15, { align: "right" });
  y += 22;
  doc.setFont("helvetica", "normal");

  const items = Array.isArray(inv.line_items) ? inv.line_items : [];
  items.forEach((it) => {
    doc.text(String(it.name || "—"), M + 10, y + 15);
    doc.text(inr(Number(it.amount) || 0), pageW - M - 10, y + 15, { align: "right" });
    y += 20;
    doc.setDrawColor(235); doc.line(M, y, pageW - M, y);
  });

  y += 12;
  const rightCol = pageW - M - 10;
  const labelCol = pageW - M - 160;
  const row = (l: string, v: string, bold = false) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.text(l, labelCol, y);
    doc.text(v, rightCol, y, { align: "right" });
    y += 16;
  };
  row("Subtotal", inr(Number(inv.subtotal)));
  row("GST (18%)", inr(Number(inv.gst_amount)));
  doc.setDrawColor(200); doc.line(labelCol, y - 8, rightCol, y - 8);
  row("Total", inr(Number(inv.total)), true);

  if (inv.payment_method) {
    y += 6;
    doc.setFont("helvetica", "normal"); doc.setFontSize(9);
    doc.text(`Payment method: ${inv.payment_method}`, M, y);
  }

  y += 30;
  doc.setFontSize(9); doc.setTextColor(120);
  doc.text("Thank you for your visit. For queries, contact the clinic.", M, y);

  return doc;
}

export function downloadInvoicePdf(inv: Invoice, clinic: Clinic | null) {
  const doc = buildInvoicePdf(inv, clinic);
  doc.save(`${invoiceNumber(inv)}.pdf`);
}

export function invoiceShareMessage(inv: Invoice, clinic: Clinic | null) {
  const name = inv.patients?.name ?? "there";
  const clinicName = clinic?.name ?? "our clinic";
  return `Hi ${name}, here is your invoice ${invoiceNumber(inv)} from ${clinicName} dated ${new Date(inv.invoice_date).toLocaleDateString("en-IN")}. Total: ${inr(Number(inv.total))}. Status: ${inv.status}.`;
}
