export type StaffRole = "Doctor" | "Receptionist" | "Lab Technician" | "Pharmacist" | "Admin" | "SuperAdmin";

export type Permission =
  | "book_appointment"
  | "register_patient"
  | "view_patient_medical_history"
  | "write_prescription"
  | "add_diagnosis"
  | "mark_appointment_complete"
  | "create_invoice"
  | "upload_lab_report"
  | "view_lab_reports"
  | "view_inventory"
  | "edit_inventory"
  | "access_settings"
  | "view_patients"
  | "view_billing"
  | "view_appointments"
  | "manage_clinics"
  | "enter_any_clinic";

const ADMIN_BASE: Permission[] = [
  "book_appointment", "register_patient", "view_patient_medical_history",
  "write_prescription", "add_diagnosis", "mark_appointment_complete",
  "create_invoice", "upload_lab_report", "view_lab_reports",
  "view_inventory", "edit_inventory", "access_settings",
  "view_patients", "view_billing", "view_appointments",
];

const ROLE_PERMISSIONS: Record<StaffRole, Permission[]> = {
  SuperAdmin: [...ADMIN_BASE, "manage_clinics", "enter_any_clinic"],
  Admin: [...ADMIN_BASE],
  Doctor: [
    "book_appointment", "register_patient", "view_patient_medical_history",
    "write_prescription", "add_diagnosis", "mark_appointment_complete",
    "create_invoice", "upload_lab_report", "view_lab_reports", "view_inventory",
    "view_patients", "view_billing", "view_appointments",
  ],
  Receptionist: [
    "book_appointment", "register_patient", "create_invoice",
    "view_patients", "view_billing", "view_appointments",
  ],
  "Lab Technician": [
    "upload_lab_report", "view_lab_reports", "view_patients",
  ],
  Pharmacist: [
    "view_inventory", "edit_inventory",
  ],
};

export function can(role: StaffRole | null, permission: Permission): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export const ROLE_BADGE: Record<StaffRole, string> = {
  Doctor: "bg-[#E1F5EE] text-primary",
  Receptionist: "bg-blue-100 text-blue-700",
  "Lab Technician": "bg-amber-100 text-amber-800",
  Pharmacist: "bg-purple-100 text-purple-700",
  Admin: "bg-navy text-white",
  SuperAdmin: "bg-[#0C2D3E] text-[#02C39A]",
};
