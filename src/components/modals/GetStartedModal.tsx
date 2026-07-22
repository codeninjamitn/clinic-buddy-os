import { useEffect, useState } from "react";
import { X, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const SPECIALITIES = [
  "General Physician",
  "Dental",
  "Physiotherapy",
  "Pediatrics",
  "Maternity / Gynaecology",
  "Ophthalmology",
  "Cardiology",
  "Dermatology",
  "Diagnostic Lab",
  "Multi-speciality",
  "Other",
];

const SIZES = ["Solo (just me)", "2–5 staff", "6–15 staff", "16+ staff"];

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function GetStartedModal({ isOpen, onClose }: Props) {
  const [form, setForm] = useState({
    clinic_name: "",
    contact_name: "",
    email: "",
    phone: "",
    city: "",
    state: "",
    speciality: "",
    clinic_size: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setDone(false);
      setForm({
        clinic_name: "", contact_name: "", email: "", phone: "",
        city: "", state: "", speciality: "", clinic_size: "", notes: "",
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const set = <K extends keyof typeof form>(k: K, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.clinic_name.trim() || !form.contact_name.trim() || !form.email.trim() || !form.phone.trim()) {
      toast.error("Please fill clinic name, your name, email and phone.");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("clinic_signup_requests").insert({
      clinic_name: form.clinic_name.trim(),
      contact_name: form.contact_name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      city: form.city.trim() || null,
      state: form.state.trim() || null,
      speciality: form.speciality || null,
      clinic_size: form.clinic_size || null,
      notes: form.notes.trim() || null,
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message || "Could not submit. Please try again.");
      return;
    }
    setDone(true);
    toast.success("Request received! We'll be in touch shortly.");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-lg font-bold text-navy">Get started with ClinicOS</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Tell us about your clinic — our team will set you up and hand over admin access.
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-muted" aria-label="Close">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {done ? (
          <div className="p-10 text-center">
            <div className="w-14 h-14 rounded-full bg-[#E1F5EE] mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-primary" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-navy">Request received</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
              Thanks {form.contact_name || "there"}! Our team will review your details and reach out at{" "}
              <span className="font-medium text-navy">{form.email}</span> within one business day to complete setup for{" "}
              <span className="font-medium text-navy">{form.clinic_name}</span>.
            </p>
            <button
              onClick={onClose}
              className="mt-6 px-5 py-2.5 rounded-md bg-primary text-white text-sm font-semibold hover:bg-primary/90"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Clinic / Lab name *">
                <input
                  className="input-base" required maxLength={200}
                  value={form.clinic_name}
                  onChange={(e) => set("clinic_name", e.target.value)}
                  placeholder="e.g. ReBalance Physiotherapy"
                />
              </Field>
              <Field label="Speciality">
                <select
                  className="input-base bg-white"
                  value={form.speciality}
                  onChange={(e) => set("speciality", e.target.value)}
                >
                  <option value="">Select…</option>
                  {SPECIALITIES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="Your name *">
                <input
                  className="input-base" required maxLength={120}
                  value={form.contact_name}
                  onChange={(e) => set("contact_name", e.target.value)}
                  placeholder="Dr. Vaishnavi Rao"
                />
              </Field>
              <Field label="Clinic size">
                <select
                  className="input-base bg-white"
                  value={form.clinic_size}
                  onChange={(e) => set("clinic_size", e.target.value)}
                >
                  <option value="">Select…</option>
                  {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="Email *">
                <input
                  className="input-base" required type="email" maxLength={200}
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  placeholder="you@clinic.in"
                />
              </Field>
              <Field label="Phone *">
                <input
                  className="input-base" required maxLength={20}
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  placeholder="+91 98xxxxxxxx"
                />
              </Field>
              <Field label="City">
                <input
                  className="input-base" maxLength={80}
                  value={form.city}
                  onChange={(e) => set("city", e.target.value)}
                  placeholder="Bengaluru"
                />
              </Field>
              <Field label="State">
                <input
                  className="input-base" maxLength={80}
                  value={form.state}
                  onChange={(e) => set("state", e.target.value)}
                  placeholder="Karnataka"
                />
              </Field>
            </div>
            <Field label="Anything else we should know?">
              <textarea
                className="input-base min-h-[80px]" maxLength={1000}
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
                placeholder="Existing tools you use, number of doctors, urgency, etc."
              />
            </Field>

            <div className="flex items-center justify-between pt-2 border-t border-border">
              <p className="text-[11px] text-muted-foreground max-w-sm">
                We'll only use these details to set up your ClinicOS workspace and contact you about it.
              </p>
              <div className="flex items-center gap-2">
                <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-sm font-medium hover:bg-muted">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-md bg-primary text-white text-sm font-semibold hover:bg-primary/90 disabled:opacity-60"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Submit request
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
      <style>{`
        .input-base {
          width: 100%;
          border: 1px solid hsl(var(--border));
          border-radius: 8px;
          padding: 9px 12px;
          font-size: 13px;
          background: white;
          color: hsl(var(--navy, 220 30% 15%));
          outline: none;
        }
        .input-base:focus { border-color: hsl(var(--primary)); box-shadow: 0 0 0 3px hsl(var(--primary) / 0.15); }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-navy mb-1.5">{label}</span>
      {children}
    </label>
  );
}
