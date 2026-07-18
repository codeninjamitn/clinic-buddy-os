import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { AssessmentProps } from "./types";

const RISK = ["Low", "Moderate", "High", "Very High"] as const;

export function CardiologyAssessment({ patientId, clinicId, onReady }: AssessmentProps) {
  const [bpS, setBpS] = useState("");
  const [bpD, setBpD] = useState("");
  const [hr, setHr] = useState("");
  const [risk, setRisk] = useState<string>("");
  const [chestPain, setChestPain] = useState(false);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    onReady(async () => {
      const { error } = await supabase.from("cardio_records").insert({
        clinic_id: clinicId, patient_id: patientId,
        bp_systolic: bpS ? Number(bpS) : null,
        bp_diastolic: bpD ? Number(bpD) : null,
        heart_rate: hr ? Number(hr) : null,
        cardiac_risk_score: risk || null,
        chest_pain: chestPain,
        clinical_notes: notes || null,
      });
      return !error;
    });
  }, [bpS, bpD, hr, risk, chestPain, notes, clinicId, patientId, onReady]);

  const bpN = Number(bpS), bpDN = Number(bpD);
  const bpTag = bpN >= 140 || bpDN >= 90 ? { l: "Hypertensive", c: "#DC2626" }
    : bpN >= 130 ? { l: "Elevated", c: "#F59E0B" }
    : bpN > 0 ? { l: "Normal", c: "#10B981" } : null;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="block text-[10px] font-medium text-muted-foreground mb-1">BP Systolic</label>
          <input type="number" value={bpS} onChange={(e) => setBpS(e.target.value)}
            className="w-full px-2 py-1.5 text-sm rounded-md border border-border" />
        </div>
        <div>
          <label className="block text-[10px] font-medium text-muted-foreground mb-1">BP Diastolic</label>
          <input type="number" value={bpD} onChange={(e) => setBpD(e.target.value)}
            className="w-full px-2 py-1.5 text-sm rounded-md border border-border" />
        </div>
        <div>
          <label className="block text-[10px] font-medium text-muted-foreground mb-1">Heart Rate (bpm)</label>
          <input type="number" value={hr} onChange={(e) => setHr(e.target.value)}
            className="w-full px-2 py-1.5 text-sm rounded-md border border-border" />
        </div>
      </div>
      {bpTag && (
        <span className="inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full text-white" style={{ background: bpTag.c }}>
          {bpTag.l}: {bpS}/{bpD}
        </span>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Cardiac Risk Score</label>
          <select value={risk} onChange={(e) => setRisk(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-md border border-border bg-white">
            <option value="">—</option>
            {RISK.map((r) => <option key={r}>{r}</option>)}
          </select>
        </div>
        <div className="flex items-end">
          <label className="inline-flex items-center gap-2 text-xs">
            <input type="checkbox" checked={chestPain} onChange={(e) => setChestPain(e.target.checked)}
              className="w-4 h-4 accent-primary" /> Chest pain reported
          </label>
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1.5">Clinical Notes</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
          className="w-full px-3 py-2 text-sm rounded-md border border-border resize-none" />
      </div>
    </div>
  );
}
