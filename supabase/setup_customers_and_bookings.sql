-- Comprehensive SQL Setup for Customers and Enhanced Bookings
-- Focuses on tracking interactions, newsletters, and cross-activity bookings

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Customers Table
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    address TEXT,
    country TEXT,
    
    -- Marketing & Newsletter
    is_subscriber BOOLEAN DEFAULT FALSE,
    newsletter_opt_in_date TIMESTAMP WITH TIME ZONE,
    marketing_tags TEXT[], -- ['luxury', 'family', 'budget']
    
    -- Account Status
    status TEXT DEFAULT 'Active', -- 'Active', 'Lead', 'Inactive', 'Blocked'
    total_bookings_count INTEGER DEFAULT 0,
    total_spend DECIMAL(12, 2) DEFAULT 0.00,
    last_interaction_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Update/Re-create Bookings Table with Foreign Key
-- Note: If you have existing bookings data, it's safer to add columns.
-- But since we're setting up a fresh structure as requested:
DROP TABLE IF EXISTS public.bookings;

CREATE TABLE public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    
    -- Activity Details
    activity_type TEXT NOT NULL, -- 'Hotel', 'Activity', 'Lounge', 'Tour', 'Cruise'
    activity_name TEXT NOT NULL,
    description TEXT,
    
    -- Scheduling
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    start_time TIME,
    end_time TIME,
    
    -- Financials
    amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    tax_amount DECIMAL(12, 2) DEFAULT 0.00,
    total_amount DECIMAL(12, 2) GENERATED ALWAYS AS (amount + tax_amount) STORED,
    currency TEXT DEFAULT 'USD',
    payment_status TEXT DEFAULT 'Pending', -- 'Pending', 'Paid', 'Partial', 'Refunded'
    
    -- Logistics
    status TEXT DEFAULT 'Pending', -- 'Confirmed', 'Pending', 'Cancelled', 'Completed'
    pax_adults INTEGER DEFAULT 1,
    pax_children INTEGER DEFAULT 0,
    lounge_name TEXT, -- Specifically for lounges if different from activity_name
    
    -- Tracking
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Enable RLS
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- 5. Create basic policies (Allowing for management within the app)
CREATE POLICY "Enable all for admins on customers" ON public.customers FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for admins on bookings" ON public.bookings FOR ALL USING (auth.role() = 'authenticated');

-- 6. Trigger to update 'updated_at'
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_customers_modtime BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_bookings_modtime BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 7. Seed Data
-- Create Customers
INSERT INTO public.customers (first_name, last_name, email, phone, country, is_subscriber, status)
VALUES 
('Emma', 'Johnson', 'emma.j@travellounge.mu', '+230 5123 4567', 'Mauritius', true, 'Active'),
('John', 'Smith', 'jsmith@example.com', '+1 415 555 0123', 'USA', false, 'Lead'),
('Sophie', 'Chen', 'sophie.c@webmail.com', '+65 9123 4567', 'Singapore', true, 'Active'),
('Robert', 'Davis', 'robert.davis@traveller.org', '+44 20 7946 0123', 'UK', false, 'Active')
ON CONFLICT (email) DO NOTHING;

-- Create Bookings linked to these customers (using subqueries to get IDs)
INSERT INTO public.bookings (customer_id, activity_type, activity_name, start_date, amount, status, payment_status)
SELECT id, 'Lounge', 'Premium Executive Lounge A', NOW() + INTERVAL '2 days', 50.00, 'Confirmed', 'Paid' FROM public.customers WHERE email = 'emma.j@travellounge.mu' LIMIT 1;

INSERT INTO public.bookings (customer_id, activity_type, activity_name, start_date, amount, status, payment_status)
SELECT id, 'Hotel', 'Luxury Island Resort', NOW() + INTERVAL '5 days', 1200.00, 'Pending', 'Pending' FROM public.customers WHERE email = 'sophie.c@webmail.com' LIMIT 1;

INSERT INTO public.bookings (customer_id, activity_type, activity_name, start_date, amount, status, payment_status)
SELECT id, 'Cruise', 'Sunset Ocean Voyage', NOW() - INTERVAL '1 day', 150.00, 'Completed', 'Paid' FROM public.customers WHERE email = 'robert.davis@traveller.org' LIMIT 1;

INSERT INTO public.bookings (customer_id, activity_type, activity_name, start_date, amount, status, payment_status)
SELECT id, 'Lounge', 'Business Lounge B', NOW() + INTERVAL '10 hours', 45.00, 'Confirmed', 'Paid' FROM public.customers WHERE email = 'jsmith@example.com' LIMIT 1;
