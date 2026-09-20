# Design Specification: Phase 7 Deliverables & Visual Verification

- **Date:** 2026-09-20
- **Status:** Approved
- **Topic:** Phase 7 Deliverables (Screenshots, ER Diagram, Deliverables Showcase Gallery, and Documentation Integration)
- **Target Repository:** `https://github.com/DKBOTMONEY/PLC-Mockup.git`

---

## 1. Objective

Provide the complete set of visual evidence, system screenshots, and ER Diagram required by Phase 7 of `alarm_maintenance.md` ("จัดทำเอกสารและส่งงาน"):
- Capture high-fidelity screenshots of all primary routes in both Light and Dark modes.
- Generate a visual ER Diagram of the 5 database tables (`profiles`, `machines`, `alarms`, `maintenance_records`, `audit_logs`).
- Create `docs/DELIVERABLES.md` detailing all deliverable assets with image previews.
- Integrate the visual assets into `README.md`.
- Commit all assets and push to the remote repository.

---

## 2. Deliverable Assets Specification

All screenshots will be stored in `docs/screenshots/` with standard desktop viewport resolution (1280x800, 16:10 aspect ratio), saved in lossless PNG format.

| File Name | Screen / Component | Description |
| :--- | :--- | :--- |
| `01_login_page.png` | `/login` | Login page featuring Demo Quick-Fill credentials for Admin and Technician |
| `02_dashboard_overview.png` | `/` | Executive dashboard with KPI metric cards, Recharts Donut chart, Bar chart, and Recent Alerts feed |
| `03_dashboard_dark.png` | `/` | Executive dashboard in Dark Mode demonstrating Phase 6 theme toggle |
| `04_machine_master.png` | `/machines` | Machine Master table with status badges (Running, Stop, Alarm, Maintenance) and search filters |
| `05_machine_create_modal.png` | `/machines` | Interactive modal form for registering machines with validation rules |
| `06_alarm_management.png` | `/alarms` | Alarm incident table with multi-condition filter and severity levels |
| `07_maintenance_records.png` | `/maintenance` | Preventive and corrective maintenance schedule records with cost tracking |
| `08_audit_logs_diff.png` | `/audit-logs` | Phase 6 audit trail viewer with JSON Diff modal showing old vs new record values |
| `09_er_diagram.png` | Diagram | Visual Entity-Relationship Diagram depicting all 5 PostgreSQL tables, types, and foreign keys |

---

## 3. Automation Capture Pipeline

### 3.1 Headless Browser Automation
- Implement a Node.js automation script using Playwright or Chromium to launch the application at `http://localhost:3000`.
- The script handles authentication by utilizing the Admin demo session.
- Automatically navigate to each target route, wait for client components and charts to render, and take full-container or viewport snapshots.
- Toggle dark mode via the theme selector and capture the dark dashboard snapshot.
- Save each image with standardized naming into `docs/screenshots/`.

### 3.2 Diagram Generation
- Synthesize the full ER diagram displaying:
  - `profiles` (`id` PK, `email`, `full_name`, `role`, `created_at`)
  - `machines` (`id` PK, `machine_code` UNIQUE, `name`, `location`, `status`, `created_at`, `updated_at`)
  - `alarms` (`id` PK, `machine_id` FK -> `machines.id`, `title`, `severity`, `status`, `acknowledged_by` FK -> `profiles.id`, `resolved_at`)
  - `maintenance_records` (`id` PK, `machine_id` FK -> `machines.id`, `technician_id` FK -> `profiles.id`, `title`, `status`, `cost`, `scheduled_date`)
  - `audit_logs` (`id` PK, `table_name`, `record_id`, `action`, `old_data`, `new_data`, `performed_by` FK -> `profiles.id`, `created_at`)
- Export both SVG/PNG diagram and embed Mermaid diagram syntax into the documentation.

---

## 4. Documentation Integration

### 4.1 `docs/DELIVERABLES.md`
A dedicated showcase document containing:
- Executive summary of the completed 7 phases.
- Image gallery with clickable captions and feature explanations.
- Verification checklist confirming compliance with `alarm_maintenance.md`.

### 4.2 `README.md` Enhancement
- Add a "📸 System Screenshots (ระบบการทำงานจริง)" section to the project README.
- Embed thumbnail previews of the dashboard, machine master, and audit logs.
- Embed the visual ER Diagram image alongside the Mermaid text diagram.

---

## 5. Verification & Acceptance Criteria
1. `docs/screenshots/` contains all 9 required PNG files.
2. All images are valid, high-resolution PNG files without visual artifacts.
3. `README.md` and `docs/DELIVERABLES.md` correctly reference the screenshots.
4. `npm run build` continues to compile with 0 errors and 0 warnings.
5. All changes are committed and pushed to `origin/main` and `origin/feat/alarm-maintenance-system`.
