"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { Machine } from "@/types/database.types";
import { getMachines } from "@/actions/machines";
import { getUserProfile } from "@/actions/auth";
import { MachineFilters } from "@/components/machines/machine-filters";
import { MachineTable } from "@/components/machines/machine-table";
import { MachineModalForm } from "@/components/machines/machine-modal-form";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw, Cpu } from "lucide-react";

export default function MachinesPage() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [isPending, startTransition] = useTransition();

  const fetchMachinesData = useCallback(() => {
    startTransition(async () => {
      const [fetchedMachines, profile] = await Promise.all([
        getMachines({ query: searchQuery, status: statusFilter }),
        getUserProfile(),
      ]);
      setMachines(fetchedMachines);
      setIsAdmin(profile?.role === "admin");
    });
  }, [searchQuery, statusFilter]);

  useEffect(() => {
    fetchMachinesData();
  }, [fetchMachinesData]);

  const handleOpenCreate = () => {
    setSelectedMachine(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (machine: Machine) => {
    setSelectedMachine(machine);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Cpu className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              จัดการเครื่องจักร (Machine Master)
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            รายการเครื่องจักรทั้งหมดในระบบ ตรวจสอบสถานะการทำงาน และบันทึกข้อมูลเครื่องจักร
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchMachinesData}
            isLoading={isPending}
            title="รีเฟรชข้อมูล"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>

          {isAdmin && (
            <Button onClick={handleOpenCreate} size="sm">
              <Plus className="w-4 h-4 mr-1.5" />
              เพิ่มเครื่องจักร
            </Button>
          )}
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xs">
        <MachineFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
        />
      </div>

      {/* Table Section */}
      <MachineTable
        machines={machines}
        isAdmin={isAdmin}
        onEdit={handleOpenEdit}
        onRefresh={fetchMachinesData}
      />

      {/* Create / Edit Modal Form */}
      <MachineModalForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        machine={selectedMachine}
        onSuccess={fetchMachinesData}
      />
    </div>
  );
}
