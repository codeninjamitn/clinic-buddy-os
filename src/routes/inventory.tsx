import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { medicines } from "@/lib/mockData2";
import { Plus, FileText, Pencil, X, AlertTriangle, Clock, Package } from "lucide-react";

export const Route = createFileRoute("/inventory")({ component: InventoryPage });

function InventoryPage() {
  const [addOpen, setAddOpen] = useState(false);

  return (
    <div className="max-w-[1600px] mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-2xl font-bold text-navy">Inventory</h2>
          <p className="text-sm text-muted-foreground">Pharmacy stock and expiry tracking</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => toast.success("Purchase order generated")} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md border border-border bg-white text-navy text-sm font-semibold hover:bg-muted">
            <FileText className="w-4 h-4" /> Generate Purchase Order
          </button>
          <button onClick={() => setAddOpen(true)} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary text-white text-sm font-semibold hover:bg-primary/90">
            <Plus className="w-4 h-4" /> Add Medicine
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        <SummaryCard icon={<Package />} label="Total SKUs" value="284" tone="navy" />
        <SummaryCard icon={<AlertTriangle />} label="Low Stock Items" value="12" tone="red" />
        <SummaryCard icon={<Clock />} label="Expiring This Month" value="8" tone="amber" />
        <SummaryCard icon={<Package />} label="Total Stock Value" value="₹2,14,800" tone="primary" />
      </div>

      <div className="card-surface overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-3">Medicine</th>
              <th className="text-left px-4 py-3">Category</th>
              <th className="text-left px-4 py-3 w-56">Current Stock</th>
              <th className="text-left px-4 py-3">Unit</th>
              <th className="text-left px-4 py-3">Expiry</th>
              <th className="text-left px-4 py-3">Reorder</th>
              <th className="text-right px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {medicines.map((m) => {
              const pct = (m.stock / m.maxStock) * 100;
              const low = pct < 20;
              const mid = pct >= 20 && pct < 50;
              const barColor = low ? "bg-red-500" : mid ? "bg-amber-500" : "bg-emerald-500";
              return (
                <tr key={m.id} className={`border-t border-border hover:bg-[#E1F5EE]/40 transition-colors ${low ? "bg-red-50/60" : ""}`}>
                  <td className="px-4 py-3 font-medium text-navy">{m.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{m.category}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full ${barColor}`} style={{ width: `${Math.min(100, pct)}%` }} />
                      </div>
                      <span className="text-xs font-semibold text-navy w-14 text-right">{m.stock}/{m.maxStock}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{m.unit}</td>
                  <td className="px-4 py-3 text-muted-foreground">{m.expiry}</td>
                  <td className="px-4 py-3 text-muted-foreground">{m.reorder}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button className="p-1.5 rounded hover:bg-muted"><Pencil className="w-4 h-4 text-muted-foreground" /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {addOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setAddOpen(false)}>
          <div className="bg-white rounded-xl w-full max-w-md p-6 animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-navy">Add Medicine</h3>
              <button onClick={() => setAddOpen(false)} className="p-1 hover:bg-muted rounded"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              {["Medicine Name", "Category", "Initial Stock", "Unit", "Expiry (MM/YYYY)", "Reorder Level"].map((f) => (
                <div key={f}>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">{f}</label>
                  <input className="w-full px-3 py-2 text-sm rounded-md border border-border" />
                </div>
              ))}
              <button onClick={() => { toast.success("Medicine added to inventory"); setAddOpen(false); }} className="w-full py-2.5 rounded-md bg-primary text-white text-sm font-semibold hover:bg-primary/90">
                Save Medicine
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string; tone: "navy" | "red" | "amber" | "primary" }) {
  const tones = {
    navy: "bg-navy/10 text-navy",
    red: "bg-red-100 text-red-600",
    amber: "bg-amber-100 text-amber-700",
    primary: "bg-[#E1F5EE] text-primary",
  };
  return (
    <div className="card-surface p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${tones[tone]} [&_svg]:w-5 [&_svg]:h-5`}>{icon}</div>
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-lg font-bold text-navy">{value}</div>
      </div>
    </div>
  );
}
