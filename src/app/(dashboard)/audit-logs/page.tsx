import Link from "next/link";
import { getUserProfile } from "@/actions/auth";
import { getAuditLogs } from "@/actions/audit";
import { AuditLogTable } from "@/components/audit/audit-log-table";
import { ExportButton } from "@/components/shared/export-button";
import { Button } from "@/components/ui/button";
import { History, ShieldAlert, ArrowLeft } from "lucide-react";

export default async function AuditLogsPage() {
  const profile = await getUserProfile();

  if (profile?.role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-red-200 dark:border-red-900/40 rounded-2xl bg-red-50/50 dark:bg-red-950/20 max-w-lg mx-auto mt-12 animate-in fade-in">
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/60 flex items-center justify-center text-red-600 dark:text-red-400 mb-4">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          จำกัดการเข้าถึงเฉพาะผู้ดูแลระบบ (Admin Only)
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
          หน้านี้สงวนไว้สำหรับผู้ใช้งานระดับ Admin เท่านั้นเพื่อความปลอดภัยของข้อมูลระบบ
        </p>
        <Link href="/" className="mt-6">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            กลับสู่หน้าหลัก
          </Button>
        </Link>
      </div>
    );
  }

  const logs = await getAuditLogs();

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <History className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              บันทึกประวัติการเปลี่ยนแปลง (Audit Trail)
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            ตรวจสอบประวัติการเพิ่ม แก้ไข และลบข้อมูลสำคัญในระบบ (Bonus Feature)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <ExportButton
            data={logs as unknown as Record<string, unknown>[]}
            filename="audit_logs_export"
            label="ส่งออกประวัติ (CSV)"
          />
        </div>
      </div>

      <AuditLogTable logs={logs} />
    </div>
  );
}
