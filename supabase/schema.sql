-- ==============================================================================
-- Supabase Database Schema: Alarm & Maintenance Management System
-- Phase 2 & Phase 6 (Bonus: Audit Logs & Triggers)
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. ENUM TYPES
-- ==============================================================================

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'technician');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE machine_status AS ENUM ('Running', 'Stop', 'Alarm', 'Maintenance');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE alarm_status AS ENUM ('Open', 'In Progress', 'Closed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE alarm_severity AS ENUM ('Low', 'Medium', 'High', 'Critical');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE maintenance_status AS ENUM ('Scheduled', 'In Progress', 'Completed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ==============================================================================
-- 2. TABLES DEFINITION
-- ==============================================================================

-- 1. Profiles Table (Links to Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'technician',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Machines Table
CREATE TABLE IF NOT EXISTS public.machines (
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
CREATE TABLE IF NOT EXISTS public.alarms (
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
CREATE TABLE IF NOT EXISTS public.maintenance_records (
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

-- 5. Audit Logs Table (Phase 6 Bonus)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
  changed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 3. INDEXES
-- ==============================================================================

CREATE INDEX IF NOT EXISTS idx_machines_status ON public.machines(status);
CREATE INDEX IF NOT EXISTS idx_machines_code ON public.machines(machine_code);
CREATE INDEX IF NOT EXISTS idx_alarms_machine_id ON public.alarms(machine_id);
CREATE INDEX IF NOT EXISTS idx_alarms_status ON public.alarms(status);
CREATE INDEX IF NOT EXISTS idx_alarms_severity ON public.alarms(severity);
CREATE INDEX IF NOT EXISTS idx_maintenance_machine_id ON public.maintenance_records(machine_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_technician_id ON public.maintenance_records(technician_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_status ON public.maintenance_records(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_scheduled_date ON public.maintenance_records(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_audit_logs_record ON public.audit_logs(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- ==============================================================================
-- 4. HELPER FUNCTIONS & TRIGGERS
-- ==============================================================================

-- Helper: Check if the calling user has 'admin' role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Trigger Function: Auto update updated_at timestamp
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
DROP TRIGGER IF EXISTS trigger_profiles_updated_at ON public.profiles;
CREATE TRIGGER trigger_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trigger_machines_updated_at ON public.machines;
CREATE TRIGGER trigger_machines_updated_at
  BEFORE UPDATE ON public.machines
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trigger_alarms_updated_at ON public.alarms;
CREATE TRIGGER trigger_alarms_updated_at
  BEFORE UPDATE ON public.alarms
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trigger_maintenance_updated_at ON public.maintenance_records;
CREATE TRIGGER trigger_maintenance_updated_at
  BEFORE UPDATE ON public.maintenance_records
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Trigger Function: Auto create profile on user signup via auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_full_name TEXT;
  user_role_val user_role;
BEGIN
  user_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    split_part(NEW.email, '@', 1)
  );

  IF (NEW.raw_user_meta_data->>'role') = 'admin' THEN
    user_role_val := 'admin'::user_role;
  ELSE
    user_role_val := 'technician'::user_role;
  END IF;

  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    user_full_name,
    user_role_val
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach new user trigger to auth.users (if auth schema exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;

-- Trigger Function: Sync Machine Status with Alarms
CREATE OR REPLACE FUNCTION public.sync_machine_status_on_alarm()
RETURNS TRIGGER AS $$
DECLARE
  target_machine_id UUID;
  open_alarm_count INT;
  curr_machine_status machine_status;
BEGIN
  target_machine_id := NEW.machine_id;

  -- Get current machine status
  SELECT status INTO curr_machine_status
  FROM public.machines
  WHERE id = target_machine_id;

  -- Count remaining open or in-progress alarms for this machine
  SELECT COUNT(*) INTO open_alarm_count
  FROM public.alarms
  WHERE machine_id = target_machine_id
    AND status IN ('Open', 'In Progress');

  -- If there are open alarms and the machine is not under maintenance, set to 'Alarm'
  IF open_alarm_count > 0 THEN
    IF curr_machine_status != 'Maintenance' THEN
      UPDATE public.machines
      SET status = 'Alarm', updated_at = NOW()
      WHERE id = target_machine_id;
    END IF;
  ELSE
    -- If no open alarms remain and current status was 'Alarm', revert to 'Running'
    IF curr_machine_status = 'Alarm' THEN
      UPDATE public.machines
      SET status = 'Running', updated_at = NOW()
      WHERE id = target_machine_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_alarm_machine_sync ON public.alarms;
CREATE TRIGGER trigger_alarm_machine_sync
  AFTER INSERT OR UPDATE OF status, machine_id ON public.alarms
  FOR EACH ROW EXECUTE FUNCTION public.sync_machine_status_on_alarm();

-- Trigger Function: Audit Logger (Phase 6 Bonus)
CREATE OR REPLACE FUNCTION public.log_audit_event()
RETURNS TRIGGER AS $$
DECLARE
  current_user_id UUID;
  rec_id UUID;
  old_val JSONB := NULL;
  new_val JSONB := NULL;
BEGIN
  -- Retrieve current authenticated user ID
  current_user_id := auth.uid();

  IF TG_OP = 'DELETE' THEN
    rec_id := OLD.id;
    old_val := to_jsonb(OLD);
  ELSIF TG_OP = 'UPDATE' THEN
    rec_id := NEW.id;
    old_val := to_jsonb(OLD);
    new_val := to_jsonb(NEW);
  ELSIF TG_OP = 'INSERT' THEN
    rec_id := NEW.id;
    new_val := to_jsonb(NEW);
  END IF;

  INSERT INTO public.audit_logs (
    table_name,
    record_id,
    action,
    changed_by,
    old_data,
    new_data
  )
  VALUES (
    TG_TABLE_NAME,
    rec_id,
    TG_OP,
    current_user_id,
    old_val,
    new_val
  );

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach Audit Log triggers to core entities
DROP TRIGGER IF EXISTS audit_machines_trigger ON public.machines;
CREATE TRIGGER audit_machines_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.machines
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

DROP TRIGGER IF EXISTS audit_alarms_trigger ON public.alarms;
CREATE TRIGGER audit_alarms_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.alarms
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

DROP TRIGGER IF EXISTS audit_maintenance_trigger ON public.maintenance_records;
CREATE TRIGGER audit_maintenance_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.maintenance_records
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

-- ==============================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alarms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- Profiles Policies
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;
CREATE POLICY "Profiles are viewable by authenticated users" ON public.profiles
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (id = auth.uid());

DROP POLICY IF EXISTS "Profiles can be inserted by authenticated or service" ON public.profiles;
CREATE POLICY "Profiles can be inserted by authenticated or service" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (id = auth.uid() OR public.is_admin());

-- ------------------------------------------------------------------------------
-- Machines Policies
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Machines viewable by authenticated" ON public.machines;
CREATE POLICY "Machines viewable by authenticated" ON public.machines
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Machines insertable by admin" ON public.machines;
CREATE POLICY "Machines insertable by admin" ON public.machines
  FOR INSERT TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Machines updatable by admin" ON public.machines;
CREATE POLICY "Machines updatable by admin" ON public.machines
  FOR UPDATE TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Machines deletable by admin" ON public.machines;
CREATE POLICY "Machines deletable by admin" ON public.machines
  FOR DELETE TO authenticated USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- Alarms Policies
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Alarms viewable by authenticated" ON public.alarms;
CREATE POLICY "Alarms viewable by authenticated" ON public.alarms
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Alarms insertable by authenticated" ON public.alarms;
CREATE POLICY "Alarms insertable by authenticated" ON public.alarms
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Alarms updatable by authenticated" ON public.alarms;
CREATE POLICY "Alarms updatable by authenticated" ON public.alarms
  FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "Alarms deletable by admin" ON public.alarms;
CREATE POLICY "Alarms deletable by admin" ON public.alarms
  FOR DELETE TO authenticated USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- Maintenance Records Policies
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Maintenance viewable by authenticated" ON public.maintenance_records;
CREATE POLICY "Maintenance viewable by authenticated" ON public.maintenance_records
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Maintenance insertable by authenticated" ON public.maintenance_records;
CREATE POLICY "Maintenance insertable by authenticated" ON public.maintenance_records
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Maintenance updatable by authenticated" ON public.maintenance_records;
CREATE POLICY "Maintenance updatable by authenticated" ON public.maintenance_records
  FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "Maintenance deletable by admin" ON public.maintenance_records;
CREATE POLICY "Maintenance deletable by admin" ON public.maintenance_records
  FOR DELETE TO authenticated USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- Audit Logs Policies
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Audit logs viewable by authenticated" ON public.audit_logs;
CREATE POLICY "Audit logs viewable by authenticated" ON public.audit_logs
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Audit logs insertable by authenticated or triggers" ON public.audit_logs;
CREATE POLICY "Audit logs insertable by authenticated or triggers" ON public.audit_logs
  FOR INSERT TO authenticated WITH CHECK (true);
