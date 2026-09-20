-- ==============================================================================
-- Supabase Seed Data: Alarm & Maintenance Management System
-- Demo profiles, realistic machines, alarms, maintenance tasks, and audit logs
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Demo Profiles & Supabase Auth Users
-- ------------------------------------------------------------------------------
-- Fixed deterministic UUIDs for demo users:
-- Admin:      00000000-0000-0000-0000-000000000001
-- Tech 1:     00000000-0000-0000-0000-000000000002
-- Tech 2:     00000000-0000-0000-0000-000000000003

DO $$
BEGIN
  -- If auth.users table exists (e.g. Supabase local or cloud), insert auth accounts
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
    -- Admin User
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      role,
      aud
    )
    VALUES (
      '00000000-0000-0000-0000-000000000001',
      '00000000-0000-0000-0000-000000000000',
      'admin@example.com',
      crypt('admin123', gen_salt('bf')),
      NOW(),
      '{"provider": "email", "providers": ["email"]}'::jsonb,
      '{"full_name": "Admin System", "role": "admin"}'::jsonb,
      NOW(),
      NOW(),
      'authenticated',
      'authenticated'
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      raw_user_meta_data = EXCLUDED.raw_user_meta_data;

    -- Technician 1 User
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      role,
      aud
    )
    VALUES (
      '00000000-0000-0000-0000-000000000002',
      '00000000-0000-0000-0000-000000000000',
      'technician@example.com',
      crypt('tech123', gen_salt('bf')),
      NOW(),
      '{"provider": "email", "providers": ["email"]}'::jsonb,
      '{"full_name": "Somchai Prasert", "role": "technician"}'::jsonb,
      NOW(),
      NOW(),
      'authenticated',
      'authenticated'
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      raw_user_meta_data = EXCLUDED.raw_user_meta_data;

    -- Technician 2 User
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      role,
      aud
    )
    VALUES (
      '00000000-0000-0000-0000-000000000003',
      '00000000-0000-0000-0000-000000000000',
      'tech2@example.com',
      crypt('tech123', gen_salt('bf')),
      NOW(),
      '{"provider": "email", "providers": ["email"]}'::jsonb,
      '{"full_name": "Wichai Jaidee", "role": "technician"}'::jsonb,
      NOW(),
      NOW(),
      'authenticated',
      'authenticated'
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      raw_user_meta_data = EXCLUDED.raw_user_meta_data;
  END IF;
END $$;

-- Populate public.profiles
INSERT INTO public.profiles (id, email, full_name, role)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin@example.com', 'Admin System', 'admin'),
  ('00000000-0000-0000-0000-000000000002', 'technician@example.com', 'Somchai Prasert', 'technician'),
  ('00000000-0000-0000-0000-000000000003', 'tech2@example.com', 'Wichai Jaidee', 'technician')
ON CONFLICT (id) DO UPDATE
SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  updated_at = NOW();

-- ------------------------------------------------------------------------------
-- 2. Machines Seed Data
-- ------------------------------------------------------------------------------
-- Fixed deterministic UUIDs for machines:
-- MC-001:    10000000-0000-0000-0000-000000000001 (Running)
-- MC-002:    10000000-0000-0000-0000-000000000002 (Alarm)
-- ROBOT-01:  10000000-0000-0000-0000-000000000003 (Running)
-- ROBOT-02:  10000000-0000-0000-0000-000000000004 (Maintenance)
-- PRESS-01:  10000000-0000-0000-0000-000000000005 (Stop)
-- PACK-01:   10000000-0000-0000-0000-000000000006 (Running)
-- CONV-01:   10000000-0000-0000-0000-000000000007 (Alarm)
-- INJ-01:    10000000-0000-0000-0000-000000000008 (Running)

INSERT INTO public.machines (id, machine_code, name, location, status, created_by, created_at, updated_at)
VALUES
  (
    '10000000-0000-0000-0000-000000000001',
    'MC-001',
    'CNC 5-Axis Milling Station 1',
    'Building A - Precision Machining Zone',
    'Running',
    '00000000-0000-0000-0000-000000000001',
    NOW() - INTERVAL '60 days',
    NOW() - INTERVAL '10 days'
  ),
  (
    '10000000-0000-0000-0000-000000000002',
    'MC-002',
    'CNC Lathe Machine A2',
    'Building A - Precision Machining Zone',
    'Alarm',
    '00000000-0000-0000-0000-000000000001',
    NOW() - INTERVAL '50 days',
    NOW() - INTERVAL '1 hour'
  ),
  (
    '10000000-0000-0000-0000-000000000003',
    'ROBOT-01',
    'Fanuc Robotic Welding Cell 1',
    'Building B - Welding Bay',
    'Running',
    '00000000-0000-0000-0000-000000000001',
    NOW() - INTERVAL '45 days',
    NOW() - INTERVAL '2 days'
  ),
  (
    '10000000-0000-0000-0000-000000000004',
    'ROBOT-02',
    'ABB Robotic Assembly Arm 4',
    'Building B - Final Assembly Line',
    'Maintenance',
    '00000000-0000-0000-0000-000000000001',
    NOW() - INTERVAL '40 days',
    NOW() - INTERVAL '3 hours'
  ),
  (
    '10000000-0000-0000-0000-000000000005',
    'PRESS-01',
    'Hydraulic Stamping Press 500T',
    'Building A - Heavy Press Shop',
    'Stop',
    '00000000-0000-0000-0000-000000000001',
    NOW() - INTERVAL '35 days',
    NOW() - INTERVAL '12 hours'
  ),
  (
    '10000000-0000-0000-0000-000000000006',
    'PACK-01',
    'High-Speed Carton Packaging Unit',
    'Building C - Packaging Dept',
    'Running',
    '00000000-0000-0000-0000-000000000001',
    NOW() - INTERVAL '30 days',
    NOW() - INTERVAL '1 day'
  ),
  (
    '10000000-0000-0000-0000-000000000007',
    'CONV-01',
    'Main Line Conveyor Belt System',
    'Building B - Internal Logistics',
    'Alarm',
    '00000000-0000-0000-0000-000000000001',
    NOW() - INTERVAL '25 days',
    NOW() - INTERVAL '30 minutes'
  ),
  (
    '10000000-0000-0000-0000-000000000008',
    'INJ-01',
    'Engel Plastic Injection Molding M1',
    'Building C - Molding Workshop',
    'Running',
    '00000000-0000-0000-0000-000000000001',
    NOW() - INTERVAL '20 days',
    NOW() - INTERVAL '5 days'
  )
ON CONFLICT (machine_code) DO UPDATE
SET
  name = EXCLUDED.name,
  location = EXCLUDED.location,
  status = EXCLUDED.status,
  updated_at = NOW();

-- ------------------------------------------------------------------------------
-- 3. Alarms Seed Data
-- ------------------------------------------------------------------------------
-- Fixed deterministic UUIDs for sample alarms:
-- Alarm 1: 20000000-0000-0000-0000-000000000001 (MC-002: Critical, Open)
-- Alarm 2: 20000000-0000-0000-0000-000000000002 (MC-002: High, In Progress)
-- Alarm 3: 20000000-0000-0000-0000-000000000003 (CONV-01: Critical, Open)
-- Alarm 4: 20000000-0000-0000-0000-000000000004 (ROBOT-01: Medium, Closed)
-- Alarm 5: 20000000-0000-0000-0000-000000000005 (PRESS-01: Low, Closed)
-- Alarm 6: 20000000-0000-0000-0000-000000000006 (PACK-01: Medium, Closed)

INSERT INTO public.alarms (
  id, machine_id, title, description, severity, status, acknowledged_by, resolved_at, created_at, updated_at
)
VALUES
  (
    '20000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000002', -- MC-002
    'Spindle Motor Overheating Critical Alert',
    'Main spindle motor temperature reached 98°C during heavy roughing cut. Thermal cutoff warning active.',
    'Critical',
    'Open',
    NULL,
    NULL,
    NOW() - INTERVAL '1 hour',
    NOW() - INTERVAL '1 hour'
  ),
  (
    '20000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000002', -- MC-002
    'Axis Z Harmonic Vibration Threshold Exceeded',
    'Piezoelectric vibration sensor recorded RMS value of 4.8 mm/s exceeding warning limit 3.5 mm/s.',
    'High',
    'In Progress',
    '00000000-0000-0000-0000-000000000002', -- Somchai Prasert
    NULL,
    NOW() - INTERVAL '4 hours',
    NOW() - INTERVAL '2 hours'
  ),
  (
    '20000000-0000-0000-0000-000000000003',
    '10000000-0000-0000-0000-000000000007', -- CONV-01
    'Conveyor E-Stop Circuit Trip S-04',
    'Safety interlock line S-04 broken near loading dock feeder. Conveyor belt automatically halted.',
    'Critical',
    'Open',
    NULL,
    NULL,
    NOW() - INTERVAL '30 minutes',
    NOW() - INTERVAL '30 minutes'
  ),
  (
    '20000000-0000-0000-0000-000000000004',
    '10000000-0000-0000-0000-000000000003', -- ROBOT-01
    'Servo Controller Bus Timeout Error E-204',
    'Intermittent EtherCAT communication glitch between PLC master and J2 axis servo drive.',
    'Medium',
    'Closed',
    '00000000-0000-0000-0000-000000000002',
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '2 days 3 hours',
    NOW() - INTERVAL '2 days'
  ),
  (
    '20000000-0000-0000-0000-000000000005',
    '10000000-0000-0000-0000-000000000005', -- PRESS-01
    'Hydraulic Line Return Pressure Drop',
    'Hydraulic return pressure dipped below minimum threshold (180 bar) during cycle reset.',
    'Low',
    'Closed',
    '00000000-0000-0000-0000-000000000003',
    NOW() - INTERVAL '4 days',
    NOW() - INTERVAL '4 days 2 hours',
    NOW() - INTERVAL '4 days'
  ),
  (
    '20000000-0000-0000-0000-000000000006',
    '10000000-0000-0000-0000-000000000006', -- PACK-01
    'Carton Feeder Photo-Eye Obstruction',
    'Cardboard dust accumulation triggered false presence signal at intake station #2.',
    'Medium',
    'Closed',
    '00000000-0000-0000-0000-000000000002',
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day 4 hours',
    NOW() - INTERVAL '1 day'
  )
ON CONFLICT (id) DO UPDATE
SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  severity = EXCLUDED.severity,
  status = EXCLUDED.status,
  acknowledged_by = EXCLUDED.acknowledged_by,
  resolved_at = EXCLUDED.resolved_at,
  updated_at = NOW();

-- ------------------------------------------------------------------------------
-- 4. Maintenance Records Seed Data
-- ------------------------------------------------------------------------------
-- Fixed deterministic UUIDs for maintenance records:
-- Maint 1: 30000000-0000-0000-0000-000000000001 (ROBOT-02: In Progress)
-- Maint 2: 30000000-0000-0000-0000-000000000002 (PRESS-01: Scheduled)
-- Maint 3: 30000000-0000-0000-0000-000000000003 (MC-002: Scheduled)
-- Maint 4: 30000000-0000-0000-0000-000000000004 (MC-001: Completed)
-- Maint 5: 30000000-0000-0000-0000-000000000005 (PACK-01: Completed)

INSERT INTO public.maintenance_records (
  id,
  machine_id,
  technician_id,
  title,
  description,
  action_taken,
  status,
  scheduled_date,
  completed_date,
  cost,
  created_at,
  updated_at
)
VALUES
  (
    '30000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000004', -- ROBOT-02
    '00000000-0000-0000-0000-000000000002', -- Somchai Prasert
    'Quarterly Preventative Maintenance & Lubrication',
    'Comprehensive multi-axis grease replacement, check cabling harnesses, and recalibrate coordinate zero points.',
    'Drained old grease from J1/J2 gearboxes; currently applying high-viscosity synthetic grease.',
    'In Progress',
    CURRENT_DATE,
    NULL,
    450.00,
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '3 hours'
  ),
  (
    '30000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000005', -- PRESS-01
    '00000000-0000-0000-0000-000000000003', -- Wichai Jaidee
    'Hydraulic Proportional Valve & Filter Overhaul',
    'Annual scheduled maintenance for hydraulic high-pressure circuit and replacement of inline filter cartridges.',
    NULL,
    'Scheduled',
    CURRENT_DATE + INTERVAL '3 days',
    NULL,
    1200.00,
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '5 days'
  ),
  (
    '30000000-0000-0000-0000-000000000003',
    '10000000-0000-0000-0000-000000000002', -- MC-002
    '00000000-0000-0000-0000-000000000002', -- Somchai Prasert
    'Spindle Chiller Unit Inspection & Flush',
    'Investigate overheating issues reported in recent alarm. Flush coolant radiator and check pump pressure.',
    NULL,
    'Scheduled',
    CURRENT_DATE + INTERVAL '1 day',
    NULL,
    850.00,
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day'
  ),
  (
    '30000000-0000-0000-0000-000000000004',
    '10000000-0000-0000-0000-000000000001', -- MC-001
    '00000000-0000-0000-0000-000000000002', -- Somchai Prasert
    'Monthly Laser Geometric Calibration',
    'Perform laser interferometer verification for axes straightness and repeatability tolerance.',
    'Calibrated X, Y, and Z ball screws. Applied backlash compensation table in Heidenhain CNC controller. Error < 0.003mm.',
    'Completed',
    CURRENT_DATE - INTERVAL '10 days',
    NOW() - INTERVAL '10 days',
    200.00,
    NOW() - INTERVAL '12 days',
    NOW() - INTERVAL '10 days'
  ),
  (
    '30000000-0000-0000-0000-000000000005',
    '10000000-0000-0000-0000-000000000006', -- PACK-01
    '00000000-0000-0000-0000-000000000003', -- Wichai Jaidee
    'Intake Optical Sensor Replacement',
    'Replace degraded photo-eye sensor on feeding channel with upgraded high-contrast photoelectric sensor.',
    'Replaced old photoelectric sensor with Omron E3Z model. Re-routed cable and verified full line operational speed.',
    'Completed',
    CURRENT_DATE - INTERVAL '5 days',
    NOW() - INTERVAL '5 days',
    150.00,
    NOW() - INTERVAL '6 days',
    NOW() - INTERVAL '5 days'
  )
ON CONFLICT (id) DO UPDATE
SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  action_taken = EXCLUDED.action_taken,
  status = EXCLUDED.status,
  scheduled_date = EXCLUDED.scheduled_date,
  completed_date = EXCLUDED.completed_date,
  cost = EXCLUDED.cost,
  updated_at = NOW();

-- ------------------------------------------------------------------------------
-- 5. Audit Logs Seed Data (Phase 6 Bonus)
-- ------------------------------------------------------------------------------
INSERT INTO public.audit_logs (
  table_name, record_id, action, changed_by, old_data, new_data, created_at
)
VALUES
  (
    'machines',
    '10000000-0000-0000-0000-000000000002',
    'UPDATE',
    '00000000-0000-0000-0000-000000000001',
    '{"status": "Running"}'::jsonb,
    '{"status": "Alarm"}'::jsonb,
    NOW() - INTERVAL '1 hour'
  ),
  (
    'alarms',
    '20000000-0000-0000-0000-000000000002',
    'UPDATE',
    '00000000-0000-0000-0000-000000000002',
    '{"status": "Open", "acknowledged_by": null}'::jsonb,
    '{"status": "In Progress", "acknowledged_by": "00000000-0000-0000-0000-000000000002"}'::jsonb,
    NOW() - INTERVAL '2 hours'
  ),
  (
    'maintenance_records',
    '30000000-0000-0000-0000-000000000004',
    'UPDATE',
    '00000000-0000-0000-0000-000000000002',
    '{"status": "In Progress"}'::jsonb,
    '{"status": "Completed", "cost": 200.00}'::jsonb,
    NOW() - INTERVAL '10 days'
  );
