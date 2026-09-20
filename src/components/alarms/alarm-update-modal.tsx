"use client";

import { useState, useTransition } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { AlarmWithRelations, AlarmStatus } from "@/types/database.types";
import { updateAlarmStatus } from "@/actions/alarms";
import { toast } from "sonner";

interface AlarmUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  alarm: AlarmWithRelations | null;
  onSuccess?: () => void;
}

export function AlarmUpdateModal({
  isOpen,
  onClose,
  alarm,
  onSuccess,
}: AlarmUpdateModalProps) {
  const [status, setStatus] = useState<AlarmStatus>(alarm?.status || "In Progress");
  const [isPending, startTransition] = useTransition();

  if (!alarm) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      const result = await updateAlarmStatus(alarm.id, status);

      if (result.success) {
        toast.success(`อัปเดตสถานะของ Alarm เป็น "${status}" เรียบร้อยแล้ว`);
        onClose();
        if (onSuccess) onSuccess();
      } else {
        toast.error(result.error || "เกิดข้อผิดพลาดในการอัปเดต");
      }
    });
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={`อัปเดตสถานะการแจ้งเตือน: ${alarm.title}`}
      description={`เครื่องจักร: ${alarm.machines?.machine_code || "-"} (${alarm.machines?.name || "-"})`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs space-y-1">
          <div><span className="font-semibold text-slate-500">หัวข้อ:</span> {alarm.title}</div>
          <div><span className="font-semibold text-slate-500">ระดับความรุนแรง:</span> {alarm.severity}</div>
          {alarm.description && (
            <div><span className="font-semibold text-slate-500">รายละเอียด:</span> {alarm.description}</div>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            ปรับเปลี่ยนสถานะการแก้ไขปัญหา <span className="text-red-500">*</span>
          </label>
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value as AlarmStatus)}
            disabled={isPending}
          >
            <option value="Open">🔴 Open (ยังไม่ได้รับการแก้ไข)</option>
            <option value="In Progress">🟡 In Progress (กำลังตรวจสอบ/แก้ไข)</option>
            <option value="Closed">🟢 Closed (แก้ไขปัญหาเสร็จสิ้นและปิดเคส)</option>
          </Select>
          <p className="text-[11px] text-slate-400 mt-1">
            เมื่อปรับเป็น &quot;Closed&quot; ระบบจะบันทึกวันเวลาที่ปิดเคส และปรับคืนสถานะของเครื่องจักรเป็น Running โดยอัตโนมัติ
          </p>
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
            บันทึกสถานะ
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
