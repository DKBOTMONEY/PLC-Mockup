"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { AlarmWithRelations, Machine } from "@/types/database.types";
import { getAlarms } from "@/actions/alarms";
import { getMachines } from "@/actions/machines";
import { AlarmFilters } from "@/components/alarms/alarm-filters";
import { AlarmTable } from "@/components/alarms/alarm-table";
import { AlarmCreateModal } from "@/components/alarms/alarm-create-modal";
import { AlarmUpdateModal } from "@/components/alarms/alarm-update-modal";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw, BellRing } from "lucide-react";

export default function AlarmsPage() {
  const [alarms, setAlarms] = useState<AlarmWithRelations[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [machineFilter, setMachineFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedAlarm, setSelectedAlarm] = useState<AlarmWithRelations | null>(null);
  const [isPending, startTransition] = useTransition();

  const fetchAlarmsData = useCallback(() => {
    startTransition(async () => {
      const [fetchedAlarms, fetchedMachines] = await Promise.all([
        getAlarms({
          query: searchQuery,
          machineId: machineFilter,
          status: statusFilter,
          severity: severityFilter,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        }),
        getMachines(),
      ]);
      setAlarms(fetchedAlarms);
      setMachines(fetchedMachines);
    });
  }, [searchQuery, machineFilter, statusFilter, severityFilter, startDate, endDate]);

  useEffect(() => {
    fetchAlarmsData();
  }, [fetchAlarmsData]);

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400">
              <BellRing className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              รายการแจ้งเตือนเหตุขัดข้อง (Alarms)
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            ติดตามรายการแจ้งเตือนจากเครื่องจักร รับเรื่องตรวจสอบ และบันทึกผลการปิดเคส
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAlarmsData}
            isLoading={isPending}
            title="รีเฟรชข้อมูล"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>

          <Button
            onClick={() => setIsCreateOpen(true)}
            size="sm"
            variant="destructive"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            แจ้งเตือนเหตุขัดข้องใหม่
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xs">
        <AlarmFilters
          machines={machines}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          machineFilter={machineFilter}
          onMachineChange={setMachineFilter}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          severityFilter={severityFilter}
          onSeverityChange={setSeverityFilter}
          startDate={startDate}
          onStartDateChange={setStartDate}
          endDate={endDate}
          onEndDateChange={setEndDate}
        />
      </div>

      {/* Alarms Table */}
      <AlarmTable
        alarms={alarms}
        onUpdateStatus={(alarm) => setSelectedAlarm(alarm)}
      />

      {/* Create Modal */}
      <AlarmCreateModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        machines={machines}
        onSuccess={fetchAlarmsData}
      />

      {/* Update Status Modal */}
      <AlarmUpdateModal
        isOpen={Boolean(selectedAlarm)}
        onClose={() => setSelectedAlarm(null)}
        alarm={selectedAlarm}
        onSuccess={fetchAlarmsData}
      />
    </div>
  );
}
