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

-- Allow anyone to view any popup ad (for both web and admin)
DROP POLICY IF EXISTS "Public can view popup ads" ON public.popup_ads;
CREATE POLICY "Public can view popup ads" ON public.popup_ads
FOR SELECT USING (true);

-- Allow anyone to manage popup ads (for the admin app development)
DROP POLICY IF EXISTS "Anyone can manage popup ads" ON public.popup_ads;
CREATE POLICY "Anyone can manage popup ads" ON public.popup_ads
FOR ALL USING (true);

-- ==============================================================================
-- 2. SEED DATA (7+ entries)
-- ==============================================================================

INSERT INTO public.popup_ads (title, content, media_url, media_type, cta_text, cta_link, is_active, display_frequency, start_at)
VALUES 
-- Image: Luxury Cruise
('Majestic Mediterranean Cruise', 'Experience the ultimate luxury at sea. 7 nights across Italy, Greece, and Croatia starting from $1,299.', 'https://images.unsplash.com/photo-1548574505-5e239809ee19', 'image', 'View Itinerary', '/cruises', true, 'once_per_session', NOW()),

-- Video: Resort Highlights
('Reel: Royal Palm Mauritius', 'Discover the paradise of Mauritius. Watch our cinematic guide to the island''s finest resorts.', 'https://assets.mixkit.co/videos/preview/mixkit-top-view-of-a-luxury-resort-and-beach-41134-large.mp4', 'video', 'Book Luxury', '/hotels', true, 'once_per_day', NOW()),

-- Image: Seasonal Flash Sale
('Flash Sale: 25% OFF!', 'Limited time offer! Book your summer getaway by Friday and save big on all flight + hotel bundles.', 'https://images.unsplash.com/photo-1574362848149-11496d93a7c7', 'image', 'Grab Deal', '/packages', true, 'always', NOW()),

-- Text Only: Important Alert
('Travel Advisory: Rodrigues Island', 'Due to high demand, we recommend booking Rodrigues flight tickets at least 3 months in advance. Contact us for priority waitlists.', NULL, 'none', 'Contact Agent', '/contact', true, 'once_per_session', NOW()),

-- Image: Honeymoon Special
('Romantic Maldives Escape', 'Exclusive honeymoon packages including private villa, candlelight dinner, and spa treatments. Make memories that last a lifetime.', 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8', 'image', 'Explore Maldives', '/services', true, 'once_per_session', NOW()),

-- Video: Adventure Tours
('Adventure Awaits!', 'Trekking, scuba diving, and wild safaris. Join our upcoming group tour to the heart of Africa.', 'https://assets.mixkit.co/videos/preview/mixkit-elephants-walking-in-the-wild-savannah-42770-large.mp4', 'video', 'Join Group', '/tours', true, 'once_per_day', NOW()),

-- Image: Early Bird Flight
('Early Bird: Dubai Flights', 'Fly to Dubai with Emirates starting from just MUR 22,000. Limited seats available for travel between Sept - Nov.', 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf', 'image', 'Search Flights', '/flights', true, 'once_per_session', NOW()),

-- Newsletter Focus
('Join the Elite Travel Club', 'Subscribe to our newsletter and get a MUR 500 voucher on your first booking over MUR 5,000.', 'https://images.unsplash.com/photo-1512413316925-fd47914c9c11', 'image', 'Join Club', '#newsletter', true, 'once_per_day', NOW()),

-- Multi-media: Resort Promo
('Stay in Paradise', 'Discover the hidden gems of Rodrigues. Hand-picked villas with breathtaking ocean views.', 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4', 'image', 'View Villas', '/rodrigues', true, 'once_per_session', NOW()),

-- Alert: New Payment Method
('Now Accepting Crypto!', 'We are excited to announce that we now accept Bitcoin and Ethereum for all international travel bookings.', NULL, 'none', 'Learn More', '/faq', true, 'once_per_session', NOW());
