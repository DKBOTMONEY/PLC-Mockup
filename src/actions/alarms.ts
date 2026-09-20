"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAlarmSchema, updateAlarmStatusSchema } from "@/lib/validations/alarm";
import { AlarmWithRelations, AlarmStatus, AlarmSeverity } from "@/types/database.types";

export type ActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

export interface AlarmFilters {
  query?: string;
  machineId?: string;
  status?: string;
  severity?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * Get alarms with relational machine & acknowledged_by profiles
 */
export async function getAlarms(filters?: AlarmFilters): Promise<AlarmWithRelations[]> {
  const supabase = await createClient();

  let query = supabase
    .from("alarms")
    .select(`
      *,
      machines:machine_id (id, machine_code, name, location),
      profiles:acknowledged_by (id, full_name, email)
    `)
    .order("created_at", { ascending: false });

  if (filters?.machineId && filters.machineId !== "ALL") {
    query = query.eq("machine_id", filters.machineId);
  }

  if (filters?.status && filters.status !== "ALL") {
    query = query.eq("status", filters.status as AlarmStatus);
  }

  if (filters?.severity && filters.severity !== "ALL") {
    query = query.eq("severity", filters.severity as AlarmSeverity);
  }

  if (filters?.startDate) {
    query = query.gte("created_at", new Date(filters.startDate).toISOString());
  }

  if (filters?.endDate) {
    // Set to end of the day
    const end = new Date(filters.endDate);
    end.setHours(23, 59, 59, 999);
    query = query.lte("created_at", end.toISOString());
  }

  if (filters?.query && filters.query.trim() !== "") {
    const term = `%${filters.query.trim()}%`;
    query = query.or(`title.ilike.${term},description.ilike.${term}`);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Error fetching alarms:", error.message);
    return [];
  }

  return (data as unknown) as AlarmWithRelations[];
}

/**
 * Report/Create a new Alarm
 */
export async function createAlarm(rawData: unknown): Promise<ActionResult> {
  const validation = createAlarmSchema.safeParse(rawData);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.errors[0]?.message || "ข้อมูลไม่ถูกต้อง",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const insertPayload = {
    machine_id: validation.data.machine_id,
    title: validation.data.title,
    description: validation.data.description || null,
    severity: validation.data.severity,
    status: validation.data.status,
    acknowledged_by: user ? user.id : null,
  };

  const { data, error } = await supabase
    .from("alarms")
    // @ts-expect-error Supabase SSR generic schema mapping
    .insert(insertPayload)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/alarms");
  revalidatePath("/machines");
  revalidatePath("/");
  return { success: true, data };
}

/**
 * Update Alarm Status (Open -> In Progress -> Closed)
 */
export async function updateAlarmStatus(
  alarmId: string,
  newStatus: AlarmStatus
): Promise<ActionResult> {
  const validation = updateAlarmStatusSchema.safeParse({ status: newStatus });
  if (!validation.success) {
    return { success: false, error: "สถานะไม่ถูกต้อง" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const updatePayload: {
    status: AlarmStatus;
    acknowledged_by?: string | null;
    resolved_at?: string | null;
  } = {
    status: newStatus,
  };

  if (user) {
    updatePayload.acknowledged_by = user.id;
  }

  if (newStatus === "Closed") {
    updatePayload.resolved_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from("alarms")
    // @ts-expect-error Supabase SSR generic schema mapping
    .update(updatePayload)
    .eq("id", alarmId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/alarms");
  revalidatePath("/machines");
  revalidatePath("/");
  return { success: true };
}
