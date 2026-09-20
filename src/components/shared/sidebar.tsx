"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/actions/auth";
import { cn } from "@/lib/utils";
import { Profile } from "@/types/database.types";
import {
  LayoutDashboard,
  Cpu,
  BellRing,
  Wrench,
  History,
  LogOut,
  ShieldCheck,
  User,
} from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

interface SidebarProps {
  profile: Profile | null;
  onCloseMobile?: () => void;
}

export function Sidebar({ profile, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const isAdmin = profile?.role === "admin";

  const navigation = [
    { name: "แดชบอร์ด (Dashboard)", href: "/", icon: LayoutDashboard },
    { name: "เครื่องจักร (Machines)", href: "/machines", icon: Cpu },
    { name: "การแจ้งเตือน (Alarms)", href: "/alarms", icon: BellRing },
    { name: "การซ่อมบำรุง (Maintenance)", href: "/maintenance", icon: Wrench },
    ...(isAdmin
      ? [{ name: "ประวัติการแก้ไข (Audit Logs)", href: "/audit-logs", icon: History }]
      : []),
  ];

  return (
    <aside className="w-64 flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-colors">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-bold text-slate-900 dark:text-slate-100 hover:opacity-90 transition-opacity"
          onClick={onCloseMobile}
        >
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm leading-tight tracking-tight">PLC System</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">
              Alarm & Maintenance
            </div>
          </div>
        </Link>
        <ThemeToggle />
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          เมนูหลัก
        </div>
        {navigation.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onCloseMobile}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
                isActive
                  ? "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
              )}
            >
              <item.icon
                className={cn(
                  "w-5 h-5 transition-colors",
                  isActive
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                )}
              />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Profile & Logout Footer */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 border border-slate-300/60 dark:border-slate-700/60">
            {isAdmin ? (
              <ShieldCheck className="w-5 h-5 text-blue-500" />
            ) : (
              <User className="w-5 h-5 text-amber-500" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
              {profile?.full_name || "ผู้ใช้งาน"}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              {profile?.email || "กำลังโหลด..."}
            </div>
            <div className="mt-0.5">
              <span
                className={cn(
                  "inline-block px-1.5 py-0.2 rounded text-[10px] font-medium uppercase tracking-wide",
                  isAdmin
                    ? "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300"
                    : "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300"
                )}
              >
                {isAdmin ? "Admin" : "Technician"}
              </span>
            </div>
          </div>
        </div>

        <form action={logout}>
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            ออกจากระบบ
          </button>
        </form>
      </div>
    </aside>
  );
}
