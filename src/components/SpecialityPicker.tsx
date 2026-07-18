import { Check, Star } from "lucide-react";
import type { Speciality } from "@/types/database";

interface Props {
  all: Speciality[];
  selected: string[];              // array of speciality IDs (order = selection order; first = primary)
  disabledIds?: string[];
  onChange: (ids: string[]) => void;
  dark?: boolean;                  // super-admin dark theme
}

/**
 * Card-grid picker. First-selected ID is the primary. Clicking a selected
 * card deselects it unless it would leave 0 selections.
 */
export function SpecialityPicker({ all, selected, disabledIds = [], onChange, dark }: Props) {
  const sorted = [...all].sort((a, b) => a.sort_order - b.sort_order);
  const toggle = (id: string) => {
    if (disabledIds.includes(id)) return;
    if (selected.includes(id)) {
      if (selected.length === 1) return;
      onChange(selected.filter((s) => s !== id));
    } else {
      onChange([...selected, id]);
    }
  };
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {sorted.map((s) => {
        const isSel = selected.includes(s.id);
        const isPrimary = isSel && selected[0] === s.id;
        const isDisabled = disabledIds.includes(s.id);
        const base = dark
          ? { background: "#0A2535", border: "1px solid #1A4055", color: "#FFFFFF" }
          : { background: "#FFFFFF", border: "1px solid #E0EFF2", color: "#0A2535" };
        const selStyle = isSel
          ? { borderLeft: `4px solid ${s.color}`, background: dark ? "#0F3346" : `${s.color}0F` }
          : {};
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => toggle(s.id)}
            disabled={isDisabled}
            className={`relative text-left rounded-lg p-3 transition-all ${isDisabled ? "opacity-40 cursor-not-allowed" : "hover:shadow-sm"}`}
            style={{ ...base, ...selStyle }}
          >
            {isSel && (
              <div className="absolute top-2 right-2">
                {isPrimary ? (
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "#02C39A", color: "#0A2535" }}>
                    <Star className="w-2.5 h-2.5" /> PRIMARY
                  </span>
                ) : (
                  <span className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: s.color }}>
                    <Check className="w-3 h-3 text-white" />
                  </span>
                )}
              </div>
            )}
            {isDisabled && (
              <span className="absolute top-2 right-2 text-[9px] font-semibold px-1.5 py-0.5 rounded" style={{ background: dark ? "#1A4055" : "#E0EFF2", color: dark ? "#7FBBC5" : "#0A2535" }}>Already added</span>
            )}
            <div className="text-[28px] leading-none">{s.icon}</div>
            <div className="mt-2 font-semibold text-[13px]">{s.name}</div>
            {s.description && <div className="text-[11px] mt-1 leading-snug opacity-70">{s.description}</div>}
          </button>
        );
      })}
    </div>
  );
}
