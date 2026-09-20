"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { machineSchema } from "@/lib/validations/machine";
import { Machine, MachineInsert, MachineUpdate, MachineStatus } from "@/types/database.types";

export type ActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

/**
 * Get list of machines with optional query and status filters
 */
export async function getMachines(filters?: {
  query?: string;
  status?: string;
}): Promise<Machine[]> {
  const supabase = await createClient();

  let query = supabase
    .from("machines")
    .select("*")
    .order("created_at", { ascending: false });

  if (filters?.status && filters.status !== "ALL") {
    query = query.eq("status", filters.status as MachineStatus);
  }

  if (filters?.query && filters.query.trim() !== "") {
    const term = `%${filters.query.trim()}%`;
    query = query.or(`machine_code.ilike.${term},name.ilike.${term},location.ilike.${term}`);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Error fetching machines:", error.message);
    return [];
  }

  return data as Machine[];
}

/**
 * Create a new machine (Admin only)
 */
export async function createMachine(rawData: unknown): Promise<ActionResult<Machine>> {
  const validation = machineSchema.safeParse(rawData);
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

  // Check unique machine_code
  const { data: existing } = await supabase
    .from("machines")
    .select("id")
    .eq("machine_code", validation.data.machine_code)
    .maybeSingle();

  if (existing) {
    return {
      success: false,
      error: `รหัสเครื่องจักร "${validation.data.machine_code}" มีอยู่ในระบบแล้ว กรุณาใช้รหัสอื่น`,
    };
  }

  const insertPayload: MachineInsert = {
    machine_code: validation.data.machine_code,
    name: validation.data.name,
    location: validation.data.location,
    status: validation.data.status,
    created_by: user.id,
  };

  const { data, error } = await supabase
    .from("machines")
    // @ts-expect-error Supabase SSR generic schema mapping
    .insert(insertPayload)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/machines");
  revalidatePath("/");
  return { success: true, data: data as Machine };
}

/**
 * Update existing machine (Admin only)
 */
export async function updateMachine(
  id: string,
  rawData: unknown
): Promise<ActionResult<Machine>> {
  const validation = machineSchema.safeParse(rawData);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.errors[0]?.message || "ข้อมูลไม่ถูกต้อง",
    };
  }

  const supabase = await createClient();

  // Check unique machine_code excluding current machine
  const { data: existing } = await supabase
    .from("machines")
    .select("id")
    .eq("machine_code", validation.data.machine_code)
    .neq("id", id)
    .maybeSingle();

  if (existing) {
    return {
      success: false,
      error: `รหัสเครื่องจักร "${validation.data.machine_code}" ซ้ำกับเครื่องจักรอื่น`,
    };
  }

  const updatePayload: MachineUpdate = {
    machine_code: validation.data.machine_code,
    name: validation.data.name,
    location: validation.data.location,
    status: validation.data.status,
  };

  const { data, error } = await supabase
    .from("machines")
    // @ts-expect-error Supabase SSR generic schema mapping
    .update(updatePayload)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/machines");
  revalidatePath("/");
  return { success: true, data: data as Machine };
}

/**
 * Delete a machine (Admin only)
 */
export async function deleteMachine(id: string): Promise<ActionResult> {
  const supabase = await createClient();

  const { error } = await supabase.from("machines").delete().eq("id", id);
  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/machines");
  revalidatePath("/");
  return { success: true };
}
