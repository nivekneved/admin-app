-- ==============================================================================
-- 1. INFRASTRUCTURE & EXTENSIONS
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. ENUMS & TYPES
-- ==============================================================================

-- Admin/User Roles
DO $$ BEGIN
    CREATE TYPE public.user_role AS ENUM ('admin', 'manager', 'staff', 'sales', 'receptionist', 'editor', 'secretary');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Service Status
DO $$ BEGIN
    CREATE TYPE public.service_status AS ENUM ('In Stock', 'Low Stock', 'Out of Stock');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Service Type
DO $$ BEGIN
    CREATE TYPE public.service_type_enum AS ENUM ('hotel', 'cruise', 'tour', 'activity', 'lounge');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Booking Status
DO $$ BEGIN
    CREATE TYPE public.booking_status AS ENUM ('Pending', 'Confirmed', 'Cancelled', 'Completed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Payment Status
DO $$ BEGIN
    CREATE TYPE public.payment_status AS ENUM ('Pending', 'Paid', 'Partial', 'Refunded');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ==============================================================================
-- 3. CORE TABLES
-- ==============================================================================

-- Admin & Staff Table
CREATE TABLE IF NOT EXISTS public.admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username TEXT UNIQUE NOT NULL,
    name TEXT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role public.user_role DEFAULT 'staff',
    bio TEXT,
    photo_url TEXT,
    linkedin_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    show_on_front_page BOOLEAN DEFAULT FALSE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customers / Profiles (Unified)
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
    newsletter_opt_in_date TIMESTAMPTZ,
    marketing_tags TEXT[], 
    
    -- Account Status
    status TEXT DEFAULT 'Active', -- 'Active', 'Lead', 'Inactive', 'Blocked'
    total_bookings_count INTEGER DEFAULT 0,
    total_spend DECIMAL(12, 2) DEFAULT 0.00,
    last_interaction_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Supabase Auth Link (Optional but recommended)
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Categories
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    link TEXT,
    show_on_home BOOLEAN DEFAULT FALSE,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Services (Combined functionality of products and services)
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    location TEXT,
    region TEXT,
    base_price DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    stock INTEGER DEFAULT 0,
    status public.service_status DEFAULT 'In Stock',
    rating DECIMAL(3, 2) DEFAULT 4.5,
    image_url TEXT,
    amenities TEXT[],
    service_type public.service_type_enum,
    duration_days INTEGER,
    duration_hours INTEGER,
    max_group_size INTEGER,
    
    -- UI & Marketing Fields
    cta_text TEXT,
    cta_link TEXT,
    gallery_images TEXT[],
    meta_title TEXT,
    meta_description TEXT,
    seo_keywords TEXT,
    special_features JSONB DEFAULT '[]'::jsonb,
    seasonality TEXT,
    highlights JSONB DEFAULT '[]'::jsonb,
    included JSONB DEFAULT '[]'::jsonb,
    not_included JSONB DEFAULT '[]'::jsonb,
    cancellation_policy TEXT,
    terms_and_conditions TEXT,
    thumbnail_url TEXT,
    banner_url TEXT,
    featured BOOLEAN DEFAULT FALSE,
    priority INTEGER DEFAULT 0,
    
    -- Legacy / JSON config
    room_types JSONB DEFAULT '[]'::jsonb,
    itinerary JSONB DEFAULT '[]'::jsonb,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bridge table for M2M Category mapping
CREATE TABLE IF NOT EXISTS public.service_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(service_id, category_id)
);

-- Hotel Room Inventory (Specific for Hotels)
CREATE TABLE IF NOT EXISTS public.hotel_rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT, -- e.g. 'Standard', 'Deluxe'
    price_per_night DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    total_units INTEGER DEFAULT 1,
    available_units INTEGER DEFAULT 1,
    size TEXT,
    view TEXT,
    bed TEXT,
    features JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookings
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
    
    -- Details
    activity_type TEXT NOT NULL,
    activity_name TEXT NOT NULL,
    description TEXT,
    
    -- Scheduling
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ,
    start_time TIME,
    end_time TIME,
    
    -- Financials
    amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    tax_amount DECIMAL(12, 2) DEFAULT 0.00,
    total_amount DECIMAL(12, 2) GENERATED ALWAYS AS (amount + tax_amount) STORED,
    currency TEXT DEFAULT 'MUR',
    
    -- Statuses
    payment_status public.payment_status DEFAULT 'Pending',
    status public.booking_status DEFAULT 'Pending',
    
    -- Logistics
    pax_adults INTEGER DEFAULT 1,
    pax_children INTEGER DEFAULT 0,
    lounge_name TEXT, 
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Booking Items (For multi-service itineraries)
CREATE TABLE IF NOT EXISTS public.booking_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
    service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
    service_name TEXT NOT NULL,
    service_category TEXT,
    amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders (Direct sales of units/items)
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    customer_name TEXT,
    amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    status TEXT DEFAULT 'Pending',
    payment_method TEXT,
    items JSONB DEFAULT '[]'::jsonb,
    total_items INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order Items
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
    service_name TEXT,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    total_price DECIMAL(12, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoices
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    customer_name TEXT,
    amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    status TEXT DEFAULT 'Pending',
    service TEXT NOT NULL,
    reference TEXT UNIQUE,
    due_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 4. CMS & MARKETING TABLES
-- ==============================================================================

-- Hero Slides
CREATE TABLE IF NOT EXISTS public.hero_slides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    subtitle TEXT,
    description TEXT,
    image_url TEXT,
    video_url TEXT,
    media_type TEXT DEFAULT 'image', -- 'image', 'video'
    cta_text TEXT,
    cta_link TEXT,
    tag TEXT,
    cta TEXT,
    link TEXT,
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blog / News
CREATE TABLE IF NOT EXISTS public.editorial_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT,
    featured_image TEXT,
    author_id UUID REFERENCES public.admins(id) ON DELETE SET NULL,
    tags TEXT[],
    status TEXT DEFAULT 'draft', -- 'draft', 'published', 'archived'
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
    service_type TEXT,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    customer_name TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- FAQ
CREATE TABLE IF NOT EXISTS public.faqs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category TEXT DEFAULT 'General',
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    order_index INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Site Settings
CREATE TABLE IF NOT EXISTS public.site_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Popular Destinations
CREATE TABLE IF NOT EXISTS public.popular_destinations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    destination TEXT NOT NULL,
    country TEXT NOT NULL,
    return_price DECIMAL(12, 2),
    is_featured BOOLEAN DEFAULT FALSE,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Content Blocks (Modular CMS)
CREATE TABLE IF NOT EXISTS public.content_blocks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_slug TEXT NOT NULL,
    section_key TEXT NOT NULL,
    content JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(page_slug, section_key)
);

-- Contact Inquiries
CREATE TABLE IF NOT EXISTS public.inquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'unread', -- 'unread', 'read', 'archived'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Newsletter Subscribers
CREATE TABLE IF NOT EXISTS public.subscribers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'active', -- 'active', 'unsubscribed'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email Templates
CREATE TABLE IF NOT EXISTS public.email_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    variables JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 5. HELPERS & TRIGGERS
-- ==============================================================================

-- Auto-update updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER tr_update_admins_modtime BEFORE UPDATE ON public.admins FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER tr_update_customers_modtime BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER tr_update_services_modtime BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER tr_update_bookings_modtime BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER tr_update_orders_modtime BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER tr_update_invoices_modtime BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER tr_update_editorial_posts_modtime BEFORE UPDATE ON public.editorial_posts FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER tr_update_content_blocks_modtime BEFORE UPDATE ON public.content_blocks FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
