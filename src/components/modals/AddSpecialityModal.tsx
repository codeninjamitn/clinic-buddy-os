import { useEffect, useState } from "react";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useClinic } from "@/lib/auth";
import { SpecialityPicker } from "@/components/SpecialityPicker";
import type { Speciality } from "@/types/database";

interface Props { isOpen: boolean; onClose: () => void; onSaved: () => void }

export function AddSpecialityModal({ isOpen, onClose, onSaved }: Props) {
  const { clinic, specialities } = useClinic();
  const [all, setAll] = useState<Speciality[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setSelected([]);
    supabase.from("specialities").select("*").order("sort_order")
      .then(({ data }) => setAll((data as Speciality[]) ?? []));
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  const existingIds = specialities.map((s) => s.speciality_id);

  const save = async () => {
    if (!clinic || selected.length === 0) return;
    setSaving(true);
    const rows = selected.map((id) => ({ clinic_id: clinic.id, speciality_id: id, is_primary: false }));
    const { error } = await supabase.from("clinic_specialities").insert(rows);
    setSaving(false);
    if (error) return toast.error(error.message);
    const names = selected.map((id) => all.find((a) => a.id === id)?.name).filter(Boolean).join(", ");
    toast.success(`${names} added to your clinic.`);
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-xl w-full max-w-[480px] p-6 animate-scale-in max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-navy">Add Speciality</h3>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded"><X className="w-5 h-5" /></button>
        </div>
        <p className="text-xs text-muted-foreground mb-3">Select one or more disciplines to add to your clinic.</p>
        <SpecialityPicker all={all} selected={selected} disabledIds={existingIds} onChange={setSelected} />
        <div className="flex gap-2 pt-5">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-md border border-border text-navy text-sm font-semibold hover:bg-muted">Cancel</button>
          <button onClick={save} disabled={saving || selected.length === 0}
            className="flex-1 py-2.5 rounded-md bg-primary text-white text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 inline-flex items-center justify-center gap-2">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />} Add to Clinic
          </button>
        </div>
      </div>
    </div>
  );
}
