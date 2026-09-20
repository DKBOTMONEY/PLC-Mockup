"use client";

import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";

interface MachineFiltersProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  statusFilter: string;
  onStatusChange: (val: string) => void;
}

export function MachineFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
}: MachineFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
      <div className="relative flex-1 w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          type="text"
          placeholder="ค้นหารหัสเครื่องจักร, ชื่อ, หรือตำแหน่ง..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 bg-white dark:bg-slate-900"
        />
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 whitespace-nowrap hidden sm:flex">
          <Filter className="w-3.5 h-3.5" />
          <span>สถานะ:</span>
        </div>
        <Select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          className="w-full sm:w-44 bg-white dark:bg-slate-900"
        >
          <option value="ALL">สถานะทั้งหมด</option>
          <option value="Running">🟢 Running (ทำงาน)</option>
          <option value="Stop">⚪ Stop (หยุด)</option>
          <option value="Alarm">🔴 Alarm (แจ้งเตือน)</option>
          <option value="Maintenance">🟠 Maintenance (ซ่อมบำรุง)</option>
        </Select>
      </div>
    </div>
  );
}
