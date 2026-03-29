-- 1. Create a View to break the recursion chain
-- Views run with the owner's privileges (postgres) and bypass RLS of the underlying table
CREATE OR REPLACE VIEW public.v_admins_roles AS
SELECT user_id, role, is_active FROM public.admins;

-- 2. Redefine is_admin_v2 to query the VIEW
CREATE OR REPLACE FUNCTION public.is_admin_v2()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.v_admins_roles 
    WHERE user_id = auth.uid() 
    AND is_active = true
    AND role IN ('admin', 'super_admin', 'manager', 'staff', 'sales', 'editor', 'receptionist', 'secretary', 'operator', 'tech')
  );
END;
$$;

-- 3. Redefine is_super_admin to query the VIEW
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.v_admins_roles 
    WHERE user_id = auth.uid() 
    AND is_active = true
    AND role = 'super_admin'
  );
END;
$$;

-- 4. Rewrite the 'admins' table policies with Zero-Recursion logic
-- Drop existing policies first
DROP POLICY IF EXISTS "Admins can view all staff" ON public.admins;
DROP POLICY IF EXISTS "Super admins can manage all staff" ON public.admins;
DROP POLICY IF EXISTS "Users can view their own record" ON public.admins;

-- A. Direct check for self (Zero-Recursion)
-- Highly efficient and cannot loop because it doesn't call functions
CREATE POLICY "Users can view their own record" ON public.admins
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- B. Management/Staff view (Uses the View-based function)
CREATE POLICY "Admins can view all staff" ON public.admins
  FOR SELECT
  TO authenticated
  USING (is_admin_v2());

-- C. Super Admin management (Uses the View-based function)
CREATE POLICY "Super admins can manage all staff" ON public.admins
  FOR ALL
  TO authenticated
  USING (is_super_admin());

-- 5. Final Grant permissions
GRANT SELECT ON public.v_admins_roles TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_admin_v2() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_super_admin() TO authenticated, service_role;
