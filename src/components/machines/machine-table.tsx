"use client";

import { useState, useTransition } from "react";
import { Machine } from "@/types/database.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils";
import { deleteMachine } from "@/actions/machines";
import { Edit2, Trash2, AlertTriangle, Cpu } from "lucide-react";
import { toast } from "sonner";

interface MachineTableProps {
  machines: Machine[];
  isAdmin: boolean;
  onEdit: (machine: Machine) => void;
  onRefresh?: () => void;
}

export function MachineTable({
  machines,
  isAdmin,
  onEdit,
  onRefresh,
}: MachineTableProps) {
  const [deleteTarget, setDeleteTarget] = useState<Machine | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;

    startDeleteTransition(async () => {
      const result = await deleteMachine(deleteTarget.id);
      if (result.success) {
        toast.success(`ลบเครื่องจักร "${deleteTarget.machine_code}" สำเร็จ`);
        setDeleteTarget(null);
        if (onRefresh) onRefresh();
      } else {
        toast.error(result.error || "เกิดข้อผิดพลาดในการลบ");
      }
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Running":
        return "running";
      case "Stop":
        return "stop";
      case "Alarm":
        return "alarm";
      case "Maintenance":
        return "maintenance";
      default:
        return "secondary";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "Running":
        return "กำลังทำงาน (Running)";
      case "Stop":
        return "หยุดทำงาน (Stop)";
      case "Alarm":
        return "แจ้งเตือนผิดปกติ (Alarm)";
      case "Maintenance":
        return "กำลังซ่อมบำรุง (Maintenance)";
      default:
        return status;
    }
  };

  if (machines.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white/50 dark:bg-slate-900/50">
        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
          <Cpu className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
          ไม่พบข้อมูลเครื่องจักร
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1">
          ยังไม่มีรายการเครื่องจักรที่ตรงกับเงื่อนไขการค้นหา หรือยังไม่มีข้อมูลในระบบ
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-950/60 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <th className="py-3.5 px-4">รหัสเครื่องจักร (Code)</th>
              <th className="py-3.5 px-4">ชื่อเครื่องจักร</th>
              <th className="py-3.5 px-4">ตำแหน่ง / แผนก</th>
              <th className="py-3.5 px-4">สถานะการทำงาน</th>
              <th className="py-3.5 px-4">อัปเดตล่าสุด</th>
              {isAdmin && <th className="py-3.5 px-4 text-right">การจัดการ</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {machines.map((machine) => (
              <tr
                key={machine.id}
                className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
              >
                <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-slate-100">
                  {machine.machine_code}
                </td>
                <td className="py-3 px-4 font-medium text-slate-900 dark:text-slate-100">
                  {machine.name}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                  {machine.location}
                </td>
                <td className="py-3 px-4">
                  <Badge variant={getStatusBadgeVariant(machine.status)}>
                    {getStatusLabel(machine.status)}
                  </Badge>
                </td>
                <td className="py-3 px-4 text-xs text-slate-500 dark:text-slate-400">
                  {formatDate(machine.updated_at)}
                </td>
                {isAdmin && (
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onEdit(machine)}
                        className="h-8 w-8 p-0 text-slate-600 hover:text-blue-600 hover:bg-blue-50 dark:text-slate-400 dark:hover:text-blue-400 dark:hover:bg-blue-950/40"
                        title="แก้ไขข้อมูล"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeleteTarget(machine)}
                        className="h-8 w-8 p-0 text-slate-600 hover:text-red-600 hover:bg-red-50 dark:text-slate-400 dark:hover:text-red-400 dark:hover:bg-red-950/40"
                        title="ลบเครื่องจักร"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <Dialog
          isOpen={Boolean(deleteTarget)}
          onClose={() => setDeleteTarget(null)}
          title="ยืนยันการลบเครื่องจักร"
          maxWidth="sm"
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-800 dark:text-red-300">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="text-xs">
                คุณแน่ใจหรือไม่ว่าต้องการลบเครื่องจักร{" "}
                <span className="font-bold">
                  {deleteTarget.machine_code} ({deleteTarget.name})
                </span>
                ? การลบนี้จะส่งผลให้ข้อมูลแจ้งเตือนและประวัติการซ่อมบำรุงที่เชื่อมโยงอยู่ถูกลบไปด้วย
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
              >
                ยกเลิก
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteConfirm}
                isLoading={isDeleting}
              >
                ลบเครื่องจักร
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </>
  );
}
