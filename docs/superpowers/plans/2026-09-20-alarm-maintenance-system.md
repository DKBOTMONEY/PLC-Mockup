# Alarm & Maintenance Management System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a production-ready web application for monitoring factory machinery, recording alarm incidents, scheduling maintenance operations, and analyzing equipment health with role-based access control (Admin / Technician).

**Architecture:** Next.js 15 App Router with TypeScript and Tailwind CSS, interacting with Supabase (PostgreSQL + Auth) via `@supabase/ssr` and Server Actions with Zod validation. Edge Middleware guarantees route and role protection, while Recharts and Sonner Toast deliver an intuitive dashboard experience.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS, `@supabase/ssr`, `@supabase/supabase-js`, Zod, Lucide React, Recharts, Sonner, next-themes, GitHub Actions.

## Global Constraints
- Node.js version floor: 20.x
- Next.js: App Router (`src/app`)
- Database: PostgreSQL on Supabase with Row Level Security (RLS) enabled on all tables
- Authentication: Supabase Auth with Role-Based Access Control (Admin vs Technician)
- Validation: Zod schemas for all forms and server actions
- Commit frequently with descriptive conventional commit messages (`feat:`, `fix:`, `chore:`, `docs:`)
- Never commit `.env.local` containing actual API secret keys

---

### Task 1: Project Initialization & Next.js App Setup (Phase 1)

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `src/app/globals.css`, `src/app/layout.tsx`, `src/app/page.tsx`, `.env.example`, `.gitignore`

**Interfaces:**
- Produces: Working Next.js baseline build with Tailwind CSS and all required dependencies installed.

- [ ] **Step 1: Create package.json and configuration files**

Write `package.json` with required dependencies:
```json
{
  "name": "alarm-maintenance-system",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@supabase/ssr": "^0.5.2",
    "@supabase/supabase-js": "^2.49.1",
    "clsx": "^2.1.1",
    "lucide-react": "^0.475.0",
    "next": "^15.2.0",
    "next-themes": "^0.4.4",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "recharts": "^2.15.1",
    "sonner": "^2.0.1",
    "tailwind-merge": "^3.0.2",
    "zod": "^3.24.2"
  },
  "devDependencies": {
    "@types/node": "^22.13.5",
    "@types/react": "^19.0.10",
    "@types/react-dom": "^19.0.4",
    "eslint": "^9.21.0",
    "eslint-config-next": "^15.2.0",
    "postcss": "^8.5.3",
    "tailwindcss": "^3.4.17",
    "typescript": "^5.7.3"
  }
}
```

- [ ] **Step 2: Install dependencies**

Run: `npm install`
Expected: Dependencies installed and `package-lock.json` created without errors.

- [ ] **Step 3: Setup Tailwind CSS, TypeScript config, and root layout**

Configure `tailwind.config.ts`:
```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  plugins: [],
};
export default config;
```

Configure `src/app/globals.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: #f8fafc;
  --foreground: #0f172a;
}

.dark {
  --background: #090d16;
  --foreground: #f8fafc;
}

body {
  color: var(--foreground);
  background: var(--background);
  font-family: Arial, Helvetica, sans-serif;
}
```

Configure `src/app/layout.tsx`:
```tsx
import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Alarm & Maintenance Management System",
  description: "Industrial Machine & Incident Monitoring System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body className="min-h-screen antialiased bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
```

- [ ] **Step 4: Create `.env.example` and `.gitignore`**

Create `.env.example`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

- [ ] **Step 5: Verify build passes and commit**

Run: `npm run build`
Expected: Production build successfully generated.
Commit:
```bash
git add .
git commit -m "chore: initialize Next.js app with Tailwind CSS and dependencies"
```

---

### Task 2: Supabase Database Schema, RLS & Seed Data (Phase 2 & Phase 6)

**Files:**
- Create: `supabase/schema.sql`, `supabase/seed.sql`, `src/types/database.types.ts`

**Interfaces:**
- Produces: Complete SQL migration script with 5 tables, RLS policies, trigger procedures, and TypeScript typings.

