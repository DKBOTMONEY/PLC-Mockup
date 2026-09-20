# Design Specification: Alarm & Maintenance Management System

- **Date:** 2026-09-20
- **Status:** Approved
- **Target Platform:** Next.js (App Router), Supabase (PostgreSQL + Auth), Tailwind CSS, Vercel
- **Project Repository:** `/Users/bank/Desktop/plc`

---

## 1. Executive Summary & Goals

The **Alarm & Maintenance Management System** is a web-based industrial equipment monitoring and service management application designed to track machine operational status, log and acknowledge incident alarms, schedule and document maintenance operations, and provide operational visibility via analytics dashboards.

The project aligns with the 7-phase implementation roadmap defined in `alarm_maintenance.md`:
1. **Phase 1:** Project Setup & Initialization (Next.js, Tailwind CSS, Git/GitHub, Supabase, Vercel).
2. **Phase 2:** Database & Authentication (4 core tables, Foreign Keys, Supabase Auth, RBAC: Admin vs Technician).
3. **Phase 3:** Core Features Development (Machine Master CRUD, Alarm CRU, Maintenance CRU, Multi-condition Search/Filter).
4. **Phase 4:** Dashboard & UI/UX (Summary metrics, Status breakdown, Tailwind UI, Toast notifications).
5. **Phase 5:** CI/CD & Deployment (GitHub Actions workflow, Vercel production hosting).
6. **Phase 6:** Bonus Features (Audit log, CSV/Excel export, Date range filter, Dark mode, Dashboard charts).
7. **Phase 7:** Documentation & Deliverables (README.md, ER Diagram, System screenshots, AI usage report).

---

## 2. System Architecture & Tech Stack

### 2.1 Technology Stack
- **Framework:** Next.js 15+ (App Router, React 19, TypeScript)
- **Styling & UI System:** Tailwind CSS, Radix UI primitives, Lucide React icons
- **State & Server Interactions:** Next.js Server Actions with Zod schema validation
- **Backend & Database:** Supabase (PostgreSQL, Supabase Auth, Row Level Security)
- **Data Visualization:** Recharts (Donut chart for machine health, Bar chart for alarm severity)
- **Notifications & Feedback:** Sonner (Toast notifications for mutations and form errors)
- **Data Export:** Native CSV generator / SheetJS utility for table exports
- **CI/CD:** GitHub Actions (`.github/workflows/ci.yml`) and Vercel Continuous Deployment

### 2.2 Directory Structure
```text
plc/
├── .github/
│   └── workflows/
│       └── ci.yml               # Automated CI (lint, type-check, build)
├── docs/
│   ├── superpowers/
│   │   └── specs/
│   │       └── 2026-09-20-alarm-maintenance-system-design.md
│   └── AI_USAGE_REPORT.md       # AI utilization deliverables (Phase 7)
├── public/                      # Static assets & icons
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx   # Login screen
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx       # App shell with Sidebar, Header, Breadcrumbs, Dark Mode toggle
│   │   │   ├── page.tsx         # Executive Dashboard (metrics, charts, recent activities)
│   │   │   ├── machines/        # Machine Master management (CRUD)
│   │   │   │   ├── page.tsx     # Machine list with filters and search
│   │   │   │   └── [id]/page.tsx# Machine detail & historical logs
│   │   │   ├── alarms/          # Alarm incident center (CRU)
│   │   │   │   └── page.tsx
│   │   │   ├── maintenance/     # Preventive & corrective maintenance records (CRU)
│   │   │   │   └── page.tsx
│   │   │   └── audit-logs/      # Audit log viewer (Phase 6 bonus)
│   │   │       └── page.tsx
│   │   ├── auth/callback/route.ts # Supabase Auth PKCE callback
│   │   ├── layout.tsx           # Root layout with ThemeProvider and Sonner Toaster
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                  # Reusable UI atoms (Button, Input, Dialog, Table, Badge, Card, Select)
│   │   ├── dashboard/           # SummaryCards, StatusPieChart, AlarmSeverityBarChart, RecentAlarmsWidget
│   │   ├── machines/            # MachineTable, MachineModalForm, MachineDeleteDialog, MachineFilters
│   │   ├── alarms/              # AlarmTable, AlarmCreateModal, AlarmUpdateStatusModal, AlarmFilters
│   │   ├── maintenance/         # MaintenanceTable, MaintenanceModalForm, MaintenanceFilters
│   │   └── shared/              # Navbar, Sidebar, ExportButton, DateRangeFilter, ThemeToggle
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts        # createBrowserClient (Client Components)
│   │   │   ├── server.ts        # createServerClient (Server Components & Actions)
│   │   │   └── middleware.ts    # Session management & token refresh
│   │   ├── validations/         # Zod schemas (machineSchema, alarmSchema, maintenanceSchema)
│   │   └── utils.ts             # Date formatting, CSV stringifier, ClassName helper (cn)
│   ├── actions/                 # Next.js Server Actions
│   │   ├── auth.ts              # signIn, signOut
│   │   ├── machines.ts          # createMachine, updateMachine, deleteMachine
│   │   ├── alarms.ts            # createAlarm, updateAlarmStatus
│   │   ├── maintenance.ts       # createMaintenance, updateMaintenance
│   │   └── audit.ts             # fetchAuditLogs
│   ├── types/
│   │   └── database.types.ts    # TypeScript definitions matching Supabase schema
│   └── middleware.ts            # Next.js edge middleware for route protection & role guard
├── supabase/
│   ├── schema.sql               # Unified SQL script: Enums, Tables, RLS, Triggers
│   └── seed.sql                 # Sample test machines, demo users, sample alarms
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## 3. Database Schema & Security (PostgreSQL on Supabase)

### 3.1 Custom Enums
```sql
CREATE TYPE user_role AS ENUM ('admin', 'technician');
CREATE TYPE machine_status AS ENUM ('Running', 'Stop', 'Alarm', 'Maintenance');
CREATE TYPE alarm_status AS ENUM ('Open', 'In Progress', 'Closed');
CREATE TYPE alarm_severity AS ENUM ('Low', 'Medium', 'High', 'Critical');
CREATE TYPE maintenance_status AS ENUM ('Scheduled', 'In Progress', 'Completed');
```

### 3.2 Tables Definition

#### 1. `profiles`
Links directly to Supabase Auth `auth.users`.
- `id`: `UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE`
- `email`: `TEXT NOT NULL`
- `full_name`: `TEXT NOT NULL`
- `role`: `user_role NOT NULL DEFAULT 'technician'`
- `created_at`: `TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- `updated_at`: `TIMESTAMPTZ NOT NULL DEFAULT NOW()`

