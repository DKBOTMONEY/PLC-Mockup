import http from "http";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import puppeteer from "puppeteer-core";

const DEFAULT_MOCK_PORT = 54321;
const APP_PORT = 3000;
const CHROME_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const SCREENSHOT_DIR = path.resolve(process.cwd(), "docs/screenshots");

// Ensure directory exists
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

// ---------------------------------------------------------------------------
// 1. Mock Data (matching supabase/seed.sql)
// ---------------------------------------------------------------------------
const mockAdminUser = {
  id: "00000000-0000-0000-0000-000000000001",
  aud: "authenticated",
  role: "authenticated",
  email: "admin@factory.com",
  email_confirmed_at: "2026-01-01T00:00:00Z",
  user_metadata: { full_name: "Admin System", role: "admin" },
  app_metadata: { provider: "email", providers: ["email"] },
};

const mockProfiles = [
  {
    id: "00000000-0000-0000-0000-000000000001",
    email: "admin@factory.com",
    full_name: "Admin System",
    role: "admin",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "00000000-0000-0000-0000-000000000002",
    email: "tech1@factory.com",
    full_name: "สมชาย ประเสริฐ",
    role: "technician",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
];

const mockMachines = [
  {
    id: "10000000-0000-0000-0000-000000000001",
    machine_code: "MC-001",
    name: "CNC 5-Axis Milling Station 1",
    location: "Building A - Precision Machining Zone",
    status: "Running",
    created_by: "00000000-0000-0000-0000-000000000001",
    created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: "10000000-0000-0000-0000-000000000002",
    machine_code: "MC-002",
    name: "CNC Lathe Machine A2",
    location: "Building A - Precision Machining Zone",
    status: "Alarm",
    created_by: "00000000-0000-0000-0000-000000000001",
    created_at: new Date(Date.now() - 50 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "10000000-0000-0000-0000-000000000003",
    machine_code: "ROBOT-01",
    name: "Fanuc Robotic Welding Cell 1",
    location: "Building B - Welding Bay",
    status: "Running",
    created_by: "00000000-0000-0000-0000-000000000001",
    created_at: new Date(Date.now() - 45 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: "10000000-0000-0000-0000-000000000004",
    machine_code: "ROBOT-02",
    name: "ABB Robotic Assembly Arm 4",
    location: "Building B - Final Assembly Line",
    status: "Maintenance",
    created_by: "00000000-0000-0000-0000-000000000001",
    created_at: new Date(Date.now() - 40 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 3600000).toISOString(),
  },
  {
    id: "10000000-0000-0000-0000-000000000005",
    machine_code: "PRESS-01",
    name: "Hydraulic Stamping Press 500T",
    location: "Building A - Heavy Press Shop",
    status: "Stop",
    created_by: "00000000-0000-0000-0000-000000000001",
    created_at: new Date(Date.now() - 35 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 12 * 3600000).toISOString(),
  },
  {
    id: "10000000-0000-0000-0000-000000000006",
    machine_code: "PACK-01",
    name: "High-Speed Carton Packaging Unit",
    location: "Building C - Packaging Dept",
    status: "Running",
    created_by: "00000000-0000-0000-0000-000000000001",
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "10000000-0000-0000-0000-000000000007",
    machine_code: "CONV-01",
    name: "Main Line Conveyor Belt System",
    location: "Building B - Internal Logistics",
    status: "Alarm",
    created_by: "00000000-0000-0000-0000-000000000001",
    created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: "10000000-0000-0000-0000-000000000008",
    machine_code: "INJ-01",
    name: "Engel Plastic Injection Molding M1",
    location: "Building C - Molding Workshop",
    status: "Running",
    created_by: "00000000-0000-0000-0000-000000000001",
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
];

const mockAlarms = [
  {
    id: "20000000-0000-0000-0000-000000000001",
    machine_id: "10000000-0000-0000-0000-000000000002",
    title: "Spindle Motor Overheating Critical Alert",
    description: "Main spindle motor temperature reached 98°C during heavy roughing cut. Thermal cutoff warning active.",
    severity: "Critical",
    status: "Open",
    acknowledged_by: null,
    resolved_at: null,
    created_at: new Date(Date.now() - 3600000).toISOString(),
    updated_at: new Date(Date.now() - 3600000).toISOString(),
    machines: {
      id: "10000000-0000-0000-0000-000000000002",
      machine_code: "MC-002",
      name: "CNC Lathe Machine A2",
      location: "Building A - Precision Machining Zone",
    },
    profiles: null,
  },
  {
    id: "20000000-0000-0000-0000-000000000002",
    machine_id: "10000000-0000-0000-0000-000000000002",
    title: "Axis Z Harmonic Vibration Threshold Exceeded",
    description: "Piezoelectric vibration sensor recorded RMS value of 4.8 mm/s exceeding warning limit 3.5 mm/s.",
    severity: "High",
    status: "In Progress",
    acknowledged_by: "00000000-0000-0000-0000-000000000002",
    resolved_at: null,
    created_at: new Date(Date.now() - 4 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    machines: {
      id: "10000000-0000-0000-0000-000000000002",
      machine_code: "MC-002",
      name: "CNC Lathe Machine A2",
      location: "Building A - Precision Machining Zone",
    },
    profiles: {
      id: "00000000-0000-0000-0000-000000000002",
      full_name: "สมชาย ประเสริฐ",
      email: "tech1@factory.com",
    },
  },
  {
    id: "20000000-0000-0000-0000-000000000003",
    machine_id: "10000000-0000-0000-0000-000000000007",
    title: "Conveyor E-Stop Circuit Trip S-04",
    description: "Safety interlock line S-04 broken near loading dock feeder. Conveyor belt automatically halted.",
    severity: "Critical",
    status: "Open",
    acknowledged_by: null,
    resolved_at: null,
    created_at: new Date(Date.now() - 1800000).toISOString(),
    updated_at: new Date(Date.now() - 1800000).toISOString(),
    machines: {
      id: "10000000-0000-0000-0000-000000000007",
      machine_code: "CONV-01",
      name: "Main Line Conveyor Belt System",
      location: "Building B - Internal Logistics",
    },
    profiles: null,
  },
  {
    id: "20000000-0000-0000-0000-000000000004",
    machine_id: "10000000-0000-0000-0000-000000000003",
    title: "Servo Controller Bus Timeout Error E-204",
    description: "Intermittent EtherCAT communication glitch between PLC master and J2 axis servo drive.",
    severity: "Medium",
    status: "Closed",
    acknowledged_by: "00000000-0000-0000-0000-000000000002",
    resolved_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    machines: {
      id: "10000000-0000-0000-0000-000000000003",
      machine_code: "ROBOT-01",
      name: "Fanuc Robotic Welding Cell 1",
      location: "Building B - Welding Bay",
    },
    profiles: {
      id: "00000000-0000-0000-0000-000000000002",
      full_name: "สมชาย ประเสริฐ",
      email: "tech1@factory.com",
    },
  },
  {
    id: "20000000-0000-0000-0000-000000000005",
    machine_id: "10000000-0000-0000-0000-000000000005",
    title: "Hydraulic Line Return Pressure Drop",
    description: "Hydraulic return pressure dipped below minimum threshold (180 bar) during cycle reset.",
    severity: "Low",
    status: "Closed",
    acknowledged_by: "00000000-0000-0000-0000-000000000002",
    resolved_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    machines: {
      id: "10000000-0000-0000-0000-000000000005",
      machine_code: "PRESS-01",
      name: "Hydraulic Stamping Press 500T",
      location: "Building A - Heavy Press Shop",
    },
    profiles: {
      id: "00000000-0000-0000-0000-000000000002",
      full_name: "สมชาย ประเสริฐ",
      email: "tech1@factory.com",
    },
  },
  {
    id: "20000000-0000-0000-0000-000000000006",
    machine_id: "10000000-0000-0000-0000-000000000006",
    title: "Carton Feeder Photo-Eye Obstruction",
    description: "Cardboard dust accumulation triggered false presence signal at intake station #2.",
    severity: "Medium",
    status: "Closed",
    acknowledged_by: "00000000-0000-0000-0000-000000000002",
    resolved_at: new Date(Date.now() - 86400000).toISOString(),
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
    machines: {
      id: "10000000-0000-0000-0000-000000000006",
      machine_code: "PACK-01",
      name: "High-Speed Carton Packaging Unit",
      location: "Building C - Packaging Dept",
    },
    profiles: {
      id: "00000000-0000-0000-0000-000000000002",
      full_name: "สมชาย ประเสริฐ",
      email: "tech1@factory.com",
    },
  },
];

const mockMaintenance = [
  {
    id: "30000000-0000-0000-0000-000000000001",
    machine_id: "10000000-0000-0000-0000-000000000004",
    technician_id: "00000000-0000-0000-0000-000000000002",
    title: "Quarterly Preventative Maintenance & Lubrication",
    description: "Comprehensive multi-axis grease replacement, check cabling harnesses, and recalibrate coordinate zero points.",
    action_taken: "Drained old grease from J1/J2 gearboxes; currently applying high-viscosity synthetic grease.",
    status: "In Progress",
    scheduled_date: new Date().toISOString().slice(0, 10),
    completed_date: null,
    cost: 450.0,
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 3600000).toISOString(),
    machines: {
      id: "10000000-0000-0000-0000-000000000004",
      machine_code: "ROBOT-02",
      name: "ABB Robotic Assembly Arm 4",
      location: "Building B - Final Assembly Line",
    },
    profiles: {
      id: "00000000-0000-0000-0000-000000000002",
      full_name: "สมชาย ประเสริฐ",
      email: "tech1@factory.com",
    },
  },
  {
    id: "30000000-0000-0000-0000-000000000002",
    machine_id: "10000000-0000-0000-0000-000000000005",
    technician_id: "00000000-0000-0000-0000-000000000002",
    title: "Hydraulic Proportional Valve & Filter Overhaul",
    description: "Annual scheduled maintenance for hydraulic high-pressure circuit and replacement of inline filter cartridges.",
    action_taken: null,
    status: "Scheduled",
    scheduled_date: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10),
    completed_date: null,
    cost: 1200.0,
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    machines: {
      id: "10000000-0000-0000-0000-000000000005",
      machine_code: "PRESS-01",
      name: "Hydraulic Stamping Press 500T",
      location: "Building A - Heavy Press Shop",
    },
    profiles: {
      id: "00000000-0000-0000-0000-000000000002",
      full_name: "สมชาย ประเสริฐ",
      email: "tech1@factory.com",
    },
  },
  {
    id: "30000000-0000-0000-0000-000000000003",
    machine_id: "10000000-0000-0000-0000-000000000002",
    technician_id: "00000000-0000-0000-0000-000000000002",
    title: "Spindle Chiller Unit Inspection & Flush",
    description: "Investigate overheating issues reported in recent alarm. Flush coolant radiator and check pump pressure.",
    action_taken: null,
    status: "Scheduled",
    scheduled_date: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
    completed_date: null,
    cost: 850.0,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
    machines: {
      id: "10000000-0000-0000-0000-000000000002",
      machine_code: "MC-002",
      name: "CNC Lathe Machine A2",
      location: "Building A - Precision Machining Zone",
    },
    profiles: {
      id: "00000000-0000-0000-0000-000000000002",
      full_name: "สมชาย ประเสริฐ",
      email: "tech1@factory.com",
    },
  },
  {
    id: "30000000-0000-0000-0000-000000000004",
    machine_id: "10000000-0000-0000-0000-000000000001",
    technician_id: "00000000-0000-0000-0000-000000000002",
    title: "Monthly Laser Geometric Calibration",
    description: "Perform laser interferometer verification for axes straightness and repeatability tolerance.",
    action_taken: "Calibrated X, Y, and Z ball screws. Applied backlash compensation table in Heidenhain CNC controller. Error < 0.003mm.",
    status: "Completed",
    scheduled_date: new Date(Date.now() - 10 * 86400000).toISOString().slice(0, 10),
    completed_date: new Date(Date.now() - 10 * 86400000).toISOString(),
    cost: 200.0,
    created_at: new Date(Date.now() - 12 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    machines: {
      id: "10000000-0000-0000-0000-000000000001",
      machine_code: "MC-001",
      name: "CNC 5-Axis Milling Station 1",
      location: "Building A - Precision Machining Zone",
    },
    profiles: {
      id: "00000000-0000-0000-0000-000000000002",
      full_name: "สมชาย ประเสริฐ",
      email: "tech1@factory.com",
    },
  },
  {
    id: "30000000-0000-0000-0000-000000000005",
    machine_id: "10000000-0000-0000-0000-000000000006",
    technician_id: "00000000-0000-0000-0000-000000000002",
    title: "Intake Optical Sensor Replacement",
    description: "Replace degraded photo-eye sensor on feeding channel with upgraded high-contrast photoelectric sensor.",
    action_taken: "Replaced old photoelectric sensor with Omron E3Z model. Re-routed cable and verified full line operational speed.",
    status: "Completed",
    scheduled_date: new Date(Date.now() - 5 * 86400000).toISOString().slice(0, 10),
    completed_date: new Date(Date.now() - 5 * 86400000).toISOString(),
    cost: 150.0,
    created_at: new Date(Date.now() - 6 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    machines: {
      id: "10000000-0000-0000-0000-000000000006",
      machine_code: "PACK-01",
      name: "High-Speed Carton Packaging Unit",
      location: "Building C - Packaging Dept",
    },
    profiles: {
      id: "00000000-0000-0000-0000-000000000002",
      full_name: "สมชาย ประเสริฐ",
      email: "tech1@factory.com",
    },
  },
];

const mockAuditLogs = [
  {
    id: "40000000-0000-0000-0000-000000000001",
    table_name: "machines",
    record_id: "10000000-0000-0000-0000-000000000002",
    action: "UPDATE",
    changed_by: "00000000-0000-0000-0000-000000000001",
    old_data: {
      status: "Running",
      machine_code: "MC-002",
      location: "Building A",
    },
    new_data: {
      status: "Alarm",
      machine_code: "MC-002",
      location: "Building A",
    },
    created_at: new Date(Date.now() - 3600000).toISOString(),
    profiles: {
      id: "00000000-0000-0000-0000-000000000001",
      full_name: "Admin System",
      email: "admin@factory.com",
    },
  },
  {
    id: "40000000-0000-0000-0000-000000000002",
    table_name: "alarms",
    record_id: "20000000-0000-0000-0000-000000000002",
    action: "UPDATE",
    changed_by: "00000000-0000-0000-0000-000000000002",
    old_data: { status: "Open", acknowledged_by: null },
    new_data: {
      status: "In Progress",
      acknowledged_by: "00000000-0000-0000-0000-000000000002",
    },
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    profiles: {
      id: "00000000-0000-0000-0000-000000000002",
      full_name: "สมชาย ประเสริฐ",
      email: "tech1@factory.com",
    },
  },
  {
    id: "40000000-0000-0000-0000-000000000003",
    table_name: "maintenance_records",
    record_id: "30000000-0000-0000-0000-000000000004",
    action: "UPDATE",
    changed_by: "00000000-0000-0000-0000-000000000002",
    old_data: { status: "In Progress", cost: 0.0 },
    new_data: { status: "Completed", cost: 200.0 },
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    profiles: {
      id: "00000000-0000-0000-0000-000000000002",
      full_name: "สมชาย ประเสริฐ",
      email: "tech1@factory.com",
    },
  },
  {
    id: "40000000-0000-0000-0000-000000000004",
    table_name: "machines",
    record_id: "10000000-0000-0000-0000-000000000008",
    action: "INSERT",
    changed_by: "00000000-0000-0000-0000-000000000001",
    old_data: null,
    new_data: {
      machine_code: "INJ-01",
      name: "Engel Plastic Injection Molding M1",
      status: "Running",
    },
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
    profiles: {
      id: "00000000-0000-0000-0000-000000000001",
      full_name: "Admin System",
      email: "admin@factory.com",
    },
  },
];

// ---------------------------------------------------------------------------
// 2. Start Mock Supabase Server
// ---------------------------------------------------------------------------
function startMockSupabaseServer(port = DEFAULT_MOCK_PORT) {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const url = new URL(req.url, `http://${req.headers.host}`);
      res.setHeader("Content-Type", "application/json");

      // Auth Token
      if (url.pathname.includes("/auth/v1/token")) {
        res.writeHead(200);
        res.end(
          JSON.stringify({
            access_token: "mock-jwt-token-admin",
            token_type: "bearer",
            expires_in: 86400,
            refresh_token: "mock-refresh-token",
            user: mockAdminUser,
          })
        );
        return;
      }

      // Auth User
      if (url.pathname.includes("/auth/v1/user")) {
        res.writeHead(200);
        res.end(JSON.stringify(mockAdminUser));
        return;
      }

      // Auth Logout
      if (url.pathname.includes("/auth/v1/logout")) {
        res.writeHead(200);
        res.end(JSON.stringify({}));
        return;
      }

      // REST: profiles
      if (url.pathname.includes("/rest/v1/profiles")) {
        const isSingle = req.headers.accept?.includes("vnd.pgrst.object+json");
        res.writeHead(200);
        res.end(JSON.stringify(isSingle ? mockProfiles[0] : mockProfiles));
        return;
      }

      // REST: machines
      if (url.pathname.includes("/rest/v1/machines")) {
        const isSingle = req.headers.accept?.includes("vnd.pgrst.object+json");
        if (req.method === "POST") {
          res.writeHead(201);
          res.end(JSON.stringify(mockMachines[0]));
          return;
        }
        res.writeHead(200);
        res.end(JSON.stringify(isSingle ? mockMachines[0] : mockMachines));
        return;
      }

      // REST: alarms
      if (url.pathname.includes("/rest/v1/alarms")) {
        const isSingle = req.headers.accept?.includes("vnd.pgrst.object+json");
        res.writeHead(200);
        res.end(JSON.stringify(isSingle ? mockAlarms[0] : mockAlarms));
        return;
      }

      // REST: maintenance_records
      if (url.pathname.includes("/rest/v1/maintenance_records")) {
        const isSingle = req.headers.accept?.includes("vnd.pgrst.object+json");
        res.writeHead(200);
        res.end(JSON.stringify(isSingle ? mockMaintenance[0] : mockMaintenance));
        return;
      }

      // REST: audit_logs
      if (url.pathname.includes("/rest/v1/audit_logs")) {
        const isSingle = req.headers.accept?.includes("vnd.pgrst.object+json");
        res.writeHead(200);
        res.end(JSON.stringify(isSingle ? mockAuditLogs[0] : mockAuditLogs));
        return;
      }

      // Fallback
      res.writeHead(200);
      res.end(JSON.stringify([]));
    });

    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.log(`[MOCK] Port ${port} in use, trying port ${port + 1}...`);
        resolve(startMockSupabaseServer(port + 1));
      } else {
        reject(err);
      }
    });

    server.listen(port, () => {
      console.log(`[MOCK] Supabase mock server listening on port ${port}`);
      resolve({ server, port });
    });
  });
}

