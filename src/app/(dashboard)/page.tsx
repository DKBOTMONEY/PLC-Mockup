import { getMachines } from "@/actions/machines";
import { getAlarms } from "@/actions/alarms";
import { getMaintenanceRecords } from "@/actions/maintenance";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { StatusDonutChart } from "@/components/dashboard/status-donut-chart";
import { SeverityBarChart } from "@/components/dashboard/severity-bar-chart";
import { RecentAlarmsWidget } from "@/components/dashboard/recent-alarms-widget";
import { ExportButton } from "@/components/shared/export-button";

export default async function DashboardOverviewPage() {
  const [machines, alarms, maintenance] = await Promise.all([
    getMachines(),
    getAlarms(),
    getMaintenanceRecords(),
  ]);

  // Aggregate machine counts
  const runningCount = machines.filter((m) => m.status === "Running").length;
  const stopCount = machines.filter((m) => m.status === "Stop").length;
  const alarmCount = machines.filter((m) => m.status === "Alarm").length;
  const maintenanceCount = machines.filter((m) => m.status === "Maintenance").length;

  // Aggregate alarm counts
  const activeAlarms = alarms.filter(
    (a) => a.status === "Open" || a.status === "In Progress"
  );
  const criticalCount = alarms.filter((a) => a.severity === "Critical").length;
  const highCount = alarms.filter((a) => a.severity === "High").length;
  const mediumCount = alarms.filter((a) => a.severity === "Medium").length;
  const lowCount = alarms.filter((a) => a.severity === "Low").length;

  // Aggregate maintenance counts
  const pendingMaintenance = maintenance.filter(
    (m) => m.status === "Scheduled" || m.status === "In Progress"
  );

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Title & Global Export Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            ภาพรวมระบบโรงงาน (Executive Dashboard)
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            รายงานสถิติสถานะเครื่องจักร การแจ้งเตือนเหตุขัดข้อง และแผนงานซ่อมบำรุง
          </p>
        </div>

        {/* Bonus Feature: Quick Export buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <ExportButton
            data={machines as unknown as Record<string, unknown>[]}
            filename="machines_export"
            label="ส่งออกเครื่องจักร (CSV)"
          />
          <ExportButton
            data={alarms as unknown as Record<string, unknown>[]}
            filename="alarms_export"
            label="ส่งออก Alarm (CSV)"
          />
        </div>
      </div>

      {/* KPI Summary Metric Cards */}
      <SummaryCards
        totalMachines={machines.length}
        runningCount={runningCount}
        stopCount={stopCount}
        alarmCount={alarmCount}
        maintenanceCount={maintenanceCount}
        activeAlarmsCount={activeAlarms.length}
        pendingMaintenanceCount={pendingMaintenance.length}
      />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StatusDonutChart
          running={runningCount}
          stop={stopCount}
          alarm={alarmCount}
          maintenance={maintenanceCount}
        />
        <SeverityBarChart
          critical={criticalCount}
          high={highCount}
          medium={mediumCount}
          low={lowCount}
        />
      </div>

      {/* Recent Alerts Feed */}
      <RecentAlarmsWidget alarms={alarms} />
    </div>
  );
}
