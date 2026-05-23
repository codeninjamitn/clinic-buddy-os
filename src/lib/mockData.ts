export type Status = "Confirmed" | "Pending" | "Completed";

export interface Appointment {
  id: string;
  patient: string;
  initials: string;
  color: string;
  time: string;
  doctor: string;
  type: string;
  status: Status;
}

export interface Patient {
  id: string;
  name: string;
  initials: string;
  color: string;
  age: number;
  gender: "M" | "F";
  phone: string;
  lastVisit: string;
  status: "Active" | "Inactive";
  bloodGroup: string;
  abdmId: string;
  email: string;
  address: string;
  emergencyName: string;
  emergencyPhone: string;
  allergies: string[];
  medications: string[];
  visits: { date: string; diagnosis: string; doctor: string }[];
}

const avatarColors = [
  "#028090", "#02C39A", "#3B82F6", "#F59E0B",
  "#EF4444", "#8B5CF6", "#EC4899", "#10B981",
];

const initials = (name: string) =>
  name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

export const todaysAppointments: Appointment[] = [
  { id: "A1", patient: "Aarav Sharma", initials: "AS", color: avatarColors[0], time: "09:00 AM", doctor: "Dr. Mehta", type: "General Checkup", status: "Completed" },
  { id: "A2", patient: "Priya Iyer", initials: "PI", color: avatarColors[1], time: "10:30 AM", doctor: "Dr. Mehta", type: "Follow-up", status: "Confirmed" },
  { id: "A3", patient: "Rohan Verma", initials: "RV", color: avatarColors[2], time: "11:15 AM", doctor: "Dr. Kapoor", type: "Diabetes Review", status: "Confirmed" },
  { id: "A4", patient: "Ananya Reddy", initials: "AR", color: avatarColors[3], time: "12:00 PM", doctor: "Dr. Mehta", type: "Vaccination", status: "Pending" },
  { id: "A5", patient: "Vikram Singh", initials: "VS", color: avatarColors[4], time: "02:30 PM", doctor: "Dr. Kapoor", type: "Blood Pressure", status: "Confirmed" },
  { id: "A6", patient: "Meera Joshi", initials: "MJ", color: avatarColors[5], time: "04:00 PM", doctor: "Dr. Mehta", type: "ECG Review", status: "Pending" },
];

export const revenueWeek = [
  { day: "Mon", revenue: 14000 },
  { day: "Tue", revenue: 18500 },
  { day: "Wed", revenue: 12000 },
  { day: "Thu", revenue: 22000 },
  { day: "Fri", revenue: 19500 },
  { day: "Sat", revenue: 8000 },
  { day: "Sun", revenue: 10500 },
];

