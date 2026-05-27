import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useClinic, formatINR } from "@/lib/auth";
import { useRole } from "@/context/RoleContext";
import type { InventoryItem } from "@/types/database";
import { Plus, FileText, Pencil, X, AlertTriangle, Clock, Package, Loader2 } from "lucide-react";

export const Route = createFileRoute("/inventory")({ component: InventoryPage });

function InventoryPage() {
  const { clinic } = useClinic();
  const { can } = useRole();
  const clinicId = clinic?.id;
  const [addOpen, setAddOpen] = useState(false);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!clinicId) return;
    setLoading(true);
    const { data } = await supabase.from("inventory").select("*").eq("clinic_id", clinicId).order("medicine_name");
    setItems((data as InventoryItem[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [clinicId]);

  const today = new Date();
  const in30 = new Date(); in30.setDate(today.getDate() + 30);
  const lowStock = items.filter(m => m.current_stock < m.reorder_level).length;
  const expiring = items.filter(m => m.expiry_date && new Date(m.expiry_date) <= in30).length;
  const stockValue = items.reduce((s, m) => s + (Number(m.unit_price ?? 0) * m.current_stock), 0);

  return (
    <div className="max-w-[1600px] mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-2xl font-bold text-navy">Inventory</h2>
          <p className="text-sm text-muted-foreground">Pharmacy stock and expiry tracking</p>
        </div>
        <div className="flex gap-2">
          {can("edit_inventory") && (
            <>
              <button onClick={() => toast.success("Purchase order generated")} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md border border-border bg-white text-navy text-sm font-semibold hover:bg-muted">
                <FileText className="w-4 h-4" /> Generate Purchase Order
              </button>
              <button onClick={() => setAddOpen(true)} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary text-white text-sm font-semibold hover:bg-primary/90">
                <Plus className="w-4 h-4" /> Add Medicine
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        <SummaryCard icon={<Package />} label="Total SKUs" value={String(items.length)} tone="navy" loading={loading} />
        <SummaryCard icon={<AlertTriangle />} label="Low Stock Items" value={String(lowStock)} tone="red" loading={loading} />
        <SummaryCard icon={<Clock />} label="Expiring This Month" value={String(expiring)} tone="amber" loading={loading} />
        <SummaryCard icon={<Package />} label="Total Stock Value" value={formatINR(stockValue)} tone="primary" loading={loading} />
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
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="border-t border-border"><td colSpan={7} className="px-4 py-3"><div className="h-6 bg-muted rounded animate-pulse" /></td></tr>
              ))
            ) : items.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-muted-foreground">No medicines in inventory.</td></tr>
            ) : items.map((m) => {
              const maxStock = Math.max(m.reorder_level * 4, m.current_stock, 100);
              const pct = (m.current_stock / maxStock) * 100;
              const low = m.current_stock < m.reorder_level;
              const mid = !low && m.current_stock < m.reorder_level * 2;
              const barColor = low ? "bg-red-500" : mid ? "bg-amber-500" : "bg-emerald-500";
              return (
                <tr key={m.id} className={`border-t border-border hover:bg-[#E1F5EE]/40 transition-colors ${low ? "bg-red-50/60" : ""}`}>
                  <td className="px-4 py-3 font-medium text-navy">{m.medicine_name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{m.category ?? "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full ${barColor}`} style={{ width: `${Math.min(100, pct)}%` }} />
                      </div>
                      <span className="text-xs font-semibold text-navy w-14 text-right">{m.current_stock}/{maxStock}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{m.unit}</td>
                  <td className="px-4 py-3 text-muted-foreground">{m.expiry_date ? new Date(m.expiry_date).toLocaleDateString("en-IN", { month: "short", year: "numeric" }) : "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{m.reorder_level}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      {can("edit_inventory") && (
                        <button className="p-1.5 rounded hover:bg-muted"><Pencil className="w-4 h-4 text-muted-foreground" /></button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {addOpen && clinicId && <AddMedicineModal clinicId={clinicId} onClose={() => setAddOpen(false)} onSaved={() => { setAddOpen(false); load(); }} />}
    </div>
  );
}

function AddMedicineModal({ clinicId, onClose, onSaved }: { clinicId: string; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [stock, setStock] = useState("0");
  const [unit, setUnit] = useState("Strips");
  const [expiry, setExpiry] = useState("");
  const [reorder, setReorder] = useState("20");
  const [price, setPrice] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!name.trim()) { toast.error("Medicine name required"); return; }
    setSaving(true);
    const { error } = await supabase.from("inventory").insert({
      clinic_id: clinicId, medicine_name: name, category: category || null,
      current_stock: Number(stock) || 0, unit, expiry_date: expiry || null,
      reorder_level: Number(reorder) || 20, unit_price: price ? Number(price) : null,
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Medicine added to inventory");
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-xl w-full max-w-md p-6 animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-navy">Add Medicine</h3>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-3">
          <Inp label="Medicine Name" value={name} onChange={setName} />
          <Inp label="Category" value={category} onChange={setCategory} />
          <Inp label="Initial Stock" value={stock} onChange={setStock} type="number" />
          <Inp label="Unit" value={unit} onChange={setUnit} />
          <Inp label="Expiry Date" value={expiry} onChange={setExpiry} type="date" />
          <Inp label="Reorder Level" value={reorder} onChange={setReorder} type="number" />
          <Inp label="Unit Price (₹)" value={price} onChange={setPrice} type="number" />
          <button onClick={submit} disabled={saving} className="w-full py-2.5 rounded-md bg-primary text-white text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 inline-flex items-center justify-center gap-2">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />} Save Medicine
          </button>
        </div>
      </div>
    </div>
  );
}

function Inp({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground mb-1">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full px-3 py-2 text-sm rounded-md border border-border" />
    </div>
  );
}

function SummaryCard({ icon, label, value, tone, loading }: { icon: React.ReactNode; label: string; value: string; tone: "navy" | "red" | "amber" | "primary"; loading?: boolean }) {
  const tones = {
    navy: "bg-navy/10 text-navy",
    red: "bg-red-100 text-red-600",
    amber: "bg-amber-100 text-amber-700",
    primary: "bg-[#E1F5EE] text-primary",
  };
  return (
    <div className="card-surface p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${tones[tone]} [&_svg]:w-5 [&_svg]:h-5`}>{icon}</div>
      <div className="flex-1">
        <div className="text-xs text-muted-foreground">{label}</div>
        {loading ? <div className="h-5 mt-1 w-16 bg-muted rounded animate-pulse" /> : <div className="text-lg font-bold text-navy">{value}</div>}
      </div>
    </div>
  );
}
