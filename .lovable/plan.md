## ClinicOS Speciality System — Implementation Plan

Add a multi-speciality layer on top of existing ClinicOS without touching current tables, UI, or RBAC. Each clinic can hold 1+ specialities; each unlocks a bespoke Clinical Assessment form in ConsultationModal and a dedicated tab in the Patient Drawer.

---

### 1. Database (single migration)

**New tables** (all with `GRANT SELECT, INSERT, UPDATE, DELETE ON ... TO authenticated; GRANT ALL ... TO service_role;` + RLS enabled):

- `specialities` — master catalogue (name, slug, icon, color, description, sort_order). Seed all 8 rows in the same migration. Read-only for authenticated (`SELECT` policy `USING (true)`).
- `clinic_specialities` — junction (clinic_id, speciality_id, is_primary). RLS scoped via `current_clinic_id()` for tenant reads; super-admins via `is_super_admin()`.
- `dental_records`, `physio_records`, `pediatric_records`, `antenatal_records`, `ophthal_records`, `cardio_records`, `derma_records` — all scoped by `clinic_id = current_clinic_id()` (matching existing pattern), with super-admin override.

> Note: spec uses `"allow all"` policies — I will replace with the project's existing tenant-scoped RLS pattern (`current_clinic_id()` + `is_super_admin()`) to stay consistent with the current security posture. Existing tables untouched.

**Seed** (same migration, using subqueries — no hardcoded IDs):
- Dental clinic (name ILIKE '%dental%') → `dental` primary + `general` secondary.
- All other clinics → `general` primary.

### 2. Types & Context

- Extend `src/types/database.ts` with `Speciality`, `ClinicSpeciality`, and per-speciality record types.
- Extend `ClinicContext` in `src/lib/auth.tsx` to fetch and expose `specialities`, `primarySpeciality`, `hasSpeciality(slug)`.
- Add `src/lib/specialities.ts` with the shared `APPOINTMENT_TYPES` map, tooth numbering, ROM presets, vaccination list, tooth condition color map, etc.

### 3. Super Admin — Add Clinic Wizard

- Add "Clinic Specialities" card grid (4×2) below plan selector in Step 1 of `AddClinicWizard.tsx`. First-selected = primary badge; unselectable if it would leave 0.
- Extend `launchClinic` server fn in `src/lib/superadmin.functions.ts` to accept `specialityIds: string[]` and insert into `clinic_specialities` after clinic insert.
- Step 4 success summary shows the selected specialities as coloured badges.
- `EditClinicModal.tsx` gets the same speciality picker.
- Overview + AllClinics cards show speciality pills (primary marked).

### 4. Settings — Manage Specialities

New section at top of `src/routes/settings.tsx`:
- Horizontal pill list with "PRIMARY" tag + X remove (guard against removing the only one; auto-promote next if removing primary).
- 3-dot kebab → "Set as primary" (two-step update wrapped in Promise.all).
- `+ Add Speciality` → new `AddSpecialityModal` (480px, card grid, greys out already-added).

### 5. Sidebar

`src/components/Sidebar.tsx`:
- Under clinic name: 1 speciality → `icon + name`; 2+ → icon row with `+N` overflow when >3. Native `title` tooltips.
- Active nav accent border color = primary speciality color (fall back to teal for `general`). Passed via inline CSS var.

### 6. ConsultationModal — Clinical Assessment section

`src/components/modals/ConsultationModal.tsx`:
- Insert new "Clinical Assessment" block between Diagnosis and Prescription.
- 1 speciality → render the form directly; 2+ → tab bar (default = primary).
- Each form is its own component in `src/components/consultation/`:
  - `DentalAssessment.tsx` — SVG odontogram (32 teeth, popover per tooth, condition color map + legend) → `dental_records`.
  - `PhysioAssessment.tsx` — body region dropdown, session number (auto-increment via count query), VAS slider with emoji, ROM table (rows depend on region), dynamic exercise protocol table with pre-filled rows → `physio_records`.
  - `PediatricAssessment.tsx` — weight/height/HC/temp grid, live BMI badge (age-percentile lookup table), vaccination datalist autocomplete, milestone + concerns → `pediatric_records`.
  - `MaternityAssessment.tsx` — LMP date (pre-fill from latest record), auto EDD/GA/trimester, weight+BP (with pre-eclampsia alert), fundal height, FHR (color coded), presentation, oedema toggle, scan upload to Supabase Storage → `antenatal_records`.
  - `OphthalAssessment.tsx` — RE/LE VA dropdowns, IOP with alert, refraction table (SPH/CYL/AXIS/ADD) → `ophthal_records`.
  - `CardioAssessment.tsx` — BP (tiered alerts), HR, chest pain toggle, ECG upload, risk-score radio → `cardio_records`.
  - `DermaAssessment.tsx` — body region chips, lesion dropdown, duration, multi-photo upload with thumbnail grid → `derma_records`.
- Submit path: insert prescription first (existing), then insert the active-tab record. All-or-nothing via sequential awaits; toast reports success.

### 7. Patient Drawer — Speciality tabs

`src/components/PatientDrawer.tsx`:
- Append one tab per clinic speciality after existing tabs (icon + name).
- Lazy-load records on tab click (skeleton while loading).
- Per-speciality panels in `src/components/patient-drawer/`:
  - Dental: timeline cards with read-only mini odontogram.
  - Physio: "Session X of N", Recharts pain sparkline, session list.
  - Pediatric: Recharts LineChart (weight left axis, height right axis), vaccination table, visit list.
  - Maternity: pregnancy summary card (live-calculated GA), Recharts BP trend (systolic/diastolic), visit list.
  - Ophthal: latest Rx table + collapsible history.
  - Cardio: BP trend chart + risk-score timeline.
  - Derma: photo gallery (click to enlarge) + record list.

### 8. Appointments & Dashboard

- `BookAppointmentModal.tsx`: build `<optgroup>`ed Type dropdown from `APPOINTMENT_TYPES` × clinic specialities (single group if only one).
- `src/routes/dashboard.tsx`: reverse-lookup speciality icon from appointment type via `APPOINTMENT_TYPES` and prefix the type text.

### 9. Storage

Reuse the existing private `lab-reports` bucket for maternity scans / ECG / derma photos, under paths `clinic/<clinic_id>/<speciality>/<uuid>.<ext>`, using signed URLs for reads (same pattern as `lab-reports.tsx`). No new bucket needed.

---

### Files created
- `src/lib/specialities.ts`
- `src/components/modals/AddSpecialityModal.tsx`
- `src/components/consultation/{Dental,Physio,Pediatric,Maternity,Ophthal,Cardio,Derma}Assessment.tsx`
- `src/components/patient-drawer/{Dental,Physio,Pediatric,Maternity,Ophthal,Cardio,Derma}Panel.tsx`
- `src/components/SpecialityPicker.tsx` (shared card grid used by wizard, edit modal, add modal)
- One migration file

### Files edited
- `src/types/database.ts`, `src/lib/auth.tsx`
- `src/lib/superadmin.functions.ts`
- `src/components/superadmin/{AddClinicWizard,EditClinicModal,OverviewPage,AllClinicsPage}.tsx`
- `src/routes/settings.tsx`, `src/routes/dashboard.tsx`
- `src/components/Sidebar.tsx`, `PatientDrawer.tsx`
- `src/components/modals/{ConsultationModal,BookAppointmentModal}.tsx`

### Not touched
Existing table columns, RBAC, auth flow, existing modal fields (only *added* the Clinical Assessment section), existing seed data.
