"use server";

import { createClient } from "@/lib/supabase/server";
import { getUserProfile } from "@/actions/auth";
import { AuditLog, Profile } from "@/types/database.types";

export type AuditLogWithProfile = AuditLog & {
  profiles?: Pick<Profile, "id" | "full_name" | "email"> | null;
};

/**
 * Get audit trail logs (Admin only)
 */
export async function getAuditLogs(): Promise<AuditLogWithProfile[]> {
  const profile = await getUserProfile();
  if (profile?.role !== "admin") {
    return [];
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("audit_logs")
    .select(`
      *,
      profiles:changed_by (id, full_name, email)
    `)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    console.error("Error fetching audit logs:", error.message);
    return [];
  }

  return (data as unknown) as AuditLogWithProfile[];
}
