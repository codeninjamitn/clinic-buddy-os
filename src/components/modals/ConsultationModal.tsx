import { useEffect, useRef, useState } from "react";
import { X, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useClinic, isoDate } from "@/lib/auth";
import { useRole } from "@/context/RoleContext";
import { DentalAssessment } from "@/components/consultation/DentalAssessment";
import { PhysioAssessment } from "@/components/consultation/PhysioAssessment";
import { PediatricsAssessment } from "@/components/consultation/PediatricsAssessment";
import { MaternityAssessment } from "@/components/consultation/MaternityAssessment";
import { OphthalmologyAssessment } from "@/components/consultation/OphthalmologyAssessment";
import { CardiologyAssessment } from "@/components/consultation/CardiologyAssessment";
import { DermatologyAssessment } from "@/components/consultation/DermatologyAssessment";
import { SPECIALITY_META, type SpecialitySlug } from "@/lib/specialities";

interface Medicine { name: string; dose: string; frequency: string; days: string }
interface Props {
  isOpen: boolean; onClose: () => void; onSuccess?: () => void;
  patientId: string | null; patientName: string | null;
}
const blankMed = (): Medicine => ({ name: "", dose: "", frequency: "1-0-1", days: "5" });

const ASSESSMENTS: Partial<Record<SpecialitySlug, React.ComponentType<{
  patientId: string; clinicId: string; onReady: (save: () => Promise<boolean>) => void;
}>>> = {
  dental: DentalAssessment,
  physio: PhysioAssessment,
  pediatrics: PediatricsAssessment,
  maternity: MaternityAssessment,
  ophthalmology: OphthalmologyAssessment,
  cardiology: CardiologyAssessment,
  dermatology: DermatologyAssessment,
};

export function ConsultationModal({ isOpen, onClose, onSuccess, patientId, patientName }: Props) {
  const { clinic, specialities, primarySpeciality } = useClinic();
  const { staffId } = useRole();
  const [diagnosis, setDiagnosis] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [meds, setMeds] = useState<Medicine[]>([blankMed()]);
  const [notes, setNotes] = useState("");
  const [followUp, setFollowUp] = useState("");
  const [saving, setSaving] = useState(false);
  // Selected clinical-assessment tab (defaults to clinic's primary speciality).
  const [tab, setTab] = useState<SpecialitySlug | "none">("none");
  const assessSave = useRef<null | (() => Promise<boolean>)>(null);

  useEffect(() => {
    if (!isOpen) return;
    setDiagnosis(""); setSymptoms(""); setMeds([blankMed()]); setNotes(""); setFollowUp("");
    const primary = (primarySpeciality?.slug as SpecialitySlug | undefined) ?? "none";
    setTab(primary in ASSESSMENTS ? primary : "none");
    assessSave.current = null;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose, primarySpeciality]);

  if (!isOpen || !patientId) return null;

  const updateMed = (i: number, patch: Partial<Medicine>) =>
    setMeds((m) => m.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));

  const clinicSlugs = specialities
    .map((s) => s.specialities?.slug as SpecialitySlug | undefined)
    .filter((s): s is SpecialitySlug => !!s && s in ASSESSMENTS);

  const AssessmentComp = tab !== "none" ? ASSESSMENTS[tab] : null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!diagnosis.trim()) { toast.error("Diagnosis is required"); return; }
    setSaving(true);
    const cleanMeds = meds.filter((m) => m.name.trim());
    const { error } = await supabase.from("prescriptions").insert({
      clinic_id: clinic?.id, patient_id: patientId, doctor_id: staffId,
      diagnosis, symptoms: symptoms.trim() || null, medicines: cleanMeds as unknown as never,
      notes: notes || null, follow_up_date: followUp || null,
    } as never);
    if (error) { setSaving(false); toast.error(error.message); return; }
    // Persist the speciality-specific assessment record when a tab has one.
    if (assessSave.current) {
      const ok = await assessSave.current();
      if (!ok) {
        setSaving(false);
        toast.error("Prescription saved, but the clinical assessment could not be saved. Please retry or copy your notes before closing.");
        return;
      }
    }
    setSaving(false);
    toast.success(`Consultation saved for ${patientName ?? "patient"}`);
    onSuccess?.();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <form onSubmit={submit} className="bg-white rounded-xl w-full max-w-3xl p-6 animate-scale-in max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-navy">Consultation</h3>
            <p className="text-xs text-muted-foreground">{patientName}</p>
          </div>
          <button type="button" onClick={onClose} className="p-1 hover:bg-muted rounded"><X className="w-5 h-5" /></button>
        </div>

        {clinicSlugs.length > 0 && (
          <div className="flex gap-1 border-b border-border mb-4 overflow-x-auto">
            {clinicSlugs.map((slug) => {
              const meta = SPECIALITY_META[slug];
              const active = tab === slug;
              return (
                <button key={slug} type="button" onClick={() => { setTab(slug); assessSave.current = null; }}
                  className={`px-3 py-2 text-xs font-semibold whitespace-nowrap border-b-2 -mb-px transition-colors ${active ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-navy"}`}>
                  <span className="mr-1">{meta.icon}</span>{meta.name}
                </button>
              );
            })}
            <button type="button" onClick={() => { setTab("none"); assessSave.current = null; }}
              className={`px-3 py-2 text-xs font-semibold border-b-2 -mb-px transition-colors ${tab === "none" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-navy"}`}>
              None
            </button>
          </div>
        )}

        {AssessmentComp && clinic && (
          <div className="mb-4 p-4 bg-muted/30 rounded-md border border-border">
            <div className="text-[11px] font-semibold text-navy uppercase mb-3">Clinical Assessment</div>
            <AssessmentComp key={tab} patientId={patientId} clinicId={clinic.id} onReady={(fn) => { assessSave.current = fn; }} />
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Symptoms (as reported by patient)</label>
            <textarea value={symptoms} onChange={(e) => setSymptoms(e.target.value)} rows={2}
              placeholder="e.g. Sore throat for 3 days, mild fever, difficulty swallowing" className="w-full px-3 py-2 text-sm rounded-md border border-border resize-none" />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Diagnosis</label>
            <textarea value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} rows={2}
              placeholder="e.g. Acute pharyngitis" className="w-full px-3 py-2 text-sm rounded-md border border-border resize-none" />
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
                  <input value={m.name} onChange={(e) => updateMed(i, { name: e.target.value })} placeholder="Medicine name" className="px-2.5 py-2 text-sm rounded-md border border-border" />
                  <input value={m.dose} onChange={(e) => updateMed(i, { dose: e.target.value })} placeholder="500mg" className="px-2.5 py-2 text-sm rounded-md border border-border" />
                  <input value={m.frequency} onChange={(e) => updateMed(i, { frequency: e.target.value })} placeholder="1-0-1" className="px-2.5 py-2 text-sm rounded-md border border-border" />
                  <input value={m.days} onChange={(e) => updateMed(i, { days: e.target.value })} placeholder="5d" className="px-2.5 py-2 text-sm rounded-md border border-border" />
                  <button type="button" onClick={() => setMeds((arr) => arr.filter((_, idx) => idx !== i))} className="text-muted-foreground hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
              className="w-full px-3 py-2 text-sm rounded-md border border-border resize-none" placeholder="Additional instructions..." />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Follow-up date</label>
            <input type="date" value={followUp} min={isoDate(new Date())} onChange={(e) => setFollowUp(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-md border border-border bg-white" />
          </div>

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-md border border-border text-navy text-sm font-semibold hover:bg-muted">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-md bg-primary text-white text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 inline-flex items-center justify-center gap-2">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />} Save Consultation
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
