
INSERT INTO public.admins (id, username, email, name, role, bio, photo_url, is_active, show_on_front_page, display_order, user_id)
VALUES 
('ec833cb0-f2b1-41f5-993a-6d8dd32f000e', 'sysadmin', 'admin@travellounge.mu', 'System Admin', 'super_admin', NULL, NULL, TRUE, FALSE, 0, 'af35dfb0-ade0-4f2c-bde2-c64e43b7f591'),
('5e5ed3d3-46da-45a3-9e82-2121d6396c65', 'leena', 'leena@travellounge.mu', 'Leena Jhugroo', 'director', 'Managing Director with years of experience in the travel and tourism industry.', 'https://tbyudagfjspedeqtlgjv.supabase.co/storage/v1/object/public/bucket/staff/1773821851457-wtxstitoox9.png', TRUE, TRUE, 1, NULL),
('fd7ea1f4-9b86-4a28-8d92-bd2d08b9c7b3', 'kirtee', 'kirtee@travellounge.mu', 'Kirtee Boodoo', 'sales', 'Senior Sales Executive Leisure, helping you plan your perfect island getaway.', 'https://tbyudagfjspedeqtlgjv.supabase.co/storage/v1/object/public/bucket/staff/1773900771685-sa09gezlnwk.png', TRUE, TRUE, 4, NULL),
('cb6f5349-21c5-47e3-b6a3-763ee6109c32', 'maleekah', 'maleekah@travellounge.mu', 'Maleekah Amboorallee', 'consultant', 'TRAVEL CONSULTANT focused on personalized travel experiences.', 'https://tbyudagfjspedeqtlgjv.supabase.co/storage/v1/object/public/bucket/staff/1773900788549-p8l08i3h08.png', TRUE, TRUE, 5, NULL),
('9ba0e344-e188-4ceb-94fb-a315696b7b67', 'manshi', 'manshi@travellounge.mu', 'Manshi Rughoobur', 'accountant', 'ACCOUNT CLERK ensuring all financial transactions are smooth and transparent.', 'https://tbyudagfjspedeqtlgjv.supabase.co/storage/v1/object/public/bucket/staff/1773900845408-wfoxkp4g3y.png', TRUE, TRUE, 7, NULL),
('c8147736-babb-44a5-b2ff-26149ecb61c9', 'nabila', 'nabila@travellounge.mu', 'Nabila Ramjaun', 'sales_corporate_sr', 'SENIOR SALES EXCUTIVE CORPORATE dedicated to high-level corporate accounts.', 'https://tbyudagfjspedeqtlgjv.supabase.co/storage/v1/object/public/bucket/staff/1773900863578-uyosp7t1h4.png', TRUE, TRUE, 3, NULL),
('a9bd7fb9-480b-4509-8562-ded4e170566f', 'nalini', 'nalini@travellounge.mu', 'Nalini Indurjeet', 'sales_corporate', 'Senior Sales Executive Corporate specializing in enterprise travel solutions.', 'https://tbyudagfjspedeqtlgjv.supabase.co/storage/v1/object/public/bucket/staff/1773900882967-hzv34t8dt1s.png', TRUE, TRUE, 2, NULL)
ON CONFLICT (id) DO UPDATE SET 
    username = EXCLUDED.username, 
    email = EXCLUDED.email, 
    name = EXCLUDED.name, 
    role = EXCLUDED.role, 
    bio = EXCLUDED.bio, 
    photo_url = EXCLUDED.photo_url, 
    is_active = EXCLUDED.is_active, 
    show_on_front_page = EXCLUDED.show_on_front_page, 
    display_order = EXCLUDED.display_order;

