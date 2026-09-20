# Phase 7 Deliverables & Screenshots Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Generate high-resolution screenshots of all system screens, create the ER Diagram visual asset, compile the `docs/DELIVERABLES.md` showcase, integrate into `README.md`, and push all deliverables to GitHub for Phase 7 completion.

**Architecture:** Automated headless browser capture using macOS Google Chrome binary against a local Next.js instance, combined with an HTML/SVG-to-PNG renderer for the ER Diagram, and Markdown documentation integration.

**Tech Stack:** Node.js, Next.js 15, macOS Google Chrome headless, Tailwind CSS, SVG/Mermaid, Git.

## Global Constraints

- Storage path for screenshots: `docs/screenshots/`
- Standard viewport resolution: 1280x800, PNG format
- Required image count: 9 images (`01_login_page.png` through `09_er_diagram.png`)
- All images must be > 10 KB and visually clean
- Zero lint errors and zero build errors (`npm run lint`, `npm run build`)
- Commit and push to `https://github.com/DKBOTMONEY/PLC-Mockup.git` (`main` and `feat/alarm-maintenance-system`)

---

### Task 1: Screenshot Capture Script & ER Diagram Generation

**Files:**
- Create: `scripts/capture-screenshots.mjs`
- Create: `docs/screenshots/01_login_page.png` ... `docs/screenshots/09_er_diagram.png`

**Interfaces:**
- Consumes: Next.js routes (`/login`, `/`, `/machines`, `/alarms`, `/maintenance`, `/audit-logs`)
- Produces: 9 PNG files in `docs/screenshots/`

- [ ] **Step 1: Create directory for screenshots**

```bash
mkdir -p docs/screenshots scripts
```

- [ ] **Step 2: Create automated screenshot generator script**

Create `scripts/capture-screenshots.mjs` that:
1. Spawns `next start -p 3000` (or uses existing server if running).
2. Uses `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome` in headless mode (`--headless=new --window-size=1280,800 --screenshot=<file> <url>`).
3. Captures `/login` as `docs/screenshots/01_login_page.png`.
4. Uses authenticated cookie or session injection for `/` (`02_dashboard_overview.png`).
5. Captures dark mode preview (`03_dashboard_dark.png`).
6. Captures `/machines` (`04_machine_master.png`).
7. Captures `/machines` with create modal opened (`05_machine_create_modal.png`).
8. Captures `/alarms` (`06_alarm_management.png`).
9. Captures `/maintenance` (`07_maintenance_records.png`).
10. Captures `/audit-logs` (`08_audit_logs_diff.png`).
11. Renders an SVG/HTML schema diagram to `docs/screenshots/09_er_diagram.png`.

- [ ] **Step 3: Run the capture script and verify images**

```bash
node scripts/capture-screenshots.mjs
ls -lh docs/screenshots/
```
Expected: 9 PNG files present in `docs/screenshots/`, each larger than 10KB.

- [ ] **Step 4: Commit generated screenshot assets**

```bash
git add docs/screenshots/ scripts/capture-screenshots.mjs
git commit -m "feat(assets): add system screenshots and ER diagram for phase 7"
```

---

### Task 2: Deliverables Showcase Gallery & README Integration

**Files:**
- Create: `docs/DELIVERABLES.md`
- Modify: `README.md`

**Interfaces:**
- Consumes: `docs/screenshots/*.png`, `alarm_maintenance.md`
- Produces: Updated documentation with live visual showcases

- [ ] **Step 1: Create `docs/DELIVERABLES.md`**

Write a detailed deliverables showcase document in `docs/DELIVERABLES.md`:
- Executive summary of project completion across all 7 phases
- Visual gallery of the 9 screenshots with functional descriptions
- Security and RBAC audit summary
- Instructions for running verification

- [ ] **Step 2: Update `README.md` with visual preview gallery**

In `README.md`:
- Add a "📸 แกลเลอรีภาพหน้าจอระบบจริง (System Screenshots Showcase)" section
- Embed previews for Dashboard (Light/Dark), Machine Master, Alarms, Maintenance, Audit Logs
- Embed the visual ER Diagram
- Link to `docs/DELIVERABLES.md`

- [ ] **Step 3: Verify build and linting**

```bash
npm run lint
npm run build
```
Expected: 0 errors, 0 warnings.

- [ ] **Step 4: Commit documentation changes**

```bash
git add docs/DELIVERABLES.md README.md
git commit -m "docs: add deliverables showcase and integrate screenshots into README"
```

---

### Task 3: Git Synchronization & Final Verification

**Files:**
- All changed files

**Interfaces:**
- Remote: `https://github.com/DKBOTMONEY/PLC-Mockup.git`

- [ ] **Step 1: Push changes to `feat/alarm-maintenance-system`**

```bash
git push origin feat/alarm-maintenance-system
```

- [ ] **Step 2: Fast-forward `main` branch and push**

```bash
git checkout main
git merge feat/alarm-maintenance-system --ff-only
git push origin main
git checkout feat/alarm-maintenance-system
```

- [ ] **Step 3: Final status verification**

```bash
git status
git log -n 3 --oneline
```
Expected: Clean working tree, branches synced with origin.
