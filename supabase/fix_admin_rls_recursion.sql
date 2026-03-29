-- 1. Redefine is_admin_v2 with SECURITY DEFINER to avoid recursion
-- This allows the function to execute with the privileges of the creator (usually postgres)
-- bypassing RLS checks when it queries the 'admins' table.
CREATE OR REPLACE FUNCTION public.is_admin_v2()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admins 
    WHERE user_id = auth.uid() 
    AND is_active = true
    AND role IN ('admin', 'super_admin', 'manager', 'staff', 'sales', 'editor', 'receptionist', 'secretary', 'operator', 'tech')
  );
END;
$$;

-- 2. Create is_super_admin function with SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admins 
    WHERE user_id = auth.uid() 
    AND is_active = true
    AND role = 'super_admin'
  );
END;
$$;

-- 3. Update the recursive policy for Super Admins
-- Old policy used a subquery on 'admins' which triggered RLS recursively.
-- New policy uses the SECURITY DEFINER function to break the loop.
DROP POLICY IF EXISTS "Super admins can manage all staff" ON public.admins;
CREATE POLICY "Super admins can manage all staff" ON public.admins
  FOR ALL
  TO authenticated
  USING (is_super_admin());

-- 4. Re-apply "Admins can view all staff" for select
-- (This one already used is_admin_v2(), but we ensure it's pointing to the new version)
DROP POLICY IF EXISTS "Admins can view all staff" ON public.admins;
CREATE POLICY "Admins can view all staff" ON public.admins
  FOR SELECT
  TO authenticated
  USING (is_admin_v2());

-- 5. Grant execute permissions (standard but good practice)
GRANT EXECUTE ON FUNCTION public.is_admin_v2() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_super_admin() TO authenticated, service_role;
