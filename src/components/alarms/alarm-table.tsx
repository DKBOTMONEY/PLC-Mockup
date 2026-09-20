"use client";

import { AlarmWithRelations } from "@/types/database.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { BellRing, CheckCircle2, Clock } from "lucide-react";

interface AlarmTableProps {
  alarms: AlarmWithRelations[];
  onUpdateStatus: (alarm: AlarmWithRelations) => void;
}

export function AlarmTable({ alarms, onUpdateStatus }: AlarmTableProps) {
  const getSeverityBadgeVariant = (severity: string) => {
    switch (severity) {
      case "Critical":
        return "destructive";
      case "High":
        return "alarm";
      case "Medium":
        return "maintenance";
      case "Low":
      default:
        return "secondary";
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Open":
        return "open";
      case "In Progress":
        return "inProgress";
      case "Closed":
        return "closed";
      default:
        return "secondary";
    }
  };

  if (alarms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white/50 dark:bg-slate-900/50">
        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
          <BellRing className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
          ไม่พบรายการแจ้งเตือน
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1">
          ไม่มีข้อมูลการแจ้งเตือนที่ตรงกับตัวกรอง หรือเครื่องจักรทั้งหมดทำงานเป็นปกติ
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
      <table className="w-full text-left text-sm border-collapse">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-950/60 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <th className="py-3.5 px-4">วันเวลาที่เกิดเหตุ</th>
            <th className="py-3.5 px-4">เครื่องจักร</th>
            <th className="py-3.5 px-4">หัวข้อปัญหา</th>
            <th className="py-3.5 px-4">ความรุนแรง</th>
            <th className="py-3.5 px-4">สถานะ</th>
            <th className="py-3.5 px-4">ผู้รับเรื่อง / วันที่ปิดเคส</th>
            <th className="py-3.5 px-4 text-right">การจัดการ</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
          {alarms.map((alarm) => (
            <tr
              key={alarm.id}
              className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
            >
              <td className="py-3 px-4 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                {formatDate(alarm.created_at)}
              </td>
              <td className="py-3 px-4">
                <div className="font-mono font-bold text-slate-900 dark:text-slate-100">
                  {alarm.machines?.machine_code || "-"}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {alarm.machines?.name || ""}
                </div>
              </td>
              <td className="py-3 px-4 max-w-xs">
                <div className="font-medium text-slate-900 dark:text-slate-100">
                  {alarm.title}
                </div>
                {alarm.description && (
                  <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {alarm.description}
                  </div>
                )}
              </td>
              <td className="py-3 px-4">
                <Badge variant={getSeverityBadgeVariant(alarm.severity)}>
                  {alarm.severity}
                </Badge>
              </td>
              <td className="py-3 px-4">
                <Badge variant={getStatusBadgeVariant(alarm.status)}>
                  {alarm.status}
                </Badge>
              </td>
              <td className="py-3 px-4 text-xs">
                <div className="text-slate-700 dark:text-slate-300 font-medium">
                  {alarm.profiles?.full_name || "-"}
                </div>
                {alarm.resolved_at && (
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="w-3 h-3" />
                    ปิดเคส: {formatDate(alarm.resolved_at)}
                  </div>
                )}
              </td>
              <td className="py-3 px-4 text-right">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onUpdateStatus(alarm)}
                  className="text-xs h-8"
                >
                  <Clock className="w-3.5 h-3.5 mr-1 text-slate-500" />
                  ปรับสถานะ
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
