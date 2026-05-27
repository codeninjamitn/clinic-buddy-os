import { useEffect, useRef, useState } from "react";
import { X, FileText, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useClinic } from "@/lib/auth";
import type { Patient } from "@/types/database";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (info: { patientName: string }) => void;
  initialFile?: File | null;
}

export function UploadLabReportModal({ isOpen, onClose, onSuccess, initialFile }: Props) {
  const { clinic } = useClinic();
  const clinicId = clinic?.id;
  const fileRef = useRef<HTMLInputElement>(null);

  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientId, setPatientId] = useState("");
  const [testName, setTestName] = useState("");
  const [labName, setLabName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setPatientId(""); setTestName(""); setLabName("");
    setFile(initialFile ?? null);
  }, [isOpen, initialFile]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || !clinicId) return;
    supabase.from("patients").select("*").eq("clinic_id", clinicId).order("name")
      .then(({ data }) => setPatients((data as Patient[]) ?? []));
  }, [isOpen, clinicId]);

  const submit = async () => {
    if (!clinicId) return;
    if (!file) { toast.error("Please choose a file to upload"); return; }
    if (!patientId) { toast.error("Select a patient"); return; }
    if (!testName.trim()) { toast.error("Test name is required"); return; }
    setSaving(true);
    try {
      const path = `${clinicId}/${patientId}/${Date.now()}-${file.name}`;
      const { error: upErr } = await supabase.storage.from("lab-reports").upload(path, file);
      if (upErr) throw upErr;
      const { error } = await supabase.from("lab_reports").insert({
        clinic_id: clinicId, patient_id: patientId, test_name: testName,
        lab_name: labName || null, test_date: new Date().toISOString().slice(0, 10),
        file_url: path, status: "Delivered",
        delivered_whatsapp: true, delivered_email: true,
      });
      if (error) throw error;
      const patientName = patients.find(p => p.id === patientId)?.name ?? "patient";
      toast.success(`Lab report for ${patientName} uploaded and sent`);
      onSuccess?.({ patientName });
    } catch (e: any) {
      toast.error(e.message ?? "Upload failed");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-xl w-full max-w-md p-6 animate-scale-in max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-navy">Upload Lab Report</h3>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-3">
          {file ? (
            <div className="text-xs text-muted-foreground bg-muted/40 px-3 py-2 rounded-md flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="flex-1 truncate">{file.name} ({(file.size / 1024).toFixed(0)} KB)</span>
              <button onClick={() => setFile(null)} className="text-xs text-primary font-semibold hover:underline">Change</button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full border-2 border-dashed border-primary/40 rounded-md p-5 flex flex-col items-center gap-1.5 text-sm text-muted-foreground hover:bg-[#E1F5EE]/40"
            >
              <Upload className="w-6 h-6 text-primary" />
              <span className="font-semibold text-navy">Choose PDF or image</span>
              <span className="text-xs">PDF, JPG, PNG up to 10 MB</span>
            </button>
          )}
          <input ref={fileRef} type="file" accept=".pdf,image/*" className="hidden" onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])} />
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Patient</label>
            <select value={patientId} onChange={(e) => setPatientId(e.target.value)} className="w-full px-3 py-2 text-sm rounded-md border border-border bg-white">
              <option value="">Select patient...</option>
              {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Test Name</label>
            <input value={testName} onChange={(e) => setTestName(e.target.value)} placeholder="e.g. HbA1c" className="w-full px-3 py-2 text-sm rounded-md border border-border" />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Lab Name</label>
            <input value={labName} onChange={(e) => setLabName(e.target.value)} placeholder="e.g. Thyrocare" className="w-full px-3 py-2 text-sm rounded-md border border-border" />
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-md border border-border text-navy text-sm font-semibold hover:bg-muted">Cancel</button>
            <button onClick={submit} disabled={saving} className="flex-1 py-2.5 rounded-md bg-primary text-white text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 inline-flex items-center justify-center gap-2">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />} Upload & Deliver
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
