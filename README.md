# ClinicOS — The Clinic Operating System for Independent India

**An all-in-one clinic management platform** — built for independent Indian doctors, diagnostic labs, and pharmacies to run appointments, patients, prescriptions, billing, lab reports, and inventory from a single smartphone-first interface.

---

## What does it do?

India has 700,000+ independent clinics running on paper registers, manual phone calls, and WhatsApp-forwarded PDFs. ClinicOS eliminates that chaos — giving every clinic a digital operating system that works out of the box, costs less than a staff member's daily wages, and makes ABDM compliance automatic.

### 🏥 For Doctors
- Write digital prescriptions with medicine lookup from live inventory
- View full patient history, visit timeline, and past diagnoses
- Mark consultations complete with clinical notes and follow-up dates
- Read-only inventory view so you know what's in stock before prescribing

### 📋 For Receptionists
- Book, reschedule, and confirm appointments with WhatsApp reminders
- Register new patients with ABDM health ID generation
- Create GST-ready invoices and collect payments via UPI, Cash, or Card
- View patient contact and billing info without accessing medical records

### 🔬 For Lab Technicians
- Upload lab reports (PDF/image) directly to patient records
- Send reports to patients via WhatsApp and email in one click
- Track pending, processing, and delivered reports
- No access to medical history or financial data

### 💊 For Pharmacists
- Manage full medicine inventory with expiry alerts and low-stock flags
- Prescription-linked dispensing (coming soon)
- Generate purchase orders for restocking
- Isolated from clinical and billing data

### 🛡️ For Clinic Admins
- Full access to all modules
- Add and manage staff with role-based permissions
- Connect to ABDM (Ayushman Bharat Digital Mission) for compliance
- Configure clinic profile, GST details, and registration info

### 🌐 For Super Admins (Platform Level)
- Manage all clinics from a single dark-theme control panel
- Add a complete new clinic in one go — 4-step wizard provisions profile, admin account, team, and starter inventory
- Enter any clinic as a super admin observer
- Suspend, activate, or delete clinics
- Full activity log of all platform actions

---

## Key Features

- **Role-based access control** — 5 roles, 12 permission types, enforced at the UI level. If you can't do it, you don't see it.
- **Prescription engine** — Doctors prescribe from a live medicine list. Saves to a permanent prescription record linked to the appointment and patient.
- **ABDM-ready** — Auto-generates digital health IDs for patients. Built for India's national health mandate.
- **WhatsApp-first** — Appointment reminders, lab report delivery, and invoice sharing all happen on WhatsApp — the channel clinics already live in.
- **Live dashboard** — Real-time appointment count, revenue metrics, and pending dues via Supabase Realtime subscriptions.
- **Multi-clinic platform** — One Super Admin shell manages unlimited clinics. Each clinic is fully isolated with its own data, team, and settings.
- **One-go clinic provisioning** — Add a new clinic, create its admin account, set up the team, and load starter inventory in a single 4-step wizard. No manual SQL, no separate setup.

---

## Role Matrix

| Capability | Doctor | Receptionist | Lab Tech | Pharmacist | Admin | Super Admin |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| View dashboard | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Book appointments | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ |
| Write prescriptions | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ |
| View full medical history | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Create invoices | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ |
| Upload lab reports | ✅ | ❌ | ✅ | ❌ | ✅ | ✅ |
| Edit inventory | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Access settings | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Manage all clinics | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## Project Info

**Live App**: [https://clinic-buddy-os.lovable.app](https://clinic-buddy-os.lovable.app)

> 👉 **Try it live!** Use any of the test accounts below to explore ClinicOS as each role — no signup needed.

### Test Accounts

| Role | Email | Password |
|---|---|---|
| 👨‍⚕️ Doctor | doctor@ramaiaiclinic.in | Doctor@1234 |
| 📋 Receptionist | reception@ramaiaiclinic.in | Staff@1234 |
| 🔬 Lab Technician | lab@ramaiaiclinic.in | Lab@1234 |
| 💊 Pharmacist | pharmacy@ramaiaiclinic.in | Pharma@1234 |

All accounts are pre-seeded with realistic Indian patient data, appointments, invoices, lab reports, and inventory for **Ramaiah Clinic, Bengaluru**.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript + Vite |
| Styling | Tailwind CSS |
| Icons | lucide-react |
| Charts | Recharts |
| Backend | Supabase (Lovable Cloud embedded) |
| Auth | Supabase Auth (email + password) |
| Storage | Supabase Storage (lab report PDFs/images) |
| Realtime | Supabase Realtime (live appointment updates) |
| Hosting | Lovable Cloud |

---

## Roadmap

- [ ] ABDM live API integration (HIP/HIU registration)
- [ ] WhatsApp Business API for real message delivery
- [ ] Prescription PDF generation and print
- [ ] Inventory reorder via purchase order email
- [ ] Multi-branch support per clinic (single clinic, multiple locations)
- [ ] Patient mobile app (view appointments, reports, prescriptions)
- [ ] Analytics module — revenue trends, no-show rates, top diagnoses
- [ ] Stripe / Razorpay subscription billing for clinic plans

---

## Why ClinicOS?

> *"I've spent years in healthcare. The thing that frustrated me most wasn't the lack of technology — it was watching a doctor miss a critical drug interaction because the patient's last prescription was scribbled in a register from three months ago. India has 700,000 independent clinics. Most of them still run this way."*

ClinicOS is built from the inside out — by someone who has lived the broken clinic workflow, not someone who discovered it from the outside. That domain knowledge is baked into every design decision: WhatsApp-first delivery, 45-minute onboarding, regional language support, and ABDM compliance that doesn't require an IT department.

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

Built with ❤️ by [Amit Navare](https://linkedin.com/in/amitnavare) for India's independent healthcare providers 🇮🇳
