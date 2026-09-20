"use client";

import { useState } from "react";
import { AuditLogWithProfile } from "@/actions/audit";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { History, ChevronDown, ChevronRight, User } from "lucide-react";

interface AuditLogTableProps {
  logs: AuditLogWithProfile[];
}

export function AuditLogTable({ logs }: AuditLogTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case "INSERT":
        return <Badge variant="running">🟢 เพิ่มข้อมูล (INSERT)</Badge>;
      case "UPDATE":
        return <Badge variant="inProgress">🟡 แก้ไขข้อมูล (UPDATE)</Badge>;
      case "DELETE":
        return <Badge variant="destructive">🔴 ลบข้อมูล (DELETE)</Badge>;
      default:
        return <Badge variant="secondary">{action}</Badge>;
    }
  };

  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white/50 dark:bg-slate-900/50">
        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
          <History className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
          ยังไม่มีบันทึกประวัติการเปลี่ยนแปลง
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1">
          ระบบจะบันทึกการเพิ่ม แก้ไข หรือลบข้อมูลเครื่องจักรและงานซ่อมโดยอัตโนมัติ
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
      <table className="w-full text-left text-sm border-collapse">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-950/60 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <th className="py-3.5 px-4 w-10"></th>
            <th className="py-3.5 px-4">วันเวลาที่ดำเนินการ</th>
            <th className="py-3.5 px-4">ตารางข้อมูล (Table)</th>
            <th className="py-3.5 px-4">การกระทำ (Action)</th>
            <th className="py-3.5 px-4">ผู้ดำเนินการ</th>
            <th className="py-3.5 px-4">รหัสรายการ (Record ID)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
          {logs.map((log) => {
            const isExpanded = expandedId === log.id;
            return (
              <tr key={log.id} className="group">
                <td colSpan={6} className="p-0">
                  <div className="flex items-center hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors py-3 px-4">
                    <div className="w-10">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleExpand(log.id)}
                        className="h-7 w-7 p-0"
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-slate-500" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        )}
                      </Button>
                    </div>

                    <div className="flex-1 grid grid-cols-5 gap-4 items-center text-xs">
                      <div className="font-mono text-slate-500 dark:text-slate-400">
                        {formatDate(log.created_at)}
                      </div>
                      <div>
                        <span className="font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                          {log.table_name}
                        </span>
                      </div>
                      <div>{getActionBadge(log.action)}</div>
                      <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>{log.profiles?.full_name || "System"}</span>
                      </div>
                      <div className="font-mono text-[11px] text-slate-400 truncate">
                        {log.record_id}
                      </div>
                    </div>
                  </div>

                  {/* Expanded JSON Diff Viewer */}
                  {isExpanded && (
                    <div className="p-4 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-100 dark:border-slate-800 text-xs grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="font-semibold text-slate-500 mb-1.5 flex items-center gap-1">
                          <span>ข้อมูลเดิม (Old Data):</span>
                        </div>
                        <pre className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-[11px] text-slate-600 dark:text-slate-300 overflow-x-auto max-h-56">
                          {log.old_data
                            ? JSON.stringify(log.old_data, null, 2)
                            : "null (สร้างข้อมูลใหม่)"}
                        </pre>
                      </div>

                      <div>
                        <div className="font-semibold text-slate-500 mb-1.5 flex items-center gap-1">
                          <span>ข้อมูลใหม่ (New Data):</span>
                        </div>
                        <pre className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-[11px] text-slate-600 dark:text-slate-300 overflow-x-auto max-h-56">
                          {log.new_data
                            ? JSON.stringify(log.new_data, null, 2)
                            : "null (ลบข้อมูลออก)"}
                        </pre>
                      </div>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
