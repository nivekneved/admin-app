-- Add user_id column to admins table if it doesn't exist
ALTER TABLE public.admins ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- Link existing admins to their auth users by email
UPDATE public.admins a
SET user_id = u.id
FROM auth.users u
WHERE a.email = u.email;

-- Comment out the previous functions and update them in rlspolicies.sql manually if needed, 
-- but here we apply the final versions for best performance and security.

CREATE OR REPLACE FUNCTION public.is_admin_or_staff()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admins 
        WHERE user_id = auth.uid()
        AND role IN ('admin', 'manager', 'staff', 'sales', 'editor', 'receptionist', 'secretary')
        AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admins 
        WHERE user_id = auth.uid()
        AND role = 'admin'
        AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
