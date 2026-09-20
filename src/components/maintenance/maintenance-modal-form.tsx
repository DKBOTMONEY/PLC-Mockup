"use client";

import { useState, useTransition, useEffect } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  Machine,
  MaintenanceWithRelations,
  MaintenanceStatus,
} from "@/types/database.types";
import {
  createMaintenanceRecord,
  updateMaintenanceRecord,
} from "@/actions/maintenance";
import { toast } from "sonner";

interface MaintenanceModalFormProps {
  isOpen: boolean;
  onClose: () => void;
  machines: Machine[];
  record?: MaintenanceWithRelations | null;
  onSuccess?: () => void;
}

export function MaintenanceModalForm({
  isOpen,
  onClose,
  machines,
  record,
  onSuccess,
}: MaintenanceModalFormProps) {
  const isEditing = Boolean(record);
  const [machineId, setMachineId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [actionTaken, setActionTaken] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [status, setStatus] = useState<MaintenanceStatus>("In Progress");
  const [cost, setCost] = useState("0");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (record) {
      setMachineId(record.machine_id);
      setTitle(record.title);
      setDescription(record.description || "");
      setActionTaken(record.action_taken || "");
      setScheduledDate(record.scheduled_date);
      setStatus(record.status);
      setCost(String(record.cost || 0));
    } else {
      setMachineId("");
      setTitle("");
      setDescription("");
      setActionTaken("");
      setScheduledDate(new Date().toISOString().split("T")[0]);
      setStatus("In Progress");
      setCost("0");
    }
  }, [record, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!machineId) {
      toast.error("กรุณาเลือกเครื่องจักร");
      return;
    }

    const payload = {
      machine_id: machineId,
      title,
      description,
      action_taken: actionTaken,
      scheduled_date: scheduledDate,
      status,
      cost: Number(cost) || 0,
    };

    startTransition(async () => {
      const result = isEditing && record
        ? await updateMaintenanceRecord(record.id, payload)
        : await createMaintenanceRecord(payload);

      if (result.success) {
        toast.success(
          isEditing
            ? "อัปเดตบันทึกการซ่อมบำรุงสำเร็จ"
            : "สร้างแผนงานซ่อมบำรุงสำเร็จ"
        );
        onClose();
        if (onSuccess) onSuccess();
      } else {
        toast.error(result.error || "เกิดข้อผิดพลาดในการบันทึก");
      }
    });
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `อัปเดตงานซ่อม: ${record?.title}` : "บันทึกแผนงานซ่อมบำรุงใหม่"}
      description="กรอกรายละเอียดงานซ่อมบำรุงเชิงป้องกันหรือการซ่อมแซมเครื่องจักร"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            เลือกเครื่องจักร <span className="text-red-500">*</span>
          </label>
          <Select
            value={machineId}
            onChange={(e) => setMachineId(e.target.value)}
            required
            disabled={isPending}
          >
            <option value="">-- กรุณาเลือกเครื่องจักร --</option>
            {machines.map((m) => (
              <option key={m.id} value={m.id}>
                {m.machine_code} - {m.name}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            ชื่องานซ่อมบำรุง (Title) <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="เช่น เปลี่ยนถ่ายน้ำมันไฮดรอลิก, เปลี่ยนสายพานไทม์มิ่ง"
            disabled={isPending}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              วันที่นัดหมาย / ดำเนินการ <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              required
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              disabled={isPending}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              สถานะงานซ่อม
            </label>
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value as MaintenanceStatus)}
              disabled={isPending}
            >
              <option value="Scheduled">🔵 Scheduled (ตามแผนที่วางไว้)</option>
              <option value="In Progress">🟡 In Progress (กำลังดำเนินการ)</option>
              <option value="Completed">🟢 Completed (ซ่อมบำรุงเสร็จสิ้น)</option>
            </Select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            รายละเอียดงานก่อนซ่อม (Description)
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="สาเหตุหรือข้อกำหนดในการซ่อมบำรุง..."
            className="flex w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50"
            disabled={isPending}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            ผลการปฏิบัติงาน / สิ่งที่แก้ไขไป (Action Taken)
          </label>
          <textarea
            rows={2}
            value={actionTaken}
            onChange={(e) => setActionTaken(e.target.value)}
            placeholder="เช่น เปลี่ยนอะไหล่เบอร์ 405 เรียบร้อย ทดสอบรันเครื่อง 30 นาที ปกติ..."
            className="flex w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50"
            disabled={isPending}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            ค่าใช้จ่ายโดยประมาณ (บาท)
          </label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            placeholder="0.00"
            disabled={isPending}
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isPending}
          >
            ยกเลิก
          </Button>
          <Button type="submit" isLoading={isPending}>
            {isEditing ? "บันทึกการแก้ไข" : "สร้างบันทึกงานซ่อม"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
