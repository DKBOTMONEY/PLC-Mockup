"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

interface StatusDonutChartProps {
  running: number;
  stop: number;
  alarm: number;
  maintenance: number;
}

const COLORS = {
  Running: "#10b981", // Emerald 500
  Stop: "#64748b",    // Slate 500
  Alarm: "#ef4444",   // Red 500
  Maintenance: "#f59e0b", // Amber 500
};

export function StatusDonutChart({
  running,
  stop,
  alarm,
  maintenance,
}: StatusDonutChartProps) {
  const data = [
    { name: "Running (ทำงาน)", value: running, color: COLORS.Running },
    { name: "Stop (หยุด)", value: stop, color: COLORS.Stop },
    { name: "Alarm (แจ้งเตือน)", value: alarm, color: COLORS.Alarm },
    { name: "Maintenance (ซ่อม)", value: maintenance, color: COLORS.Maintenance },
  ].filter((item) => item.value > 0);

  const total = running + stop + alarm + maintenance;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">
          สัดส่วนสถานะเครื่องจักร (Machine Health)
        </CardTitle>
        <CardDescription>
          ภาพรวมสถานะการทำงานของเครื่องจักรทั้งหมด {total} เครื่อง
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col items-center justify-center pt-2">
        {total === 0 ? (
          <div className="h-64 flex items-center justify-center text-slate-400 text-xs">
            ไม่มีข้อมูลเครื่องจักร
          </div>
        ) : (
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [`${value} เครื่อง`, "จำนวน"]}
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.9)",
                    border: "1px solid rgba(51, 65, 85, 0.5)",
                    borderRadius: "8px",
                    color: "#f8fafc",
                    fontSize: "12px",
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  formatter={(value) => (
                    <span className="text-xs text-slate-600 dark:text-slate-400">
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