- [ ] **Step 1: Write `supabase/schema.sql`**

Write PostgreSQL schema with enums, tables, functions, triggers, and RLS:
```sql
-- Enums
CREATE TYPE user_role AS ENUM ('admin', 'technician');
CREATE TYPE machine_status AS ENUM ('Running', 'Stop', 'Alarm', 'Maintenance');
CREATE TYPE alarm_status AS ENUM ('Open', 'In Progress', 'Closed');
CREATE TYPE alarm_severity AS ENUM ('Low', 'Medium', 'High', 'Critical');
CREATE TYPE maintenance_status AS ENUM ('Scheduled', 'In Progress', 'Completed');

-- 1. Profiles Table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'technician',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Machines Table
CREATE TABLE public.machines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  machine_code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  status machine_status NOT NULL DEFAULT 'Running',
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Alarms Table
CREATE TABLE public.alarms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  machine_id UUID NOT NULL REFERENCES public.machines(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  severity alarm_severity NOT NULL DEFAULT 'Medium',
  status alarm_status NOT NULL DEFAULT 'Open',
  acknowledged_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Maintenance Records Table
CREATE TABLE public.maintenance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  machine_id UUID NOT NULL REFERENCES public.machines(id) ON DELETE CASCADE,
  technician_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  action_taken TEXT,
  status maintenance_status NOT NULL DEFAULT 'In Progress',
  scheduled_date DATE NOT NULL DEFAULT CURRENT_DATE,
  completed_date TIMESTAMPTZ,
  cost NUMERIC(10, 2) DEFAULT 0.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Audit Logs Table (Bonus)
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL,
  changed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS Setup
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alarms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function: is_admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Policies
CREATE POLICY "Profiles are viewable by authenticated users" ON public.profiles
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (id = auth.uid());

CREATE POLICY "Machines viewable by authenticated" ON public.machines
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Machines insertable by admin" ON public.machines
  FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Machines updatable by admin" ON public.machines
  FOR UPDATE TO authenticated USING (public.is_admin());
CREATE POLICY "Machines deletable by admin" ON public.machines
  FOR DELETE TO authenticated USING (public.is_admin());

CREATE POLICY "Alarms viewable by authenticated" ON public.alarms
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Alarms insertable by authenticated" ON public.alarms
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Alarms updatable by authenticated" ON public.alarms
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Maintenance viewable by authenticated" ON public.maintenance_records
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Maintenance insertable by authenticated" ON public.maintenance_records
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Maintenance updatable by authenticated" ON public.maintenance_records
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Audit logs viewable by authenticated" ON public.audit_logs
  FOR SELECT TO authenticated USING (true);
```

- [ ] **Step 2: Write `supabase/seed.sql`**

Write realistic mock machines, sample alarms, and maintenance tasks for easy demo and testing.

- [ ] **Step 3: Define TypeScript types in `src/types/database.types.ts`**

Generate/write type definitions matching tables and enums.

- [ ] **Step 4: Commit schema and seed**

```bash
git add supabase/ src/types/
git commit -m "feat(db): add supabase schema, RLS policies, triggers and seed data"
```

---

### Task 3: Supabase SSR Clients, Route Protection & Authentication (Phase 1 & Phase 2)

**Files:**
- Create: `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts`, `src/lib/supabase/middleware.ts`, `src/middleware.ts`, `src/actions/auth.ts`, `src/app/(auth)/login/page.tsx`

**Interfaces:**
- Consumes: Supabase credentials from `.env.local`
- Produces: Authenticated user sessions, protected route middleware, and login/logout Server Actions.

- [ ] **Step 1: Create Supabase SSR client utilities**

Implement `src/lib/supabase/client.ts` using `createBrowserClient` and `src/lib/supabase/server.ts` using `createServerClient` with Next.js `cookies()`.

- [ ] **Step 2: Implement Next.js Edge Middleware**

Implement `src/middleware.ts` to refresh session cookies and redirect unauthenticated requests to `/login`.