const rawPatients: Omit<Patient, "initials" | "color">[] = [
  { id: "PT-1042", name: "Aarav Sharma", age: 34, gender: "M", phone: "+91 98450 12345", lastVisit: "12/05/2026", status: "Active", bloodGroup: "B+", abdmId: "12-3456-7890-1234", email: "aarav.sharma@gmail.com", address: "42, MG Road, Bengaluru, KA 560001", emergencyName: "Neha Sharma", emergencyPhone: "+91 98450 99887", allergies: ["Penicillin", "Dust mites"], medications: ["Metformin 500mg", "Atorvastatin 10mg"], visits: [
    { date: "12/05/2026", diagnosis: "Type 2 Diabetes — routine review", doctor: "Dr. Mehta" },
    { date: "18/02/2026", diagnosis: "Seasonal flu", doctor: "Dr. Mehta" },
    { date: "04/11/2025", diagnosis: "Annual health checkup", doctor: "Dr. Kapoor" },
    { date: "22/07/2025", diagnosis: "Mild hypertension", doctor: "Dr. Mehta" },
  ]},
  { id: "PT-1043", name: "Priya Iyer", age: 28, gender: "F", phone: "+91 99800 23456", lastVisit: "20/05/2026", status: "Active", bloodGroup: "O+", abdmId: "23-4567-8901-2345", email: "priya.iyer@outlook.com", address: "11, Adyar, Chennai, TN 600020", emergencyName: "Ravi Iyer", emergencyPhone: "+91 99800 33445", allergies: ["Sulfa drugs"], medications: ["Folic Acid"], visits: [
    { date: "20/05/2026", diagnosis: "Prenatal checkup — 24 weeks", doctor: "Dr. Mehta" },
    { date: "08/04/2026", diagnosis: "Prenatal checkup — 18 weeks", doctor: "Dr. Mehta" },
    { date: "15/02/2026", diagnosis: "Confirmation of pregnancy", doctor: "Dr. Mehta" },
    { date: "10/12/2025", diagnosis: "Iron deficiency anemia", doctor: "Dr. Kapoor" },
  ]},
  { id: "PT-1044", name: "Rohan Verma", age: 45, gender: "M", phone: "+91 98200 34567", lastVisit: "22/05/2026", status: "Active", bloodGroup: "A+", abdmId: "34-5678-9012-3456", email: "rohan.verma@yahoo.in", address: "B-204, Andheri West, Mumbai, MH 400058", emergencyName: "Sunita Verma", emergencyPhone: "+91 98200 44556", allergies: ["None known"], medications: ["Insulin Glargine", "Metformin 1000mg", "Telmisartan 40mg"], visits: [
    { date: "22/05/2026", diagnosis: "Diabetes follow-up, HbA1c review", doctor: "Dr. Kapoor" },
    { date: "10/03/2026", diagnosis: "Hypertension review", doctor: "Dr. Kapoor" },
    { date: "02/01/2026", diagnosis: "Lipid profile elevated", doctor: "Dr. Mehta" },
    { date: "14/10/2025", diagnosis: "Routine diabetes management", doctor: "Dr. Kapoor" },
  ]},
  { id: "PT-1045", name: "Ananya Reddy", age: 6, gender: "F", phone: "+91 90080 45678", lastVisit: "15/05/2026", status: "Active", bloodGroup: "AB+", abdmId: "45-6789-0123-4567", email: "reddy.family@gmail.com", address: "7, Jubilee Hills, Hyderabad, TS 500033", emergencyName: "Kavya Reddy (Mother)", emergencyPhone: "+91 90080 55667", allergies: ["Peanuts"], medications: ["Multivitamin syrup"], visits: [
    { date: "15/05/2026", diagnosis: "MMR booster vaccination", doctor: "Dr. Mehta" },
    { date: "03/03/2026", diagnosis: "Common cold", doctor: "Dr. Mehta" },
    { date: "20/12/2025", diagnosis: "Routine pediatric checkup", doctor: "Dr. Mehta" },
    { date: "11/09/2025", diagnosis: "Mild fever", doctor: "Dr. Kapoor" },
  ]},
  { id: "PT-1046", name: "Vikram Singh", age: 52, gender: "M", phone: "+91 98101 56789", lastVisit: "21/05/2026", status: "Active", bloodGroup: "B-", abdmId: "56-7890-1234-5678", email: "vikram.singh@hotmail.com", address: "C-12, Lajpat Nagar, New Delhi, DL 110024", emergencyName: "Harpreet Singh", emergencyPhone: "+91 98101 66778", allergies: ["Aspirin"], medications: ["Amlodipine 5mg", "Aspirin 75mg (discontinued)"], visits: [
    { date: "21/05/2026", diagnosis: "BP monitoring", doctor: "Dr. Kapoor" },
    { date: "12/04/2026", diagnosis: "Chest discomfort — ECG normal", doctor: "Dr. Kapoor" },
    { date: "05/02/2026", diagnosis: "Hypertension review", doctor: "Dr. Mehta" },
    { date: "18/11/2025", diagnosis: "Annual cardiac screening", doctor: "Dr. Kapoor" },
  ]},
  { id: "PT-1047", name: "Meera Joshi", age: 61, gender: "F", phone: "+91 97400 67890", lastVisit: "19/05/2026", status: "Active", bloodGroup: "O-", abdmId: "67-8901-2345-6789", email: "meera.joshi@gmail.com", address: "5, Koregaon Park, Pune, MH 411001", emergencyName: "Anil Joshi", emergencyPhone: "+91 97400 77889", allergies: ["Iodine contrast"], medications: ["Levothyroxine 75mcg", "Calcium + D3"], visits: [
    { date: "19/05/2026", diagnosis: "ECG review post palpitations", doctor: "Dr. Mehta" },
    { date: "07/03/2026", diagnosis: "Hypothyroidism follow-up", doctor: "Dr. Mehta" },
    { date: "14/12/2025", diagnosis: "Joint pain — osteoarthritis", doctor: "Dr. Kapoor" },
    { date: "29/09/2025", diagnosis: "Vitamin D deficiency", doctor: "Dr. Mehta" },
  ]},
  { id: "PT-1048", name: "Karthik Nair", age: 38, gender: "M", phone: "+91 95440 78901", lastVisit: "10/05/2026", status: "Active", bloodGroup: "A-", abdmId: "78-9012-3456-7890", email: "karthik.nair@gmail.com", address: "23, Marine Drive, Kochi, KL 682031", emergencyName: "Lakshmi Nair", emergencyPhone: "+91 95440 88990", allergies: ["None known"], medications: ["Pantoprazole 40mg"], visits: [
    { date: "10/05/2026", diagnosis: "Acid reflux follow-up", doctor: "Dr. Mehta" },
    { date: "02/03/2026", diagnosis: "Gastritis", doctor: "Dr. Mehta" },
    { date: "16/12/2025", diagnosis: "Routine checkup", doctor: "Dr. Kapoor" },
    { date: "01/08/2025", diagnosis: "Throat infection", doctor: "Dr. Mehta" },
  ]},
  { id: "PT-1049", name: "Sneha Patel", age: 31, gender: "F", phone: "+91 99090 89012", lastVisit: "08/05/2026", status: "Active", bloodGroup: "B+", abdmId: "89-0123-4567-8901", email: "sneha.patel@gmail.com", address: "44, Satellite, Ahmedabad, GJ 380015", emergencyName: "Rajesh Patel", emergencyPhone: "+91 99090 99001", allergies: ["Latex"], medications: ["None"], visits: [
    { date: "08/05/2026", diagnosis: "Migraine management", doctor: "Dr. Kapoor" },
    { date: "19/02/2026", diagnosis: "Migraine — initial consult", doctor: "Dr. Kapoor" },
    { date: "11/11/2025", diagnosis: "Annual health checkup", doctor: "Dr. Mehta" },
    { date: "23/06/2025", diagnosis: "Viral fever", doctor: "Dr. Mehta" },
  ]},
  { id: "PT-1050", name: "Arjun Malhotra", age: 22, gender: "M", phone: "+91 98112 90123", lastVisit: "02/04/2026", status: "Inactive", bloodGroup: "O+", abdmId: "90-1234-5678-9012", email: "arjun.malhotra@gmail.com", address: "18, Sector 17, Chandigarh, CH 160017", emergencyName: "Suresh Malhotra", emergencyPhone: "+91 98112 11223", allergies: ["Shellfish"], medications: ["None"], visits: [
    { date: "02/04/2026", diagnosis: "Sports injury — knee strain", doctor: "Dr. Kapoor" },
    { date: "15/01/2026", diagnosis: "Skin allergy", doctor: "Dr. Mehta" },
    { date: "20/10/2025", diagnosis: "Annual checkup", doctor: "Dr. Mehta" },
    { date: "09/07/2025", diagnosis: "Sinusitis", doctor: "Dr. Kapoor" },
  ]},
  { id: "PT-1051", name: "Divya Krishnan", age: 42, gender: "F", phone: "+91 96320 01234", lastVisit: "17/05/2026", status: "Active", bloodGroup: "AB-", abdmId: "01-2345-6789-0123", email: "divya.k@gmail.com", address: "9, T. Nagar, Chennai, TN 600017", emergencyName: "Ramesh Krishnan", emergencyPhone: "+91 96320 22334", allergies: ["Penicillin"], medications: ["Metoprolol 25mg"], visits: [
    { date: "17/05/2026", diagnosis: "Cardiac arrhythmia follow-up", doctor: "Dr. Kapoor" },
    { date: "06/03/2026", diagnosis: "Palpitations — Holter monitor", doctor: "Dr. Kapoor" },
    { date: "12/12/2025", diagnosis: "Thyroid panel review", doctor: "Dr. Mehta" },
    { date: "28/08/2025", diagnosis: "General checkup", doctor: "Dr. Mehta" },
  ]},
  { id: "PT-1052", name: "Sahil Kapoor", age: 29, gender: "M", phone: "+91 97170 12340", lastVisit: "11/05/2026", status: "Active", bloodGroup: "A+", abdmId: "11-2233-4455-6677", email: "sahil.kapoor@gmail.com", address: "31, Civil Lines, Jaipur, RJ 302006", emergencyName: "Priyanka Kapoor", emergencyPhone: "+91 97170 33445", allergies: ["None known"], medications: ["Cetirizine (PRN)"], visits: [
    { date: "11/05/2026", diagnosis: "Allergic rhinitis", doctor: "Dr. Mehta" },
    { date: "04/02/2026", diagnosis: "Throat infection", doctor: "Dr. Mehta" },
    { date: "19/10/2025", diagnosis: "Routine bloodwork", doctor: "Dr. Kapoor" },
    { date: "07/06/2025", diagnosis: "Travel vaccination", doctor: "Dr. Mehta" },
  ]},
  { id: "PT-1053", name: "Pooja Banerjee", age: 55, gender: "F", phone: "+91 98300 23451", lastVisit: "28/03/2026", status: "Inactive", bloodGroup: "B+", abdmId: "22-3344-5566-7788", email: "pooja.banerjee@gmail.com", address: "12, Salt Lake, Kolkata, WB 700064", emergencyName: "Subrata Banerjee", emergencyPhone: "+91 98300 44556", allergies: ["Codeine"], medications: ["Glimepiride 2mg", "Metformin 500mg"], visits: [
    { date: "28/03/2026", diagnosis: "Diabetes review", doctor: "Dr. Kapoor" },
    { date: "14/01/2026", diagnosis: "Knee pain — physiotherapy advised", doctor: "Dr. Mehta" },
    { date: "30/10/2025", diagnosis: "HbA1c review", doctor: "Dr. Kapoor" },
    { date: "12/07/2025", diagnosis: "Annual checkup", doctor: "Dr. Mehta" },
  ]},
];

export const patients: Patient[] = rawPatients.map((p, i) => ({
  ...p,
  initials: initials(p.name),
  color: avatarColors[i % avatarColors.length],
}));