#### 2. `machines`
Master record of factory machinery.
- `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `machine_code`: `TEXT NOT NULL UNIQUE` (e.g., "MC-001", "CNC-A2")
- `name`: `TEXT NOT NULL` (e.g., "CNC Milling Station 1")
- `location`: `TEXT NOT NULL` (e.g., "Building A, Floor 2")
- `status`: `machine_status NOT NULL DEFAULT 'Running'`
- `created_by`: `UUID REFERENCES profiles(id) ON DELETE SET NULL`
- `created_at`: `TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- `updated_at`: `TIMESTAMPTZ NOT NULL DEFAULT NOW()`

#### 3. `alarms`
Incident logs triggered by machine anomalies or manually filed.
- `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `machine_id`: `UUID NOT NULL REFERENCES machines(id) ON DELETE CASCADE`
- `title`: `TEXT NOT NULL`
- `description`: `TEXT`
- `severity`: `alarm_severity NOT NULL DEFAULT 'Medium'`
- `status`: `alarm_status NOT NULL DEFAULT 'Open'`
- `acknowledged_by`: `UUID REFERENCES profiles(id) ON DELETE SET NULL`
- `resolved_at`: `TIMESTAMPTZ`
- `created_at`: `TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- `updated_at`: `TIMESTAMPTZ NOT NULL DEFAULT NOW()`

#### 4. `maintenance_records`
Scheduled maintenance and breakdown repair work orders.
- `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `machine_id`: `UUID NOT NULL REFERENCES machines(id) ON DELETE CASCADE`
- `technician_id`: `UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE`
- `title`: `TEXT NOT NULL`
- `description`: `TEXT`
- `action_taken`: `TEXT`
- `status`: `maintenance_status NOT NULL DEFAULT 'In Progress'`
- `scheduled_date`: `DATE NOT NULL DEFAULT CURRENT_DATE`
- `completed_date`: `TIMESTAMPTZ`
- `cost`: `NUMERIC(10, 2) DEFAULT 0.00`
- `created_at`: `TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- `updated_at`: `TIMESTAMPTZ NOT NULL DEFAULT NOW()`

