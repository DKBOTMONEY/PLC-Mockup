import Link from "next/link";
import { Cpu, BellRing, Wrench, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function DashboardOverviewPage() {
  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            ระบบบริหารจัดการเครื่องจักรและงานซ่อมบำรุง
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            PLC Alarm & Maintenance Management System &bull; ควบคุมและติดตามสถานะเครื่องจักรโรงงาน
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:border-blue-500/50 transition-colors">
          <CardHeader>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-2">
              <Cpu className="w-5 h-5" />
            </div>
            <CardTitle>รายการเครื่องจักร (Machines)</CardTitle>
            <CardDescription>
              ตรวจสอบสถานะ ควบคุม และแก้ไขข้อมูลเครื่องจักรหลักทั้งหมด
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/machines">
              <Button variant="outline" className="w-full justify-between">
                <span>เข้าสู่หน้าเครื่องจักร</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:border-red-500/50 transition-colors">
          <CardHeader>
            <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center mb-2">
              <BellRing className="w-5 h-5" />
            </div>
            <CardTitle>การแจ้งเตือนเหตุขัดข้อง (Alarms)</CardTitle>
            <CardDescription>
              รับแจ้งเหตุฉุกเฉิน อัปเดตสถานะปัญหา และบันทึกเวลาปิดเคส
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/alarms">
              <Button variant="outline" className="w-full justify-between">
                <span>จัดการแจ้งเตือน</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:border-amber-500/50 transition-colors">
          <CardHeader>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-2">
              <Wrench className="w-5 h-5" />
            </div>
            <CardTitle>งานซ่อมบำรุง (Maintenance)</CardTitle>
            <CardDescription>
              จัดตารางงานซ่อมบำรุงเชิงป้องกัน และบันทึกผลการปฏิบัติงาน
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/maintenance">
              <Button variant="outline" className="w-full justify-between">
                <span>บันทึกงานซ่อม</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
