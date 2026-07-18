import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ROM_PRESETS, EXERCISE_PRESETS } from "@/lib/specialities";
import type { AssessmentProps } from "./types";

type Exercise = { name: string; sets: string; reps: string; frequency: string; instructions: string };

const REGIONS = ["Cervical", "Lumbar", "Shoulder", "Elbow", "Wrist", "Hip", "Knee", "Ankle", "Full Body"];

export function PhysioAssessment({ patientId, clinicId, onReady }: AssessmentProps) {
  const [region, setRegion] = useState("Lumbar");
  const [sessionN, setSessionN] = useState(1);
  const [pain, setPain] = useState(3);
  const [rom, setRom] = useState<Record<string, string>>({});
  const [exs, setExs] = useState<Exercise[]>(EXERCISE_PRESETS["Lumbar"] ?? []);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    // Auto-increment session number based on existing count.
    supabase.from("physio_records").select("id", { count: "exact", head: true })
      .eq("patient_id", patientId).then(({ count }) => setSessionN((count ?? 0) + 1));
  }, [patientId]);

  useEffect(() => {
    setExs(EXERCISE_PRESETS[region] ?? []);
    setRom({});
  }, [region]);

  useEffect(() => {
    onReady(async () => {
      const { error } = await supabase.from("physio_records").insert({
        clinic_id: clinicId, patient_id: patientId,
        body_region: region, pain_score: pain,
        rom_data: rom, exercise_protocol: exs,
        session_notes: notes || null, session_number: sessionN,
      });
      return !error;
    });
  }, [region, pain, rom, exs, notes, sessionN, clinicId, patientId, onReady]);

  const movements = ROM_PRESETS[region] ?? [];
  const emoji = pain <= 2 ? "😊" : pain <= 5 ? "😐" : pain <= 8 ? "😖" : "😣";

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Body Region</label>
          <select value={region} onChange={(e) => setRegion(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-md border border-border bg-white">
            {REGIONS.map((r) => <option key={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Session #</label>
          <input type="number" min={1} value={sessionN} onChange={(e) => setSessionN(Number(e.target.value) || 1)}
            className="w-full px-3 py-2 text-sm rounded-md border border-border" />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1.5">Pain Score (VAS)</label>
        <div className="flex items-center gap-3">
          <span className="text-xs">😊</span>
          <input type="range" min={0} max={10} value={pain} onChange={(e) => setPain(Number(e.target.value))}
            className="flex-1 accent-primary" />
          <span className="text-xs">😣</span>
          <span className="w-10 h-10 rounded-md bg-primary text-white font-bold text-sm inline-flex items-center justify-center">{pain}</span>
          <span className="text-xs text-muted-foreground w-14">{emoji}</span>
        </div>
      </div>

      {movements.length > 0 && (
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Range of Motion (°)</label>
          <div className="grid grid-cols-2 gap-2">
            {movements.map((m) => (
              <div key={m} className="flex items-center gap-2">
                <span className="text-xs text-navy w-32 truncate">{m}</span>
                <input type="number" value={rom[m] ?? ""} onChange={(e) => setRom((r) => ({ ...r, [m]: e.target.value }))}
                  className="flex-1 px-2 py-1.5 text-sm rounded-md border border-border" placeholder="°" />
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs font-medium text-muted-foreground">Exercise Protocol</label>
          <button type="button" onClick={() => setExs((e) => [...e, { name: "", sets: "3", reps: "10", frequency: "1x/day", instructions: "" }])}
            className="text-xs font-semibold text-primary inline-flex items-center gap-1 hover:underline">
            <Plus className="w-3.5 h-3.5" /> Add Exercise
          </button>
        </div>
        <div className="space-y-2">
          {exs.map((x, i) => (
            <div key={i} className="grid grid-cols-[1fr_50px_50px_80px_1fr_28px] gap-2 items-center">
              <input value={x.name} onChange={(e) => setExs((arr) => arr.map((r, idx) => idx === i ? { ...r, name: e.target.value } : r))}
                placeholder="Exercise" className="px-2 py-1.5 text-xs rounded-md border border-border" />
              <input value={x.sets} onChange={(e) => setExs((arr) => arr.map((r, idx) => idx === i ? { ...r, sets: e.target.value } : r))}
                placeholder="Sets" className="px-2 py-1.5 text-xs rounded-md border border-border" />
              <input value={x.reps} onChange={(e) => setExs((arr) => arr.map((r, idx) => idx === i ? { ...r, reps: e.target.value } : r))}
                placeholder="Reps" className="px-2 py-1.5 text-xs rounded-md border border-border" />
              <input value={x.frequency} onChange={(e) => setExs((arr) => arr.map((r, idx) => idx === i ? { ...r, frequency: e.target.value } : r))}
                placeholder="Freq" className="px-2 py-1.5 text-xs rounded-md border border-border" />
              <input value={x.instructions} onChange={(e) => setExs((arr) => arr.map((r, idx) => idx === i ? { ...r, instructions: e.target.value } : r))}
                placeholder="Instructions" className="px-2 py-1.5 text-xs rounded-md border border-border" />
              <button type="button" onClick={() => setExs((arr) => arr.filter((_, idx) => idx !== i))}
                className="text-muted-foreground hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          ))}
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
