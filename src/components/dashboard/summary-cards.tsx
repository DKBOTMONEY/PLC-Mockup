import { Card, CardContent } from "@/components/ui/card";
import { Cpu, BellRing, Wrench, Activity } from "lucide-react";

interface SummaryCardsProps {
  totalMachines: number;
  runningCount: number;
  stopCount: number;
  alarmCount: number;
  maintenanceCount: number;
  activeAlarmsCount: number;
  pendingMaintenanceCount: number;
}

export function SummaryCards({
  totalMachines,
  runningCount,
  stopCount,
  alarmCount,
  maintenanceCount,
  activeAlarmsCount,
  pendingMaintenanceCount,
}: SummaryCardsProps) {
  const operatingRate =
    totalMachines > 0 ? Math.round((runningCount / totalMachines) * 100) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Machines */}
      <Card className="border-l-4 border-l-blue-500 shadow-xs">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                เครื่องจักรทั้งหมด
              </p>
              <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mt-1">
                {totalMachines} <span className="text-xs font-normal text-slate-400">เครื่อง</span>
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
            <Activity className="w-3.5 h-3.5 text-emerald-500" />
            <span>อัตราการทำงาน: <span className="font-semibold text-emerald-600 dark:text-emerald-400">{operatingRate}%</span></span>
          </div>
        </CardContent>
      </Card>

      {/* Machine Status Breakdown */}
      <Card className="border-l-4 border-l-emerald-500 shadow-xs">
        <CardContent className="p-5">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
            สถานะเครื่องจักร (Machines Status)
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center justify-between p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300">
              <span>🟢 ทำงาน:</span>
              <span className="font-bold">{runningCount}</span>
            </div>
            <div className="flex items-center justify-between p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <span>⚪ หยุด:</span>
              <span className="font-bold">{stopCount}</span>
            </div>
            <div className="flex items-center justify-between p-1.5 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300">
              <span>🔴 เตือน:</span>
              <span className="font-bold">{alarmCount}</span>
            </div>
            <div className="flex items-center justify-between p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300">
              <span>🟠 ซ่อม:</span>
              <span className="font-bold">{maintenanceCount}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Alarms */}
      <Card className="border-l-4 border-l-red-500 shadow-xs">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                แจ้งเตือนที่ค้างอยู่ (Active Alarms)
              </p>
              <h3 className="text-2xl font-bold tracking-tight text-red-600 dark:text-red-400 mt-1">
                {activeAlarmsCount} <span className="text-xs font-normal text-slate-400">รายการ</span>
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center">
              <BellRing className="w-5 h-5 animate-pulse" />
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            สถานะ Open และ In Progress ที่รอการแก้ไข
          </p>
        </CardContent>
      </Card>

      {/* Pending Maintenance */}
      <Card className="border-l-4 border-l-amber-500 shadow-xs">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                งานซ่อมบำรุงที่รอทำ
              </p>
              <h3 className="text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400 mt-1">
                {pendingMaintenanceCount} <span className="text-xs font-normal text-slate-400">งาน</span>
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Wrench className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            งานตามแผนและกำลังดำเนินการซ่อม
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
