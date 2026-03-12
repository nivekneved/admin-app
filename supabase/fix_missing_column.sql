-- ==============================================================================
-- SCHEMA FIX: ADD MISSING USER_ID TO CUSTOMERS
-- ==============================================================================
-- This script adds the missing 'user_id' column to the 'customers' table.
-- This column is required for Row Level Security (RLS) policies.

DO $$ 
BEGIN
    -- Check if column exists first
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'customers' 
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE public.customers ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
        RAISE NOTICE 'Column user_id added to public.customers';
    END IF;

    -- Add is_active to hotel_rooms if missing
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'hotel_rooms' 
        AND column_name = 'is_active'
    ) THEN
        ALTER TABLE public.hotel_rooms ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
        RAISE NOTICE 'Column is_active added to public.hotel_rooms';
    END IF;
END $$;
