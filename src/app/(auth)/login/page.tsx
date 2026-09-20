"use client";

import { Suspense, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { login } from "@/actions/auth";
import { toast } from "sonner";
import {
  Lock,
  Mail,
  ShieldCheck,
  Wrench,
  Loader2,
  Cpu,
  ArrowRight,
} from "lucide-react";

function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleFillDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    toast.info("กรอกข้อมูลตัวอย่างเรียบร้อยแล้ว", {
      description: `ผู้ใช้งาน: ${demoEmail}`,
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    startTransition(async () => {
      try {
        const result = await login(formData, redirectTo);
        if (result && !result.success) {
          toast.error(result.error || "เข้าสู่ระบบไม่สำเร็จ");
        }
      } catch (err: unknown) {
        // In Next.js, redirect throws a NEXT_REDIRECT error which should not be intercepted as a failure
        if (
          err &&
          typeof err === "object" &&
          "message" in err &&
          typeof (err as { message: unknown }).message === "string" &&
          (err as { message: string }).message.includes("NEXT_REDIRECT")
        ) {
          return;
        }
        toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
      }
    });
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-slate-100">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-600/15 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Main Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center p-3 bg-blue-600/10 border border-blue-500/20 rounded-xl mb-1 text-blue-400">
              <Cpu className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              ระบบจัดการเครื่องจักรและแจ้งเตือน
            </h1>
            <p className="text-sm text-slate-400">
              Alarm & Maintenance Monitoring System
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="text-xs font-medium text-slate-300 flex items-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                อีเมล (Email)
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@factory.com"
                className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700/80 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="text-xs font-medium text-slate-300 flex items-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                รหัสผ่าน (Password)
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700/80 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full mt-2 py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  กำลังเข้าสู่ระบบ...
                </>
              ) : (
                <>
                  เข้าสู่ระบบ
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Demo Accounts Section */}
          <div className="pt-4 border-t border-slate-800/80 space-y-3">
            <p className="text-xs font-medium text-slate-400 text-center">
              บัญชีทดสอบสำหรับระบบ (คลิกเพื่อกรอกอัตโนมัติ)
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() =>
                  handleFillDemo("admin@factory.com", "Admin@123456")
                }
                className="p-2.5 rounded-xl border border-slate-800 bg-slate-950/60 hover:bg-slate-800 hover:border-slate-700 text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-400 mb-0.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  ผู้ดูแลระบบ
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  admin@factory.com
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  Role: Admin
                </div>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleFillDemo("tech1@factory.com", "Tech@123456")
                }
                className="p-2.5 rounded-xl border border-slate-800 bg-slate-950/60 hover:bg-slate-800 hover:border-slate-700 text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 mb-0.5">
                  <Wrench className="w-3.5 h-3.5" />
                  ช่างเทคนิค
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  tech1@factory.com
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  Role: Technician
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-4 text-center text-xs text-slate-500">
          PLC Alarm & Maintenance System &bull; Next.js 15 & Supabase SSR
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 text-slate-400 text-sm">
          <Loader2 className="w-6 h-6 animate-spin mr-2 text-blue-500" />
          กำลังโหลดหน้าเข้าสู่ระบบ...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
