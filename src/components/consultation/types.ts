// Shared prop shape for every speciality assessment form.
// Each form owns its own local state and exposes `getPayload()` via ref.
export interface AssessmentProps {
  patientId: string;
  clinicId: string;
  // Ref API — the ConsultationModal calls save() to persist this speciality's record
  // alongside the prescription. Return true on success, false on validation fail.
  onReady: (save: () => Promise<boolean>) => void;
}
