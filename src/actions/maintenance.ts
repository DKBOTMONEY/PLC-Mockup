"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { maintenanceSchema } from "@/lib/validations/maintenance";
import {
  MaintenanceWithRelations,
  MaintenanceStatus,
} from "@/types/database.types";

export type ActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

export interface MaintenanceFilters {
  query?: string;
  machineId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * Get maintenance records with relational machine & technician profiles
 */
export async function getMaintenanceRecords(
  filters?: MaintenanceFilters
): Promise<MaintenanceWithRelations[]> {
  const supabase = await createClient();

  let query = supabase
    .from("maintenance_records")
    .select(`
      *,
      machines:machine_id (id, machine_code, name, location),
      profiles:technician_id (id, full_name, email)
    `)
    .order("scheduled_date", { ascending: false });

  if (filters?.machineId && filters.machineId !== "ALL") {
    query = query.eq("machine_id", filters.machineId);
  }

  if (filters?.status && filters.status !== "ALL") {
    query = query.eq("status", filters.status as MaintenanceStatus);
  }

  if (filters?.startDate) {
    query = query.gte("scheduled_date", filters.startDate);
  }

  if (filters?.endDate) {
    query = query.lte("scheduled_date", filters.endDate);
  }

  if (filters?.query && filters.query.trim() !== "") {
    const term = `%${filters.query.trim()}%`;
    query = query.or(`title.ilike.${term},description.ilike.${term},action_taken.ilike.${term}`);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Error fetching maintenance records:", error.message);
    return [];
  }

  return (data as unknown) as MaintenanceWithRelations[];
}

/**
 * Create a new maintenance record
 */
export async function createMaintenanceRecord(
  rawData: unknown
): Promise<ActionResult> {
  const validation = maintenanceSchema.safeParse(rawData);
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

  if (!user) {
    return { success: false, error: "กรุณาเข้าสู่ระบบก่อนดำเนินการ" };
  }

  const technicianId = validation.data.technician_id || user.id;

  const insertPayload = {
    machine_id: validation.data.machine_id,
    technician_id: technicianId,
    title: validation.data.title,
    description: validation.data.description || null,
    action_taken: validation.data.action_taken || null,
    status: validation.data.status,
    scheduled_date: validation.data.scheduled_date,
    cost: validation.data.cost,
    completed_date:
      validation.data.status === "Completed" ? new Date().toISOString() : null,
  };

  const { data, error } = await supabase
    .from("maintenance_records")
    // @ts-expect-error Supabase SSR generic schema mapping
    .insert(insertPayload)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/maintenance");
  revalidatePath("/");
  return { success: true, data };
}

/**
 * Update an existing maintenance record
 */
export async function updateMaintenanceRecord(
  id: string,
  rawData: unknown
): Promise<ActionResult> {
  const validation = maintenanceSchema.safeParse(rawData);
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

  const technicianId = validation.data.technician_id || user?.id;

  const updatePayload = {
    machine_id: validation.data.machine_id,
    technician_id: technicianId,
    title: validation.data.title,
    description: validation.data.description || null,
    action_taken: validation.data.action_taken || null,
    status: validation.data.status,
    scheduled_date: validation.data.scheduled_date,
    cost: validation.data.cost,
    completed_date:
      validation.data.status === "Completed" ? new Date().toISOString() : null,
  };

  const { error } = await supabase
    .from("maintenance_records")
    // @ts-expect-error Supabase SSR generic schema mapping
    .update(updatePayload)
    .eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/maintenance");
  revalidatePath("/");
  return { success: true };
}
