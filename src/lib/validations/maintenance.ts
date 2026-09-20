import { z } from "zod";

export const maintenanceStatusEnum = z.enum(["Scheduled", "In Progress", "Completed"]);

export const maintenanceSchema = z.object({
  machine_id: z.string().uuid("กรุณาเลือกเครื่องจักร"),
  technician_id: z.string().uuid("กรุณาเลือกหรือระบุช่างผู้รับผิดชอบ").optional().nullable(),
  title: z
    .string()
    .trim()
    .min(1, "กรุณาระบุชื่องานซ่อมบำรุง")
    .max(150, "ชื่องานต้องไม่เกิน 150 ตัวอักษร"),
  description: z.string().trim().max(1000, "รายละเอียดต้องไม่เกิน 1000 ตัวอักษร").optional().default(""),
  action_taken: z.string().trim().max(1000, "ผลการปฏิบัติงานต้องไม่เกิน 1000 ตัวอักษร").optional().default(""),
  status: maintenanceStatusEnum.default("In Progress"),
  scheduled_date: z.string().min(1, "กรุณาระบุวันที่ดำเนินการ"),
  cost: z.coerce.number().min(0, "ค่าใช้จ่ายต้องไม่ติดลบ").default(0),
});

export type MaintenanceFormValues = z.infer<typeof maintenanceSchema>;