// ---------------------------------------------------------------------------
// 3. Ensure Next.js Local Server Running
// ---------------------------------------------------------------------------
async function isServerUp(url) {
  try {
    const res = await fetch(url, { redirect: "manual" });
    return res.status >= 200 && res.status < 400;
  } catch {
    return false;
  }
}

async function startNextServer(mockPort) {
  console.log("[SERVER] Checking if Next.js is already running on port 3000...");
  const alreadyRunning = await isServerUp(`http://localhost:${APP_PORT}`);
  if (alreadyRunning) {
    console.log("[SERVER] Next.js is already running!");
    return null;
  }

  console.log("[SERVER] Spawning Next.js server on port 3000...");
  const env = {
    ...process.env,
    NEXT_PUBLIC_SUPABASE_URL: `http://127.0.0.1:${mockPort}`,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "mock-anon-key",
  };

  const child = spawn("npx", ["next", "dev", "-p", String(APP_PORT)], {
    env,
    stdio: "inherit",
  });

  for (let i = 0; i < 40; i++) {
    await new Promise((r) => setTimeout(r, 1000));
    if (await isServerUp(`http://localhost:${APP_PORT}`)) {
      console.log("[SERVER] Next.js server is up and responsive!");
      return child;
    }
  }

  throw new Error("Next.js server failed to start in 40 seconds");
}

