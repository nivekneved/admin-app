-- ==============================================================================
-- 1. SEED CATEGORIES
-- ==============================================================================

INSERT INTO public.categories (name, slug, description, image_url, display_order)
VALUES 
('Hotels', 'hotels', 'Luxury resorts and boutique stay-overs', 'https://images.unsplash.com/photo-1566073771259-6a8506099945', 1),
('Activities', 'activities', 'Excursions and island adventures', 'https://images.unsplash.com/photo-1544551763-47a0159f963f', 2),
('Cruises', 'cruises', 'Private catamarans and sunset voyages', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e', 3),
('Lounge Access', 'lounges', 'Premium airport and port lounges', 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3', 4),
('Group Tours', 'tours', 'Curated cultural journeys', 'https://images.unsplash.com/photo-1502784444187-359ac186c5bb', 5)
ON CONFLICT (name) DO NOTHING;

-- ==============================================================================
-- 2. SEED ADMINS & STAFF
-- ==============================================================================

INSERT INTO public.admins (username, email, password, role)
VALUES 
('system_admin', 'admin@travellounge.mu', 'admin123', 'admin'),
('nancy_secretary', 'nancy@travellounge.mu', 'nancy123', 'secretary'),
('mark_sales', 'mark@travellounge.mu', 'mark123', 'sales')
ON CONFLICT (email) DO NOTHING;

-- ==============================================================================
-- 3. SEED CUSTOMERS
-- ==============================================================================

INSERT INTO public.customers (first_name, last_name, email, phone, country, is_subscriber, status)
VALUES 
('Emma', 'Johnson', 'emma.j@travellounge.mu', '+230 5123 4567', 'Mauritius', true, 'Active'),
('Jean', 'Dupont', 'jean.dupont@email.mu', '+230 5987 6543', 'Mauritius', true, 'Active'),
('Sarah', 'Smith', 'sarah.smith@email.com', '+44 7700 900000', 'UK', false, 'Active'),
('John', 'Doe', 'john.doe@example.com', '+1 415 555 0123', 'USA', false, 'Lead')
ON CONFLICT (email) DO NOTHING;

-- ==============================================================================
-- 4. SEED SERVICES
-- ==============================================================================

-- Hotels
INSERT INTO public.services (name, description, location, region, base_price, stock, status, rating, image_url, service_type, amenities)
VALUES 
('Lux* Grand Baie', 'Boutique resort in Grand Baie.', 'Grand Baie', 'North', 15500.00, 20, 'In Stock', 5.0, 'https://images.unsplash.com/photo-1566073771259-6a8506099945', 'hotel', ARRAY['Spa', 'Infinity Pool', 'Gym']),
('Constance Belle Mare', 'Luxury golf resort.', 'Belle Mare', 'East', 12800.00, 15, 'In Stock', 4.8, 'https://images.unsplash.com/photo-1540541338287-41700207dee6', 'hotel', ARRAY['Golf', 'Wine Cellar', 'Private Beach']),
('Heritage Le Telfair', '19th-century inspired elegance.', 'Bel Ombre', 'South', 13500.00, 12, 'Low Stock', 4.9, 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7', 'hotel', ARRAY['Nature Reserve', 'Spa', 'Kite Surf']);

-- Activities & Cruises
INSERT INTO public.services (name, description, location, region, base_price, stock, status, rating, image_url, service_type, amenities, duration_hours)
VALUES 
('Ile aux Cerfs Speedboat', 'Day tour to the beautiful Ile aux Cerfs.', 'Trou d''Eau Douce', 'East', 2800.00, 50, 'In Stock', 4.6, 'https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b', 'activity', ARRAY['Lunch', 'Drinks', 'Snorkeling'], 6),
('Sunset Ocean Voyage', 'Private catamaran sunset cruise.', 'Grand Baie', 'North', 4500.00, 5, 'Low Stock', 4.9, 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e', 'cruise', ARRAY['Open Bar', 'Music', 'Dinner'], 3),
('Premium Executive Lounge', 'VIP airport lounge access with all-inclusive amenities.', 'SSR Airport', 'Airport', 1500.00, 100, 'In Stock', 4.7, 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3', 'lounge', ARRAY['WiFi', 'Buffet', 'Shower'], 4);

-- ==============================================================================
-- 5. LINK SERVICES TO CATEGORIES
-- ==============================================================================

INSERT INTO public.service_categories (service_id, category_id)
SELECT s.id, c.id FROM public.services s, public.categories c 
WHERE s.name = 'Lux* Grand Baie' AND c.name = 'Hotels'
ON CONFLICT DO NOTHING;

INSERT INTO public.service_categories (service_id, category_id)
SELECT s.id, c.id FROM public.services s, public.categories c 
WHERE s.name = 'Constance Belle Mare' AND c.name = 'Hotels'
ON CONFLICT DO NOTHING;

INSERT INTO public.service_categories (service_id, category_id)
SELECT s.id, c.id FROM public.services s, public.categories c 
WHERE s.name = 'Ile aux Cerfs Speedboat' AND c.name = 'Activities'
ON CONFLICT DO NOTHING;

INSERT INTO public.service_categories (service_id, category_id)
SELECT s.id, c.id FROM public.services s, public.categories c 
WHERE s.name = 'Sunset Ocean Voyage' AND c.name = 'Cruises'
ON CONFLICT DO NOTHING;

INSERT INTO public.service_categories (service_id, category_id)
SELECT s.id, c.id FROM public.services s, public.categories c 
WHERE s.name = 'Premium Executive Lounge' AND c.name = 'Lounge Access'
ON CONFLICT DO NOTHING;

-- ==============================================================================
-- 6. SEED BOOKINGS
-- ==============================================================================

INSERT INTO public.bookings (customer_id, service_id, activity_type, activity_name, start_date, amount, status, payment_status)
SELECT c.id, s.id, 'hotel', s.name, NOW() + INTERVAL '10 days', s.base_price, 'Confirmed', 'Paid'
FROM public.customers c, public.services s 
WHERE c.email = 'emma.j@travellounge.mu' AND s.name = 'Lux* Grand Baie'
LIMIT 1;

INSERT INTO public.bookings (customer_id, service_id, activity_type, activity_name, start_date, amount, status, payment_status)
SELECT c.id, s.id, 'cruise', s.name, NOW() + INTERVAL '2 days', s.base_price, 'Pending', 'Pending'
FROM public.customers c, public.services s 
WHERE c.email = 'jean.dupont@email.mu' AND s.name = 'Sunset Ocean Voyage'
LIMIT 1;

-- ==============================================================================
-- 7. SEED CMS CONTENT
-- ==============================================================================

INSERT INTO public.hero_slides (title, subtitle, image_url, cta_text, cta_link, order_index)
VALUES 
('Escape to Paradise', 'Mauritius Luxury Collection', 'https://images.unsplash.com/photo-1544551763-47a0159f963f', 'Discover More', '/services', 1),
('Ocean Adventures', 'Private Laguna Cruises', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e', 'Book a Cruise', '/services?category=Cruises', 2)
ON CONFLICT DO NOTHING;

INSERT INTO public.faqs (category, question, answer)
VALUES 
('Booking', 'How do I cancel my booking?', 'You can cancel through your dashboard or contact our support team.'),
('Payment', 'What payment methods do you accept?', 'We accept Credit Cards, PayPal, and Bank Transfers.')
ON CONFLICT DO NOTHING;
