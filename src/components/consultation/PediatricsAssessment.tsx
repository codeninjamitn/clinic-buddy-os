import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { VACCINATION_LIST } from "@/lib/specialities";
import type { AssessmentProps } from "./types";

export function PediatricsAssessment({ patientId, clinicId, onReady }: AssessmentProps) {
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [hc, setHc] = useState("");
  const [temp, setTemp] = useState("");
  const [milestones, setMilestones] = useState("");
  const [vaccine, setVaccine] = useState("");
  const [concerns, setConcerns] = useState("");

  useEffect(() => {
    onReady(async () => {
      const { error } = await supabase.from("pediatric_records").insert({
        clinic_id: clinicId, patient_id: patientId,
        weight_kg: weight ? Number(weight) : null,
        height_cm: height ? Number(height) : null,
        head_circumference_cm: hc ? Number(hc) : null,
        temperature_c: temp ? Number(temp) : null,
        milestone_notes: milestones || null,
        vaccination_given: vaccine || null,
        developmental_concerns: concerns || null,
      });
      return !error;
    });
  }, [weight, height, hc, temp, milestones, vaccine, concerns, clinicId, patientId, onReady]);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-2">
        {[
          { l: "Weight (kg)", v: weight, s: setWeight },
          { l: "Height (cm)", v: height, s: setHeight },
          { l: "Head (cm)", v: hc, s: setHc },
          { l: "Temp (°C)", v: temp, s: setTemp },
        ].map((f) => (
          <div key={f.l}>
            <label className="block text-[10px] font-medium text-muted-foreground mb-1">{f.l}</label>
            <input type="number" step="0.1" value={f.v} onChange={(e) => f.s(e.target.value)}
              className="w-full px-2 py-1.5 text-sm rounded-md border border-border" />
          </div>
        ))}
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
            <option value="">Select...</option>
            {VACCINATION_LIST.map((v) => <option key={v}>{v}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Concerns</label>
          <input value={concerns} onChange={(e) => setConcerns(e.target.value)}
            placeholder="Any concerns?"
            className="w-full px-3 py-2 text-sm rounded-md border border-border" />
        </div>
      </div>
    </div>
  );
}

