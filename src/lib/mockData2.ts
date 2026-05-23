export type ApptStatus = "Confirmed" | "Pending" | "Completed";

export interface WeekAppt {
  id: string;
  patient: string;
  day: number; // 0..6 (Mon..Sun)
  start: number; // hour 9..19, supports .5
  duration: number; // hours
  type: string;
  doctor: string;
  status: ApptStatus;
}

export const weekAppointments: WeekAppt[] = [
  { id: "W1", patient: "Aarav Sharma", day: 0, start: 9, duration: 0.5, type: "General", doctor: "Dr. Mehta", status: "Completed" },
  { id: "W2", patient: "Priya Iyer", day: 0, start: 10.5, duration: 0.5, type: "Follow-up", doctor: "Dr. Priya", status: "Confirmed" },
  { id: "W3", patient: "Rohan Verma", day: 0, start: 14, duration: 1, type: "Procedure", doctor: "Dr. Ramesh", status: "Confirmed" },
  { id: "W4", patient: "Ananya Reddy", day: 1, start: 9.5, duration: 0.5, type: "Vaccination", doctor: "Dr. Mehta", status: "Pending" },
  { id: "W5", patient: "Vikram Singh", day: 1, start: 11, duration: 0.5, type: "BP Check", doctor: "Dr. Priya", status: "Confirmed" },
  { id: "W6", patient: "Meera Joshi", day: 1, start: 16, duration: 1, type: "ECG", doctor: "Dr. Ramesh", status: "Pending" },
  { id: "W7", patient: "Karthik Nair", day: 2, start: 10, duration: 0.5, type: "Follow-up", doctor: "Dr. Mehta", status: "Confirmed" },
  { id: "W8", patient: "Sneha Patel", day: 2, start: 13, duration: 0.5, type: "Migraine", doctor: "Dr. Priya", status: "Confirmed" },
  { id: "W9", patient: "Divya Krishnan", day: 3, start: 9, duration: 0.5, type: "Cardiac", doctor: "Dr. Ramesh", status: "Confirmed" },
  { id: "W10", patient: "Sahil Kapoor", day: 3, start: 11.5, duration: 0.5, type: "Allergy", doctor: "Dr. Mehta", status: "Completed" },
  { id: "W11", patient: "Arjun Malhotra", day: 3, start: 15, duration: 1, type: "Procedure", doctor: "Dr. Ramesh", status: "Pending" },
  { id: "W12", patient: "Pooja Banerjee", day: 4, start: 10, duration: 0.5, type: "Diabetes", doctor: "Dr. Priya", status: "Confirmed" },
  { id: "W13", patient: "Aarav Sharma", day: 4, start: 14.5, duration: 0.5, type: "Lab Review", doctor: "Dr. Mehta", status: "Confirmed" },
  { id: "W14", patient: "Rohan Verma", day: 5, start: 10, duration: 0.5, type: "Follow-up", doctor: "Dr. Mehta", status: "Pending" },
  { id: "W15", patient: "Meera Joshi", day: 5, start: 12, duration: 0.5, type: "Thyroid", doctor: "Dr. Priya", status: "Confirmed" },
];

export interface Invoice {
  id: string;
  patient: string;
  date: string;
  services: string[];
  amount: number;
  status: "Paid" | "Pending" | "Overdue";
}

