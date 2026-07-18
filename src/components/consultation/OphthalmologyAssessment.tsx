import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { AssessmentProps } from "./types";

export function OphthalmologyAssessment({ patientId, clinicId, onReady }: AssessmentProps) {
  const [f, setF] = useState({
    va_right: "", va_left: "", iop_right: "", iop_left: "",
    sph_right: "", cyl_right: "", axis_right: "", add_right: "",
    sph_left: "", cyl_left: "", axis_left: "", add_left: "",
    clinical_notes: "",
  });
  const upd = (k: keyof typeof f, v: string) => setF((s) => ({ ...s, [k]: v }));

  useEffect(() => {
    onReady(async () => {
      const num = (v: string) => (v ? Number(v) : null);
      const { error } = await supabase.from("ophthal_records").insert({
        clinic_id: clinicId, patient_id: patientId,
        va_right: f.va_right || null, va_left: f.va_left || null,
        iop_right: num(f.iop_right), iop_left: num(f.iop_left),
        sph_right: num(f.sph_right), cyl_right: num(f.cyl_right), axis_right: num(f.axis_right) as number | null, add_right: num(f.add_right),
        sph_left: num(f.sph_left), cyl_left: num(f.cyl_left), axis_left: num(f.axis_left) as number | null, add_left: num(f.add_left),
        clinical_notes: f.clinical_notes || null,
      });
      return !error;
    });
  }, [f, clinicId, patientId, onReady]);

  const Eye = ({ side, prefix }: { side: string; prefix: "right" | "left" }) => (
    <div className="border border-border rounded-md p-3">
      <div className="text-xs font-semibold text-navy mb-2">{side} Eye</div>
      <div className="grid grid-cols-2 gap-2 mb-2">
        <div><label className="block text-[10px] text-muted-foreground mb-1">VA</label>
          <input value={f[`va_${prefix}` as keyof typeof f]} onChange={(e) => upd(`va_${prefix}` as keyof typeof f, e.target.value)}
            placeholder="6/6" className="w-full px-2 py-1.5 text-sm rounded border border-border" /></div>
        <div><label className="block text-[10px] text-muted-foreground mb-1">IOP</label>
          <input type="number" step="0.1" value={f[`iop_${prefix}` as keyof typeof f]} onChange={(e) => upd(`iop_${prefix}` as keyof typeof f, e.target.value)}
            className="w-full px-2 py-1.5 text-sm rounded border border-border" /></div>
      </div>
      <div className="grid grid-cols-4 gap-1.5">
        {(["sph", "cyl", "axis", "add"] as const).map((k) => (
          <div key={k}>
            <label className="block text-[10px] text-muted-foreground mb-1 uppercase">{k}</label>
            <input type="number" step="0.25" value={f[`${k}_${prefix}` as keyof typeof f]}
              onChange={(e) => upd(`${k}_${prefix}` as keyof typeof f, e.target.value)}
              className="w-full px-1.5 py-1.5 text-xs rounded border border-border" />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Eye side="Right" prefix="right" />
        <Eye side="Left" prefix="left" />
      </div>
      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1.5">Clinical Notes</label>
        <textarea value={f.clinical_notes} onChange={(e) => upd("clinical_notes", e.target.value)} rows={2}
          className="w-full px-3 py-2 text-sm rounded-md border border-border resize-none" />
      </div>
    </div>
  );
}
