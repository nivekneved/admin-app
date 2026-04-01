
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$ BEGIN
    CREATE TYPE public.user_role AS ENUM ('admin', 'manager', 'staff', 'sales', 'receptionist', 'editor', 'secretary');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE public.service_status AS ENUM ('In Stock', 'Low Stock', 'Out of Stock');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE public.booking_status AS ENUM ('Pending', 'Confirmed', 'Cancelled', 'Completed');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE public.payment_status AS ENUM ('Pending', 'Paid', 'Partial', 'Refunded');
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS public.admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    role TEXT DEFAULT 'staff',
    bio TEXT,
    photo_url TEXT,
    linkedin_url TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    show_on_front_page BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    address TEXT,
    country TEXT,
    is_subscriber BOOLEAN DEFAULT FALSE,
    newsletter_opt_in_date TIMESTAMPTZ,
    marketing_tags TEXT[],
    status TEXT DEFAULT 'Active',
    total_bookings_count INTEGER DEFAULT 0,
    total_spend DECIMAL(12, 2) DEFAULT 0.00,
    last_interaction_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    image_url TEXT,
    link TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    show_on_home BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    short_description TEXT,
    location TEXT,
    region TEXT,
    base_price DECIMAL(12, 2) DEFAULT 0.00,
    rating DECIMAL(3, 2) DEFAULT 4.5,
    stock INTEGER,
    status TEXT DEFAULT 'active',
    is_active BOOLEAN DEFAULT TRUE,
    is_coming_soon BOOLEAN DEFAULT FALSE,
    featured BOOLEAN DEFAULT FALSE,
    priority INTEGER DEFAULT 0,
    image_url TEXT,
    thumbnail_url TEXT,
    banner_url TEXT,
    secondary_image_url TEXT,
    gallery_images TEXT[],
    cta_text TEXT,
    cta_link TEXT,
    is_seasonal_deal BOOLEAN DEFAULT FALSE,
    deal_note TEXT DEFAULT 'Limited Time',
    amenities TEXT[],
    service_type TEXT CHECK (service_type = ANY (ARRAY['hotel'::text, 'cruise'::text, 'tour'::text, 'activity'::text, 'transfer'::text, 'flight'::text, 'visa'::text, 'corporate'::text, 'land_activity'::text, 'sea_activity'::text])),
    duration_days INTEGER,
    duration_hours INTEGER,
    max_group_size INTEGER,
    room_types JSONB DEFAULT '[]'::jsonb,
    itinerary JSONB DEFAULT '[]'::jsonb,
    special_features JSONB DEFAULT '[]'::jsonb,
    highlights JSONB DEFAULT '[]'::jsonb,
    included JSONB DEFAULT '[]'::jsonb,
    not_included JSONB DEFAULT '[]'::jsonb,
    cancellation_policy TEXT,
    terms_and_conditions TEXT,
    seasonality TEXT,
    meta_title TEXT,
    meta_description TEXT,
    seo_keywords TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.service_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(service_id, category_id)
);

CREATE TABLE IF NOT EXISTS public.hotel_rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT,
    price_per_night DECIMAL(12, 2) DEFAULT 0.00,
    total_units INTEGER DEFAULT 1,
    size TEXT,
    view TEXT,
    bed TEXT,
    features JSONB DEFAULT '[]'::jsonb,
    image_url TEXT,
    max_occupancy INTEGER DEFAULT 2,
    meal_plan TEXT DEFAULT 'Room Only',
    cancellation_policy TEXT,
    deposit_policy TEXT,
    min_stay_days INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.room_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    weekday_price DECIMAL(12, 2) NOT NULL,
    weekend_price DECIMAL(12, 2) NOT NULL,
    amenities TEXT[],
    max_occupancy INTEGER DEFAULT 2,
    min_stay_days INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    service_type TEXT NOT NULL,
    service_name TEXT NOT NULL,
    description TEXT,
    check_in_date TIMESTAMPTZ NOT NULL,
    check_out_date TIMESTAMPTZ,
    start_time TIME,
    end_time TIME,
    amount DECIMAL(12, 2) DEFAULT 0.00,
    tax_amount DECIMAL(12, 2) DEFAULT 0.00,
    total_price DECIMAL(12, 2) GENERATED ALWAYS AS (amount + tax_amount) STORED,
    currency TEXT DEFAULT 'USD',
    payment_status TEXT DEFAULT 'Pending',
    status TEXT DEFAULT 'Pending',
    pax_adults INTEGER DEFAULT 1,
    pax_children INTEGER DEFAULT 0,
    lounge_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.booking_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
    service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
    service_name TEXT NOT NULL,
    service_category TEXT,
    amount DECIMAL(12, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.hero_slides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    subtitle TEXT,
    description TEXT,
    image_url TEXT,
    mobile_image_url TEXT,
    video_url TEXT,
    media_type TEXT DEFAULT 'image',
    alignment TEXT DEFAULT 'center',
    overlay_opacity DOUBLE PRECISION DEFAULT 0.4,
    cta_text TEXT,
    cta_link TEXT,
    tag TEXT,
    badge_text TEXT,
    badge_color TEXT DEFAULT '#EF4444',
    animation_type TEXT DEFAULT 'fade',
    duration INTEGER DEFAULT 6000,
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.editorial_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT,
    featured_image TEXT,
    author_id UUID REFERENCES public.admins(id) ON DELETE SET NULL,
    tags TEXT[],
    status TEXT DEFAULT 'draft' CHECK (status = ANY (ARRAY['draft'::text, 'published'::text])),
    published_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.content_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_slug TEXT NOT NULL,
    section_key TEXT NOT NULL,
    content JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(page_slug, section_key)
);

CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
    service_type TEXT,
    customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    customer_name TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    status TEXT DEFAULT 'pending' CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.faqs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT DEFAULT 'General',
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    order_index INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.site_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.navigations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    label TEXT NOT NULL,
    link TEXT NOT NULL,
    icon TEXT,
    parent_id UUID REFERENCES public.navigations(id) ON DELETE CASCADE,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.popular_destinations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    destination TEXT NOT NULL,
    country TEXT,
    return_price DECIMAL(12, 2) NOT NULL,
    image_url TEXT,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.popup_ads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT,
    media_url TEXT,
    media_type TEXT DEFAULT 'image' CHECK (media_type = ANY (ARRAY['image'::text, 'video'::text, 'none'::text])),
    cta_text TEXT,
    cta_link TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    display_frequency TEXT DEFAULT 'once_per_session' CHECK (display_frequency = ANY (ARRAY['always'::text, 'once_per_session'::text, 'once_per_day'::text])),
    start_at TIMESTAMPTZ,
    end_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.partners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    logo_url TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'unread' CHECK (status = ANY (ARRAY['unread'::text, 'read'::text])),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status = ANY (ARRAY['active'::text, 'unsubscribed'::text])),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.email_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    variables JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.auth_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DO $$ 
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND column_name = 'updated_at'
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS tr_update_%I_modtime ON public.%I', t, t);
        EXECUTE format('CREATE TRIGGER tr_update_%I_modtime BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column()', t, t);
    END LOOP;
END $$;
