-- ==============================================================================
-- DATABASE REPAIR & SYNC SCRIPT
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/tbyudagfjspedeqtlgjv/sql/new)
-- ==============================================================================

-- 1. Ensure the UUID extension is enabled (required for uuid_generate_v4())
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create the admins table if it doesn't already exist
CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'staff' CHECK (role IN ('admin', 'staff', 'manager', 'sales', 'receptionist', 'editor')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable RLS and add a policy for the Admin App to read/write
-- Note: In production, you should restrict this to authenticated users
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view admins" ON admins;
CREATE POLICY "Public can view admins" ON admins FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Public can insert admins" ON admins;
CREATE POLICY "Public can insert admins" ON admins FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Public can update admins" ON admins;
CREATE POLICY "Public can update admins" ON admins FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Public can delete admins" ON admins;
CREATE POLICY "Public can delete admins" ON admins FOR DELETE USING (auth.role() = 'authenticated');

-- 4. Verify table exists by inserting a test admin if empty
INSERT INTO admins (username, email, password, role)
SELECT 'system_admin', 'admin@travellounge.mu', 'password123', 'admin'
WHERE NOT EXISTS (SELECT 1 FROM admins LIMIT 1);
