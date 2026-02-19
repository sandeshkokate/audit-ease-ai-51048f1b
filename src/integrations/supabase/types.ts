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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          created_at: string | null
          details: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          ip_address: unknown
          new_values: Json | null
          old_values: Json | null
          tenant_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          tenant_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          tenant_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          awb: string | null
          billed_amount: number | null
          box_count: number | null
          breadth_cm: number | null
          charged_weight: number | null
          charged_zone: string | null
          courier_name: string | null
          created_at: string | null
          created_by: string | null
          credit_note_date: string | null
          credit_note_number: string | null
          customer_pincode: string | null
          dead_weight: number | null
          delivery_date: string | null
          dimensions_json: Json | null
          discrepancy_amount: number | null
          discrepancy_reasons: Json | null
          dispute_email_id: string | null
          dispute_raised_date: string | null
          dispute_status: string | null
          escalated: boolean | null
          escalated_at: string | null
          escalation_reason: string | null
          expected_amount: number | null
          expected_zone: string | null
          follow_up_date: string | null
          has_damage_misclassification: boolean | null
          has_rto_overcharge: boolean | null
          has_weight_discrepancy: boolean | null
          has_zone_discrepancy: boolean | null
          height_cm: number | null
          id: string
          is_rto: boolean | null
          length_cm: number | null
          max_expected_weight: number | null
          order_date: string | null
          order_id: string
          origin_pincode: string | null
          priority: string | null
          recovery_amount: number | null
          recovery_date: string | null
          rejected_at: string | null
          rejection_reason: string | null
          rto_reason: string | null
          shipment_status: string | null
          tenant_id: string
          updated_at: string | null
          updated_by: string | null
          upload_batch_id: string | null
          volumetric_weight: number | null
        }
        Insert: {
          awb?: string | null
          billed_amount?: number | null
          box_count?: number | null
          breadth_cm?: number | null
          charged_weight?: number | null
          charged_zone?: string | null
          courier_name?: string | null
          created_at?: string | null
          created_by?: string | null
          credit_note_date?: string | null
          credit_note_number?: string | null
          customer_pincode?: string | null
          dead_weight?: number | null
          delivery_date?: string | null
          dimensions_json?: Json | null
          discrepancy_amount?: number | null
          discrepancy_reasons?: Json | null
          dispute_email_id?: string | null
          dispute_raised_date?: string | null
          dispute_status?: string | null
          escalated?: boolean | null
          escalated_at?: string | null
          escalation_reason?: string | null
          expected_amount?: number | null
          expected_zone?: string | null
          follow_up_date?: string | null
          has_damage_misclassification?: boolean | null
          has_rto_overcharge?: boolean | null
          has_weight_discrepancy?: boolean | null
          has_zone_discrepancy?: boolean | null
          height_cm?: number | null
          id?: string
          is_rto?: boolean | null
          length_cm?: number | null
          max_expected_weight?: number | null
          order_date?: string | null
          order_id: string
          origin_pincode?: string | null
          priority?: string | null
          recovery_amount?: number | null
          recovery_date?: string | null
          rejected_at?: string | null
          rejection_reason?: string | null
          rto_reason?: string | null
          shipment_status?: string | null
          tenant_id: string
          updated_at?: string | null
          updated_by?: string | null
          upload_batch_id?: string | null
          volumetric_weight?: number | null
        }
        Update: {
          awb?: string | null
          billed_amount?: number | null
          box_count?: number | null
          breadth_cm?: number | null
          charged_weight?: number | null
          charged_zone?: string | null
          courier_name?: string | null
          created_at?: string | null
          created_by?: string | null
          credit_note_date?: string | null
          credit_note_number?: string | null
          customer_pincode?: string | null
          dead_weight?: number | null
          delivery_date?: string | null
          dimensions_json?: Json | null
          discrepancy_amount?: number | null
          discrepancy_reasons?: Json | null
          dispute_email_id?: string | null
          dispute_raised_date?: string | null
          dispute_status?: string | null
          escalated?: boolean | null
          escalated_at?: string | null
          escalation_reason?: string | null
          expected_amount?: number | null
          expected_zone?: string | null
          follow_up_date?: string | null
          has_damage_misclassification?: boolean | null
          has_rto_overcharge?: boolean | null
          has_weight_discrepancy?: boolean | null
          has_zone_discrepancy?: boolean | null
          height_cm?: number | null
          id?: string
          is_rto?: boolean | null
          length_cm?: number | null
          max_expected_weight?: number | null
          order_date?: string | null
          order_id?: string
          origin_pincode?: string | null
          priority?: string | null
          recovery_amount?: number | null
          recovery_date?: string | null
          rejected_at?: string | null
          rejection_reason?: string | null
          rto_reason?: string | null
          shipment_status?: string | null
          tenant_id?: string
          updated_at?: string | null
          updated_by?: string | null
          upload_batch_id?: string | null
          volumetric_weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_upload_batch_id_fkey"
            columns: ["upload_batch_id"]
            isOneToOne: false
            referencedRelation: "upload_batches"
            referencedColumns: ["id"]
          },
        ]
      }
      courier_master: {
        Row: {
          api_available: boolean | null
          api_documentation: string | null
          courier_code: string
          courier_name: string
          created_at: string | null
          customer_support_email: string | null
          dispute_email: string | null
          id: string
          is_active: boolean | null
          phone: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          api_available?: boolean | null
          api_documentation?: string | null
          courier_code: string
          courier_name: string
          created_at?: string | null
          customer_support_email?: string | null
          dispute_email?: string | null
          id?: string
          is_active?: boolean | null
          phone?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          api_available?: boolean | null
          api_documentation?: string | null
          courier_code?: string
          courier_name?: string
          created_at?: string | null
          customer_support_email?: string | null
          dispute_email?: string | null
          id?: string
          is_active?: boolean | null
          phone?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      credit_notes: {
        Row: {
          amount: number
          awb: string | null
          courier_name: string | null
          created_at: string | null
          created_by: string | null
          credit_date: string | null
          credit_note_number: string
          id: string
          match_status: string | null
          matched_at: string | null
          matched_audit_log_id: string | null
          matched_by: string | null
          notes: string | null
          order_id: string | null
          tenant_id: string
          upload_batch_id: string | null
        }
        Insert: {
          amount: number
          awb?: string | null
          courier_name?: string | null
          created_at?: string | null
          created_by?: string | null
          credit_date?: string | null
          credit_note_number: string
          id?: string
          match_status?: string | null
          matched_at?: string | null
          matched_audit_log_id?: string | null
          matched_by?: string | null
          notes?: string | null
          order_id?: string | null
          tenant_id: string
          upload_batch_id?: string | null
        }
        Update: {
          amount?: number
          awb?: string | null
          courier_name?: string | null
          created_at?: string | null
          created_by?: string | null
          credit_date?: string | null
          credit_note_number?: string
          id?: string
          match_status?: string | null
          matched_at?: string | null
          matched_audit_log_id?: string | null
          matched_by?: string | null
          notes?: string | null
          order_id?: string | null
          tenant_id?: string
          upload_batch_id?: string | null
        }
        Relationships: []
      }
      dispute_emails: {
        Row: {
          attachments: Json | null
          audit_log_id: string | null
          body: string
          cc_emails: string[] | null
          copied_at: string | null
          courier_email: string | null
          courier_name: string | null
          created_at: string | null
          created_by: string | null
          dispute_reasoning: Json | null
          email_template_used: string | null
          follow_up_scheduled: string | null
          id: string
          is_copied: boolean | null
          is_marked_sent: boolean | null
          marked_sent_at: string | null
          marked_sent_by: string | null
          subject: string | null
          tenant_id: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          attachments?: Json | null
          audit_log_id?: string | null
          body: string
          cc_emails?: string[] | null
          copied_at?: string | null
          courier_email?: string | null
          courier_name?: string | null
          created_at?: string | null
          created_by?: string | null
          dispute_reasoning?: Json | null
          email_template_used?: string | null
          follow_up_scheduled?: string | null
          id?: string
          is_copied?: boolean | null
          is_marked_sent?: boolean | null
          marked_sent_at?: string | null
          marked_sent_by?: string | null
          subject?: string | null
          tenant_id: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          attachments?: Json | null
          audit_log_id?: string | null
          body?: string
          cc_emails?: string[] | null
          copied_at?: string | null
          courier_email?: string | null
          courier_name?: string | null
          created_at?: string | null
          created_by?: string | null
          dispute_reasoning?: Json | null
          email_template_used?: string | null
          follow_up_scheduled?: string | null
          id?: string
          is_copied?: boolean | null
          is_marked_sent?: boolean | null
          marked_sent_at?: string | null
          marked_sent_by?: string | null
          subject?: string | null
          tenant_id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dispute_emails_audit_log_id_fkey"
            columns: ["audit_log_id"]
            isOneToOne: false
            referencedRelation: "audit_logs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dispute_emails_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      dispute_notes: {
        Row: {
          audit_log_id: string
          created_at: string | null
          id: string
          note: string
          note_type: string | null
          tenant_id: string
          user_id: string
        }
        Insert: {
          audit_log_id: string
          created_at?: string | null
          id?: string
          note: string
          note_type?: string | null
          tenant_id: string
          user_id: string
        }
        Update: {
          audit_log_id?: string
          created_at?: string | null
          id?: string
          note?: string
          note_type?: string | null
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dispute_notes_audit_log_id_fkey"
            columns: ["audit_log_id"]
            isOneToOne: false
            referencedRelation: "audit_logs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dispute_notes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dispute_notes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      email_templates: {
        Row: {
          body_template: string
          courier_name: string | null
          created_at: string | null
          description: string | null
          discrepancy_type: string | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          language: string | null
          subject_template: string
          template_code: string
          template_name: string
          updated_at: string | null
        }
        Insert: {
          body_template: string
          courier_name?: string | null
          created_at?: string | null
          description?: string | null
          discrepancy_type?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          language?: string | null
          subject_template: string
          template_code: string
          template_name: string
          updated_at?: string | null
        }
        Update: {
          body_template?: string
          courier_name?: string | null
          created_at?: string | null
          description?: string | null
          discrepancy_type?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          language?: string | null
          subject_template?: string
          template_code?: string
          template_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      feature_flags: {
        Row: {
          created_at: string | null
          description: string | null
          enabled: boolean | null
          flag_key: string
          id: string
          label: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          enabled?: boolean | null
          flag_key: string
          id?: string
          label: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          enabled?: boolean | null
          flag_key?: string
          id?: string
          label?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      invitations: {
        Row: {
          accepted_at: string | null
          created_at: string | null
          email: string
          expires_at: string
          id: string
          invite_status: string | null
          invited_by: string
          role: string
          tenant_id: string
          token: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string | null
          email: string
          expires_at: string
          id?: string
          invite_status?: string | null
          invited_by: string
          role?: string
          tenant_id: string
          token: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          invite_status?: string | null
          invited_by?: string
          role?: string
          tenant_id?: string
          token?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          adjustment_amount: number | null
          adjustment_reason: string | null
          commission_amount: number
          commission_percentage: number
          created_at: string | null
          created_by: string | null
          due_date: string | null
          gst_amount: number | null
          gst_percentage: number | null
          id: string
          invoice_number: string
          invoice_period_end: string
          invoice_period_start: string
          line_items: Json
          paid_date: string | null
          payment_method: string | null
          payment_reference: string | null
          pdf_url: string | null
          status: string | null
          tenant_id: string
          total_amount: number
          total_recovered: number
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          adjustment_amount?: number | null
          adjustment_reason?: string | null
          commission_amount: number
          commission_percentage: number
          created_at?: string | null
          created_by?: string | null
          due_date?: string | null
          gst_amount?: number | null
          gst_percentage?: number | null
          id?: string
          invoice_number: string
          invoice_period_end: string
          invoice_period_start: string
          line_items?: Json
          paid_date?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          pdf_url?: string | null
          status?: string | null
          tenant_id: string
          total_amount: number
          total_recovered: number
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          adjustment_amount?: number | null
          adjustment_reason?: string | null
          commission_amount?: number
          commission_percentage?: number
          created_at?: string | null
          created_by?: string | null
          due_date?: string | null
          gst_amount?: number | null
          gst_percentage?: number | null
          id?: string
          invoice_number?: string
          invoice_period_end?: string
          invoice_period_start?: string
          line_items?: Json
          paid_date?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          pdf_url?: string | null
          status?: string | null
          tenant_id?: string
          total_amount?: number
          total_recovered?: number
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          company: string | null
          created_at: string | null
          email: string
          id: string
          lead_status: string | null
          message: string | null
          monthly_shipments: string | null
          name: string
          notes: string | null
          phone: string | null
          source: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string | null
          email: string
          id?: string
          lead_status?: string | null
          message?: string | null
          monthly_shipments?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          source?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string | null
          email?: string
          id?: string
          lead_status?: string | null
          message?: string | null
          monthly_shipments?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          source?: string | null
        }
        Relationships: []
      }
      pincode_zone_master: {
        Row: {
          city: string | null
          created_at: string | null
          id: string
          is_serviceable: boolean | null
          pincode: string
          state: string | null
          updated_at: string | null
          zone_bluedart: string | null
          zone_delhivery: string | null
          zone_dtdc: string | null
          zone_ecom: string | null
          zone_xpressbees: string | null
        }
        Insert: {
          city?: string | null
          created_at?: string | null
          id?: string
          is_serviceable?: boolean | null
          pincode: string
          state?: string | null
          updated_at?: string | null
          zone_bluedart?: string | null
          zone_delhivery?: string | null
          zone_dtdc?: string | null
          zone_ecom?: string | null
          zone_xpressbees?: string | null
        }
        Update: {
          city?: string | null
          created_at?: string | null
          id?: string
          is_serviceable?: boolean | null
          pincode?: string
          state?: string | null
          updated_at?: string | null
          zone_bluedart?: string | null
          zone_delhivery?: string | null
          zone_dtdc?: string | null
          zone_ecom?: string | null
          zone_xpressbees?: string | null
        }
        Relationships: []
      }
      platform_settings: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_system: boolean | null
          setting_key: string
          setting_value: Json
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_system?: boolean | null
          setting_key: string
          setting_value: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_system?: boolean | null
          setting_key?: string
          setting_value?: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      rate_cards: {
        Row: {
          contract_pdf_url: string | null
          courier_name: string
          created_at: string | null
          created_by: string | null
          divisor: number | null
          effective_from: string
          effective_to: string | null
          id: string
          is_active: boolean | null
          min_chargeable_weight: number | null
          rate_structure: Json
          rto_percentage: number | null
          tenant_id: string
          updated_at: string | null
          updated_by: string | null
          uploaded_via: string | null
        }
        Insert: {
          contract_pdf_url?: string | null
          courier_name: string
          created_at?: string | null
          created_by?: string | null
          divisor?: number | null
          effective_from: string
          effective_to?: string | null
          id?: string
          is_active?: boolean | null
          min_chargeable_weight?: number | null
          rate_structure?: Json
          rto_percentage?: number | null
          tenant_id: string
          updated_at?: string | null
          updated_by?: string | null
          uploaded_via?: string | null
        }
        Update: {
          contract_pdf_url?: string | null
          courier_name?: string
          created_at?: string | null
          created_by?: string | null
          divisor?: number | null
          effective_from?: string
          effective_to?: string | null
          id?: string
          is_active?: boolean | null
          min_chargeable_weight?: number | null
          rate_structure?: Json
          rto_percentage?: number | null
          tenant_id?: string
          updated_at?: string | null
          updated_by?: string | null
          uploaded_via?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rate_cards_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_feature_access: {
        Row: {
          created_at: string | null
          expires_at: string | null
          feature_name: string
          granted_at: string | null
          granted_by: string | null
          id: string
          is_enabled: boolean | null
          tenant_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          feature_name: string
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          is_enabled?: boolean | null
          tenant_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          feature_name?: string
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          is_enabled?: boolean | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_feature_access_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          address: string | null
          city: string | null
          commission_percentage: number | null
          company_name: string
          contact_email: string
          contact_person: string | null
          contact_phone: string | null
          created_at: string | null
          created_by: string | null
          credit_balance: number | null
          email_signature: string | null
          email_tone: string | null
          gstin: string | null
          id: string
          onboarding_date: string | null
          pincode: string | null
          state: string | null
          status: string | null
          subscription_plan: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          commission_percentage?: number | null
          company_name: string
          contact_email: string
          contact_person?: string | null
          contact_phone?: string | null
          created_at?: string | null
          created_by?: string | null
          credit_balance?: number | null
          email_signature?: string | null
          email_tone?: string | null
          gstin?: string | null
          id?: string
          onboarding_date?: string | null
          pincode?: string | null
          state?: string | null
          status?: string | null
          subscription_plan?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          commission_percentage?: number | null
          company_name?: string
          contact_email?: string
          contact_person?: string | null
          contact_phone?: string | null
          created_at?: string | null
          created_by?: string | null
          credit_balance?: number | null
          email_signature?: string | null
          email_tone?: string | null
          gstin?: string | null
          id?: string
          onboarding_date?: string | null
          pincode?: string | null
          state?: string | null
          status?: string | null
          subscription_plan?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      upload_batches: {
        Row: {
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          discrepancy_rows: number | null
          error_log: Json | null
          failed_rows: number | null
          file_size: number | null
          filename: string
          id: string
          processed_rows: number | null
          started_at: string | null
          status: string | null
          tenant_id: string
          total_rows: number | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          discrepancy_rows?: number | null
          error_log?: Json | null
          failed_rows?: number | null
          file_size?: number | null
          filename: string
          id?: string
          processed_rows?: number | null
          started_at?: string | null
          status?: string | null
          tenant_id: string
          total_rows?: number | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          discrepancy_rows?: number | null
          error_log?: Json | null
          failed_rows?: number | null
          file_size?: number | null
          filename?: string
          id?: string
          processed_rows?: number | null
          started_at?: string | null
          status?: string | null
          tenant_id?: string
          total_rows?: number | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "upload_batches_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          created_by: string | null
          email: string
          full_name: string | null
          id: string
          is_active: boolean | null
          last_login: string | null
          notification_preferences: Json | null
          phone: string | null
          role: string
          tenant_id: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          email: string
          full_name?: string | null
          id: string
          is_active?: boolean | null
          last_login?: string | null
          notification_preferences?: Json | null
          phone?: string | null
          role: string
          tenant_id?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          email?: string
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          notification_preferences?: Json | null
          phone?: string | null
          role?: string
          tenant_id?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_my_claim: { Args: { claim: string }; Returns: string }
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