- [ ] **Step 3: Implement Auth Server Actions (`signIn`, `signOut`)**

Create `src/actions/auth.ts` with error handling and redirect logic.

- [ ] **Step 4: Build modern Login page UI**

Create `src/app/(auth)/login/page.tsx` with email/password form, demo credential hints, loading state, and toast feedback.

- [ ] **Step 5: Verify auth routes build and commit**

Run: `npm run build`
Commit:
```bash
git add src/lib/supabase/ src/middleware.ts src/actions/auth.ts src/app/\(auth\)/
git commit -m "feat(auth): implement supabase ssr clients, middleware guard and login UI"
```

---

### Task 4: Design System & App Shell Layout (Phase 4 & Phase 6)

**Files:**
- Create:
  - `src/lib/utils.ts` (cn helper)
  - `src/components/ui/button.tsx`, `src/components/ui/card.tsx`, `src/components/ui/badge.tsx`, `src/components/ui/input.tsx`, `src/components/ui/dialog.tsx`, `src/components/ui/select.tsx`
  - `src/components/shared/navbar.tsx`, `src/components/shared/sidebar.tsx`, `src/components/shared/theme-toggle.tsx`
  - `src/app/(dashboard)/layout.tsx`

**Interfaces:**
- Produces: Responsive Dashboard layout with collapsible mobile navigation, active route styling, user badge (Admin vs Technician), and Theme Toggle.

- [ ] **Step 1: Write utility helper `src/lib/utils.ts`**

Implement `cn(...inputs)` using `clsx` and `tailwind-merge`.

- [ ] **Step 2: Create reusable UI atom components**

Build accessible, Tailwind-styled Button, Badge, Card, Input, Dialog, and Select components.

- [ ] **Step 3: Build Sidebar & Navbar components**

Include navigation links (`/`, `/machines`, `/alarms`, `/maintenance`, `/audit-logs`), user profile summary, and Logout button.

- [ ] **Step 4: Build Dashboard layout shell `src/app/(dashboard)/layout.tsx`**

Compose Sidebar and Navbar with main content area.

- [ ] **Step 5: Verify build and commit**

Run: `npm run build`
Commit:
```bash
git add src/components/ src/app/\(dashboard\)/layout.tsx src/lib/utils.ts
git commit -m "feat(ui): add design system components, app shell layout and theme toggle"
```

---

### Task 5: Machine Master CRUD Management (Phase 3)

**Files:**
- Create:
  - `src/lib/validations/machine.ts`
  - `src/actions/machines.ts`
  - `src/components/machines/machine-table.tsx`
  - `src/components/machines/machine-modal-form.tsx`
  - `src/components/machines/machine-filters.tsx`
  - `src/app/(dashboard)/machines/page.tsx`

**Interfaces:**
- Consumes: Supabase `machines` table
- Produces: Full CRUD UI with search, status filters, Zod validation, and Admin-only mutation guards.

- [ ] **Step 1: Create Zod validation schema `src/lib/validations/machine.ts`**

Define schema validating `machine_code` (non-empty, alphanumeric), `name`, `location`, and `status`.

- [ ] **Step 2: Implement Machine Server Actions `src/actions/machines.ts`**

Write `getMachines`, `createMachine`, `updateMachine`, and `deleteMachine` with Admin role check and `revalidatePath('/machines')`.

- [ ] **Step 3: Build Machine Table and Filter components**

Implement search by code/name, filter by status, and table action buttons (Edit, Delete).

- [ ] **Step 4: Build Create & Edit Modal Form**

Form with Zod resolver, inline error messages, and Sonner toast on completion.

- [ ] **Step 5: Assemble `src/app/(dashboard)/machines/page.tsx`**

Fetch machine list, pass current user role, render filters, and show count statistics.

- [ ] **Step 6: Verify build and commit**

Run: `npm run build`
Commit:
```bash
git add src/lib/validations/machine.ts src/actions/machines.ts src/components/machines/ src/app/\(dashboard\)/machines/
git commit -m "feat(machines): implement machine master CRUD, validation and filters"
```

