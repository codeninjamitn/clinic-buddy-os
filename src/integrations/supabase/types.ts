export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      antenatal_records: {
        Row: {
          bp_diastolic: number | null
          bp_systolic: number | null
          clinic_id: string
          created_at: string
          edd: string | null
          fetal_heart_rate: number | null
          fetal_presentation: string | null
          fundal_height_cm: number | null
          gestational_weeks: number | null
          id: string
          lmp: string | null
          oedema: boolean | null
          patient_id: string
          remarks: string | null
          scan_report_url: string | null
          visit_date: string
          weight_kg: number | null
        }
        Insert: {
          bp_diastolic?: number | null
          bp_systolic?: number | null
          clinic_id: string
          created_at?: string
          edd?: string | null
          fetal_heart_rate?: number | null
          fetal_presentation?: string | null
          fundal_height_cm?: number | null
          gestational_weeks?: number | null
          id?: string
          lmp?: string | null
          oedema?: boolean | null
          patient_id: string
          remarks?: string | null
          scan_report_url?: string | null
          visit_date?: string
          weight_kg?: number | null
        }
        Update: {
          bp_diastolic?: number | null
          bp_systolic?: number | null
          clinic_id?: string
          created_at?: string
          edd?: string | null
          fetal_heart_rate?: number | null
          fetal_presentation?: string | null
          fundal_height_cm?: number | null
          gestational_weeks?: number | null
          id?: string
          lmp?: string | null
          oedema?: boolean | null
          patient_id?: string
          remarks?: string | null
          scan_report_url?: string | null
          visit_date?: string
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "antenatal_records_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "antenatal_records_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          appointment_date: string
          appointment_time: string
          clinic_id: string | null
          created_at: string | null
          doctor_id: string | null
          id: string
          notes: string | null
          patient_id: string | null
          status: string | null
          type: string | null
          whatsapp_reminder: boolean | null
        }
        Insert: {
          appointment_date: string
          appointment_time: string
          clinic_id?: string | null
          created_at?: string | null
          doctor_id?: string | null
          id?: string
          notes?: string | null
          patient_id?: string | null
          status?: string | null
          type?: string | null
          whatsapp_reminder?: boolean | null
        }
        Update: {
          appointment_date?: string
          appointment_time?: string
          clinic_id?: string | null
          created_at?: string | null
          doctor_id?: string | null
          id?: string
          notes?: string | null
          patient_id?: string | null
          status?: string | null
          type?: string | null
          whatsapp_reminder?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_clinic_fk"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      cardio_records: {
        Row: {
          appointment_id: string | null
          bp_diastolic: number | null
          bp_systolic: number | null
          cardiac_risk_score: string | null
          chest_pain: boolean | null
          clinic_id: string
          clinical_notes: string | null
          created_at: string
          ecg_url: string | null
          heart_rate: number | null
          id: string
          patient_id: string
        }
        Insert: {
          appointment_id?: string | null
          bp_diastolic?: number | null
          bp_systolic?: number | null
          cardiac_risk_score?: string | null
          chest_pain?: boolean | null
          clinic_id: string
          clinical_notes?: string | null
          created_at?: string
          ecg_url?: string | null
          heart_rate?: number | null
          id?: string
          patient_id: string
        }
        Update: {
          appointment_id?: string | null
          bp_diastolic?: number | null
          bp_systolic?: number | null
          cardiac_risk_score?: string | null
          chest_pain?: boolean | null
          clinic_id?: string
          clinical_notes?: string | null
          created_at?: string
          ecg_url?: string | null
          heart_rate?: number | null
          id?: string
          patient_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cardio_records_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cardio_records_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cardio_records_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      clinic_invites: {
        Row: {
          accepted: boolean | null
          accepted_at: string | null
          clinic_id: string | null
          created_at: string | null
          email: string
          id: string
          name: string
          role: string
          token_expires_at: string | null
          token_hash: string | null
        }
        Insert: {
          accepted?: boolean | null
          accepted_at?: string | null
          clinic_id?: string | null
          created_at?: string | null
          email: string
          id?: string
          name: string
          role: string
          token_expires_at?: string | null
          token_hash?: string | null
        }
        Update: {
          accepted?: boolean | null
          accepted_at?: string | null
          clinic_id?: string | null
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          role?: string
          token_expires_at?: string | null
          token_hash?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clinic_invites_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      clinic_specialities: {
        Row: {
          added_at: string
          clinic_id: string
          id: string
          is_primary: boolean
          speciality_id: string
        }
        Insert: {
          added_at?: string
          clinic_id: string
          id?: string
          is_primary?: boolean
          speciality_id: string
        }
        Update: {
          added_at?: string
          clinic_id?: string
          id?: string
          is_primary?: boolean
          speciality_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinic_specialities_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_specialities_speciality_id_fkey"
            columns: ["speciality_id"]
            isOneToOne: false
            referencedRelation: "specialities"
            referencedColumns: ["id"]
          },
        ]
      }
      clinics: {
        Row: {
          abdm_connected: boolean | null
          address: string | null
          created_at: string | null
          created_by: string | null
          email: string | null
          gst_number: string | null
          id: string
          logo_url: string | null
          name: string
          phone: string | null
          plan: string | null
          registration_number: string | null
          status: string | null
        }
        Insert: {
          abdm_connected?: boolean | null
          address?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          gst_number?: string | null
          id?: string
          logo_url?: string | null
          name: string
          phone?: string | null
          plan?: string | null
          registration_number?: string | null
          status?: string | null
        }
        Update: {
          abdm_connected?: boolean | null
          address?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          gst_number?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          phone?: string | null
          plan?: string | null
          registration_number?: string | null
          status?: string | null
        }
        Relationships: []
      }
      dental_records: {
        Row: {
          appointment_id: string | null
          chief_complaint: string | null
          clinic_id: string
          clinical_findings: string | null
          created_at: string
          id: string
          next_visit_notes: string | null
          patient_id: string
          tooth_data: Json
          treatment_plan: string | null
        }
        Insert: {
          appointment_id?: string | null
          chief_complaint?: string | null
          clinic_id: string
          clinical_findings?: string | null
          created_at?: string
          id?: string
          next_visit_notes?: string | null
          patient_id: string
          tooth_data?: Json
          treatment_plan?: string | null
        }
        Update: {
          appointment_id?: string | null
          chief_complaint?: string | null
          clinic_id?: string
          clinical_findings?: string | null
          created_at?: string
          id?: string
          next_visit_notes?: string | null
          patient_id?: string
          tooth_data?: Json
          treatment_plan?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dental_records_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dental_records_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dental_records_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      derma_records: {
        Row: {
          affected_body_regions: Json
          appointment_id: string | null
          clinic_id: string
          clinical_notes: string | null
          created_at: string
          duration: string | null
          id: string
          lesion_type: string | null
          patient_id: string
          photo_urls: Json
          treatment_protocol: string | null
        }
        Insert: {
          affected_body_regions?: Json
          appointment_id?: string | null
          clinic_id: string
          clinical_notes?: string | null
          created_at?: string
          duration?: string | null
          id?: string
          lesion_type?: string | null
          patient_id: string
          photo_urls?: Json
          treatment_protocol?: string | null
        }
        Update: {
          affected_body_regions?: Json
          appointment_id?: string | null
          clinic_id?: string
          clinical_notes?: string | null
          created_at?: string
          duration?: string | null
          id?: string
          lesion_type?: string | null
          patient_id?: string
          photo_urls?: Json
          treatment_protocol?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "derma_records_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "derma_records_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "derma_records_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory: {
        Row: {
          category: string | null
          clinic_id: string | null
          created_at: string | null
          current_stock: number | null
          expiry_date: string | null
          id: string
          medicine_name: string
          reorder_level: number | null
          unit: string | null
          unit_price: number | null
        }
        Insert: {
          category?: string | null
          clinic_id?: string | null
          created_at?: string | null
          current_stock?: number | null
          expiry_date?: string | null
          id?: string
          medicine_name: string
          reorder_level?: number | null
          unit?: string | null
          unit_price?: number | null
        }
        Update: {
          category?: string | null
          clinic_id?: string | null
          created_at?: string | null
          current_stock?: number | null
          expiry_date?: string | null
          id?: string
          medicine_name?: string
          reorder_level?: number | null
          unit?: string | null
          unit_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_clinic_fk"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          clinic_id: string | null
          created_at: string | null
          doctor_id: string | null
          due_date: string | null
          gst_amount: number | null
          id: string
          invoice_date: string | null
          line_items: Json | null
          patient_id: string | null
          payment_method: string | null
          status: string | null
          subtotal: number | null
          total: number | null
        }
        Insert: {
          clinic_id?: string | null
          created_at?: string | null
          doctor_id?: string | null
          due_date?: string | null
          gst_amount?: number | null
          id?: string
          invoice_date?: string | null
          line_items?: Json | null
          patient_id?: string | null
          payment_method?: string | null
          status?: string | null
          subtotal?: number | null
          total?: number | null
        }
        Update: {
          clinic_id?: string | null
          created_at?: string | null
          doctor_id?: string | null
          due_date?: string | null
          gst_amount?: number | null
          id?: string
          invoice_date?: string | null
          line_items?: Json | null
          patient_id?: string | null
          payment_method?: string | null
          status?: string | null
          subtotal?: number | null
          total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_clinic_fk"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_reports: {
        Row: {
          clinic_id: string | null
          created_at: string | null
          delivered_email: boolean | null
          delivered_whatsapp: boolean | null
          file_url: string | null
          id: string
          lab_name: string | null
          patient_id: string | null
          status: string | null
          test_date: string | null
          test_name: string
        }
        Insert: {
          clinic_id?: string | null
          created_at?: string | null
          delivered_email?: boolean | null
          delivered_whatsapp?: boolean | null
          file_url?: string | null
          id?: string
          lab_name?: string | null
          patient_id?: string | null
          status?: string | null
          test_date?: string | null
          test_name: string
        }
        Update: {
          clinic_id?: string | null
          created_at?: string | null
          delivered_email?: boolean | null
          delivered_whatsapp?: boolean | null
          file_url?: string | null
          id?: string
          lab_name?: string | null
          patient_id?: string | null
          status?: string | null
          test_date?: string | null
          test_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "lab_reports_clinic_fk"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_reports_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_reports_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      ophthal_records: {
        Row: {
          add_left: number | null
          add_right: number | null
          appointment_id: string | null
          axis_left: number | null
          axis_right: number | null
          clinic_id: string
          clinical_notes: string | null
          created_at: string
          cyl_left: number | null
          cyl_right: number | null
          id: string
          iop_left: number | null
          iop_right: number | null
          patient_id: string
          sph_left: number | null
          sph_right: number | null
          va_left: string | null
          va_right: string | null
        }
        Insert: {
          add_left?: number | null
          add_right?: number | null
          appointment_id?: string | null
          axis_left?: number | null
          axis_right?: number | null
          clinic_id: string
          clinical_notes?: string | null
          created_at?: string
          cyl_left?: number | null
          cyl_right?: number | null
          id?: string
          iop_left?: number | null
          iop_right?: number | null
          patient_id: string
          sph_left?: number | null
          sph_right?: number | null
          va_left?: string | null
          va_right?: string | null
        }
        Update: {
          add_left?: number | null
          add_right?: number | null
          appointment_id?: string | null
          axis_left?: number | null
          axis_right?: number | null
          clinic_id?: string
          clinical_notes?: string | null
          created_at?: string
          cyl_left?: number | null
          cyl_right?: number | null
          id?: string
          iop_left?: number | null
          iop_right?: number | null
          patient_id?: string
          sph_left?: number | null
          sph_right?: number | null
          va_left?: string | null
          va_right?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ophthal_records_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ophthal_records_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ophthal_records_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          abdm_health_id: string | null
          address: string | null
          alt_phone: string | null
          blood_group: string | null
          clinic_id: string | null
          created_at: string | null
          current_medications: string | null
          dob: string | null
          email: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          gender: string | null
          id: string
          is_active: boolean | null
          known_allergies: string | null
          name: string
          phone: string
        }
        Insert: {
          abdm_health_id?: string | null
          address?: string | null
          alt_phone?: string | null
          blood_group?: string | null
          clinic_id?: string | null
          created_at?: string | null
          current_medications?: string | null
          dob?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          gender?: string | null
          id?: string
          is_active?: boolean | null
          known_allergies?: string | null
          name: string
          phone: string
        }
        Update: {
          abdm_health_id?: string | null
          address?: string | null
          alt_phone?: string | null
          blood_group?: string | null
          clinic_id?: string | null
          created_at?: string | null
          current_medications?: string | null
          dob?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          gender?: string | null
          id?: string
          is_active?: boolean | null
          known_allergies?: string | null
          name?: string
          phone?: string
        }
        Relationships: [
          {
            foreignKeyName: "patients_clinic_fk"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patients_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      pediatric_records: {
        Row: {
          clinic_id: string
          created_at: string
          developmental_concerns: string | null
          head_circumference_cm: number | null
          height_cm: number | null
          id: string
          milestone_notes: string | null
          patient_id: string
          temperature_c: number | null
          vaccination_given: string | null
          visit_date: string
          weight_kg: number | null
        }
        Insert: {
          clinic_id: string
          created_at?: string
          developmental_concerns?: string | null
          head_circumference_cm?: number | null
          height_cm?: number | null
          id?: string
          milestone_notes?: string | null
          patient_id: string
          temperature_c?: number | null
          vaccination_given?: string | null
          visit_date?: string
          weight_kg?: number | null
        }
        Update: {
          clinic_id?: string
          created_at?: string
          developmental_concerns?: string | null
          head_circumference_cm?: number | null
          height_cm?: number | null
          id?: string
          milestone_notes?: string | null
          patient_id?: string
          temperature_c?: number | null
          vaccination_given?: string | null
          visit_date?: string
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pediatric_records_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pediatric_records_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      physio_records: {
        Row: {
          appointment_id: string | null
          body_region: string | null
          clinic_id: string
          created_at: string
          exercise_protocol: Json
          id: string
          pain_score: number | null
          patient_id: string
          rom_data: Json
          session_notes: string | null
          session_number: number | null
        }
        Insert: {
          appointment_id?: string | null
          body_region?: string | null
          clinic_id: string
          created_at?: string
          exercise_protocol?: Json
          id?: string
          pain_score?: number | null
          patient_id: string
          rom_data?: Json
          session_notes?: string | null
          session_number?: number | null
        }
        Update: {
          appointment_id?: string | null
          body_region?: string | null
          clinic_id?: string
          created_at?: string
          exercise_protocol?: Json
          id?: string
          pain_score?: number | null
          patient_id?: string
          rom_data?: Json
          session_notes?: string | null
          session_number?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "physio_records_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "physio_records_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "physio_records_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      prescriptions: {
        Row: {
          appointment_id: string | null
          clinic_id: string | null
          created_at: string | null
          diagnosis: string | null
          doctor_id: string | null
          follow_up_date: string | null
          id: string
          medicines: Json | null
          notes: string | null
          patient_id: string | null
        }
        Insert: {
          appointment_id?: string | null
          clinic_id?: string | null
          created_at?: string | null
          diagnosis?: string | null
          doctor_id?: string | null
          follow_up_date?: string | null
          id?: string
          medicines?: Json | null
          notes?: string | null
          patient_id?: string | null
        }
        Update: {
          appointment_id?: string | null
          clinic_id?: string | null
          created_at?: string | null
          diagnosis?: string | null
          doctor_id?: string | null
          follow_up_date?: string | null
          id?: string
          medicines?: Json | null
          notes?: string | null
          patient_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prescriptions_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_clinic_fk"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      specialities: {
        Row: {
          color: string
          created_at: string
          description: string | null
          icon: string
          id: string
          name: string
          slug: string
          sort_order: number | null
        }
        Insert: {
          color: string
          created_at?: string
          description?: string | null
          icon: string
          id?: string
          name: string
          slug: string
          sort_order?: number | null
        }
        Update: {
          color?: string
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          name?: string
          slug?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      staff: {
        Row: {
          auth_user_id: string | null
          clinic_id: string | null
          created_at: string | null
          email: string | null
          id: string
          is_active: boolean | null
          is_super_admin: boolean | null
          name: string
          phone: string | null
          role: string | null
          user_id: string | null
        }
        Insert: {
          auth_user_id?: string | null
          clinic_id?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          is_super_admin?: boolean | null
          name: string
          phone?: string | null
          role?: string | null
          user_id?: string | null
        }
        Update: {
          auth_user_id?: string | null
          clinic_id?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          is_super_admin?: boolean | null
          name?: string
          phone?: string | null
          role?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_clinic_fk"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      super_admin_log: {
        Row: {
          action: string
          clinic_id: string | null
          clinic_name: string | null
          created_at: string | null
          id: string
          metadata: Json | null
          performed_by: string | null
        }
        Insert: {
          action: string
          clinic_id?: string | null
          clinic_name?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          performed_by?: string | null
        }
        Update: {
          action?: string
          clinic_id?: string | null
          clinic_name?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          performed_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "super_admin_log_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_clinic_id: { Args: never; Returns: string }
      get_current_staff_role: { Args: never; Returns: string }
      is_super_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
