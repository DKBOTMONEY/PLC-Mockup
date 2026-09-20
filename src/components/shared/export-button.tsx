"use client";

import { Button } from "@/components/ui/button";
import { exportToCSV } from "@/lib/utils/export-csv";
import { Download } from "lucide-react";
import { toast } from "sonner";

interface ExportButtonProps {
  data: Record<string, unknown>[];
  filename: string;
  label?: string;
}

export function ExportButton({
  data,
  filename,
  label = "Export CSV",
}: ExportButtonProps) {
  const handleExport = () => {
    if (!data || data.length === 0) {
      toast.error("ไม่มีข้อมูลสำหรับส่งออก");
      return;
    }

    try {
      exportToCSV(data, filename);
      toast.success(`ส่งออกไฟล์ ${filename}.csv เรียบร้อยแล้ว`);
    } catch {
      toast.error("เกิดข้อผิดพลาดในการส่งออกไฟล์");
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      className="text-xs h-9 bg-white dark:bg-slate-900"
    >
      <Download className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
      {label}
    </Button>
  );
}