---

### Task 6: Alarm Incident Center (CRU) & Status Sync (Phase 3)

**Files:**
- Create:
  - `src/lib/validations/alarm.ts`
  - `src/actions/alarms.ts`
  - `src/components/alarms/alarm-table.tsx`
  - `src/components/alarms/alarm-create-modal.tsx`
  - `src/components/alarms/alarm-update-modal.tsx`
  - `src/components/alarms/alarm-filters.tsx`
  - `src/app/(dashboard)/alarms/page.tsx`

**Interfaces:**
- Consumes: `alarms` and `machines` tables
- Produces: Incident logging, status progression (`Open` -> `In Progress` -> `Closed`), and machine status synchronization.

- [ ] **Step 1: Write Zod schema `src/lib/validations/alarm.ts`**

Validate `machine_id`, `title`, `description`, `severity`, `status`.

- [ ] **Step 2: Implement Alarm Server Actions `src/actions/alarms.ts`**

Write `getAlarms`, `createAlarm` (auto-syncs machine status to 'Alarm'), and `updateAlarmStatus` (records `resolved_at` when closed).

- [ ] **Step 3: Build Alarm Table, Modals, and Filters**

Create status badges (Red for Open, Amber for In Progress, Green for Closed), report form modal, and update status modal.

- [ ] **Step 4: Assemble `src/app/(dashboard)/alarms/page.tsx`**

Integrate multi-filter (Machine + Status + Date range) and list view.

- [ ] **Step 5: Verify build and commit**

Run: `npm run build`
Commit:
```bash
git add src/lib/validations/alarm.ts src/actions/alarms.ts src/components/alarms/ src/app/\(dashboard\)/alarms/
git commit -m "feat(alarms): implement alarm incident CRU, status sync and multi-filters"
```

---

### Task 7: Maintenance Work Orders (CRU) (Phase 3)

**Files:**
- Create:
  - `src/lib/validations/maintenance.ts`
  - `src/actions/maintenance.ts`
  - `src/components/maintenance/maintenance-table.tsx`
  - `src/components/maintenance/maintenance-modal-form.tsx`
  - `src/components/maintenance/maintenance-filters.tsx`
  - `src/app/(dashboard)/maintenance/page.tsx`

**Interfaces:**
- Consumes: `maintenance_records`, `machines`, and `profiles` tables
- Produces: Maintenance scheduling, action logging, and status tracking (`Scheduled` -> `In Progress` -> `Completed`).

- [ ] **Step 1: Write Zod schema `src/lib/validations/maintenance.ts`**

Validate `machine_id`, `technician_id`, `title`, `scheduled_date`, `action_taken`, `status`.

- [ ] **Step 2: Implement Maintenance Server Actions `src/actions/maintenance.ts`**

Write `getMaintenanceRecords`, `createMaintenanceRecord`, and `updateMaintenanceRecord`.

- [ ] **Step 3: Build Maintenance UI components**

Table with status pills, modal form to log repairs and update status to `Completed`.

- [ ] **Step 4: Assemble `src/app/(dashboard)/maintenance/page.tsx`**

Multi-filter by machine, status, technician, and date range.

- [ ] **Step 5: Verify build and commit**

Run: `npm run build`
Commit:
```bash
git add src/lib/validations/maintenance.ts src/actions/maintenance.ts src/components/maintenance/ src/app/\(dashboard\)/maintenance/
git commit -m "feat(maintenance): implement maintenance records CRU and filter system"
```

---

### Task 8: Dashboard Analytics & CSV Export Utility (Phase 4 & Phase 6)

**Files:**
- Create:
  - `src/lib/utils/export-csv.ts`
  - `src/components/shared/export-button.tsx`
  - `src/components/dashboard/summary-cards.tsx`
  - `src/components/dashboard/status-donut-chart.tsx`
  - `src/components/dashboard/severity-bar-chart.tsx`
  - `src/components/dashboard/recent-alarms-widget.tsx`
  - `src/app/(dashboard)/page.tsx`

