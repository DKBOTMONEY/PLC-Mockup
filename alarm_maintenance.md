# แผนการพัฒนาโปรเจกต์: Alarm & Maintenance Management System

เอกสารนี้คือแผนการดำเนินงาน (Project Plan) สำหรับพัฒนาระบบ Alarm & Maintenance Management System โดยแบ่งเป็นระยะ (Phases) เพื่อให้ง่ายต่อการติดตามความคืบหน้า

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)
- **Frontend/Backend:** Next.js, Tailwind CSS
- **Database & Auth:** Supabase
- **CI/CD & Hosting:** GitHub, GitHub Actions, Vercel
- **AI Tools:** ChatGPT, GitHub Copilot, etc. (สำหรับช่วยวิเคราะห์, ออกแบบ, เขียนโค้ด, ตรวจสอบ)

---

## 📅 ระยะเวลาและแผนการดำเนินงาน (Phases)

### Phase 1: การตั้งค่าเริ่มต้น (Project Setup & Initialization)
- [ ] สร้างโปรเจกต์ Next.js พร้อมตั้งค่า Tailwind CSS
- [ ] สร้าง GitHub Repository และ Push โค้ดเริ่มต้น (ห้ามอัปโหลดรวดเดียวตอนจบ)
- [ ] สร้างโปรเจกต์บน Supabase และเตรียมพร้อมใช้งาน
- [ ] เชื่อมต่อโปรเจกต์ GitHub กับ Vercel เพื่อเตรียมทำ Deployment
- [ ] ตั้งค่า Environment Variables (`.env.local`) สำหรับเก็บ Supabase URL และ API Keys (ห้าม Commit ไฟล์นี้ลง GitHub เด็ดขาด)

### Phase 2: ฐานข้อมูลและการยืนยันตัวตน (Database & Authentication)
- [ ] **ออกแบบ Database Schema:** สร้างตารางอย่างน้อย 4 ตาราง ได้แก่
  - `users` / `profiles` (เก็บข้อมูลผู้ใช้และ Role: Admin, Technician)
  - `machines` (เก็บข้อมูลเครื่องจักร)
  - `alarms` (เก็บข้อมูลการแจ้งเตือน)
  - `maintenance_records` (เก็บข้อมูลการซ่อมบำรุง)
- [ ] ตั้งค่าความสัมพันธ์ (Foreign Keys) ระหว่างตารางให้ถูกต้อง
- [ ] **ตั้งค่า Supabase Auth:** เปิดใช้งานระบบ Login/Logout
- [ ] **จัดการสิทธิ์ (Role-based Access):** สร้าง Middleware หรือเขียนเงื่อนไขป้องกันการเข้าถึงหน้าเว็บตาม Role
  - *Admin:* เข้าถึงได้ทุกหน้า และจัดการข้อมูลหลักได้
  - *Technician:* ดูข้อมูล, อัปเดต Alarm, บันทึก Maintenance, ดู Dashboard ได้

### Phase 3: พัฒนาฟีเจอร์หลัก (Core Features Development)
- [ ] **Machine Master (CRUD):** 
  - สร้างหน้า UI สำหรับ Create, Read, Update, Delete ข้อมูลเครื่องจักร
  - กำหนดสถานะ (Running, Stop, Alarm, Maintenance)
  - *Validation:* ป้องกันช่องว่าง, เช็ค Machine ID ห้ามซ้ำ
- [ ] **Alarm Record (CRU):**
  - สร้างระบบบันทึกและอัปเดต Alarm (Open, In Progress, Closed)
- [ ] **Maintenance Record (CRU):**
  - สร้างระบบบันทึกและอัปเดตข้อมูลการซ่อมบำรุง
- [ ] **Search & Filter:**
  - สร้างแถบค้นหา/ตัวกรอง ที่รองรับเงื่อนไข 2 อย่างขึ้นไป (เช่น กรองตาม Machine + Status)

### Phase 4: ส่วนแสดงผลรวมและประสบการณ์ผู้ใช้ (Dashboard & UI/UX)
- [ ] **Dashboard:**
  - แสดงตัวเลขสรุป: จำนวนเครื่องจักรทั้งหมด
  - แสดงตัวเลขแยกตามสถานะ: Running, Stop, Alarm, Maintenance
  - แสดงจำนวนรายการ Alarm และ Maintenance ที่กำลังดำเนินการ
- [ ] ปรับปรุงหน้าตา UI ด้วย Tailwind CSS ให้สวยงามและใช้งานง่าย
- [ ] เพิ่ม Input Validation แบบแจ้งเตือน (Alert/Toast) เมื่อผู้ใช้กรอกข้อมูลผิดพลาด

### Phase 5: ระบบอัตโนมัติและการส่งมอบ (CI/CD & Deployment)
- [ ] **GitHub Actions (CI):** 
  - สร้างไฟล์ Workflow (เช่น `.github/workflows/main.yml`)
  - กำหนดขั้นตอน: `Install Dependencies` -> `Build Project` -> `Test / Lint`
  - ตรวจสอบให้ Workflow แสดงสถานะ Passed/Failed เมื่อทำการ Push โค้ด
- [ ] **Vercel Deployment (CD):**
  - ตรวจสอบให้ Vercel ดึงโค้ดล่าสุดจาก GitHub ไป Deploy อัตโนมัติ
  - ตรวจสอบการตั้งค่า Environment Variables บน Vercel ให้เรียบร้อย
  - ทดสอบระบบบน URL จริง

### Phase 6: ฟีเจอร์พิเศษสำหรับคะแนนโบนัส (Bonus Features) - *เลือกทำ*
- [ ] เพิ่มระบบ Machine History / Audit Log (บันทึกประวัติการแก้ไข)
- [ ] เพิ่มปุ่ม Export ข้อมูลเป็น CSV / Excel
- [ ] ทำ Advanced Filter (ตัวกรองตามช่วงวันที่)
- [ ] ปรับ UI ให้เป็น Responsive แบบสมบูรณ์ / เพิ่ม Dark Mode
- [ ] เพิ่มกราฟวิเคราะห์ข้อมูลบน Dashboard

### Phase 7: จัดทำเอกสารและส่งงาน (Documentation & Deliverables)
- [ ] **README.md:** เขียนอธิบายโครงการ, เทคโนโลยี, โครงสร้าง Database, วิธีติดตั้ง, และลิงก์ Vercel
- [ ] **Database Schema:** แคปภาพหน้าจอหรือ Export โครงสร้าง ER Diagram
- [ ] **Screenshots:** ถ่ายภาพหน้าจอระบบการทำงานจริง
- [ ] **AI Usage Report:** เขียนรายงานสั้นๆ ว่าใช้ AI ช่วยในส่วนไหนบ้าง (เช่น ใช้ ChatGPT ออกแบบฐานข้อมูล, ใช้ Copilot ช่วยเขียน UI)
- [ ] ตรวจสอบความเรียบร้อยทั้งหมดและส่งงาน (GitHub URL, Vercel URL, เอกสารต่างๆ)

---
**หมายเหตุ:** ให้ใช้ AI ช่วยในแต่ละ Phase ได้อย่างเต็มที่ แต่ต้องมั่นใจว่าระบบทำงานได้จริง ปลอดภัย และคุณมีความเข้าใจในภาพรวมของระบบที่ส่งมอบ