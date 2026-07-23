export type Role = "Doctor" | "Receptionist" | "Lab Technician" | "Pharmacist" | "Admin";

export interface Speciality {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  description: string | null;
  sort_order: number;
}

export interface ClinicSpeciality {
  id: string;
  clinic_id: string;
  speciality_id: string;
  is_primary: boolean;
  added_at: string;
  specialities?: Speciality | null;
}

export type ApptType = "General Checkup" | "Follow-up" | "Procedure" | "Lab Consultation" | "Emergency";
export type ApptStatus = "Confirmed" | "Pending" | "Completed" | "Cancelled";
export type InvoiceStatus = "Paid" | "Pending" | "Overdue" | "Draft";
export type PaymentMethod = "Cash" | "UPI" | "Card" | "Insurance";
export type LabStatus = "Pending" | "Processing" | "Delivered";
export type Gender = "Male" | "Female" | "Other";

export interface Clinic {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  gst_number: string | null;
  abdm_connected: boolean;
  created_at: string;
  logo_url: string | null;
  plan: string | null;
}

export interface Staff {
  id: string;
  clinic_id: string;
  name: string;
  role: Role;
  phone: string | null;
  email: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Patient {
  id: string;
  clinic_id: string;
  name: string;
  dob: string | null;
  gender: Gender | null;
  blood_group: string | null;
  phone: string;
  alt_phone: string | null;
  email: string | null;
  address: string | null;
  known_allergies: string | null;
  current_medications: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  emergency_contact_relation: string | null;
  abdm_health_id: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Appointment {
  id: string;
  clinic_id: string;
  patient_id: string;
  doctor_id: string | null;
  appointment_date: string;
  appointment_time: string;
  type: ApptType | null;
  status: ApptStatus;
  notes: string | null;
  whatsapp_reminder: boolean;
  created_at: string;
  patients?: { name: string; phone?: string } | null;
  staff?: { name: string } | null;
}

export interface InvoiceLineItem { name: string; amount: number }

export interface Invoice {
  id: string;
  clinic_id: string;
  patient_id: string;
  doctor_id: string | null;
  invoice_date: string;
  due_date: string | null;
  line_items: InvoiceLineItem[];
  subtotal: number;
  gst_amount: number;
  total: number;
  payment_method: PaymentMethod | null;
  payment_reference: string | null;
  status: InvoiceStatus;
  created_at: string;
  patients?: { name: string; phone?: string | null; email?: string | null } | null;
  staff?: { name: string } | null;
}

export interface LabReport {
  id: string;
  clinic_id: string;
  patient_id: string;
  test_name: string;
  lab_name: string | null;
  test_date: string | null;
  file_url: string | null;
  status: LabStatus;
  delivered_whatsapp: boolean;
  delivered_email: boolean;
  created_at: string;
  patients?: { name: string; phone?: string } | null;
}

export interface InventoryItem {
  id: string;
  clinic_id: string;
  medicine_name: string;
  category: string | null;
  current_stock: number;
  unit: string;
  expiry_date: string | null;
  reorder_level: number;
  unit_price: number | null;
  created_at: string;
}
