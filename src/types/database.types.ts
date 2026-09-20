// ==============================================================================
// Supabase Database Type Definitions
// Generated and aligned with supabase/schema.sql
// ==============================================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// ------------------------------------------------------------------------------
// Database Enums
// ------------------------------------------------------------------------------
export type UserRole = "admin" | "technician";
export type MachineStatus = "Running" | "Stop" | "Alarm" | "Maintenance";
export type AlarmStatus = "Open" | "In Progress" | "Closed";
export type AlarmSeverity = "Low" | "Medium" | "High" | "Critical";
export type MaintenanceStatus = "Scheduled" | "In Progress" | "Completed";

// ------------------------------------------------------------------------------
// Supabase Client Database Interface
// ------------------------------------------------------------------------------
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          role: UserRole;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      machines: {
        Row: {
          id: string;
          machine_code: string;
          name: string;
          location: string;
          status: MachineStatus;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          machine_code: string;
          name: string;
          location: string;
          status?: MachineStatus;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          machine_code?: string;
          name?: string;
          location?: string;
          status?: MachineStatus;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "machines_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      alarms: {
        Row: {
          id: string;
          machine_id: string;
          title: string;
          description: string | null;
          severity: AlarmSeverity;
          status: AlarmStatus;
          acknowledged_by: string | null;
          resolved_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          machine_id: string;
          title: string;
          description?: string | null;
          severity?: AlarmSeverity;
          status?: AlarmStatus;
          acknowledged_by?: string | null;
          resolved_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          machine_id?: string;
          title?: string;
          description?: string | null;
          severity?: AlarmSeverity;
          status?: AlarmStatus;
          acknowledged_by?: string | null;
          resolved_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "alarms_machine_id_fkey";
            columns: ["machine_id"];
            isOneToOne: false;
            referencedRelation: "machines";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "alarms_acknowledged_by_fkey";
            columns: ["acknowledged_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      maintenance_records: {
        Row: {
          id: string;
          machine_id: string;
          technician_id: string;
          title: string;
          description: string | null;
          action_taken: string | null;
          status: MaintenanceStatus;
          scheduled_date: string;
          completed_date: string | null;
          cost: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          machine_id: string;
          technician_id: string;
          title: string;
          description?: string | null;
          action_taken?: string | null;
          status?: MaintenanceStatus;
          scheduled_date?: string;
          completed_date?: string | null;
          cost?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          machine_id?: string;
          technician_id?: string;
          title?: string;
          description?: string | null;
          action_taken?: string | null;
          status?: MaintenanceStatus;
          scheduled_date?: string;
          completed_date?: string | null;
          cost?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "maintenance_records_machine_id_fkey";
            columns: ["machine_id"];
            isOneToOne: false;
            referencedRelation: "machines";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "maintenance_records_technician_id_fkey";
            columns: ["technician_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      audit_logs: {
        Row: {
          id: string;
          table_name: string;
          record_id: string;
          action: string;
          changed_by: string | null;
          old_data: Json | null;
          new_data: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          table_name: string;
          record_id: string;
          action: string;
          changed_by?: string | null;
          old_data?: Json | null;
          new_data?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          table_name?: string;
          record_id?: string;
          action?: string;
          changed_by?: string | null;
          old_data?: Json | null;
          new_data?: Json | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "audit_logs_changed_by_fkey";
            columns: ["changed_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
    };
    Enums: {
      user_role: UserRole;
      machine_status: MachineStatus;
      alarm_status: AlarmStatus;
      alarm_severity: AlarmSeverity;
      maintenance_status: MaintenanceStatus;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// ------------------------------------------------------------------------------
// Entity Convenience Types
// ------------------------------------------------------------------------------
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

export type Machine = Database["public"]["Tables"]["machines"]["Row"];
export type MachineInsert = Database["public"]["Tables"]["machines"]["Insert"];
export type MachineUpdate = Database["public"]["Tables"]["machines"]["Update"];

export type Alarm = Database["public"]["Tables"]["alarms"]["Row"];
export type AlarmInsert = Database["public"]["Tables"]["alarms"]["Insert"];
export type AlarmUpdate = Database["public"]["Tables"]["alarms"]["Update"];

export type MaintenanceRecord = Database["public"]["Tables"]["maintenance_records"]["Row"];
export type MaintenanceRecordInsert = Database["public"]["Tables"]["maintenance_records"]["Insert"];
export type MaintenanceRecordUpdate = Database["public"]["Tables"]["maintenance_records"]["Update"];

export type AuditLog = Database["public"]["Tables"]["audit_logs"]["Row"];
export type AuditLogInsert = Database["public"]["Tables"]["audit_logs"]["Insert"];
export type AuditLogUpdate = Database["public"]["Tables"]["audit_logs"]["Update"];

// ------------------------------------------------------------------------------
// Joined / Relational Composite Types
// ------------------------------------------------------------------------------
export type AlarmWithRelations = Alarm & {
  machines: Pick<Machine, "id" | "machine_code" | "name" | "location"> | null;
  profiles?: Pick<Profile, "id" | "full_name" | "email"> | null;
};

export type MaintenanceWithRelations = MaintenanceRecord & {
  machines: Pick<Machine, "id" | "machine_code" | "name" | "location"> | null;
  profiles: Pick<Profile, "id" | "full_name" | "email"> | null;
};

export type MachineWithStats = Machine & {
  active_alarms_count?: number;
  pending_maintenance_count?: number;
};
