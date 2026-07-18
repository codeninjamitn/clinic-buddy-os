import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { AssessmentProps } from "./types";

export function MaternityAssessment({ patientId, clinicId, onReady }: AssessmentProps) {
  const [lmp, setLmp] = useState("");
  const [edd, setEdd] = useState("");
  const [gw, setGw] = useState("");
  const [weight, setWeight] = useState("");
  const [bpS, setBpS] = useState("");
  const [bpD, setBpD] = useState("");
  const [fundal, setFundal] = useState("");
  const [fhr, setFhr] = useState("");
  const [presentation, setPresentation] = useState("");
  const [oedema, setOedema] = useState(false);
  const [remarks, setRemarks] = useState("");

  // Auto-calc EDD (LMP + 280 days) and GA (weeks since LMP).
  useEffect(() => {
    if (!lmp) return;
    const d = new Date(lmp);
    const eddD = new Date(d); eddD.setDate(eddD.getDate() + 280);
    setEdd(eddD.toISOString().slice(0, 10));
    const wks = Math.floor((Date.now() - d.getTime()) / (7 * 24 * 3600 * 1000));
    if (wks >= 0 && wks <= 45) setGw(String(wks));
  }, [lmp]);

  useEffect(() => {
    onReady(async () => {
      const { error } = await supabase.from("antenatal_records").insert({
        clinic_id: clinicId, patient_id: patientId,
        lmp: lmp || null, edd: edd || null,
        gestational_weeks: gw ? Number(gw) : null,
        weight_kg: weight ? Number(weight) : null,
        bp_systolic: bpS ? Number(bpS) : null,
        bp_diastolic: bpD ? Number(bpD) : null,
        fundal_height_cm: fundal ? Number(fundal) : null,
        fetal_heart_rate: fhr ? Number(fhr) : null,
        fetal_presentation: presentation || null,
        oedema, remarks: remarks || null,
      });
      return !error;
    });
  }, [lmp, edd, gw, weight, bpS, bpD, fundal, fhr, presentation, oedema, remarks, clinicId, patientId, onReady]);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="block text-[10px] font-medium text-muted-foreground mb-1">LMP</label>
          <input type="date" value={lmp} onChange={(e) => setLmp(e.target.value)}
            className="w-full px-2 py-1.5 text-sm rounded-md border border-border bg-white" />
        </div>
        <div>
          <label className="block text-[10px] font-medium text-muted-foreground mb-1">EDD (auto)</label>
          <input type="date" value={edd} onChange={(e) => setEdd(e.target.value)}
            className="w-full px-2 py-1.5 text-sm rounded-md border border-border bg-white" />
        </div>
        <div>
          <label className="block text-[10px] font-medium text-muted-foreground mb-1">GA (weeks)</label>
          <input type="number" value={gw} onChange={(e) => setGw(e.target.value)}
            className="w-full px-2 py-1.5 text-sm rounded-md border border-border" />
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2">
        <div>
          <label className="block text-[10px] font-medium text-muted-foreground mb-1">Weight (kg)</label>
          <input type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)}
            className="w-full px-2 py-1.5 text-sm rounded-md border border-border" />
        </div>
        <div>
          <label className="block text-[10px] font-medium text-muted-foreground mb-1">BP Sys</label>
          <input type="number" value={bpS} onChange={(e) => setBpS(e.target.value)}
            className="w-full px-2 py-1.5 text-sm rounded-md border border-border" />
        </div>
        <div>
          <label className="block text-[10px] font-medium text-muted-foreground mb-1">BP Dia</label>
          <input type="number" value={bpD} onChange={(e) => setBpD(e.target.value)}
            className="w-full px-2 py-1.5 text-sm rounded-md border border-border" />
        </div>
        <div>
          <label className="block text-[10px] font-medium text-muted-foreground mb-1">Fundal (cm)</label>
          <input type="number" step="0.1" value={fundal} onChange={(e) => setFundal(e.target.value)}
            className="w-full px-2 py-1.5 text-sm rounded-md border border-border" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="block text-[10px] font-medium text-muted-foreground mb-1">FHR (bpm)</label>
          <input type="number" value={fhr} onChange={(e) => setFhr(e.target.value)}
            className="w-full px-2 py-1.5 text-sm rounded-md border border-border" />
        </div>
        <div>
          <label className="block text-[10px] font-medium text-muted-foreground mb-1">Presentation</label>
          <select value={presentation} onChange={(e) => setPresentation(e.target.value)}
            className="w-full px-2 py-1.5 text-sm rounded-md border border-border bg-white">
            <option value="">—</option>
            <option>Cephalic</option><option>Breech</option><option>Transverse</option><option>Oblique</option>
          </select>
        </div>
        <div className="flex items-end">
          <label className="inline-flex items-center gap-2 text-xs">
            <input type="checkbox" checked={oedema} onChange={(e) => setOedema(e.target.checked)}
              className="w-4 h-4 accent-primary" /> Oedema present
          </label>
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1.5">Remarks</label>
        <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={2}
          className="w-full px-3 py-2 text-sm rounded-md border border-border resize-none" />
      </div>
    </div>
  );
}
