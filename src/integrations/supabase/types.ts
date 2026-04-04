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
          awb_number: string
          billed_rto: number | null
          billed_value: number | null
          billed_weight: number | null
          billed_zone: string | null
          courier: string
          created_at: string | null
          discrepancy_type: string
          expected_rto: number | null
          expected_value: number | null
          expected_weight: number | null
          expected_zone: string | null
          forward_charge: number | null
          id: string
          overcharge_amount: number | null
          resolution_notes: string | null
          resolved_at: string | null
          rto_percentage: number | null
          shipment_id: string | null
          status: string | null
          tenant_id: string
        }
        Insert: {
          awb_number: string
          billed_rto?: number | null
          billed_value?: number | null
          billed_weight?: number | null
          billed_zone?: string | null
          courier: string
          created_at?: string | null
          discrepancy_type: string
          expected_rto?: number | null
          expected_value?: number | null
          expected_weight?: number | null
          expected_zone?: string | null
          forward_charge?: number | null
          id?: string
          overcharge_amount?: number | null
          resolution_notes?: string | null
          resolved_at?: string | null
          rto_percentage?: number | null
          shipment_id?: string | null
          status?: string | null
          tenant_id: string
        }
        Update: {
          awb_number?: string
          billed_rto?: number | null
          billed_value?: number | null
          billed_weight?: number | null
          billed_zone?: string | null
          courier?: string
          created_at?: string | null
          discrepancy_type?: string
          expected_rto?: number | null
          expected_value?: number | null
          expected_weight?: number | null
          expected_zone?: string | null
          forward_charge?: number | null
          id?: string
          overcharge_amount?: number | null
          resolution_notes?: string | null
          resolved_at?: string | null
          rto_percentage?: number | null
          shipment_id?: string | null
          status?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments"
            referencedColumns: ["id"]
          },
        ]
      }
      city_zone_mapping: {
        Row: {
          courier: string
          destination_city: string
          destination_state: string
          id: string
          origin_city: string
          origin_state: string
          tenant_id: string
          zone: string
        }
        Insert: {
          courier: string
          destination_city: string
          destination_state: string
          id?: string
          origin_city: string
          origin_state: string
          tenant_id: string
          zone: string
        }
        Update: {
          courier?: string
          destination_city?: string
          destination_state?: string
          id?: string
          origin_city?: string
          origin_state?: string
          tenant_id?: string
          zone?: string
        }
        Relationships: []
      }
      contact_submissions: {
        Row: {
          company: string | null
          created_at: string | null
          email: string
          id: string
          message: string
          monthly_shipments: string | null
          name: string
          phone: string | null
          source: string | null
          status: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string | null
          email: string
          id?: string
          message: string
          monthly_shipments?: string | null
          name: string
          phone?: string | null
          source?: string | null
          status?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string | null
          email?: string
          id?: string
          message?: string
          monthly_shipments?: string | null
          name?: string
          phone?: string | null
          source?: string | null
          status?: string | null
        }
        Relationships: []
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
      courier_rate_cards: {
        Row: {
          additional_rate_per_kg: number | null
          base_rate: number
          cod_charge: number | null
          courier_code: string
          courier_name: string
          courier_type: string | null
          created_at: string | null
          effective_from: string | null
          fuel_surcharge_percent: number | null
          id: string
          is_active: boolean | null
          rto_charge_percent: number | null
          weight_slab_end: number
          weight_slab_start: number
          zone: string
        }
        Insert: {
          additional_rate_per_kg?: number | null
          base_rate: number
          cod_charge?: number | null
          courier_code: string
          courier_name: string
          courier_type?: string | null
          created_at?: string | null
          effective_from?: string | null
          fuel_surcharge_percent?: number | null
          id?: string
          is_active?: boolean | null
          rto_charge_percent?: number | null
          weight_slab_end: number
          weight_slab_start: number
          zone: string
        }
        Update: {
          additional_rate_per_kg?: number | null
          base_rate?: number
          cod_charge?: number | null
          courier_code?: string
          courier_name?: string
          courier_type?: string | null
          created_at?: string | null
          effective_from?: string | null
          fuel_surcharge_percent?: number | null
          id?: string
          is_active?: boolean | null
          rto_charge_percent?: number | null
          weight_slab_end?: number
          weight_slab_start?: number
          zone?: string
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
          expires_at?: string
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
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          link: string | null
          message: string | null
          tenant_id: string | null
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          message?: string | null
          tenant_id?: string | null
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          message?: string | null
          tenant_id?: string | null
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      pincode_circle_map: {
        Row: {
          circle: string
          prefix_end: number
          prefix_start: number
          region_label: string | null
          state: string | null
        }
        Insert: {
          circle: string
          prefix_end: number
          prefix_start: number
          region_label?: string | null
          state?: string | null
        }
        Update: {
          circle?: string
          prefix_end?: number
          prefix_start?: number
          region_label?: string | null
          state?: string | null
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
          courier: string
          created_at: string | null
          created_by: string | null
          effective_from: string
          effective_to: string | null
          id: string
          is_active: boolean | null
          rate_structure: Json
          rto_percentage: number | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          courier: string
          created_at?: string | null
          created_by?: string | null
          effective_from?: string
          effective_to?: string | null
          id?: string
          is_active?: boolean | null
          rate_structure: Json
          rto_percentage?: number | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          courier?: string
          created_at?: string | null
          created_by?: string | null
          effective_from?: string
          effective_to?: string | null
          id?: string
          is_active?: boolean | null
          rate_structure?: Json
          rto_percentage?: number | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          action: string
          attempted_at: string
          id: string
          identifier: string
        }
        Insert: {
          action: string
          attempted_at?: string
          id?: string
          identifier: string
        }
        Update: {
          action?: string
          attempted_at?: string
          id?: string
          identifier?: string
        }
        Relationships: []
      }
      shipments: {
        Row: {
          actual_weight: number | null
          awb_number: string
          billed_amount: number | null
          billed_weight: number | null
          billed_zone: string | null
          cod_amount: number | null
          cod_charge: number | null
          courier: string
          created_at: string | null
          destination_city: string | null
          destination_state: string | null
          forward_charge: number | null
          fuel_surcharge: number | null
          height_cm: number | null
          id: string
          is_rto: boolean | null
          length_cm: number | null
          order_id: string | null
          origin_city: string | null
          origin_state: string | null
          payment_mode: string | null
          product_type: string | null
          rto_charge: number | null
          shipment_date: string | null
          status: string | null
          tenant_id: string
          updated_at: string | null
          uploaded_by: string | null
          volumetric_weight: number | null
          width_cm: number | null
        }
        Insert: {
          actual_weight?: number | null
          awb_number: string
          billed_amount?: number | null
          billed_weight?: number | null
          billed_zone?: string | null
          cod_amount?: number | null
          cod_charge?: number | null
          courier: string
          created_at?: string | null
          destination_city?: string | null
          destination_state?: string | null
          forward_charge?: number | null
          fuel_surcharge?: number | null
          height_cm?: number | null
          id?: string
          is_rto?: boolean | null
          length_cm?: number | null
          order_id?: string | null
          origin_city?: string | null
          origin_state?: string | null
          payment_mode?: string | null
          product_type?: string | null
          rto_charge?: number | null
          shipment_date?: string | null
          status?: string | null
          tenant_id: string
          updated_at?: string | null
          uploaded_by?: string | null
          volumetric_weight?: number | null
          width_cm?: number | null
        }
        Update: {
          actual_weight?: number | null
          awb_number?: string
          billed_amount?: number | null
          billed_weight?: number | null
          billed_zone?: string | null
          cod_amount?: number | null
          cod_charge?: number | null
          courier?: string
          created_at?: string | null
          destination_city?: string | null
          destination_state?: string | null
          forward_charge?: number | null
          fuel_surcharge?: number | null
          height_cm?: number | null
          id?: string
          is_rto?: boolean | null
          length_cm?: number | null
          order_id?: string | null
          origin_city?: string | null
          origin_state?: string | null
          payment_mode?: string | null
          product_type?: string | null
          rto_charge?: number | null
          shipment_date?: string | null
          status?: string | null
          tenant_id?: string
          updated_at?: string | null
          uploaded_by?: string | null
          volumetric_weight?: number | null
          width_cm?: number | null
        }
        Relationships: []
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
          is_active: boolean
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
          is_active?: boolean
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
          is_active?: boolean
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
      zone_circle_matrix: {
        Row: {
          destination_circle: string
          origin_circle: string
          zone_code: string
        }
        Insert: {
          destination_circle: string
          origin_circle: string
          zone_code: string
        }
        Update: {
          destination_circle?: string
          origin_circle?: string
          zone_code?: string
        }
        Relationships: []
      }
      zone_mapping: {
        Row: {
          courier_id: string
          destination_circle: string
          destination_pincode: string
          id: string
          is_fallback: boolean
          resolved_at: string
          source_circle: string
          source_pincode: string
          tenant_id: string
          zone_code: string
        }
        Insert: {
          courier_id: string
          destination_circle: string
          destination_pincode: string
          id?: string
          is_fallback?: boolean
          resolved_at?: string
          source_circle: string
          source_pincode: string
          tenant_id: string
          zone_code: string
        }
        Update: {
          courier_id?: string
          destination_circle?: string
          destination_pincode?: string
          id?: string
          is_fallback?: boolean
          resolved_at?: string
          source_circle?: string
          source_pincode?: string
          tenant_id?: string
          zone_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "zone_mapping_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      zone_master: {
        Row: {
          created_at: string | null
          destination_pincode_end: string
          destination_pincode_start: string
          distance_km_approx: number | null
          id: string
          origin_pincode_end: string
          origin_pincode_start: string
          zone: string
          zone_type: string | null
        }
        Insert: {
          created_at?: string | null
          destination_pincode_end: string
          destination_pincode_start: string
          distance_km_approx?: number | null
          id?: string
          origin_pincode_end: string
          origin_pincode_start: string
          zone: string
          zone_type?: string | null
        }
        Update: {
          created_at?: string | null
          destination_pincode_end?: string
          destination_pincode_start?: string
          distance_km_approx?: number | null
          id?: string
          origin_pincode_end?: string
          origin_pincode_start?: string
          zone?: string
          zone_type?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_invitation: { Args: { token_value: string }; Returns: Json }
      auth_user_role: { Args: never; Returns: string }
      auth_user_tenant_id: { Args: never; Returns: string }
      check_rate_limit: {
        Args: {
          p_action: string
          p_identifier: string
          p_max_attempts?: number
          p_window_minutes?: number
        }
        Returns: boolean
      }
      create_team_invitation: {
        Args: {
          p_email: string
          p_first_name?: string
          p_invited_by: string
          p_last_name?: string
          p_role: string
          p_tenant_id: string
        }
        Returns: Json
      }
      custom_access_token_hook: { Args: { event: Json }; Returns: Json }
      expire_old_invitations: { Args: never; Returns: number }
      generate_dispute_email: {
        Args: {
          p_audit_log_id: string
          p_generated_by: string
          p_tenant_id: string
        }
        Returns: Json
      }
      generate_monthly_invoice: {
        Args: {
          p_billing_month: string
          p_generated_by: string
          p_tenant_id: string
        }
        Returns: Json
      }
      get_my_claim: { Args: { claim: string }; Returns: string }
      get_my_profile: {
        Args: never
        Returns: {
          created_at: string
          created_by: string
          email: string
          full_name: string
          id: string
          is_active: boolean
          last_login: string
          notification_preferences: Json
          phone: string
          role: string
          tenant_id: string
          updated_at: string
          updated_by: string
        }[]
      }
      get_user_profile_for_login: {
        Args: { lookup_user_id: string }
        Returns: {
          email: string
          full_name: string
          id: string
          is_active: boolean
          last_login: string
          notification_preferences: Json
          phone: string
          role: string
          tenant_id: string
        }[]
      }
      log_activity:
        | {
            Args: {
              p_action: string
              p_details?: Json
              p_entity_id?: string
              p_entity_type?: string
            }
            Returns: Json
          }
        | {
            Args: {
              p_action: string
              p_details?: string
              p_entity_id?: string
              p_entity_type?: string
              p_new_values?: Json
              p_old_values?: Json
            }
            Returns: undefined
          }
      notify_tenant_users: {
        Args: {
          p_link?: string
          p_message?: string
          p_only_user_id?: string
          p_tenant_id: string
          p_title: string
          p_type?: string
        }
        Returns: undefined
      }
      process_csv_upload: {
        Args: { p_shipments: Json; p_tenant_id: string; p_uploaded_by: string }
        Returns: Json
      }
      resolve_zone_mapping: {
        Args: {
          p_courier_id: string
          p_dest_pincode: string
          p_source_pincode: string
          p_tenant_id: string
        }
        Returns: {
          dest_circle: string
          is_fallback: boolean
          source_circle: string
          zone_code: string
        }[]
      }
      resolve_zone_mapping_batch: {
        Args: { p_courier_id: string; p_pairs: Json; p_tenant_id: string }
        Returns: {
          dst: string
          src: string
          zone_code: string
        }[]
      }
      update_dispute_status: {
        Args: {
          p_dispute_id: string
          p_follow_up_date?: string
          p_new_status: string
          p_notes?: string
          p_recovered_amount?: number
          p_updated_by: string
        }
        Returns: Json
      }
      update_last_login: {
        Args: { lookup_user_id: string }
        Returns: undefined
      }
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
