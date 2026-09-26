import http from "http";
import { spawn, exec } from "child_process";
import fs from "fs";
import path from "path";

const MOCK_PORT = 54321;
const APP_PORT = 3000;
const ENV_PATH = path.resolve(process.cwd(), ".env.local");

// Mock Users
const mockAdminUser = {
  id: "00000000-0000-0000-0000-000000000001",
  aud: "authenticated",
  role: "authenticated",
  email: "admin@factory.com",
  email_confirmed_at: "2026-01-01T00:00:00Z",
  user_metadata: { full_name: "Admin System", role: "admin" },
  app_metadata: { provider: "email", providers: ["email"] },
};

const mockTechUser = {
  id: "00000000-0000-0000-0000-000000000002",
  aud: "authenticated",
  role: "authenticated",
  email: "tech1@factory.com",
  email_confirmed_at: "2026-01-01T00:00:00Z",
  user_metadata: { full_name: "สมชาย ประเสริฐ", role: "technician" },
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

let mockMachines = [
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

let mockAlarms = [
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
];

let mockMaintenance = [
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
];

let mockAuditLogs = [
  {
    id: "40000000-0000-0000-0000-000000000001",
    table_name: "machines",
    record_id: "10000000-0000-0000-0000-000000000002",
    action: "UPDATE",
    changed_by: "00000000-0000-0000-0000-000000000001",
    old_data: { status: "Running", machine_code: "MC-002" },
    new_data: { status: "Alarm", machine_code: "MC-002" },
    created_at: new Date(Date.now() - 3600000).toISOString(),
    profiles: {
      id: "00000000-0000-0000-0000-000000000001",
      full_name: "Admin System",
      email: "admin@factory.com",
    },
  },
];

function startMockSupabaseServer(port = MOCK_PORT) {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const url = new URL(req.url, `http://${req.headers.host}`);
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Headers", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");

      if (req.method === "OPTIONS") {
        res.writeHead(204);
        res.end();
        return;
      }

      // Collect body
      let bodyStr = "";
      req.on("data", (chunk) => (bodyStr += chunk));
      req.on("end", () => {
        let body = {};
        try {
          if (bodyStr) body = JSON.parse(bodyStr);
        } catch {}

        // Auth: token
        if (url.pathname.includes("/auth/v1/token")) {
          const isTech = body.email === "tech1@factory.com";
          const user = isTech ? mockTechUser : mockAdminUser;
          res.writeHead(200);
          res.end(
            JSON.stringify({
              access_token: `mock-jwt-${user.user_metadata.role}`,
              token_type: "bearer",
              expires_in: 86400,
              refresh_token: "mock-refresh-token",
              user,
            })
          );
          return;
        }

        // Auth: user
        if (url.pathname.includes("/auth/v1/user")) {
          const authHeader = req.headers.authorization || "";
          const isTech = authHeader.includes("technician");
          res.writeHead(200);
          res.end(JSON.stringify(isTech ? mockTechUser : mockAdminUser));
          return;
        }

        // Auth: logout
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
            const newMachine = {
              id: "10000000-0000-0000-0000-" + String(Date.now()).slice(-12),
              machine_code: body.machine_code || "MC-" + Math.floor(Math.random() * 900 + 100),
              name: body.name || "New Machine",
              location: body.location || "Building A",
              status: body.status || "Running",
              created_by: mockAdminUser.id,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
            mockMachines.unshift(newMachine);
            res.writeHead(201);
            res.end(JSON.stringify(isSingle ? newMachine : [newMachine]));
            return;
          }
          res.writeHead(200);
          res.end(JSON.stringify(isSingle ? mockMachines[0] : mockMachines));
          return;
        }

        // REST: alarms
        if (url.pathname.includes("/rest/v1/alarms")) {
          const isSingle = req.headers.accept?.includes("vnd.pgrst.object+json");
          if (req.method === "POST") {
            const newAlarm = {
              id: "20000000-0000-0000-0000-" + String(Date.now()).slice(-12),
              machine_id: body.machine_id || mockMachines[0].id,
              title: body.title || "New Alarm",
              description: body.description || "",
              severity: body.severity || "Medium",
              status: "Open",
              acknowledged_by: null,
              resolved_at: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              machines: mockMachines.find((m) => m.id === body.machine_id) || mockMachines[0],
              profiles: null,
            };
            mockAlarms.unshift(newAlarm);
            res.writeHead(201);
            res.end(JSON.stringify(isSingle ? newAlarm : [newAlarm]));
            return;
          }
          res.writeHead(200);
          res.end(JSON.stringify(isSingle ? mockAlarms[0] : mockAlarms));
          return;
        }

        // REST: maintenance_records
        if (url.pathname.includes("/rest/v1/maintenance_records")) {
          const isSingle = req.headers.accept?.includes("vnd.pgrst.object+json");
          if (req.method === "POST") {
            const newMaint = {
              id: "30000000-0000-0000-0000-" + String(Date.now()).slice(-12),
              machine_id: body.machine_id || mockMachines[0].id,
              technician_id: body.technician_id || mockTechUser.id,
              title: body.title || "New Maintenance Plan",
              description: body.description || "",
              action_taken: null,
              status: body.status || "Scheduled",
              scheduled_date: body.scheduled_date || new Date().toISOString().slice(0, 10),
              completed_date: null,
              cost: Number(body.cost || 0),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              machines: mockMachines.find((m) => m.id === body.machine_id) || mockMachines[0],
              profiles: mockProfiles[1],
            };
            mockMaintenance.unshift(newMaint);
            res.writeHead(201);
            res.end(JSON.stringify(isSingle ? newMaint : [newMaint]));
            return;
          }
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

        // Default
        res.writeHead(200);
        res.end(JSON.stringify([]));
      });
    });

    server.on("error", reject);
    server.listen(port, () => {
      console.log(`[MOCK] Supabase mock backend listening on http://127.0.0.1:${port}`);
      resolve(server);
    });
  });
}

