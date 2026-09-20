import Link from "next/link";
import { AlarmWithRelations } from "@/types/database.types";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { BellRing, ArrowRight } from "lucide-react";

interface RecentAlarmsWidgetProps {
  alarms: AlarmWithRelations[];
}

export function RecentAlarmsWidget({ alarms }: RecentAlarmsWidgetProps) {
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

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <BellRing className="w-4 h-4 text-red-500" />
          <CardTitle className="text-base font-semibold">
            การแจ้งเตือนล่าสุด (Recent Alarms)
          </CardTitle>
        </div>
        <Link
          href="/alarms"
          className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
        >
          <span>ดูทั้งหมด</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </CardHeader>
      <CardContent className="p-0">
        {alarms.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            ไม่มีรายการแจ้งเตือนค้างอยู่
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {alarms.slice(0, 5).map((alarm) => (
              <div
                key={alarm.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="font-mono text-xs font-bold px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                    {alarm.machines?.machine_code || "MC"}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {alarm.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {alarm.machines?.name} &bull; {formatDate(alarm.created_at)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <span className="text-[11px] font-medium text-slate-400">
                    {alarm.severity}
                  </span>
                  <Badge variant={getStatusBadgeVariant(alarm.status)}>
                    {alarm.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
