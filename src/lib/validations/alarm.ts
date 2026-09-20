import { z } from "zod";

export const alarmSeverityEnum = z.enum(["Low", "Medium", "High", "Critical"]);
export const alarmStatusEnum = z.enum(["Open", "In Progress", "Closed"]);

export const createAlarmSchema = z.object({
  machine_id: z.string().uuid("กรุณาเลือกเครื่องจักร"),
  title: z
    .string()
    .trim()
    .min(1, "กรุณาระบุหัวข้อการแจ้งเตือน")
    .max(150, "หัวข้อต้องไม่เกิน 150 ตัวอักษร"),
  description: z.string().trim().max(1000, "รายละเอียดต้องไม่เกิน 1000 ตัวอักษร").optional().default(""),
  severity: alarmSeverityEnum.default("Medium"),
  status: alarmStatusEnum.default("Open"),
});

export const updateAlarmStatusSchema = z.object({
  status: alarmStatusEnum,
});

export type CreateAlarmFormValues = z.infer<typeof createAlarmSchema>;
export type UpdateAlarmStatusValues = z.infer<typeof updateAlarmStatusSchema>;
