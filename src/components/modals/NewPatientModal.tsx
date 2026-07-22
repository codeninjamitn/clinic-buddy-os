import { useEffect, useState } from "react";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useClinic } from "@/lib/auth";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function NewPatientModal({ isOpen, onClose, onSuccess }: Props) {
  const { clinic } = useClinic();
  const clinicId = clinic?.id;

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<"Male" | "Female" | "Other">("Male");
  const [bloodGroup, setBloodGroup] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [allergies, setAllergies] = useState("");
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setName(""); setPhone(""); setAge(""); setGender("Male"); setBloodGroup("");
    setEmail(""); setAddress(""); setAllergies(""); setEmergencyName(""); setEmergencyPhone("");
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  const submit = async () => {
    if (!clinicId) return;
    if (!name.trim() || !phone.trim()) { toast.error("Name and phone are required"); return; }
    setSaving(true);
    const ageNum = age.trim() ? parseInt(age, 10) : NaN;
    const dobFromAge =
      !isNaN(ageNum) && ageNum >= 0 && ageNum <= 130
        ? `${new Date().getFullYear() - ageNum}-01-01`
        : null;
    const { error } = await supabase.from("patients").insert({
      clinic_id: clinicId, name, phone,
      dob: dobFromAge, gender, blood_group: bloodGroup || null,
      email: email || null, address: address || null,
      known_allergies: allergies || null,
      emergency_contact_name: emergencyName || null,
      emergency_contact_phone: emergencyPhone || null,
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(`Patient ${name} registered successfully`);
    onSuccess?.();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-xl w-full max-w-lg p-6 animate-scale-in max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-navy">Add Patient</h3>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded"><X className="w-5 h-5" /></button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Name *" value={name} onChange={setName} className="col-span-2" />
          <Field label="Phone *" value={phone} onChange={setPhone} placeholder="+91 ..." />
          <Field label="Age" type="number" value={age} onChange={setAge} placeholder="e.g. 32" />
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Gender</label>
            <select value={gender} onChange={(e) => setGender(e.target.value as any)} className="w-full px-3 py-2 text-sm rounded-md border border-border bg-white">
              <option>Male</option><option>Female</option><option>Other</option>
            </select>
          </div>
          <Field label="Blood group" value={bloodGroup} onChange={setBloodGroup} placeholder="O+" />
          <Field label="Email" value={email} onChange={setEmail} className="col-span-2" />
          <Field label="Address" value={address} onChange={setAddress} className="col-span-2" />
          <Field label="Known allergies" value={allergies} onChange={setAllergies} className="col-span-2" />
          <Field label="Emergency contact name" value={emergencyName} onChange={setEmergencyName} />
          <Field label="Emergency phone" value={emergencyPhone} onChange={setEmergencyPhone} />
        </div>
        <div className="flex gap-2 mt-5">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-md border border-border text-navy text-sm font-semibold hover:bg-muted">Cancel</button>
          <button
            onClick={submit}
            disabled={saving}
            className="flex-1 py-2.5 rounded-md bg-primary text-white text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 inline-flex items-center justify-center gap-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />} Save Patient
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", placeholder, className = "" }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-xs font-medium text-muted-foreground mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 text-sm rounded-md border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
    </div>
  );
}
