# รายงานการประยุกต์ใช้ปัญญาประดิษฐ์ (AI Usage Report)

- **โครงการ:** Alarm & Maintenance Management System
- **จัดทำเมื่อ:** 20 กันยายน 2026
- **แพลตฟอร์ม/เครื่องมือ:** Next.js 15 (App Router), Supabase (PostgreSQL + Auth), Tailwind CSS
- **AI Tools ที่ใช้:** Antigravity (Google DeepMind Agentic Coding Assistant), Claude / Gemini Thinking Models

---

## 1. บทบาทและขอบเขตการใช้งาน AI (AI Roles & Scope)

ในการพัฒนาโครงการนี้ ได้มีการนำ AI เข้ามามีส่วนร่วมในทุกขั้นตอนของวงจรการพัฒนาซอฟต์แวร์ (Software Development Life Cycle - SDLC) ตั้งแต่การวิเคราะห์ข้อกำหนดจนถึงการทดสอบและจัดทำระบบ CI/CD โดยแบ่งตามเฟสดังนี้:

| ขั้นตอน / Phase | กิจกรรมที่ใช้ AI ช่วย | เครื่องมือ AI / เทคนิคที่ใช้ |
| :--- | :--- | :--- |
| **1. Brainstorming & Requirements** | วิเคราะห์เอกสารข้อกำหนด `alarm_maintenance.md` แตกประเด็น 7 Phases และวางแผนงาน | Agentic Brainstorming & Specification Skill |
| **2. Database & Schema Design** | ออกแบบโครงสร้างตาราง 5 ตาราง, Foreign Keys, Triggers อัตโนมัติ, RLS Security และสร้าง Seed Data | AI SQL Generator & Schema Optimization Prompts |
| **3. Security & Access Control** | ออกแบบระบบสิทธิ์ตามบทบาท (RBAC) กั้นเส้นทางผ่าน Next.js Middleware และ PostgreSQL RLS Policies | AI Security Auditing (`SET search_path`, CSRF/Cookie safety) |
| **4. Frontend & Component Engineering** | สร้าง UI Design System ด้วย Tailwind CSS, Lucide Icons, และ Recharts Data Visualization | AI-driven Component Synthesis & Responsive Styling |
| **5. Fullstack CRUD & Server Actions** | พัฒนาระบบ Machine CRUD, Alarm CRU, Maintenance CRU ควบคู่กับ Zod Data Validation | Next.js 15 Server Actions & TypeScript Type Generation |
| **6. CI/CD & Automated Verification** | เขียน Workflow สำหรับ GitHub Actions (`.github/workflows/ci.yml`) และตรวจแก้ Type Errors | Automated Verification & Self-Review Loop |

---

## 2. ตัวอย่างกระบวนการทำงานร่วมกับ AI (Workflows & Prompting)

### 2.1 การออกแบบสถาปัตยกรรมและการสร้างฐานข้อมูล (Database Design)
* **ปัญหา:** ต้องสร้างระบบความสัมพันธ์ที่เมื่อเกิด Alarm สถานะ Open เครื่องจักรต้องปรับสถานะเป็น `Alarm` อัตโนมัติ และเมื่อปิดเคสต้องคืนสถานะเป็น `Running`
* **การใช้ AI:** ให้ AI เขียน PostgreSQL Function และ Trigger `sync_machine_status_on_alarm()` ที่รองรับทั้งการ `INSERT`, `UPDATE`, และ `DELETE` ของ Alarm อย่างปลอดภัย และใส่ `SET search_path = public, pg_temp;` เพื่อป้องกันช่องโหว่ความปลอดภัยระดับฐานข้อมูล

### 2.2 การพัฒนา UI Dashboard และ Data Visualizations
* **ปัญหา:** ผู้บริหารต้องการเห็นอัตราการทำงานของเครื่องจักร สัดส่วนสถานะ และระดับความรุนแรงของปัญหาในหน้าจอเดียว
* **การใช้ AI:** ให้ AI วิเคราะห์โมเดลข้อมูลและสร้างคอมโพเนนต์ Recharts (Donut Chart สำหรับ Machine Health และ Bar Chart สำหรับ Alarm Severity) พร้อม Summary Cards 4 สีที่คำนวณสถิติแบบ Real-time

### 2.3 การเขียน Server Actions และ Data Validation
* **ปัญหา:** ต้องการป้องกันข้อผิดพลาดจากผู้ใช้ เช่น รหัสเครื่องจักรซ้ำ หรือการกรอกข้อมูลไม่ครบถ้วน
* **การใช้ AI:** ให้ AI กำหนด Zod Schemas (`machineSchema`, `createAlarmSchema`, `maintenanceSchema`) ที่ตรวจสอบข้อมูลล่วงหน้าทั้งระดับหน้าบ้านและหลังบ้าน พร้อมส่งข้อความแจ้งเตือนภาษาไทยผ่าน Sonner Toast

---

## 3. การตรวจสอบความถูกต้องและผลลัพธ์ (Verification & Evidence)

โค้ดทั้งหมดที่สร้างโดย AI ผ่านการตรวจสอบด้วยกระบวนการดังนี้:
1. **ESLint Static Analysis:** รัน `npm run lint` ผลลัพธ์: `✔ No ESLint warnings or errors`
2. **Next.js Production Build:** รัน `npm run build` ตรวจสอบทั้ง 10 Static/Dynamic Routes ผ่านฉลุย 100%
3. **Database Idempotency:** สคริปต์ `supabase/schema.sql` และ `supabase/seed.sql` เขียนด้วยเงื่อนไข `IF NOT EXISTS` และ `ON CONFLICT DO UPDATE` สามารถรันซ้ำได้โดยไม่เกิดข้อผิดพลาด
4. **Git Version Control:** ทยอย Commit แยกตามแต่ละฟีเจอร์อย่างเป็นขั้นตอน (Atomic Commits) ตามเกณฑ์ที่กำหนด

---

## 4. สรุปคุณค่าที่ได้รับจาก AI (Reflection & Takeaways)
การใช้งาน AI ในโปรเจกต์นี้ช่วยลดระยะเวลาในการเขียนโค้ดพื้นฐาน (Boilerplate) ลงอย่างมาก ทำให้สามารถโฟกัสไปที่ Business Logic, ประสบการณ์ผู้ใช้งาน (UI/UX), และความปลอดภัยของระบบได้อย่างเต็มที่ ส่งผลให้ได้ระบบที่ทำงานได้จริง ปลอดภัย และมีเอกสารส่งมอบครบถ้วนสมบูรณ์ตามเกณฑ์ทุกประการ
