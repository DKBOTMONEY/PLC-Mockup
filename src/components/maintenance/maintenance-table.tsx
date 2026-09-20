"use client";

import { MaintenanceWithRelations } from "@/types/database.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatShortDate } from "@/lib/utils";
import { Wrench, Edit3, User, CheckCircle2 } from "lucide-react";

interface MaintenanceTableProps {
  records: MaintenanceWithRelations[];
  onEdit: (record: MaintenanceWithRelations) => void;
}

export function MaintenanceTable({ records, onEdit }: MaintenanceTableProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Scheduled":
        return <Badge variant="secondary">🔵 ตามแผน (Scheduled)</Badge>;
      case "In Progress":
        return <Badge variant="inProgress">🟡 กำลังดำเนินการ</Badge>;
      case "Completed":
        return <Badge variant="running">🟢 เสร็จสิ้น (Completed)</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white/50 dark:bg-slate-900/50">
        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
          <Wrench className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
          ไม่พบประวัติการซ่อมบำรุง
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1">
          ยังไม่มีรายการซ่อมบำรุงที่ตรงกับเงื่อนไข หรือยังไม่มีการวางแผนงานซ่อม
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
      <table className="w-full text-left text-sm border-collapse">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-950/60 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <th className="py-3.5 px-4">วันที่นัดหมาย</th>
            <th className="py-3.5 px-4">เครื่องจักร</th>
            <th className="py-3.5 px-4">ชื่องานซ่อมบำรุง</th>
            <th className="py-3.5 px-4">สถานะ</th>
            <th className="py-3.5 px-4">ช่างผู้รับผิดชอบ</th>
            <th className="py-3.5 px-4">ผลการซ่อมบำรุง</th>
            <th className="py-3.5 px-4 text-right">การจัดการ</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
          {records.map((rec) => (
            <tr
              key={rec.id}
              className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
            >
              <td className="py-3 px-4 text-xs font-mono text-slate-600 dark:text-slate-300 whitespace-nowrap">
                {formatShortDate(rec.scheduled_date)}
              </td>
              <td className="py-3 px-4">
                <div className="font-mono font-bold text-slate-900 dark:text-slate-100">
                  {rec.machines?.machine_code || "-"}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[140px]">
                  {rec.machines?.name || ""}
                </div>
              </td>
              <td className="py-3 px-4 max-w-xs">
                <div className="font-medium text-slate-900 dark:text-slate-100">
                  {rec.title}
                </div>
                {rec.description && (
                  <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {rec.description}
                  </div>
                )}
              </td>
              <td className="py-3 px-4">{getStatusBadge(rec.status)}</td>
              <td className="py-3 px-4 text-xs">
                <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-medium">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>{rec.profiles?.full_name || "-"}</span>
                </div>
              </td>
              <td className="py-3 px-4 max-w-xs text-xs text-slate-600 dark:text-slate-400">
                {rec.action_taken ? (
                  <div className="flex items-start gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="truncate">{rec.action_taken}</span>
                  </div>
                ) : (
                  <span className="text-slate-400 italic">ยังไม่มีผลการซ่อม</span>
                )}
              </td>
              <td className="py-3 px-4 text-right">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit(rec)}
                  className="text-xs h-8"
                >
                  <Edit3 className="w-3.5 h-3.5 mr-1 text-slate-500" />
                  อัปเดตผลงาน
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
