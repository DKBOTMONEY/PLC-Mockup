# Alarm & Maintenance Management System

[![CI Pipeline](https://github.com/DKBOTMONEY/PLC-Mockup/actions/workflows/ci.yml/badge.svg)](https://github.com/DKBOTMONEY/PLC-Mockup/actions)
![Next.js](https://img.shields.io/badge/Next.js-15.2-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8?logo=tailwind-css)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%20%2B%20Auth-3ecf8e?logo=supabase)

ระบบบริหารจัดการเครื่องจักร การแจ้งเตือนเหตุขัดข้อง และแผนงานซ่อมบำรุงเชิงป้องกัน (Industrial Equipment Monitoring & Maintenance Management System) พัฒนาตามเกณฑ์และแผนงาน 7 ระยะ (Phases) จากเอกสาร `alarm_maintenance.md`

📖 **เอกสารส่งมอบโครงการและรายงานฉบับสมบูรณ์:**
* 📑 [**Project Deliverables & Showcase (เอกสารส่งมอบฉบับเต็ม)**](docs/DELIVERABLES.md)
* 🤖 [**AI Usage Report (รายงานการประยุกต์ใช้ AI)**](docs/AI_USAGE_REPORT.md)
* 📸 [**Screenshot Gallery (แกลเลอรีภาพระบบจริง)**](#-แกลเลอรีภาพหน้าจอระบบจริง-system-screenshots-showcase)

---

## 🚀 ฟีเจอร์หลักของระบบ (Features)

### 1. แดชบอร์ดสรุปภาพรวม (Executive Dashboard - Phase 4 & Phase 6 Bonus)
* **Summary KPI Cards:** แสดงจำนวนเครื่องจักรทั้งหมด, อัตราความพร้อมใช้งาน (% Operating Rate), และจำนวน Alarm / Maintenance ที่รอการแก้ไข
* **Machine Health Donut Chart:** แผนภูมิโดนัทจาก **Recharts** แสดงสัดส่วนเครื่องจักรตามสถานะ (Running, Stop, Alarm, Maintenance)
* **Severity Bar Chart:** แผนภูมิแท่งสรุปการเกิดเหตุขัดข้องแยกตามระดับความรุนแรง (Critical, High, Medium, Low)
* **Recent Alerts Feed:** รายการแจ้งเตือนล่าสุด 5 รายการ พร้อมทางลัดเข้าจัดการได้ทันที
* **CSV Data Export:** ปุ่ม Export ข้อมูลเครื่องจักรและแจ้งเตือนออกมาเป็นไฟล์ `.csv` รองรับภาษาไทยสมบูรณ์

### 2. จัดการข้อมูลเครื่องจักร (Machine Master CRUD - Phase 3)
* เพิ่ม, ดู, แก้ไข, และลบข้อมูลเครื่องจักร พร้อมระบบตรวจสอบรหัสเครื่องจักรซ้ำ (**Unique Code Validation**)
* จัดการสถานะเครื่องจักร: `Running` (ทำงาน), `Stop` (หยุด), `Alarm` (ขัดข้อง), `Maintenance` (ซ่อมบำรุง)
* ค้นหาและกรองข้อมูลแบบผสม (ค้นหาชื่อ/รหัส + กรองสถานะ)
* ระบบจำกัดสิทธิ์ (**Admin Only** สำหรับการเพิ่ม ลบ และแก้ไข)

### 3. ศูนย์รับแจ้งเหตุขัดข้อง (Alarm Records CRU - Phase 3)
* รายงานปัญหาเครื่องจักร: เลือกเครื่องจักร, ระบุหัวข้อ, รายละเอียด, และระดับความรุนแรง
* **Machine Status Sync Trigger:** ปรับสถานะเครื่องจักรเป็น `Alarm` อัตโนมัติเมื่อเกิดเหตุ และคืนค่าเป็น `Running` เมื่อปิดเคสเสร็จสิ้น
* อัปเดตสถานะปัญหา: `Open` $\rightarrow$ `In Progress` $\rightarrow$ `Closed` (พร้อมบันทึกวันเวลาที่ปิดเคสและชื่อผู้รับผิดชอบ)
* ตัวกรองหลายมิติ: กรองตามเครื่องจักร + สถานะ + ระดับความรุนแรง + ช่วงวันที่

### 4. บันทึกแผนงานซ่อมบำรุง (Maintenance Records CRU - Phase 3)
* สร้างแผนงานซ่อมบำรุงเชิงป้องกัน ระบุช่างผู้รับผิดชอบ และกำหนดวันที่นัดหมาย
* บันทึกผลการปฏิบัติงานจริง (`action_taken`) และค่าใช้จ่าย
* อัปเดตสถานะงานซ่อม: `Scheduled` $\rightarrow$ `In Progress` $\rightarrow$ `Completed`

### 5. ประวัติการเปลี่ยนแปลงระบบ (Audit Trail Viewer - Phase 6 Bonus)
* ตารางบันทึก Audit Logs เก็บประวัติการ `INSERT`, `UPDATE`, `DELETE` ของข้อมูลเครื่องจักรและงานซ่อม
* มี JSON Diff Viewer ให้ Admin กดดูข้อมูลเดิม (`old_data`) เทียบกับข้อมูลใหม่ (`new_data`) ได้อย่างโปร่งใส

### 6. ระบบยืนยันตัวตนและการแบ่งสิทธิ์ (Auth & RBAC - Phase 2)
* เข้าสู่ระบบด้วย Supabase Auth (Email / Password)
* แบ่งสิทธิ์ตามบทบาทชัดเจน:
  * 🛡️ **Admin:** สิทธิ์เต็มทุกหน้า จัดการข้อมูลเครื่องจักร (CRUD) และดู Audit Logs ได้
  * 🔧 **Technician:** ดูข้อมูลเครื่องจักร, สร้างและอัปเดต Alarm, บันทึกผลการซ่อมบำรุง, ดู Dashboard
* ระบบจำกัดการเข้าถึงผ่าน **Next.js Edge Middleware** ควบคู่กับ **PostgreSQL Row Level Security (RLS)**

---

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)

* **Frontend:** Next.js 15 (App Router, React 19), TypeScript, Tailwind CSS
* **Icons & Components:** Lucide React, Radix UI Primitives, Sonner (Toast notifications)
* **Data Visualization:** Recharts
* **Backend & Database:** Supabase (PostgreSQL 15+, Supabase Auth, Row Level Security, Triggers & Functions)
* **Form Validation:** Zod
* **CI/CD:** GitHub Actions (`.github/workflows/ci.yml`), Vercel Deployment

---

## 📸 แกลเลอรีภาพหน้าจอระบบจริง (System Screenshots Showcase)

ระบบได้รับการพัฒนาและทดสอบการทำงานจริงทุกหน้าจอ สามารถดูรายละเอียดการวิเคราะห์เชิงลึกได้ที่ [docs/DELIVERABLES.md](docs/DELIVERABLES.md):

| # | หน้าจอ / ส่วนประกอบระบบ | ภาพตัวอย่าง (Screenshot) | รายละเอียดและ Phase |
| :-: | :--- | :---: | :--- |
| **01** | **ระบบยืนยันตัวตน & สิทธิ์ทดสอบ**<br>(Authentication & Demo Accounts) | [![Login](docs/screenshots/01_login_page.png)](docs/screenshots/01_login_page.png) | **Phase 2 & 4:** รองรับ Supabase Auth พร้อมปุ่มกด One-Click Demo บัญชี Admin และ Technician |
| **02** | **แดชบอร์ดภาพรวมผู้บริหาร**<br>(Executive KPI & Analytics) | [![Dashboard Overview](docs/screenshots/02_dashboard_overview.png)](docs/screenshots/02_dashboard_overview.png) | **Phase 4 & 6:** Real-time KPI Cards, Recharts Donut & Bar Charts, Recent Alarms Feed, และปุ่ม Export CSV |
| **03** | **โหมดมืดสำหรับห้องควบคุม**<br>(Dark Mode Support) | [![Dark Mode](docs/screenshots/03_dashboard_dark.png)](docs/screenshots/03_dashboard_dark.png) | **Phase 6 Bonus:** รองรับ Theme Toggle สลับ Dark/Light ไร้รอยต่อ ลดความเมื่อยล้าสายตากะกลางคืน |
| **04** | **จัดการข้อมูลเครื่องจักร**<br>(Machine Master Management) | [![Machine Master](docs/screenshots/04_machine_master.png)](docs/screenshots/04_machine_master.png) | **Phase 3:** แสดงตารางเครื่องจักร สถานะแบบ Badge ค้นหาและกรองแบบ Multi-condition (Admin ควบคุม CRUD) |
| **05** | **หน้าต่างเพิ่มเครื่องจักรใหม่**<br>(Machine Registration Modal) | [![Machine Modal](docs/screenshots/05_machine_create_modal.png)](docs/screenshots/05_machine_create_modal.png) | **Phase 3:** Modal ตรวจสอบความถูกต้อง (Zod Validation) ป้องกันรหัสเครื่องจักรซ้ำ แจ้งเตือนผ่าน Toast |
| **06** | **ศูนย์รับแจ้งเหตุขัดข้อง**<br>(Alarm Incident Management) | [![Alarm Management](docs/screenshots/06_alarm_management.png)](docs/screenshots/06_alarm_management.png) | **Phase 3 & 6:** แยกสีตาม Severity, กรองตามวันที่/สถานะ, พร้อม Trigger ปรับสถานะเครื่องจักรเป็น Alarm และ Running อัตโนมัติ |
| **07** | **บันทึกแผนงานซ่อมบำรุง**<br>(Maintenance Records & Cost) | [![Maintenance](docs/screenshots/07_maintenance_records.png)](docs/screenshots/07_maintenance_records.png) | **Phase 3 & 6:** มอบหมายงานช่างเทคนิค ติดตามสถานะงาน กำหนดวันนัดหมาย และบันทึกค่าใช้จ่ายจริง |
| **08** | **ประวัติการแก้ไขระบบ**<br>(Audit Trail & JSON Diff) | [![Audit Logs Diff](docs/screenshots/08_audit_logs_diff.png)](docs/screenshots/08_audit_logs_diff.png) | **Phase 6 Bonus:** บันทึกประวัติ INSERT/UPDATE/DELETE พร้อมตัวเปรียบเทียบ JSON Diff สีเขียว/แดง (Admin Only) |
| **09** | **แผนภาพสถาปัตยกรรมฐานข้อมูล**<br>(Database ER Diagram) | [![ER Diagram](docs/screenshots/09_er_diagram.png)](docs/screenshots/09_er_diagram.png) | **Phase 2 & 7:** แผนภาพความสัมพันธ์ 5 ตารางหลัก Enums และ Foreign Key Constraints บน PostgreSQL |

---

## 🗄️ โครงสร้างฐานข้อมูล (Database Schema)

ฐานข้อมูลประกอบด้วย 5 ตารางหลัก พร้อมเปิดใช้งาน Row Level Security (RLS) ทุกตาราง:

![Entity Relationship Diagram](docs/screenshots/09_er_diagram.png)

```
+------------------+          +------------------------+
|     profiles     |          |        machines        |
+------------------+          +------------------------+
| id (UUID, PK)    |<----+    | id (UUID, PK)          |<----+
| email            |     |    | machine_code (UNIQUE)  |     |
| full_name        |     |    | name                   |     |
| role (admin/tech)|     |    | location               |     |
+------------------+     |    | status (enum)          |     |
                         |    +------------------------+     |
                         |                 ^                 |
                         +------------+    |                 |
                                      |    |                 |
                         +------------------------+          |
                         |         alarms         |          |
                         +------------------------+          |
                         | id (UUID, PK)          |          |
                         | machine_id (FK) -------+----------+
                         | title, severity, status|
                         | acknowledged_by (FK) --+
                         | resolved_at            |
                         +------------------------+
                                      ^
                                      |
                         +------------------------+
                         |  maintenance_records   |
                         +------------------------+
                         | id (UUID, PK)          |
                         | machine_id (FK) -------+
                         | technician_id (FK) ----+
                         | title, status, cost    |
                         | scheduled_date         |
                         +------------------------+
```

### สคริปต์ฐานข้อมูล:
* **`supabase/schema.sql`**: สคริปต์สร้าง Enums, ตาราง 5 ตาราง, Indexes, Trigger Procedures, และ RLS Policies (พร้อมรันใน Supabase SQL Editor)
* **`supabase/seed.sql`**: สคริปต์ข้อมูลจำลองสำหรับเครื่องจักร, ข้อมูลแจ้งเตือน, และประวัติการซ่อมบำรุง

---

## 🔑 บัญชีทดสอบระบบ (Demo Test Accounts)

ระบบเตรียมปุ่มกดกรอกข้อมูลทดสอบอัตโนมัติที่หน้า Login:

| บทบาท (Role) | อีเมล (Email) | รหัสผ่าน (Password) | สิทธิ์การใช้งาน |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@factory.com` | `Admin@123456` | สิทธิ์สูงสุด: จัดการเครื่องจักร (CRUD) + ดู Audit Logs |
| **Technician** | `tech1@factory.com` | `Tech@123456` | ช่างเทคนิค: ดูเครื่องจักร + จัดการ Alarm + บันทึก Maintenance |

---

## 💻 ขั้นตอนการติดตั้งและรันในเครื่อง (Local Setup)

### 1. โคลน Repository
```bash
git clone https://github.com/DKBOTMONEY/PLC-Mockup.git
cd PLC-Mockup
```

### 2. ติดตั้ง Dependencies
```bash
npm install
```

### 3. ตั้งค่า Environment Variables
คัดลอกไฟล์ `.env.example` ไปเป็น `.env.local`:
```bash
cp .env.example .env.local
```
กรอกข้อมูล Supabase URL และ Key:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 4. รัน Database Migration บน Supabase
1. เข้าไปที่แดชบอร์ดของ Supabase $\rightarrow$ **SQL Editor**
2. คัดลอกเนื้อหาจากไฟล์ `supabase/schema.sql` แล้วกด **Run**
3. (ทางเลือก) คัดลอกเนื้อหาจาก `supabase/seed.sql` แล้วกด **Run** เพื่อใส่ข้อมูลตัวอย่าง

### 5. รันเซิร์ฟเวอร์สำหรับพัฒนา
```bash
npm run dev
```
เปิดเบราว์เซอร์ที่ [http://localhost:3000](http://localhost:3000)

### 6. ทดสอบ Linting และ Production Build
```bash
npm run lint
npm run build
```

---

## 🌐 การ Deploy บน Vercel (Phase 5)

1. นำเข้า (Import) Repository `DKBOTMONEY/PLC-Mockup` บน [Vercel Dashboard](https://vercel.com)
2. กำหนด **Environment Variables**:
   * `NEXT_PUBLIC_SUPABASE_URL`
   * `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   * `SUPABASE_SERVICE_ROLE_KEY`
3. กด **Deploy** โค้ดจะถูก Build และขึ้น Production ทันที

---

## 📋 สรุปผลการดำเนินงานตาม 7 Phases (Deliverables Checklist)

- [x] **Phase 1: Project Setup & Initialization** (Next.js 15, Tailwind CSS, GitHub Repo, Git commits แยกชัดเจน)
- [x] **Phase 2: Database & Authentication** (4 ตารางหลัก + Audit Logs, Foreign Keys, Supabase Auth, RBAC Admin/Technician)
- [x] **Phase 3: Core Features Development** (Machine Master CRUD, Alarm Incident CRU, Maintenance CRU, Search & Filter)
- [x] **Phase 4: Dashboard & UI/UX** (Summary metric cards, Recharts visualizations, Responsive UI, Toast feedback)
- [x] **Phase 5: CI/CD & Deployment** (GitHub Actions `.github/workflows/ci.yml`, Vercel Deployment ready)
- [x] **Phase 6: Bonus Features** (Export CSV, Date Range filter, Dark/Light Mode, Dashboard Charts, Audit Trail Viewer)
- [x] **Phase 7: Documentation & Deliverables** (`README.md`, `supabase/schema.sql`, `docs/AI_USAGE_REPORT.md`)