// ---------------------------------------------------------------------------
// 4. ER Diagram HTML Generator
// ---------------------------------------------------------------------------
function getErDiagramHtml() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Entity-Relationship Diagram</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: #0b0f19;
      background-image: 
        radial-gradient(rgba(59, 130, 246, 0.08) 1px, transparent 0),
        radial-gradient(rgba(148, 163, 184, 0.05) 1px, transparent 0);
      background-size: 24px 24px;
      background-position: 0 0, 12px 12px;
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #e2e8f0;
      width: 1280px;
      height: 800px;
      overflow: hidden;
      position: relative;
      padding: 24px 32px;
    }

    /* Header */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #1e293b;
      padding-bottom: 14px;
      margin-bottom: 22px;
    }
    .title-group h1 {
      font-size: 20px;
      font-weight: 700;
      color: #f8fafc;
      display: flex;
      align-items: center;
      gap: 10px;
      letter-spacing: -0.02em;
    }
    .title-group p {
      font-size: 11px;
      color: #94a3b8;
      margin-top: 2px;
    }
    .badges {
      display: flex;
      gap: 8px;
    }
    .badge {
      font-size: 10px;
      font-weight: 600;
      padding: 4px 10px;
      border-radius: 9999px;
      border: 1px solid;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .badge-blue { background: rgba(59, 130, 246, 0.12); color: #60a5fa; border-color: rgba(59, 130, 246, 0.3); }
    .badge-emerald { background: rgba(16, 185, 129, 0.12); color: #34d399; border-color: rgba(16, 185, 129, 0.3); }
    .badge-purple { background: rgba(168, 85, 247, 0.12); color: #c084fc; border-color: rgba(168, 85, 247, 0.3); }

    /* Schema Grid Layout */
    .schema-canvas {
      position: relative;
      width: 1216px;
      height: 650px;
    }

    /* Table Cards */
    .table-card {
      position: absolute;
      background: #111827;
      border: 1px solid #334155;
      border-radius: 10px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5);
      width: 280px;
      overflow: hidden;
      z-index: 10;
    }
    .table-header {
      padding: 8px 12px;
      font-size: 12px;
      font-weight: 700;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #1f2937;
    }
    .th-profiles { background: #1e1b4b; color: #a5b4fc; border-left: 4px solid #6366f1; }
    .th-machines { background: #064e3b; color: #6ee7b7; border-left: 4px solid #10b981; }
    .th-alarms { background: #7f1d1d; color: #fca5a5; border-left: 4px solid #ef4444; }
    .th-maintenance { background: #78350f; color: #fcd34d; border-left: 4px solid #f59e0b; }
    .th-audit { background: #312e81; color: #c7d2fe; border-left: 4px solid #8b5cf6; }

    .table-sub {
      font-size: 9px;
      color: #94a3b8;
      font-weight: normal;
    }

    .columns {
      padding: 4px 0;
      background: #0f172a;
    }
    .column-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 3.5px 12px;
      font-size: 10.5px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      border-bottom: 1px solid rgba(255, 255, 255, 0.02);
    }
    .column-name {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #cbd5e1;
    }
    .column-type {
      color: #64748b;
      font-size: 9.5px;
    }
    .pill {
      font-size: 8.5px;
      font-weight: 700;
      padding: 1px 4px;
      border-radius: 3px;
      line-height: 1;
    }
    .pill-pk { background: #fef08a; color: #854d0e; }
    .pill-fk { background: #bae6fd; color: #0369a1; }
    .pill-enum { background: #fbcfe8; color: #9d174d; }

    /* SVG Connector Overlay */
    svg.connectors {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1;
    }

    /* Footer Legend */
    .legend {
      position: absolute;
      bottom: 6px;
      left: 32px;
      display: flex;
      gap: 16px;
      font-size: 10px;
      color: #64748b;
      background: rgba(15, 23, 42, 0.8);
      padding: 6px 14px;
      border-radius: 8px;
      border: 1px solid #1e293b;
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 5px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="title-group">
      <h1>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
        Alarm & Maintenance Management System &bull; Database ER Diagram
      </h1>
      <p>Relational Schema Model &bull; PostgreSQL 15 &bull; Supabase Row Level Security (RLS) &bull; Audit Trail</p>
    </div>
    <div class="badges">
      <span class="badge badge-blue">PostgreSQL 15</span>
      <span class="badge badge-emerald">5 Tables &bull; Enums</span>
      <span class="badge badge-purple">RLS Enabled</span>
    </div>
  </div>

  <div class="schema-canvas">
    <!-- SVG Connector Lines -->
    <svg class="connectors">
      <defs>
        <marker id="arrow-blue" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
          <polygon points="0 1, 8 4, 0 7" fill="#60a5fa" />
        </marker>
        <marker id="arrow-emerald" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
          <polygon points="0 1, 8 4, 0 7" fill="#34d399" />
        </marker>
        <marker id="arrow-amber" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
          <polygon points="0 1, 8 4, 0 7" fill="#f59e0b" />
        </marker>
        <marker id="arrow-purple" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
          <polygon points="0 1, 8 4, 0 7" fill="#a855f7" />
        </marker>
      </defs>

      <!-- profiles (top:10, left:20) -> machines (top:10, left:460) created_by -->
      <path d="M 300 70 L 460 140" stroke="#60a5fa" stroke-width="2" fill="none" stroke-dasharray="4 2" marker-end="url(#arrow-blue)" />

      <!-- machines (top:10, left:460) -> alarms (top:330, left:20) machine_id -->
      <path d="M 520 220 C 520 280, 200 280, 200 330" stroke="#34d399" stroke-width="2" fill="none" marker-end="url(#arrow-emerald)" />

      <!-- machines (top:10, left:460) -> maintenance_records (top:330, left:460) machine_id -->
      <path d="M 600 220 L 600 330" stroke="#34d399" stroke-width="2" fill="none" marker-end="url(#arrow-emerald)" />

      <!-- profiles (top:10, left:20) -> maintenance_records technician_id -->
      <path d="M 160 210 C 160 280, 480 280, 480 330" stroke="#60a5fa" stroke-width="2" fill="none" stroke-dasharray="4 2" marker-end="url(#arrow-blue)" />

      <!-- profiles (top:10, left:20) -> alarms acknowledged_by -->
      <path d="M 80 210 L 80 330" stroke="#60a5fa" stroke-width="2" fill="none" stroke-dasharray="4 2" marker-end="url(#arrow-blue)" />

      <!-- profiles -> audit_logs changed_by -->
      <path d="M 280 200 C 350 240, 850 150, 920 330" stroke="#60a5fa" stroke-width="2" fill="none" stroke-dasharray="4 2" marker-end="url(#arrow-blue)" />
    </svg>

    <!-- Table 1: profiles -->
    <div class="table-card" style="top: 10px; left: 20px;">
      <div class="table-header th-profiles">
        <span>public.profiles</span>
        <span class="table-sub">Auth & Users</span>
      </div>
      <div class="columns">
        <div class="column-row"><span class="column-name"><span class="pill pill-pk">PK</span>id</span><span class="column-type">UUID &bull; auth.users</span></div>
        <div class="column-row"><span class="column-name">email</span><span class="column-type">TEXT NOT NULL</span></div>
        <div class="column-row"><span class="column-name">full_name</span><span class="column-type">TEXT NOT NULL</span></div>
        <div class="column-row"><span class="column-name"><span class="pill pill-enum">ENUM</span>role</span><span class="column-type">user_role</span></div>
        <div class="column-row"><span class="column-name">created_at</span><span class="column-type">TIMESTAMPTZ</span></div>
        <div class="column-row"><span class="column-name">updated_at</span><span class="column-type">TIMESTAMPTZ</span></div>
      </div>
    </div>

    <!-- Table 2: machines -->
    <div class="table-card" style="top: 10px; left: 460px; width: 300px;">
      <div class="table-header th-machines">
        <span>public.machines</span>
        <span class="table-sub">Machine Master</span>
      </div>
      <div class="columns">
        <div class="column-row"><span class="column-name"><span class="pill pill-pk">PK</span>id</span><span class="column-type">UUID</span></div>
        <div class="column-row"><span class="column-name">machine_code</span><span class="column-type">TEXT UNIQUE</span></div>
        <div class="column-row"><span class="column-name">name</span><span class="column-type">TEXT NOT NULL</span></div>
        <div class="column-row"><span class="column-name">location</span><span class="column-type">TEXT NOT NULL</span></div>
        <div class="column-row"><span class="column-name"><span class="pill pill-enum">ENUM</span>status</span><span class="column-type">machine_status</span></div>
        <div class="column-row"><span class="column-name"><span class="pill pill-fk">FK</span>created_by</span><span class="column-type">UUID &bull; profiles.id</span></div>
        <div class="column-row"><span class="column-name">created_at</span><span class="column-type">TIMESTAMPTZ</span></div>
        <div class="column-row"><span class="column-name">updated_at</span><span class="column-type">TIMESTAMPTZ</span></div>
      </div>
    </div>

    <!-- System Architecture Info Card (top right) -->
    <div class="table-card" style="top: 10px; left: 880px; width: 316px; border-color: #1e3a8a;">
      <div class="table-header" style="background: #172554; color: #93c5fd; border-left: 4px solid #3b82f6;">
        <span>Architecture & Triggers</span>
        <span class="table-sub">Automations</span>
      </div>
      <div class="columns" style="padding: 10px 14px; font-size: 10.5px; color: #94a3b8; line-height: 1.6;">
        <p style="color: #cbd5e1; font-weight: 600; margin-bottom: 4px;">⚡ Automated DB Triggers:</p>
        <div>&bull; <strong style="color: #f1f5f9;">sync_machine_status_on_alarm:</strong> Updates machine to <span style="color:#ef4444;">Alarm</span> or restores to <span style="color:#10b981;">Running</span> automatically.</div>
        <div>&bull; <strong style="color: #f1f5f9;">log_audit_event:</strong> Streams changes into audit_logs.</div>
        <div>&bull; <strong style="color: #f1f5f9;">set_updated_at:</strong> Refreshes timestamp.</div>
        <p style="color: #cbd5e1; font-weight: 600; margin-top: 8px; margin-bottom: 4px;">🛡️ Role-Based Access Control:</p>
        <div>&bull; <strong style="color: #60a5fa;">Admin:</strong> Full CRUD on Machines, Alarms, Maintenance & Audits.</div>
        <div>&bull; <strong style="color: #f59e0b;">Technician:</strong> View Machines/Alarms, Update Alarm status, Manage Work Orders.</div>
      </div>
    </div>

    <!-- Table 3: alarms -->
    <div class="table-card" style="top: 330px; left: 20px; width: 300px;">
      <div class="table-header th-alarms">
        <span>public.alarms</span>
        <span class="table-sub">Alarm Management</span>
      </div>
      <div class="columns">
        <div class="column-row"><span class="column-name"><span class="pill pill-pk">PK</span>id</span><span class="column-type">UUID</span></div>
        <div class="column-row"><span class="column-name"><span class="pill pill-fk">FK</span>machine_id</span><span class="column-type">UUID &bull; machines.id</span></div>
        <div class="column-row"><span class="column-name">title</span><span class="column-type">TEXT NOT NULL</span></div>
        <div class="column-row"><span class="column-name">description</span><span class="column-type">TEXT</span></div>
        <div class="column-row"><span class="column-name"><span class="pill pill-enum">ENUM</span>severity</span><span class="column-type">alarm_severity</span></div>
        <div class="column-row"><span class="column-name"><span class="pill pill-enum">ENUM</span>status</span><span class="column-type">alarm_status</span></div>
        <div class="column-row"><span class="column-name"><span class="pill pill-fk">FK</span>acknowledged_by</span><span class="column-type">UUID &bull; profiles.id</span></div>
        <div class="column-row"><span class="column-name">resolved_at</span><span class="column-type">TIMESTAMPTZ</span></div>
        <div class="column-row"><span class="column-name">created_at</span><span class="column-type">TIMESTAMPTZ</span></div>
      </div>
    </div>

    <!-- Table 4: maintenance_records -->
    <div class="table-card" style="top: 330px; left: 440px; width: 320px;">
      <div class="table-header th-maintenance">
        <span>public.maintenance_records</span>
        <span class="table-sub">Preventative & Repair</span>
      </div>
      <div class="columns">
        <div class="column-row"><span class="column-name"><span class="pill pill-pk">PK</span>id</span><span class="column-type">UUID</span></div>
        <div class="column-row"><span class="column-name"><span class="pill pill-fk">FK</span>machine_id</span><span class="column-type">UUID &bull; machines.id</span></div>
        <div class="column-row"><span class="column-name"><span class="pill pill-fk">FK</span>technician_id</span><span class="column-type">UUID &bull; profiles.id</span></div>
        <div class="column-row"><span class="column-name">title</span><span class="column-type">TEXT NOT NULL</span></div>
        <div class="column-row"><span class="column-name">action_taken</span><span class="column-type">TEXT</span></div>
        <div class="column-row"><span class="column-name"><span class="pill pill-enum">ENUM</span>status</span><span class="column-type">maintenance_status</span></div>
        <div class="column-row"><span class="column-name">scheduled_date</span><span class="column-type">DATE</span></div>
        <div class="column-row"><span class="column-name">completed_date</span><span class="column-type">TIMESTAMPTZ</span></div>
        <div class="column-row"><span class="column-name">cost</span><span class="column-type">NUMERIC(10,2)</span></div>
        <div class="column-row"><span class="column-name">created_at</span><span class="column-type">TIMESTAMPTZ</span></div>
      </div>
    </div>

    <!-- Table 5: audit_logs -->
    <div class="table-card" style="top: 330px; left: 880px; width: 316px;">
      <div class="table-header th-audit">
        <span>public.audit_logs</span>
        <span class="table-sub">Audit Trail (Bonus)</span>
      </div>
      <div class="columns">
        <div class="column-row"><span class="column-name"><span class="pill pill-pk">PK</span>id</span><span class="column-type">UUID</span></div>
        <div class="column-row"><span class="column-name">table_name</span><span class="column-type">TEXT NOT NULL</span></div>
        <div class="column-row"><span class="column-name">record_id</span><span class="column-type">UUID NOT NULL</span></div>
        <div class="column-row"><span class="column-name">action</span><span class="column-type">TEXT (INSERT|UPDATE|DEL)</span></div>
        <div class="column-row"><span class="column-name"><span class="pill pill-fk">FK</span>changed_by</span><span class="column-type">UUID &bull; profiles.id</span></div>
        <div class="column-row"><span class="column-name">old_data</span><span class="column-type">JSONB</span></div>
        <div class="column-row"><span class="column-name">new_data</span><span class="column-type">JSONB</span></div>
        <div class="column-row"><span class="column-name">created_at</span><span class="column-type">TIMESTAMPTZ</span></div>
      </div>
    </div>
  </div>

  <div class="legend">
    <div class="legend-item"><span class="pill pill-pk">PK</span> Primary Key</div>
    <div class="legend-item"><span class="pill pill-fk">FK</span> Foreign Key (1 : N)</div>
    <div class="legend-item"><span class="pill pill-enum">ENUM</span> PostgreSQL Enum Type</div>
    <div class="legend-item"><span style="color:#60a5fa;">&bull; Blue Line:</span> User / Profile Association</div>
    <div class="legend-item"><span style="color:#34d399;">&bull; Green Line:</span> Machine Foreign Key Relation</div>
  </div>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// 5. Main Execution Flow
// ---------------------------------------------------------------------------
async function main() {
  console.log("=== Phase 7: Screenshot Capture & ER Diagram Generation ===");

  // 1. Start mock Supabase server
  const { server: mockServer, port: mockPort } = await startMockSupabaseServer();

  // 2. Backup existing .env.local
  const envPath = path.resolve(process.cwd(), ".env.local");
  let originalEnv = null;
  if (fs.existsSync(envPath)) {
    originalEnv = fs.readFileSync(envPath, "utf8");
  }

  // Write temporary .env.local for local mock server
  fs.writeFileSync(
    envPath,
    `NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:${mockPort}\nNEXT_PUBLIC_SUPABASE_ANON_KEY=mock-anon-key\nSUPABASE_SERVICE_ROLE_KEY=mock-service-role-key\n`
  );

  let nextProcess = null;
  let browser = null;

  try {
    // 3. Start Next.js
    nextProcess = await startNextServer(mockPort);

    // 4. Launch Headless Chrome
    console.log("[CHROME] Launching headless browser...");
    browser = await puppeteer.launch({
      executablePath: CHROME_PATH,
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--window-size=1280,800",
      ],
      defaultViewport: {
        width: 1280,
        height: 800,
        deviceScaleFactor: 1,
      },
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    // -------------------------------------------------------------------------
    // Shot 1: Login Page
    // -------------------------------------------------------------------------
    console.log("[1/9] Capturing 01_login_page.png...");
    await page.goto(`http://localhost:${APP_PORT}/login`, { waitUntil: "networkidle0" });
    await new Promise((r) => setTimeout(r, 800));
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "01_login_page.png"),
      fullPage: false,
    });

    // Perform Login
    console.log("[AUTH] Logging in as Admin...");
    await page.type('input[name="email"]', "admin@factory.com");
    await page.type('input[name="password"]', "Admin@123456");
    await page.click('button[type="submit"]');

    // Wait for redirect to /
    await page.waitForNavigation({ waitUntil: "networkidle0", timeout: 15000 }).catch(() => {});
    await new Promise((r) => setTimeout(r, 1500));

    // -------------------------------------------------------------------------
    // Shot 2: Dashboard Overview (Light Mode)
    // -------------------------------------------------------------------------
    console.log("[2/9] Capturing 02_dashboard_overview.png...");
    await page.goto(`http://localhost:${APP_PORT}/`, { waitUntil: "networkidle0" });
    // Ensure light mode
    await page.evaluate(() => {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    });
    await new Promise((r) => setTimeout(r, 1500));
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "02_dashboard_overview.png"),
      fullPage: false,
    });

    // -------------------------------------------------------------------------
    // Shot 3: Dashboard Dark Mode
    // -------------------------------------------------------------------------
    console.log("[3/9] Capturing 03_dashboard_dark.png...");
    await page.evaluate(() => {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    });
    await new Promise((r) => setTimeout(r, 1000));
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "03_dashboard_dark.png"),
      fullPage: false,
    });

    // Reset back to light mode for remaining screenshots
    await page.evaluate(() => {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    });

    // -------------------------------------------------------------------------
    // Shot 4: Machine Master
    // -------------------------------------------------------------------------
    console.log("[4/9] Capturing 04_machine_master.png...");
    await page.goto(`http://localhost:${APP_PORT}/machines`, { waitUntil: "networkidle0" });
    await new Promise((r) => setTimeout(r, 1200));
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "04_machine_master.png"),
      fullPage: false,
    });

    // -------------------------------------------------------------------------
    // Shot 5: Machine Create Modal
    // -------------------------------------------------------------------------
    console.log("[5/9] Capturing 05_machine_create_modal.png...");
    const buttons = await page.$$("button");
    let clicked = false;
    for (const b of buttons) {
      const text = await page.evaluate((el) => el.textContent, b);
      if (text && text.includes("เพิ่มเครื่องจักร")) {
        await b.click();
        clicked = true;
        break;
      }
    }
    if (!clicked) {
      console.warn("Could not find button 'เพิ่มเครื่องจักร', trying selector");
    }
    await new Promise((r) => setTimeout(r, 800));
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "05_machine_create_modal.png"),
      fullPage: false,
    });

    // Close modal if open
    await page.keyboard.press("Escape");
    await new Promise((r) => setTimeout(r, 400));

    // -------------------------------------------------------------------------
    // Shot 6: Alarm Management
    // -------------------------------------------------------------------------
    console.log("[6/9] Capturing 06_alarm_management.png...");
    await page.goto(`http://localhost:${APP_PORT}/alarms`, { waitUntil: "networkidle0" });
    await new Promise((r) => setTimeout(r, 1200));
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "06_alarm_management.png"),
      fullPage: false,
    });

    // -------------------------------------------------------------------------
    // Shot 7: Maintenance Records
    // -------------------------------------------------------------------------
    console.log("[7/9] Capturing 07_maintenance_records.png...");
    await page.goto(`http://localhost:${APP_PORT}/maintenance`, { waitUntil: "networkidle0" });
    await new Promise((r) => setTimeout(r, 1200));
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "07_maintenance_records.png"),
      fullPage: false,
    });

    // -------------------------------------------------------------------------
    // Shot 8: Audit Logs Diff
    // -------------------------------------------------------------------------
    console.log("[8/9] Capturing 08_audit_logs_diff.png...");
    await page.goto(`http://localhost:${APP_PORT}/audit-logs`, { waitUntil: "networkidle0" });
    await new Promise((r) => setTimeout(r, 1200));
    // Click the first chevron expand button
    const chevronBtn = await page.$("tbody tr button");
    if (chevronBtn) {
      await chevronBtn.click();
      await new Promise((r) => setTimeout(r, 600));
    }
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "08_audit_logs_diff.png"),
      fullPage: false,
    });

    // -------------------------------------------------------------------------
    // Shot 9: ER Diagram
    // -------------------------------------------------------------------------
    console.log("[9/9] Capturing 09_er_diagram.png...");
    const erHtml = getErDiagramHtml();
    const erPath = path.resolve(SCREENSHOT_DIR, "er-diagram.html");
    fs.writeFileSync(erPath, erHtml, "utf8");
    await page.goto(`file://${erPath}`, { waitUntil: "load" });
    await new Promise((r) => setTimeout(r, 600));
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "09_er_diagram.png"),
      fullPage: false,
    });

    // Clean up temporary HTML file
    if (fs.existsSync(erPath)) {
      fs.unlinkSync(erPath);
    }

    console.log("\n=== Screenshot Capture Complete! ===");

    // -------------------------------------------------------------------------
    // Verification
    // -------------------------------------------------------------------------
    const expectedFiles = [
      "01_login_page.png",
      "02_dashboard_overview.png",
      "03_dashboard_dark.png",
      "04_machine_master.png",
      "05_machine_create_modal.png",
      "06_alarm_management.png",
      "07_maintenance_records.png",
      "08_audit_logs_diff.png",
      "09_er_diagram.png",
    ];

    let allValid = true;
    console.log("\n--- Deliverable Asset Verification ---");
    for (const filename of expectedFiles) {
      const filePath = path.join(SCREENSHOT_DIR, filename);
      if (!fs.existsSync(filePath)) {
        console.error(`❌ MISSING: ${filename}`);
        allValid = false;
        continue;
      }
      const stats = fs.statSync(filePath);
      const sizeKB = (stats.size / 1024).toFixed(1);
      if (stats.size < 10000) {
        console.error(`❌ TOO SMALL (<10KB): ${filename} (${sizeKB} KB)`);
        allValid = false;
      } else {
        console.log(`✅ ${filename} - ${sizeKB} KB (>10KB threshold passed)`);
      }
    }

    if (!allValid) {
      throw new Error("One or more screenshot deliverables failed verification!");
    }
  } finally {
    // Cleanup
    if (browser) {
      await browser.close();
    }
    if (nextProcess) {
      nextProcess.kill();
    }
    mockServer.close();

    // Restore original .env.local
    if (originalEnv !== null) {
      fs.writeFileSync(envPath, originalEnv);
    }
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
