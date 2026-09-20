"use client";

import { useState, useTransition } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Machine, AlarmSeverity } from "@/types/database.types";
import { createAlarm } from "@/actions/alarms";
import { toast } from "sonner";

interface AlarmCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  machines: Machine[];
  onSuccess?: () => void;
}

export function AlarmCreateModal({
  isOpen,
  onClose,
  machines,
  onSuccess,
}: AlarmCreateModalProps) {
  const [machineId, setMachineId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<AlarmSeverity>("Medium");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!machineId) {
      toast.error("กรุณาเลือกเครื่องจักรที่พบปัญหา");
      return;
    }

    startTransition(async () => {
      const result = await createAlarm({
        machine_id: machineId,
        title,
        description,
        severity,
        status: "Open",
      });

      if (result.success) {
        toast.success("บันทึกการแจ้งเตือนเหตุขัดข้องเรียบร้อยแล้ว");
        // Reset
        setMachineId("");
        setTitle("");
        setDescription("");
        setSeverity("Medium");
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
      title="แจ้งเตือนเหตุขัดข้องใหม่ (Report Alarm)"
      description="บันทึกข้อผิดพลาดของเครื่องจักรเพื่อส่งเรื่องให้ช่างซ่อมบำรุงเข้าตรวจสอบ"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            เลือกเครื่องจักรที่พบปัญหา <span className="text-red-500">*</span>
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
                {m.machine_code} - {m.name} ({m.location})
              </option>
            ))}
          </Select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            หัวข้อปัญหา (Alarm Title) <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="เช่น Overheat Alert, มอเตอร์แกน X สะดุด"
            disabled={isPending}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            ระดับความรุนแรง (Severity)
          </label>
          <Select
            value={severity}
            onChange={(e) => setSeverity(e.target.value as AlarmSeverity)}
            disabled={isPending}
          >
            <option value="Low">ℹ️ Low (ต่ำ - เครื่องจักรยังทำงานได้)</option>
            <option value="Medium">⚡ Medium (ปานกลาง - ทำงานได้แต่ประสิทธิภาพลดลง)</option>
            <option value="High">⚠️ High (สูง - เสี่ยงต่อความเสียหาย)</option>
            <option value="Critical">🔥 Critical (วิกฤต - ต้องหยุดเครื่องจักรทันที)</option>
          </Select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            รายละเอียดปัญหา / อาการที่พบ (Description)
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="ระบุอาการ เสียง กลิ่น หรือรหัส Error ที่หน้าจอเครื่องจักร..."
            className="flex w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50"
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
          <Button type="submit" variant="destructive" isLoading={isPending}>
            บันทึกการแจ้งเตือน
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
