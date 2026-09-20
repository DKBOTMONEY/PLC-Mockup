"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

interface SeverityBarChartProps {
  critical: number;
  high: number;
  medium: number;
  low: number;
}

const SEVERITY_CONFIG = [
  { key: "Critical", label: "วิกฤต (Critical)", color: "#ef4444" },
  { key: "High", label: "สูง (High)", color: "#f97316" },
  { key: "Medium", label: "ปานกลาง (Medium)", color: "#eab308" },
  { key: "Low", label: "ต่ำ (Low)", color: "#3b82f6" },
];

export function SeverityBarChart({
  critical,
  high,
  medium,
  low,
}: SeverityBarChartProps) {
  const data = [
    { name: "Critical", count: critical, fill: SEVERITY_CONFIG[0].color },
    { name: "High", count: high, fill: SEVERITY_CONFIG[1].color },
    { name: "Medium", count: medium, fill: SEVERITY_CONFIG[2].color },
    { name: "Low", count: low, fill: SEVERITY_CONFIG[3].color },
  ];

  const total = critical + high + medium + low;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">
          การแจ้งเตือนแยกตามความรุนแรง (Severity)
        </CardTitle>
        <CardDescription>
          สรุปการเกิดเหตุขัดข้องทั้งหมด {total} รายการ
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pt-2">
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11 }}
                stroke="#64748b"
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11 }}
                stroke="#64748b"
              />
              <Tooltip
                formatter={(val: number) => [`${val} รายการ`, "จำนวน"]}
                contentStyle={{
                  backgroundColor: "rgba(15, 23, 42, 0.9)",
                  border: "1px solid rgba(51, 65, 85, 0.5)",
                  borderRadius: "8px",
                  color: "#f8fafc",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`bar-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