INSERT INTO public.categories (id, name, slug, description, image_url, show_on_home, display_order)
VALUES 
('c1a8e376-6d7d-481b-bb37-8ad03000c96d', 'Hotels', 'hotels', 'Luxury stays and cozy retreats', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80', TRUE, 1),
('c2b9f487-7e8e-592c-cc48-9ae14111d07e', 'Cruises', 'cruises', 'Explore the high seas in style', 'https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&fit=crop&q=80', TRUE, 2),
('d3c0a598-8f9f-6a3d-dd59-0bf25222e18f', 'Activities', 'activities', 'Unforgettable local experiences', 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&q=80', TRUE, 3),
('e4d1b609-90a0-7b4e-ee60-1cf36333f40a', 'Island Getaways', 'getaways', 'Remote paradise islands', 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&q=80', TRUE, 4),
('f5e2c71a-a1b1-8c5f-ff71-2df47444051b', 'Transfers', 'transfers', 'Reliable and safe transportation', 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80', TRUE, 5)
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name, 
    slug = EXCLUDED.slug, 
    description = EXCLUDED.description, 
    image_url = EXCLUDED.image_url, 
    show_on_home = EXCLUDED.show_on_home, 
    display_order = EXCLUDED.display_order;

INSERT INTO public.email_templates (name, subject, body, variables)
VALUES 
('welcome_email', 'Welcome to Travel Lounge!', 'Hi {{name}}, welcome to our platform.', '["name"]'),
('booking_confirmation', 'Booking Confirmed: {{booking_id}}', 'Your booking for {{service_name}} is confirmed.', '["name", "booking_id", "service_name"]'),
('admin_new_inquiry', 'New Inquiry Received: {{subject}}', 'You have received a new inquiry from {{name}} ({{email}}).\n\nSubject: {{subject}}\nMessage: {{message}}', '["name", "email", "subject", "message"]')
ON CONFLICT (name) DO UPDATE SET 
    subject = EXCLUDED.subject, 
    body = EXCLUDED.body, 
    variables = EXCLUDED.variables;

INSERT INTO public.site_settings (key, value, category, description)
VALUES 
('company_info', '{"name": "Travel Lounge", "address": "Port Louis, Mauritius", "email": "reservation@travellounge.mu", "phone": "+230 123 4567"}', 'general', 'Company essential contact information'),
('social_links', '{"facebook": "#", "instagram": "#", "twitter": "#", "linkedin": "#"}', 'social', 'Social media URLs'),
('header_config', '{"logo_url": "/logo.png", "sticky": true, "show_search": true}', 'ui', 'Header behavior and assets'),
('footer_config', '{"copyright": "© 2026 Travel Lounge", "show_newsletter": true}', 'ui', 'Footer section settings')
ON CONFLICT (key) DO UPDATE SET 
    value = EXCLUDED.value, 
    category = EXCLUDED.category;

INSERT INTO public.navigations (label, link, display_order, is_active)
VALUES 
('Home', '/', 1, TRUE),
('Hotels', '/hotels', 2, TRUE),
('Cruises', '/cruises', 3, TRUE),
('Activities', '/activities', 4, TRUE),
('About Us', '/about', 5, TRUE),
('Contact', '/contact', 6, TRUE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.hero_slides (title, subtitle, description, image_url, order_index, is_active)
VALUES 
('Discover Mauritius', 'Your Paradise Awaits', 'Experience the best of the island with our curated tours.', 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&q=80', 1, TRUE),
('Luxury Cruises', 'Sail the Sapphire Waters', 'Unforgettable memories on the high seas.', 'https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&fit=crop&q=80', 2, TRUE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.popular_destinations (destination, country, return_price, is_featured, image_url)
VALUES 
('Grand Baie', 'Mauritius', 1500, TRUE, 'https://images.unsplash.com/photo-1589552820164-f4b7c37dd3af?auto=format&fit=crop&q=80'),
('Flic en Flac', 'Mauritius', 1200, TRUE, 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80'),
('Black River Gorges', 'Mauritius', 800, FALSE, 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&q=80')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.services (id, name, description, service_type, base_price, location, region, image_url, is_active)
VALUES 
('6301966a-3f25-4f43-9d48-645923f37f41', 'Casela Nature Park Entry', 'Interact with wildlife and enjoy the safari', 'land_activity', 1800, 'Cascavelle', 'West', 'https://images.unsplash.com/photo-1549480017-d76466a4b7e8', TRUE),
('b4f292c3-d357-4514-9d86-8f197d168161', 'Black River Gorges Hiking', 'Nature walk through the lush green forests', 'activity', 1500, 'Black River', 'South-West', 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e', TRUE),
('b1fdbe71-8d9f-4087-8821-512176afa629', 'Shangri-La Touessrok', 'Lagoon luxury', 'hotel', 48000, 'Trou d''Eau Douce', 'East', 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7', TRUE),
('5b795371-785e-4b14-95eb-0d92bb2be7d7', 'LUX* Grand Baie', 'Luxury resort', 'hotel', 5000, 'Grand Baie', 'North', 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb', TRUE),
('f2d80131-a3d3-4f53-abfe-fc9b3c4afc8a', 'Blue Safari Submarine', 'Dive 35 meters deep without getting wet.', 'activity', 4900, 'Trou aux Biches', 'North', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5', TRUE),
('bf8a5f82-8faf-40e4-97c9-809820753b56', 'Le Morne Peak Challenge', 'Hike the iconic UNESCO World Heritage site.', 'activity', 1800, 'Le Morne', 'South-West', 'https://images.unsplash.com/photo-1563492065599-3520f775eeed', TRUE),
('5d7bb29f-046b-47e8-b2dc-28356b21720a', 'Sunset Dinner Cruise', 'Romantic evening on the water with dinner', 'cruise', 6500, 'Grand Baie', 'North', 'https://images.unsplash.com/photo-1534447677768-be436bb09401', TRUE),
('bc6fa55d-b9b0-48c4-8086-e12e018c6e9b', 'Wild West Exploration', 'Discover the salt pans and rugged west coast', 'tour', 4200, 'Tamarin', 'West', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b', TRUE)
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name, 
    description = EXCLUDED.description, 
    service_type = EXCLUDED.service_type, 
    base_price = EXCLUDED.base_price, 
    location = EXCLUDED.location, 
    region = EXCLUDED.region, 
    is_active = EXCLUDED.is_active;

INSERT INTO public.content_blocks (page_slug, section_key, content)
VALUES 
('home', 'hero_section', '{"title": "Explore the World with Us", "subtitle": "Curated experiences for the modern traveler"}'),
('home', 'features_section', '{"title": "Why Choose Travel Lounge?", "features": [{"title": "Expert Guides", "icon": "Users"}, {"title": "Best Prices", "icon": "DollarSign"}]}'),
('about', 'about_hero', '{"title": "Our Story", "content": "Travel Lounge was founded on a passion for exploration and storytelling."}')
ON CONFLICT (page_slug, section_key) DO UPDATE SET content = EXCLUDED.content;
