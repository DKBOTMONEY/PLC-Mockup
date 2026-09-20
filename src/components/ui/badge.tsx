import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | "default"
    | "secondary"
    | "destructive"
    | "outline"
    | "running"
    | "stop"
    | "alarm"
    | "maintenance"
    | "open"
    | "inProgress"
    | "closed";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "border-transparent bg-blue-600 text-white shadow hover:bg-blue-700",
    secondary: "border-transparent bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100",
    destructive: "border-transparent bg-red-600 text-white shadow hover:bg-red-700",
    outline: "border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200",
    
    // Machine status badges
    running: "border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-medium",
    stop: "border-slate-400/30 bg-slate-500/15 text-slate-700 dark:text-slate-400 font-medium",
    alarm: "border-red-500/30 bg-red-500/15 text-red-700 dark:text-red-400 font-medium animate-pulse",
    maintenance: "border-amber-500/30 bg-amber-500/15 text-amber-700 dark:text-amber-400 font-medium",

    // Work / Alarm status badges
    open: "border-red-500/30 bg-red-500/15 text-red-700 dark:text-red-400 font-medium",
    inProgress: "border-blue-500/30 bg-blue-500/15 text-blue-700 dark:text-blue-400 font-medium",
    closed: "border-slate-400/30 bg-slate-500/15 text-slate-700 dark:text-slate-400 font-medium",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
