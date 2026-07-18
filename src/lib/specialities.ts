// Shared speciality metadata + appointment type map.
export type SpecialitySlug =
  | "general" | "dental" | "physio" | "pediatrics"
  | "maternity" | "ophthalmology" | "cardiology" | "dermatology";

export const APPOINTMENT_TYPES: Record<SpecialitySlug, string[]> = {
  general:       ["General Checkup", "Follow-up", "Procedure", "Emergency"],
  dental:        ["Dental Checkup", "Scaling & Polishing", "Filling", "Extraction", "Root Canal", "Crown & Bridge", "Orthodontic Consult", "Dental X-Ray"],
  physio:        ["Initial Assessment", "Physiotherapy Session", "Review", "Discharge Assessment"],
  pediatrics:    ["Well-Baby Visit", "Vaccination", "Sick Visit", "Growth Review", "Developmental Assessment"],
  maternity:     ["Antenatal Visit", "Ultrasound", "Postnatal Visit", "Emergency OB"],
  ophthalmology: ["Eye Checkup", "Refraction", "Glaucoma Review", "Post-op Review"],
  cardiology:    ["Cardiac Consultation", "ECG", "BP Review", "Stress Test"],
  dermatology:   ["Skin Consultation", "Procedure", "Follow-up", "Biopsy Review"],
};

// Static fallback icon/color (kept in sync with `specialities` table seed).
export const SPECIALITY_META: Record<SpecialitySlug, { name: string; icon: string; color: string }> = {
  general:       { name: "General Medicine",  icon: "🩺",  color: "#028090" },
  dental:        { name: "Dental",             icon: "🦷", color: "#E05C5C" },
  physio:        { name: "Physiotherapy",      icon: "🦴", color: "#854F0B" },
  pediatrics:    { name: "Pediatrics",         icon: "👶", color: "#185FA5" },
  maternity:     { name: "Maternity",          icon: "🤰", color: "#7B3FA0" },
  ophthalmology: { name: "Ophthalmology",      icon: "👁️", color: "#0F6E56" },
  cardiology:    { name: "Cardiology",         icon: "🫀", color: "#C0392B" },
  dermatology:   { name: "Dermatology",        icon: "🩹", color: "#6D4C41" },
};

/** Look up a speciality slug from an appointment type string. */
export function slugForApptType(type: string | null | undefined): SpecialitySlug | null {
  if (!type) return null;
  for (const slug of Object.keys(APPOINTMENT_TYPES) as SpecialitySlug[]) {
    if (APPOINTMENT_TYPES[slug].includes(type)) return slug;
  }
  return null;
}

// Odontogram tooth numbers (FDI).
export const UPPER_TEETH = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
export const LOWER_TEETH = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

export const TOOTH_CONDITIONS = [
  "Healthy", "Cavity", "Filled", "Missing", "Crown",
  "RCT needed", "Extraction needed", "Bridge", "Implant", "Fractured",
] as const;
export type ToothCondition = typeof TOOTH_CONDITIONS[number];

export const TOOTH_COLOR: Record<ToothCondition, string> = {
  "Healthy": "#FFFFFF",
  "Cavity": "#FCA5A5",
  "Filled": "#93C5FD",
  "Missing": "#D1D5DB",
  "Crown": "#FCD34D",
  "RCT needed": "#FB923C",
  "Extraction needed": "#991B1B",
  "Bridge": "#C4B5FD",
  "Implant": "#5EEAD4",
  "Fractured": "#F59E0B",
};

// Physio ROM presets per body region.
export const ROM_PRESETS: Record<string, string[]> = {
  Cervical:  ["Flexion", "Extension", "Left Rotation", "Right Rotation"],
  Lumbar:    ["Flexion", "Extension", "Side Bend L", "Side Bend R"],
  Shoulder:  ["Flexion", "Abduction", "Internal Rotation", "External Rotation"],
  Elbow:     ["Flexion", "Extension", "Pronation", "Supination"],
  Wrist:     ["Flexion", "Extension", "Radial Deviation", "Ulnar Deviation"],
  Hip:       ["Flexion", "Extension", "Abduction", "Adduction"],
  Knee:      ["Flexion", "Extension", "Internal Rotation", "External Rotation"],
  Ankle:     ["Dorsiflexion", "Plantarflexion", "Inversion", "Eversion"],
  "Full Body": ["General Mobility", "Balance", "Endurance", "Strength"],
};

export const EXERCISE_PRESETS: Record<string, { name: string; sets: string; reps: string; frequency: string; instructions: string }[]> = {
  Cervical: [
    { name: "Chin Tucks", sets: "3", reps: "10", frequency: "2x/day", instructions: "Slow, controlled" },
    { name: "Neck Rotation", sets: "2", reps: "10", frequency: "2x/day", instructions: "Each side" },
  ],
  Lumbar: [
    { name: "Cat-Cow Stretch", sets: "3", reps: "10", frequency: "1x/day", instructions: "Move slowly" },
    { name: "Bird-Dog", sets: "3", reps: "8", frequency: "1x/day", instructions: "Hold 5 sec" },
  ],
  Shoulder: [
    { name: "Pendulum Swings", sets: "3", reps: "10", frequency: "2x/day", instructions: "Small circles" },
    { name: "Wall Walks", sets: "2", reps: "10", frequency: "1x/day", instructions: "Both arms" },
  ],
  Knee: [
    { name: "Quad Sets", sets: "3", reps: "10", frequency: "2x/day", instructions: "Hold 5 sec" },
    { name: "Straight-Leg Raise", sets: "3", reps: "10", frequency: "1x/day", instructions: "Slow" },
  ],
};

export const VACCINATION_LIST = [
  "BCG", "OPV", "Hepatitis B", "DPT", "Hib", "IPV", "MMR",
  "Varicella", "Typhoid", "Hepatitis A", "Pneumococcal", "Rotavirus", "None",
];

export const DERMA_BODY_REGIONS = [
  "Face", "Scalp", "Neck", "Chest", "Back", "Arms", "Hands",
  "Legs", "Feet", "Groin", "Nails", "Generalised",
];

export const LESION_TYPES = [
  "Macule", "Papule", "Plaque", "Vesicle", "Pustule", "Nodule",
  "Ulcer", "Wheal", "Scale", "Crust", "Erosion", "Scar",
];

export const VA_OPTIONS = ["6/6", "6/9", "6/12", "6/18", "6/24", "6/36", "6/60", "CF", "HM", "PL", "NPL"];
