import { useEffect, useState } from "react";
import { X, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useClinic, isoDate } from "@/lib/auth";
import { useRole } from "@/context/RoleContext";

interface Medicine {
  name: string;
  dose: string;
  frequency: string;
  days: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  patientId: string | null;
  patientName: string | null;
}

const blankMed = (): Medicine => ({ name: "", dose: "", frequency: "1-0-1", days: "5" });

export function ConsultationModal({ isOpen, onClose, onSuccess, patientId, patientName }: Props) {
  const { clinic } = useClinic();
  const { staffId } = useRole();
  const [diagnosis, setDiagnosis] = useState("");
  const [meds, setMeds] = useState<Medicine[]>([blankMed()]);
  const [notes, setNotes] = useState("");
  const [followUp, setFollowUp] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setDiagnosis(""); setMeds([blankMed()]); setNotes(""); setFollowUp("");
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen || !patientId) return null;

  const updateMed = (i: number, patch: Partial<Medicine>) =>
    setMeds((m) => m.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!diagnosis.trim()) { toast.error("Diagnosis is required"); return; }
    const cleanMeds = meds.filter((m) => m.name.trim());
    setSaving(true);
    const { error } = await supabase.from("prescriptions").insert({
      clinic_id: clinic?.id,
      patient_id: patientId,
      doctor_id: staffId,
      diagnosis,
      medicines: cleanMeds,
      notes: notes || null,
      follow_up_date: followUp || null,
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(`Prescription saved for ${patientName ?? "patient"}`);
    onSuccess?.();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <form onSubmit={submit} className="bg-white rounded-xl w-full max-w-2xl p-6 animate-scale-in max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-navy">Consultation</h3>
            <p className="text-xs text-muted-foreground">{patientName}</p>
          </div>
          <button type="button" onClick={onClose} className="p-1 hover:bg-muted rounded"><X className="w-5 h-5" /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Diagnosis</label>
            <textarea value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} rows={2}
              placeholder="e.g. Acute pharyngitis"
              className="w-full px-3 py-2 text-sm rounded-md border border-border resize-none" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-medium text-muted-foreground">Medicines</label>
              <button type="button" onClick={() => setMeds((m) => [...m, blankMed()])}
                className="text-xs font-semibold text-primary inline-flex items-center gap-1 hover:underline">
                <Plus className="w-3.5 h-3.5" /> Add medicine
              </button>
            </div>
            <div className="space-y-2">
              {meds.map((m, i) => (
                <div key={i} className="grid grid-cols-[1fr_80px_90px_60px_28px] gap-2 items-center">
                  <input value={m.name} onChange={(e) => updateMed(i, { name: e.target.value })}
                    placeholder="Medicine name" className="px-2.5 py-2 text-sm rounded-md border border-border" />
                  <input value={m.dose} onChange={(e) => updateMed(i, { dose: e.target.value })}
                    placeholder="500mg" className="px-2.5 py-2 text-sm rounded-md border border-border" />
                  <input value={m.frequency} onChange={(e) => updateMed(i, { frequency: e.target.value })}
                    placeholder="1-0-1" className="px-2.5 py-2 text-sm rounded-md border border-border" />
                  <input value={m.days} onChange={(e) => updateMed(i, { days: e.target.value })}
                    placeholder="5d" className="px-2.5 py-2 text-sm rounded-md border border-border" />
                  <button type="button" onClick={() => setMeds((arr) => arr.filter((_, idx) => idx !== i))}
                    className="text-muted-foreground hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
              className="w-full px-3 py-2 text-sm rounded-md border border-border resize-none"
              placeholder="Additional instructions..." />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Follow-up date</label>
            <input type="date" value={followUp} min={isoDate(new Date())}
              onChange={(e) => setFollowUp(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-md border border-border bg-white" />
          </div>

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-md border border-border text-navy text-sm font-semibold hover:bg-muted">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-md bg-primary text-white text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 inline-flex items-center justify-center gap-2">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />} Save Prescription
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
