"use client";

import { useState, useTransition, useEffect } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { createMachine, updateMachine } from "@/actions/machines";
import { Machine, MachineStatus } from "@/types/database.types";
import { toast } from "sonner";

interface MachineModalFormProps {
  isOpen: boolean;
  onClose: () => void;
  machine?: Machine | null;
  onSuccess?: () => void;
}

export function MachineModalForm({
  isOpen,
  onClose,
  machine,
  onSuccess,
}: MachineModalFormProps) {
  const isEditing = Boolean(machine);
  const [machineCode, setMachineCode] = useState("");
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState<MachineStatus>("Running");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (machine) {
      setMachineCode(machine.machine_code);
      setName(machine.name);
      setLocation(machine.location);
      setStatus(machine.status);
    } else {
      setMachineCode("");
      setName("");
      setLocation("");
      setStatus("Running");
    }
  }, [machine, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      machine_code: machineCode,
      name,
      location,
      status,
    };

    startTransition(async () => {
      const result = isEditing && machine
        ? await updateMachine(machine.id, payload)
        : await createMachine(payload);

      if (result.success) {
        toast.success(
          isEditing ? "อัปเดตข้อมูลเครื่องจักรสำเร็จ" : "เพิ่มเครื่องจักรใหม่สำเร็จ"
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
      title={isEditing ? `แก้ไขเครื่องจักร: ${machine?.machine_code}` : "เพิ่มเครื่องจักรใหม่"}
      description="กรอกข้อมูลเครื่องจักรให้ครบถ้วนเพื่อบันทึกเข้าสู่ฐานข้อมูลระบบ PLC"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            รหัสเครื่องจักร (Machine Code) <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            required
            value={machineCode}
            onChange={(e) => setMachineCode(e.target.value.toUpperCase())}
            placeholder="เช่น MC-001, CNC-02"
            disabled={isPending}
          />
          <p className="text-[11px] text-slate-400 mt-1">
            ต้องไม่ซ้ำกันในระบบ และใช้เฉพาะตัวอักษรภาษาอังกฤษ ตัวเลข ขีด (-)
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            ชื่อเครื่องจักร (Machine Name) <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="เช่น CNC Milling Station A"
            disabled={isPending}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            ตำแหน่งที่ตั้ง / แผนก (Location) <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            required
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="เช่น อาคาร A ชั้น 1 หรือ แผนกแปรรูป"
            disabled={isPending}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            สถานะเริ่มต้น (Status)
          </label>
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value as MachineStatus)}
            disabled={isPending}
          >
            <option value="Running">🟢 Running (กำลังทำงาน)</option>
            <option value="Stop">⚪ Stop (หยุดทำงาน)</option>
            <option value="Alarm">🔴 Alarm (เกิดข้อผิดพลาด)</option>
            <option value="Maintenance">🟠 Maintenance (กำลังซ่อมบำรุง)</option>
          </Select>
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
            {isEditing ? "บันทึกการแก้ไข" : "สร้างเครื่องจักร"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
