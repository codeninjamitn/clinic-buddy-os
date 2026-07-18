import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { UPPER_TEETH, LOWER_TEETH, TOOTH_CONDITIONS, TOOTH_COLOR, type ToothCondition } from "@/lib/specialities";
import type { AssessmentProps } from "./types";

type ToothState = Record<number, { condition: ToothCondition; note?: string }>;

export function DentalAssessment({ patientId, clinicId, onReady }: AssessmentProps) {
  const [complaint, setComplaint] = useState("");
  const [findings, setFindings] = useState("");
  const [teeth, setTeeth] = useState<ToothState>({});
  const [plan, setPlan] = useState("");
  const [next, setNext] = useState("");
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    onReady(async () => {
      const { error } = await supabase.from("dental_records").insert({
        clinic_id: clinicId, patient_id: patientId,
        chief_complaint: complaint || null,
        clinical_findings: findings || null,
        tooth_data: teeth,
        treatment_plan: plan || null,
        next_visit_notes: next || null,
      });
      return !error;
    });
  }, [complaint, findings, teeth, plan, next, clinicId, patientId, onReady]);

  const setTooth = (n: number, patch: Partial<{ condition: ToothCondition; note: string }>) =>
    setTeeth((t) => ({ ...t, [n]: { condition: t[n]?.condition ?? "Healthy", ...t[n], ...patch } }));

  const Tooth = ({ n }: { n: number }) => {
    const state = teeth[n];
    const fill = state ? TOOTH_COLOR[state.condition] : "#FFFFFF";
    const missing = state?.condition === "Missing";
    return (
      <button type="button" onClick={() => setActive(n === active ? null : n)}
        className="relative w-8 h-10 rounded border text-[10px] font-medium hover:ring-2 hover:ring-primary/40"
        style={{ background: fill, borderColor: "#94A3B8", color: "#0A2535", textDecoration: missing ? "line-through" : "none" }}>
        {n}
      </button>
    );
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1.5">Chief Complaint</label>
        <input value={complaint} onChange={(e) => setComplaint(e.target.value)}
          placeholder="e.g. Toothache upper right" className="w-full px-3 py-2 text-sm rounded-md border border-border" />
      </div>
      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1.5">Clinical Findings</label>
        <textarea value={findings} onChange={(e) => setFindings(e.target.value)} rows={2}
          className="w-full px-3 py-2 text-sm rounded-md border border-border resize-none" />
      </div>

      <div className="border border-border rounded-md p-3 bg-muted/30">
        <div className="text-[11px] font-semibold text-muted-foreground uppercase mb-2">Tooth Chart</div>
        <div className="space-y-2">
          <div className="flex gap-0.5 justify-center flex-wrap">{UPPER_TEETH.map((n) => <Tooth key={n} n={n} />)}</div>
          <div className="border-t border-dashed border-border" />
          <div className="flex gap-0.5 justify-center flex-wrap">{LOWER_TEETH.map((n) => <Tooth key={n} n={n} />)}</div>
        </div>

        {active !== null && (
          <div className="mt-3 p-3 bg-white rounded-md border border-border">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-semibold text-navy">Tooth #{active}</div>
              <button type="button" onClick={() => setActive(null)} className="text-xs text-muted-foreground hover:text-navy">Close</button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <select value={teeth[active]?.condition ?? "Healthy"}
                onChange={(e) => setTooth(active, { condition: e.target.value as ToothCondition })}
                className="px-2.5 py-1.5 text-sm rounded-md border border-border bg-white">
                {TOOTH_CONDITIONS.map((c) => <option key={c}>{c}</option>)}
              </select>
              <input value={teeth[active]?.note ?? ""} onChange={(e) => setTooth(active, { note: e.target.value })}
                placeholder="Notes" className="px-2.5 py-1.5 text-sm rounded-md border border-border" />
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2 mt-3">
          {TOOTH_CONDITIONS.map((c) => (
            <div key={c} className="inline-flex items-center gap-1 text-[10px] text-navy/70">
              <span className="w-3 h-3 rounded" style={{ background: TOOTH_COLOR[c], border: "1px solid #94A3B8" }} /> {c}
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1.5">Treatment Plan</label>
        <textarea value={plan} onChange={(e) => setPlan(e.target.value)} rows={2}
          placeholder="Planned procedures and sequence..."
          className="w-full px-3 py-2 text-sm rounded-md border border-border resize-none" />
      </div>
      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1.5">Next Visit</label>
        <input value={next} onChange={(e) => setNext(e.target.value)}
          placeholder="e.g. Scaling in 3 months"
          className="w-full px-3 py-2 text-sm rounded-md border border-border" />
      </div>
    </div>
  );
}
