import { z } from "zod";

export const machineStatusEnum = z.enum(["Running", "Stop", "Alarm", "Maintenance"]);

export const machineSchema = z.object({
  machine_code: z
    .string()
    .trim()
    .min(1, "กรุณาระบุรหัสเครื่องจักร")
    .max(50, "รหัสเครื่องจักรต้องไม่เกิน 50 ตัวอักษร")
    .regex(/^[A-Za-z0-9-_]+$/, "รหัสเครื่องจักรต้องเป็นตัวอักษรภาษาอังกฤษ ตัวเลข ขีด (-) หรือขีดล่าง (_) เท่านั้น"),
  name: z
    .string()
    .trim()
    .min(1, "กรุณาระบุชื่อเครื่องจักร")
    .max(100, "ชื่อเครื่องจักรต้องไม่เกิน 100 ตัวอักษร"),
  location: z
    .string()
    .trim()
    .min(1, "กรุณาระบุตำแหน่งที่ตั้ง / แผนก")
    .max(100, "ตำแหน่งต้องไม่เกิน 100 ตัวอักษร"),
  status: machineStatusEnum.default("Running"),
});

export type MachineFormValues = z.infer<typeof machineSchema>;
