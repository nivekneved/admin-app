-- ==============================================================================
-- BOOTSTRAP ADMIN IDENTITY (VERIFIED)
-- ==============================================================================
-- Use this script to manually provision your administrative identity in the 
-- 'admins' table. 

-- IMPORTANT: Ensure you have run 'fix_missing_column.sql' first if you encountered
-- the "user_id does not exist" error.

DO $$ 
BEGIN
    INSERT INTO public.admins (
        username, 
        name, 
        email, 
        password, 
        role, 
        is_active, 
        show_on_front_page,
        display_order
    )
    VALUES (
        'admin_root', 
        'System Administrator', 
        'admin@travellounge.mu', -- CHANGE THIS to your actual login email
        'bootstrap_pass_123', 
        'admin', 
        true, 
        true,
        0
    )
    ON CONFLICT (email) 
    DO UPDATE SET 
        role = 'admin', 
        is_active = true,
        updated_at = NOW();
        
    RAISE NOTICE 'Admin identity provisioned/updated for email: admin@travellounge.mu';
END $$;
