import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { VACCINE_SCHEDULE } from "@/lib/specialities";
import type { AssessmentProps } from "./types";

export function PediatricsAssessment({ patientId, clinicId, onReady }: AssessmentProps) {
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [hc, setHc] = useState("");
  const [temp, setTemp] = useState("");
  const [milestones, setMilestones] = useState("");
  const [vaccine, setVaccine] = useState("");
  const [nextDate, setNextDate] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    onReady(async () => {
      const { error } = await supabase.from("pediatric_records").insert({
        clinic_id: clinicId, patient_id: patientId,
        weight_kg: weight ? Number(weight) : null,
        height_cm: height ? Number(height) : null,
        head_circumference_cm: hc ? Number(hc) : null,
        temperature_c: temp ? Number(temp) : null,
        milestones_notes: milestones || null,
        vaccine_administered: vaccine || null,
        next_vaccine_due: nextDate || null,
        session_notes: notes || null,
      });
      return !error;
    });
  }, [weight, height, hc, temp, milestones, vaccine, nextDate, notes, clinicId, patientId, onReady]);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-2">
        <div>
          <label className="block text-[10px] font-medium text-muted-foreground mb-1">Weight (kg)</label>
          <input value={weight} onChange={(e) => setWeight(e.target.value)} type="number" step="0.1"
            className="w-full px-2 py-1.5 text-sm rounded-md border border-border" />
        </div>
        <div>
          <label className="block text-[10px] font-medium text-muted-foreground mb-1">Height (cm)</label>
          <input value={height} onChange={(e) => setHeight(e.target.value)} type="number" step="0.1"
            className="w-full px-2 py-1.5 text-sm rounded-md border border-border" />
        </div>
        <div>
          <label className="block text-[10px] font-medium text-muted-foreground mb-1">Head (cm)</label>
          <input value={hc} onChange={(e) => setHc(e.target.value)} type="number" step="0.1"
            className="w-full px-2 py-1.5 text-sm rounded-md border border-border" />
        </div>
        <div>
          <label className="block text-[10px] font-medium text-muted-foreground mb-1">Temp (°C)</label>
          <input value={temp} onChange={(e) => setTemp(e.target.value)} type="number" step="0.1"
            className="w-full px-2 py-1.5 text-sm rounded-md border border-border" />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1.5">Developmental Milestones</label>
        <textarea value={milestones} onChange={(e) => setMilestones(e.target.value)} rows={2}
          placeholder="e.g. Sits without support, babbles..."
          className="w-full px-3 py-2 text-sm rounded-md border border-border resize-none" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Vaccine Administered</label>
          <select value={vaccine} onChange={(e) => setVaccine(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-md border border-border bg-white">
            <option value="">None</option>
            {VACCINE_SCHEDULE.map((v) => <option key={v.name}>{v.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Next Vaccine Due</label>
          <input type="date" value={nextDate} onChange={(e) => setNextDate(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-md border border-border bg-white" />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1.5">Session Notes</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
          className="w-full px-3 py-2 text-sm rounded-md border border-border resize-none" />
      </div>
    </div>
  );
}
