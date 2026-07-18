import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DERMA_BODY_REGIONS } from "@/lib/specialities";
import type { AssessmentProps } from "./types";

const LESIONS = ["Papule", "Plaque", "Macule", "Vesicle", "Pustule", "Nodule", "Rash", "Cyst", "Ulcer", "Other"];

export function DermatologyAssessment({ patientId, clinicId, onReady }: AssessmentProps) {
  const [regions, setRegions] = useState<string[]>([]);
  const [lesion, setLesion] = useState("");
  const [duration, setDuration] = useState("");
  const [treatment, setTreatment] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    onReady(async () => {
      const { error } = await supabase.from("derma_records").insert({
        clinic_id: clinicId, patient_id: patientId,
        affected_body_regions: regions,
        lesion_type: lesion || null,
        duration: duration || null,
        photo_urls: [],
        treatment_protocol: treatment || null,
        clinical_notes: notes || null,
      });
      return !error;
    });
  }, [regions, lesion, duration, treatment, notes, clinicId, patientId, onReady]);

  const toggle = (r: string) => setRegions((rs) => rs.includes(r) ? rs.filter((x) => x !== r) : [...rs, r]);

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1.5">Affected Body Regions</label>
        <div className="flex flex-wrap gap-1.5">
          {DERMA_BODY_REGIONS.map((r) => {
            const sel = regions.includes(r);
            return (
              <button key={r} type="button" onClick={() => toggle(r)}
                className={`text-[11px] px-2 py-1 rounded-full border transition-colors ${sel ? "bg-primary text-white border-primary" : "bg-white text-navy border-border hover:bg-muted"}`}>
                {r}
              </button>
            );
          })}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Lesion Type</label>
          <select value={lesion} onChange={(e) => setLesion(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-md border border-border bg-white">
            <option value="">—</option>
            {LESIONS.map((l) => <option key={l}>{l}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Duration</label>
          <input value={duration} onChange={(e) => setDuration(e.target.value)}
            placeholder="e.g. 2 weeks"
            className="w-full px-3 py-2 text-sm rounded-md border border-border" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1.5">Treatment Protocol</label>
        <textarea value={treatment} onChange={(e) => setTreatment(e.target.value)} rows={2}
          placeholder="Topical / Oral medications, procedures..."
          className="w-full px-3 py-2 text-sm rounded-md border border-border resize-none" />
      </div>
      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1.5">Clinical Notes</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
          className="w-full px-3 py-2 text-sm rounded-md border border-border resize-none" />
      </div>
    </div>
  );
}