export const invoices: Invoice[] = [
  { id: "INV-2041", patient: "Aarav Sharma", date: "22/05/2026", services: ["Consultation", "Blood Test"], amount: 1850, status: "Paid" },
  { id: "INV-2042", patient: "Priya Iyer", date: "21/05/2026", services: ["Prenatal Checkup", "Ultrasound"], amount: 3200, status: "Paid" },
  { id: "INV-2043", patient: "Rohan Verma", date: "20/05/2026", services: ["HbA1c", "Consultation"], amount: 1600, status: "Pending" },
  { id: "INV-2044", patient: "Ananya Reddy", date: "19/05/2026", services: ["MMR Vaccine"], amount: 1200, status: "Paid" },
  { id: "INV-2045", patient: "Vikram Singh", date: "18/05/2026", services: ["ECG", "Consultation"], amount: 2100, status: "Overdue" },
  { id: "INV-2046", patient: "Meera Joshi", date: "17/05/2026", services: ["Thyroid Panel", "Vitamin D"], amount: 2800, status: "Paid" },
  { id: "INV-2047", patient: "Karthik Nair", date: "16/05/2026", services: ["Consultation", "Endoscopy"], amount: 5400, status: "Pending" },
  { id: "INV-2048", patient: "Sneha Patel", date: "15/05/2026", services: ["MRI Brain"], amount: 8200, status: "Paid" },
  { id: "INV-2049", patient: "Divya Krishnan", date: "14/05/2026", services: ["Holter Monitor"], amount: 4500, status: "Overdue" },
  { id: "INV-2050", patient: "Sahil Kapoor", date: "13/05/2026", services: ["Allergy Panel"], amount: 3100, status: "Paid" },
];

export interface Payment {
  id: string;
  patient: string;
  amount: number;
  method: "UPI" | "Cash" | "Card";
  date: string;
  invoice: string;
}

export const payments: Payment[] = [
  { id: "P1", patient: "Aarav Sharma", amount: 1850, method: "UPI", date: "22/05/2026", invoice: "INV-2041" },
  { id: "P2", patient: "Priya Iyer", amount: 3200, method: "Card", date: "21/05/2026", invoice: "INV-2042" },
  { id: "P3", patient: "Ananya Reddy", amount: 1200, method: "Cash", date: "19/05/2026", invoice: "INV-2044" },
  { id: "P4", patient: "Meera Joshi", amount: 2800, method: "UPI", date: "17/05/2026", invoice: "INV-2046" },
  { id: "P5", patient: "Sneha Patel", amount: 8200, method: "Card", date: "15/05/2026", invoice: "INV-2048" },
  { id: "P6", patient: "Sahil Kapoor", amount: 3100, method: "UPI", date: "13/05/2026", invoice: "INV-2050" },
  { id: "P7", patient: "Karthik Nair", amount: 2000, method: "Cash", date: "12/05/2026", invoice: "INV-2038" },
  { id: "P8", patient: "Rohan Verma", amount: 1500, method: "UPI", date: "10/05/2026", invoice: "INV-2035" },
];

export type LabStatus = "Pending" | "Processing" | "Delivered";
export interface LabReport {
  id: string;
  patient: string;
  test: string;
  orderedDate: string;
  lab: string;
  status: LabStatus;
  reportDate?: string;
}

export const labReports: LabReport[] = [
  { id: "L1", patient: "Aarav Sharma", test: "HbA1c", orderedDate: "22/05/2026", lab: "Thyrocare", status: "Pending" },
  { id: "L2", patient: "Rohan Verma", test: "Lipid Profile", orderedDate: "21/05/2026", lab: "SRL Diagnostics", status: "Pending" },
  { id: "L3", patient: "Meera Joshi", test: "Thyroid Panel", orderedDate: "20/05/2026", lab: "Metropolis", status: "Processing" },
  { id: "L4", patient: "Vikram Singh", test: "CBC", orderedDate: "20/05/2026", lab: "Thyrocare", status: "Processing" },
  { id: "L5", patient: "Priya Iyer", test: "Vitamin D", orderedDate: "18/05/2026", lab: "SRL Diagnostics", status: "Delivered", reportDate: "20/05/2026" },
  { id: "L6", patient: "Sneha Patel", test: "Liver Function Test", orderedDate: "17/05/2026", lab: "Metropolis", status: "Delivered", reportDate: "19/05/2026" },
  { id: "L7", patient: "Karthik Nair", test: "Urine Routine", orderedDate: "16/05/2026", lab: "Thyrocare", status: "Delivered", reportDate: "17/05/2026" },
  { id: "L8", patient: "Sahil Kapoor", test: "Dengue NS1", orderedDate: "15/05/2026", lab: "SRL Diagnostics", status: "Delivered", reportDate: "16/05/2026" },
];