**Interfaces:**
- Consumes: Aggregated statistics from machines, alarms, and maintenance
- Produces: Executive dashboard with KPI cards, Recharts visualizations, quick-action widgets, and CSV export.

- [ ] **Step 1: Implement CSV export utility `src/lib/utils/export-csv.ts`**

Function `exportToCSV(data: any[], filename: string)` formatting records into downloadable CSV file.

- [ ] **Step 2: Build Summary Metric Cards**

Cards displaying Total Machines, Running/Stop/Alarm/Maintenance breakdown, Active Alarms, and Pending Maintenance.

- [ ] **Step 3: Build Recharts Data Visualizations**

Donut chart for Machine Status Distribution and Bar chart for Incidents by Severity.

- [ ] **Step 4: Build Recent Alarms and Tasks widget**

Display top 5 unresolved alerts with direct navigation.

- [ ] **Step 5: Assemble Executive Dashboard `src/app/(dashboard)/page.tsx`**

Integrate cards, charts, and activity feeds with responsive grid layout.

- [ ] **Step 6: Verify build and commit**

Run: `npm run build`
Commit:
```bash
git add src/lib/utils/export-csv.ts src/components/shared/export-button.tsx src/components/dashboard/ src/app/\(dashboard\)/page.tsx
git commit -m "feat(dashboard): add analytics metric cards, charts and csv export"
```

---

### Task 9: Audit Trail Viewer & Role Permissions Polish (Phase 2 & Phase 6)

**Files:**
- Create:
  - `src/actions/audit.ts`
  - `src/components/audit/audit-log-table.tsx`
  - `src/app/(dashboard)/audit-logs/page.tsx`

**Interfaces:**
- Consumes: `audit_logs` table
- Produces: Admin-only audit inspection screen displaying historical modifications with JSON diffs.

- [ ] **Step 1: Implement Audit Server Action `src/actions/audit.ts`**

Fetch audit logs ordered by `created_at DESC` with Admin-only authorization check.

- [ ] **Step 2: Build Audit Log Table UI**

Display timestamp, table name, action (INSERT, UPDATE, DELETE), user, and inspectable JSON changes.

- [ ] **Step 3: Create `src/app/(dashboard)/audit-logs/page.tsx`**

Protect page with role guard (non-admin receives access denied notice).

- [ ] **Step 4: Verify build and commit**

Run: `npm run build`
Commit:
```bash
git add src/actions/audit.ts src/components/audit/ src/app/\(dashboard\)/audit-logs/
git commit -m "feat(audit): add audit log viewer and role-based permissions display"
```

---

### Task 10: CI/CD Pipeline, Verification & Documentation (Phase 5 & Phase 7)

**Files:**
- Create:
  - `.github/workflows/ci.yml`
  - `README.md`
  - `docs/AI_USAGE_REPORT.md`

**Interfaces:**
- Produces: GitHub Actions CI workflow, comprehensive README, AI usage deliverables, and successful end-to-end build verification.

- [ ] **Step 1: Create GitHub Actions Workflow `.github/workflows/ci.yml`**

```yaml
name: CI Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "npm"

      - name: Install Dependencies
        run: npm ci

      - name: Run Linter
        run: npm run lint

      - name: Build Project
        run: npm run build
```

- [ ] **Step 2: Write complete `README.md`**

Include project overview, architecture diagram, setup instructions, Supabase configuration guide, Vercel deployment link, and demo credentials.

- [ ] **Step 3: Write `docs/AI_USAGE_REPORT.md`**

Document AI utilization across design, schema generation, UI architecture, and testing.

- [ ] **Step 4: Run end-to-end lint and build verification**

Run: `npm run lint && npm run build`
Expected: Zero lint warnings, clean build.

- [ ] **Step 5: Final commit**

```bash
git add .github/workflows/ci.yml README.md docs/AI_USAGE_REPORT.md
git commit -m "docs: add GitHub Actions CI workflow, README and AI usage report"
```
