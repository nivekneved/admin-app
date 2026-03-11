-- ==============================================================================
-- 1. CREATE POPUP_ADS TABLE
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.popup_ads (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT,
    media_url TEXT,
    media_type TEXT DEFAULT 'image' CHECK (media_type IN ('image', 'video', 'none')),
    cta_text TEXT,
    cta_link TEXT,
    is_active BOOLEAN DEFAULT true,
    display_frequency TEXT DEFAULT 'once_per_session' CHECK (display_frequency IN ('always', 'once_per_session', 'once_per_day')),
    start_at TIMESTAMPTZ,
    end_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.popup_ads ENABLE ROW LEVEL SECURITY;

-- Simple public read policy
CREATE POLICY "Allow public read access" ON public.popup_ads
    FOR SELECT USING (true);

-- Admin all access
CREATE POLICY "Allow admin all access" ON public.popup_ads
    FOR ALL USING (auth.role() = 'service_role' OR auth.role() = 'authenticated');

-- ==============================================================================
-- 2. SEED DATA (7+ entries)
-- ==============================================================================

INSERT INTO public.popup_ads (title, content, media_url, media_type, cta_text, cta_link, is_active, display_frequency)
VALUES 
('Welcome to Travel Lounge!', 'Check out our latest luxury cruise packages.', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e', 'image', 'View Cruises', '/services?category=cruises', true, 'once_per_session'),
('Flash Sale: 30% Off', 'Book any hotel in the next 24 hours and save big!', 'https://images.unsplash.com/photo-1566073771259-6a8506099945', 'image', 'Book Now', '/services?category=hotels', true, 'always'),
('New Destination: Maldives', 'Explore the crystal clear waters of the Maldives with our new group tours.', 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8', 'image', 'Explore Maldives', '/services', true, 'once_per_day'),
('Exclusive Spa Discount', 'Get a complimentary massage with every villa booking.', 'https://images.unsplash.com/photo-1540541338287-41700207dee6', 'image', 'View Villas', '/services', false, 'once_per_session'),
('Join Our Newsletter', 'Subscribe to get exclusive travel deals delivered to your inbox.', NULL, 'none', 'Subscribe', '#newsletter', true, 'once_per_session'),
('Watch Our 2026 Promo', 'Experience the beauty of Mauritius through our new cinematic reel.', 'https://www.w3schools.com/html/mov_bbb.mp4', 'video', 'Watch Now', '/about', true, 'once_per_day'),
('Limited Time: Honeymoon Special', 'Make your special moments even more memorable.', 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7', 'image', 'Learn More', '/services', true, 'once_per_session'),
('Flight Alerts', 'Sign up for instant notifications on low fare flights.', NULL, 'none', 'Notify Me', '/contact', true, 'always');