export interface Medicine {
  id: string;
  name: string;
  category: string;
  stock: number;
  maxStock: number;
  unit: string;
  expiry: string;
  reorder: number;
}

export const medicines: Medicine[] = [
  { id: "M1", name: "Paracetamol 500mg", category: "Analgesic", stock: 420, maxStock: 500, unit: "tablets", expiry: "08/2027", reorder: 100 },
  { id: "M2", name: "Amoxicillin 250mg", category: "Antibiotic", stock: 60, maxStock: 300, unit: "capsules", expiry: "11/2026", reorder: 80 },
  { id: "M3", name: "Metformin 500mg", category: "Antidiabetic", stock: 180, maxStock: 400, unit: "tablets", expiry: "04/2027", reorder: 100 },
  { id: "M4", name: "Atorvastatin 10mg", category: "Statin", stock: 25, maxStock: 200, unit: "tablets", expiry: "06/2026", reorder: 50 },
  { id: "M5", name: "Omeprazole 20mg", category: "Antacid", stock: 240, maxStock: 300, unit: "capsules", expiry: "09/2027", reorder: 75 },
  { id: "M6", name: "Azithromycin 500mg", category: "Antibiotic", stock: 90, maxStock: 200, unit: "tablets", expiry: "05/2026", reorder: 50 },
  { id: "M7", name: "Telmisartan 40mg", category: "Antihypertensive", stock: 150, maxStock: 250, unit: "tablets", expiry: "01/2027", reorder: 60 },
  { id: "M8", name: "Insulin Glargine", category: "Antidiabetic", stock: 12, maxStock: 60, unit: "vials", expiry: "07/2026", reorder: 20 },
  { id: "M9", name: "Cetirizine 10mg", category: "Antihistamine", stock: 320, maxStock: 400, unit: "tablets", expiry: "12/2027", reorder: 100 },
  { id: "M10", name: "Pantoprazole 40mg", category: "Antacid", stock: 175, maxStock: 250, unit: "tablets", expiry: "03/2027", reorder: 60 },
  { id: "M11", name: "Amlodipine 5mg", category: "Antihypertensive", stock: 30, maxStock: 200, unit: "tablets", expiry: "05/2026", reorder: 70 },
  { id: "M12", name: "Levothyroxine 75mcg", category: "Thyroid", stock: 210, maxStock: 300, unit: "tablets", expiry: "10/2027", reorder: 80 },
  { id: "M13", name: "Glimepiride 2mg", category: "Antidiabetic", stock: 18, maxStock: 200, unit: "tablets", expiry: "06/2026", reorder: 60 },
  { id: "M14", name: "Folic Acid 5mg", category: "Vitamin", stock: 450, maxStock: 500, unit: "tablets", expiry: "02/2028", reorder: 100 },
  { id: "M15", name: "Ondansetron 4mg", category: "Antiemetic", stock: 95, maxStock: 200, unit: "tablets", expiry: "09/2026", reorder: 40 },
];

export interface Staff {
  id: string;
  name: string;
  role: "Doctor" | "Receptionist" | "Lab Technician" | "Pharmacist";
  phone: string;
  active: boolean;
}

export const staff: Staff[] = [
  { id: "S1", name: "Dr. Priya Mehta", role: "Doctor", phone: "+91 98450 11122", active: true },
  { id: "S2", name: "Anita Rao", role: "Receptionist", phone: "+91 99000 22334", active: true },
  { id: "S3", name: "Rajesh Kumar", role: "Lab Technician", phone: "+91 98800 44556", active: true },
  { id: "S4", name: "Sunita Sharma", role: "Pharmacist", phone: "+91 97100 66778", active: false },
];
