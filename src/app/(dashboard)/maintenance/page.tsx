"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { MaintenanceWithRelations, Machine } from "@/types/database.types";
import { getMaintenanceRecords } from "@/actions/maintenance";
import { getMachines } from "@/actions/machines";
import { MaintenanceFilters } from "@/components/maintenance/maintenance-filters";
import { MaintenanceTable } from "@/components/maintenance/maintenance-table";
import { MaintenanceModalForm } from "@/components/maintenance/maintenance-modal-form";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw, Wrench } from "lucide-react";

export default function MaintenancePage() {
  const [records, setRecords] = useState<MaintenanceWithRelations[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [machineFilter, setMachineFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MaintenanceWithRelations | null>(null);
  const [isPending, startTransition] = useTransition();

  const fetchMaintenanceData = useCallback(() => {
    startTransition(async () => {
      const [fetchedRecords, fetchedMachines] = await Promise.all([
        getMaintenanceRecords({
          query: searchQuery,
          machineId: machineFilter,
          status: statusFilter,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        }),
        getMachines(),
      ]);
      setRecords(fetchedRecords);
      setMachines(fetchedMachines);
    });
  }, [searchQuery, machineFilter, statusFilter, startDate, endDate]);

  useEffect(() => {
    fetchMaintenanceData();
  }, [fetchMaintenanceData]);

  const handleOpenCreate = () => {
    setSelectedRecord(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (record: MaintenanceWithRelations) => {
    setSelectedRecord(record);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Wrench className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              การซ่อมบำรุงรักษา (Maintenance Records)
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            วางแผนงานซ่อมบำรุงเครื่องจักรเชิงป้องกัน และบันทึกผลการดำเนินงานของทีมช่างเทคนิค
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchMaintenanceData}
            isLoading={isPending}
            title="รีเฟรชข้อมูล"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>

          <Button onClick={handleOpenCreate} size="sm">
            <Plus className="w-4 h-4 mr-1.5" />
            เพิ่มแผนงานซ่อม
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xs">
        <MaintenanceFilters
          machines={machines}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          machineFilter={machineFilter}
          onMachineChange={setMachineFilter}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          startDate={startDate}
          onStartDateChange={setStartDate}
          endDate={endDate}
          onEndDateChange={setEndDate}
        />
      </div>

      {/* Table */}
      <MaintenanceTable records={records} onEdit={handleOpenEdit} />

      {/* Modal Form (Create & Update) */}
      <MaintenanceModalForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        machines={machines}
        record={selectedRecord}
        onSuccess={fetchMaintenanceData}
      />
    </div>
  );
}
