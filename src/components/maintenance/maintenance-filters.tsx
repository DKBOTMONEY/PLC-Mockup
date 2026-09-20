"use client";

import { Machine } from "@/types/database.types";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Search, Calendar } from "lucide-react";

interface MaintenanceFiltersProps {
  machines: Machine[];
  searchQuery: string;
  onSearchChange: (val: string) => void;
  machineFilter: string;
  onMachineChange: (val: string) => void;
  statusFilter: string;
  onStatusChange: (val: string) => void;
  startDate: string;
  onStartDateChange: (val: string) => void;
  endDate: string;
  onEndDateChange: (val: string) => void;
}

export function MaintenanceFilters({
  machines,
  searchQuery,
  onSearchChange,
  machineFilter,
  onMachineChange,
  statusFilter,
  onStatusChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
}: MaintenanceFiltersProps) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            type="text"
            placeholder="ค้นหาชื่องานซ่อมหรือรายละเอียด..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 bg-white dark:bg-slate-900"
          />
        </div>

        {/* Machine Filter */}
        <Select
          value={machineFilter}
          onChange={(e) => onMachineChange(e.target.value)}
          className="bg-white dark:bg-slate-900"
        >
          <option value="ALL">เครื่องจักรทั้งหมด</option>
          {machines.map((m) => (
            <option key={m.id} value={m.id}>
              {m.machine_code} - {m.name}
            </option>
          ))}
        </Select>

        {/* Status Filter */}
        <Select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          className="bg-white dark:bg-slate-900"
        >
          <option value="ALL">สถานะทั้งหมด</option>
          <option value="Scheduled">🔵 Scheduled (ตามแผน)</option>
          <option value="In Progress">🟡 In Progress (กำลังดำเนินการ)</option>
          <option value="Completed">🟢 Completed (เสร็จสิ้น)</option>
        </Select>
      </div>

      {/* Date Range Filter */}
      <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
        <div className="flex items-center gap-1.5 text-slate-500 font-medium">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>กรองตามวันที่นัดหมาย:</span>
        </div>

        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="h-8 text-xs w-36 bg-white dark:bg-slate-900"
          />
          <span className="text-slate-400">ถึง</span>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="h-8 text-xs w-36 bg-white dark:bg-slate-900"
          />
          {(startDate || endDate) && (
            <button
              onClick={() => {
                onStartDateChange("");
                onEndDateChange("");
              }}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline ml-1"
            >
              ล้างวันที่
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