async function isServerUp(url) {
  try {
    const res = await fetch(url, { redirect: "manual" });
    return res.status >= 200 && res.status < 400;
  } catch {
    return false;
  }
}

async function main() {
  console.log("==================================================");
  console.log("  Alarm & Maintenance Management System");
  console.log("  Interactive Local Demo Environment");
  console.log("==================================================");

  let originalEnv = null;
  if (fs.existsSync(ENV_PATH)) {
    originalEnv = fs.readFileSync(ENV_PATH, "utf-8");
  }

  // Set mock env
  fs.writeFileSync(
    ENV_PATH,
    `NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:${MOCK_PORT}\nNEXT_PUBLIC_SUPABASE_ANON_KEY=mock-anon-key\nSUPABASE_SERVICE_ROLE_KEY=mock-service-key\n`
  );

  const mockServer = await startMockSupabaseServer(MOCK_PORT);

  // Check if Next.js already running
  const running = await isServerUp(`http://localhost:${APP_PORT}`);
  let nextProcess = null;

  if (!running) {
    console.log(`[NEXT] Starting Next.js standalone server on http://localhost:${APP_PORT}...`);
    nextProcess = spawn("npx", ["next", "start", "-p", String(APP_PORT)], {
      env: {
        ...process.env,
        NEXT_PUBLIC_SUPABASE_URL: `http://127.0.0.1:${MOCK_PORT}`,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "mock-anon-key",
        SUPABASE_SERVICE_ROLE_KEY: "mock-service-key",
      },
      stdio: "inherit",
    });

    // Wait until responsive
    for (let i = 0; i < 30; i++) {
      await new Promise((r) => setTimeout(r, 1000));
      if (await isServerUp(`http://localhost:${APP_PORT}`)) {
        console.log(`[NEXT] Server is ready on http://localhost:${APP_PORT}!`);
        break;
      }
    }
  } else {
    console.log(`[NEXT] Server is already running on http://localhost:${APP_PORT}!`);
  }

  console.log("\n🌐 Opening browser at http://localhost:3000 ...");
  exec("open http://localhost:3000");

  console.log("\n==================================================");
  console.log("  ✅ Demo Ready! You can play with the website now.");
  console.log("  - URL: http://localhost:3000");
  console.log("  - Demo Admin: admin@factory.com / Admin@123456");
  console.log("  - Demo Technician: tech1@factory.com / Tech@123456");
  console.log("  Press Ctrl+C to stop the demo server.");
  console.log("==================================================\n");

  const cleanup = () => {
    console.log("\nShutting down demo server...");
    mockServer.close();
    if (nextProcess) nextProcess.kill();
    if (originalEnv) {
      fs.writeFileSync(ENV_PATH, originalEnv);
    }
    process.exit(0);
  };

  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);
}

main().catch(console.error);