#### 5. `audit_logs` (Phase 6 Bonus)
Immutable trail of modifications made across key entities.
- `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `table_name`: `TEXT NOT NULL`
- `record_id`: `UUID NOT NULL`
- `action`: `TEXT NOT NULL` ('INSERT', 'UPDATE', 'DELETE')
- `changed_by`: `UUID REFERENCES profiles(id) ON DELETE SET NULL`
- `old_data`: `JSONB`
- `new_data`: `JSONB`
- `created_at`: `TIMESTAMPTZ NOT NULL DEFAULT NOW()`

### 3.3 Database Triggers & Automation
1. **Auto Profile Creation:** Trigger on `auth.users` `AFTER INSERT` to insert initial record into `profiles` with role extracted from user metadata or defaulting to `'technician'`.
2. **Machine Status Sync on Alarm:** When a new Alarm with `status = 'Open'` is created, a trigger or Server Action updates the corresponding machine's `status` to `'Alarm'`. When an Alarm is closed and no other open alarms exist for that machine, its status reverts to `'Running'`.
3. **Audit Logger Trigger:** Generic trigger logging row changes into `audit_logs`.

### 3.4 Security & Row Level Security (RLS)
- RLS enabled on all tables (`profiles`, `machines`, `alarms`, `maintenance_records`, `audit_logs`).
- Helper function `auth.is_admin()` checks whether `(SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'`.
- Policies:
  - `profiles`: All authenticated users can read all profiles; users can update their own profile; only admins can modify `role`.
  - `machines`: All authenticated users can `SELECT`; only admins can `INSERT`, `UPDATE`, `DELETE`.
  - `alarms`: All authenticated users can `SELECT`, `INSERT`, and `UPDATE`.
  - `maintenance_records`: All authenticated users can `SELECT`, `INSERT`, and `UPDATE`.
  - `audit_logs`: All authenticated users can `SELECT`; only triggers write to it.

---

## 4. Role-Based Access Control (RBAC) & Middleware

### 4.1 Role Matrix
| Feature / Action | Admin | Technician |
| :--- | :---: | :---: |
| View Dashboard & Metrics | ✅ | ✅ |
| View Machines & Details | ✅ | ✅ |
| Create / Edit / Delete Machines | ✅ | ❌ |
| View Alarms | ✅ | ✅ |
| Create Alarm | ✅ | ✅ |
| Update Alarm Status (Acknowledge / Close) | ✅ | ✅ |
| View Maintenance Records | ✅ | ✅ |
| Create / Update Maintenance Records | ✅ | ✅ |
| Export Data (CSV) | ✅ | ✅ |
| View Audit Logs | ✅ | ❌ |

### 4.2 Middleware Guard
Next.js `middleware.ts` intercepts all requests:
1. Validates Supabase session cookie. If expired or missing, redirects to `/login`.
2. If authenticated user attempts to access `/admin/*` or performs admin-only write actions without `'admin'` role, returns 403 Forbidden or redirects with a toast notification.
3. If already logged in and visiting `/login`, redirects to `/`.

---

## 5. User Interface & Feature Specifications

### 5.1 Dashboard (`/`)
- **Metric Cards:**
  - Total Machines (with online/operating percentage)
  - Status Counters: Running (Green), Stop (Gray), Alarm (Red), Maintenance (Amber)
  - Active Alarms count (Open + In Progress)
  - Pending Maintenance count (Scheduled + In Progress)
- **Visual Analytics (Recharts):**
  - Donut Chart: Distribution of machines by status.
  - Bar Chart: Incidents grouped by severity (Low, Medium, High, Critical).
- **Recent Activities:**
  - Quick-view list of last 5 alarm occurrences with status badges and quick action links.
  - Upcoming scheduled maintenance tasks for the current week.

### 5.2 Machine Management (`/machines`)
- Search input matching `machine_code` or `name`.
- Filter dropdowns: Status (`Running`, `Stop`, `Alarm`, `Maintenance`), Location.
- Data table displaying Code, Name, Location, Status, Last Updated, Actions.
- Modals for Create Machine and Edit Machine with Zod validation.
- Delete confirmation dialog with safety checks (warns if machine has active alarms).

### 5.3 Alarm Incident Records (`/alarms`)
- Multi-condition filters: Target Machine + Alarm Status + Severity + Date Range.
- "Report Alarm" modal: select machine, enter title/notes, select severity.
- "Update Status" modal: transition from `Open` to `In Progress` or `Closed`, adds technician notes, automatically records `resolved_at`.

### 5.4 Maintenance Records (`/maintenance`)
- Multi-condition filters: Machine + Status + Assigned Technician + Date Range.
- "Create Maintenance Task" modal: machine selection, scheduled date, planned action.
- "Complete / Update Task" modal: record `action_taken`, record `completed_date`, update status to `Completed`.

### 5.5 Bonus Features Implementation
- **Export to CSV:** Standardized CSV export button on all list pages (`machines.csv`, `alarms.csv`, `maintenance.csv`) containing currently filtered rows.
- **Dark Mode Support:** Next-themes integration with smooth transition and local storage persistence.
- **Date Range Picker:** Reusable start/end date filter for alarm and maintenance queries.

---

## 6. CI/CD & Deployment Pipeline

### 6.1 GitHub Actions Workflow (`.github/workflows/ci.yml`)
- Trigger: `push` to `main`, `pull_request` to `main`.
- Jobs:
  - Checkout repository.
  - Setup Node.js (v20+).
  - Install dependencies (`npm ci`).
  - Run linter (`npm run lint`).
  - Build test (`npm run build`).

### 6.2 Vercel Deployment
- Connected to GitHub repository for continuous delivery.
- Production environment variables:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`

---

## 7. Deliverables & Documentation Plan (Phase 7)

1. **`README.md`:** Comprehensive instructions covering architecture, features, database schema, local setup, deployment URL, and demo credentials.
2. **`supabase/schema.sql`:** One-click script for creating schemas, functions, triggers, and seed accounts.
3. **`docs/AI_USAGE_REPORT.md`:** Detailed log demonstrating how AI was used across planning, schema design, frontend generation, and automated testing.
4. **Screenshots & ER Diagram:** Stored in `docs/screenshots/` and embedded in `README.md`.
