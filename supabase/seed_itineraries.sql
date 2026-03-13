-- ==============================================================================
-- SEED ITINERARY DATA FOR TRAVEL LOUNGE SERVICES (REFACTORED)
-- ==============================================================================

DO $$ 
DECLARE
    service_id UUID;
    cat_activities UUID := '305bad02-1aec-47e0-bc9f-61959c4cc8d5';
    cat_tours      UUID := '89cd9aeb-8092-4d5b-96c8-1fb84fc60bf0';
    cat_daypkgs    UUID := '8ba58ff4-e2e1-4ec9-acbd-4667acd7c070';
    cat_cruises    UUID := '6a753b13-9d37-4893-8d80-a214868234bb';
    cat_rodrigues  UUID := '76f2ff52-bc1b-4281-9e6e-9349706da5d9';
BEGIN

-- 1. Activities: Wild South Adventure
IF NOT EXISTS (SELECT 1 FROM public.services WHERE name = 'Wild South Adventure') THEN
    INSERT INTO public.services (name, description, location, region, base_price, status, rating, image_url, service_type, duration_hours, itinerary, highlights, included)
    VALUES (
        'Wild South Adventure',
        'Explore the rugged beauty of Southern Mauritius including waterfalls, tea plantations and sacred lakes.',
        'Bois Cheri & Grand Bassin',
        'South',
        3500.00,
        'In Stock',
        4.9,
        'https://images.unsplash.com/photo-1544551763-47a0159f963f',
        'activity',
        8,
        '[{"time": "09:00", "title": "Pick-up", "description": "Departure from your hotel in a private air-conditioned vehicle."}, {"time": "10:00", "title": "Bois Cheri Tea Factory", "description": "Guided tour of the oldest tea plantation and tasting session with panoramic views."}, {"time": "11:30", "title": "Grand Bassin (Ganga Talao)", "description": "Visit the sacred Hindu lake and the impressive 108ft Shiva statue."}, {"time": "13:00", "title": "Traditional Lunch", "description": "Savory Mauritian lunch at a local estate overlooking the valleys."}, {"time": "14:30", "title": "Alexandra Falls", "description": "Photo stop at the breathtaking waterfalls in the Black River Gorges."}, {"time": "16:00", "title": "Chamarel Seven Coloured Earth", "description": "Witness the iconic geological formation and the 100m Chamarel waterfall."}, {"time": "17:30", "title": "Return", "description": "Arrival back at your hotel."}]'::jsonb,
        '["Tea Factory Tour", "Volcanic Lake Visit", "7 Coloured Earth", "Traditional Mauritian Lunch"]'::jsonb,
        '["Private Transport", "Entry Fees", "Lunch & Soft Drinks", "Professional Guide"]'::jsonb
    ) RETURNING id INTO service_id;
    INSERT INTO public.service_categories (service_id, category_id) VALUES (service_id, cat_activities);
END IF;

-- 2. Group Tours: Cultural Heritage Journey
IF NOT EXISTS (SELECT 1 FROM public.services WHERE name = 'Cultural Heritage Journey') THEN
    INSERT INTO public.services (name, description, location, region, base_price, status, rating, image_url, service_type, duration_days, itinerary, highlights, included)
    VALUES (
        'Cultural Heritage Journey',
        'A deep dive into the history, soul and melting pot culture of Port Louis and the North.',
        'Port Louis',
        'North',
        2200.00,
        'In Stock',
        4.7,
        'https://images.unsplash.com/photo-1502784444187-359ac186c5bb',
        'tour',
        1,
        '[{"time": "08:30", "title": "Aapravasi Ghat", "description": "UNESCO World Heritage site: learn about the history of the indentured labor system."}, {"time": "10:00", "title": "Central Market", "description": "Immerse yourself in the vibrant scents and colors of the local bazaar."}, {"time": "11:30", "title": "Citadel Fort Adelaide", "description": "Panoramic view of the city and harbor from the 19th-century moorish fort."}, {"time": "13:00", "title": "Street Food Exploration", "description": "Taste authentic Dholl Puri, Gateaux Piments, and Alouda at selected hidden gems."}, {"time": "14:30", "title": "Pamplemousses Botanical Garden", "description": "Discover the giant water lilies and exotic flora in one of the world''s oldest gardens."}]'::jsonb,
        '["UNESCO Heritage Site", "City Panorama", "Authentic Street Food", "Famous Botanical Gardens"]'::jsonb,
        '["Group Coordination", "Tastings", "Entry Tickets"]'::jsonb
    ) RETURNING id INTO service_id;
    INSERT INTO public.service_categories (service_id, category_id) VALUES (service_id, cat_tours);
END IF;

-- 3. Day Packages: Island Bliss Escape
IF NOT EXISTS (SELECT 1 FROM public.services WHERE name = 'Island Bliss Escape') THEN
    INSERT INTO public.services (name, description, location, region, base_price, status, rating, image_url, service_type, duration_hours, itinerary, highlights, included)
    VALUES (
        'Island Bliss Escape',
        'The ultimate day of relaxation on the private sanctuary of Ile aux Cerfs with premium beach club access.',
        'Ile aux Cerfs',
        'East',
        4800.00,
        'In Stock',
        5.0,
        'https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5',
        'activity',
        7,
        '[{"time": "09:30", "title": "Speedboat Transfer", "description": "Swift transfer from Trou d''Eau Douce to the island jetty."}, {"time": "10:00", "title": "Beach Club Welcome", "description": "Welcome cocktail and assignment of your private sunbed and umbrella."}, {"time": "11:00", "title": "Leisure & Snorkeling", "description": "Explore the turquoise lagoon or relax with a book on the white sand."}, {"time": "13:00", "title": "Lobster BBQ Lunch", "description": "Gourmet seafood barbecue served on the sand with unlimited beverages."}, {"time": "15:00", "title": "Watersports (Optional)", "description": "Try Parasailing or Tube Riding (extra cost) at the island adventure center."}, {"time": "16:30", "title": "Final Transfer", "description": "Return boat trip to the mainland."}]'::jsonb,
        '["Exclusive Beach Club", "Lobster Lunch", "Private Speedboat", "Premium Amenities"]'::jsonb,
        '["Sunbeds", "All-inclusive Lunch", "Return Speedboat", "Welcome Drink"]'::jsonb
    ) RETURNING id INTO service_id;
    INSERT INTO public.service_categories (service_id, category_id) VALUES (service_id, cat_daypkgs);
END IF;

-- 4. Cruises: Three Islands Catamaran Cruise
IF NOT EXISTS (SELECT 1 FROM public.services WHERE name = 'Three Islands Catamaran Cruise') THEN
    INSERT INTO public.services (name, description, location, region, base_price, status, rating, image_url, service_type, duration_hours, itinerary, highlights, included)
    VALUES (
        'Three Islands Catamaran Cruise',
        'Sail to the pristine northern islets: Coin de Mire, Flat Island, and Gabriel Island.',
        'Grand Baie',
        'North',
        3200.00,
        'In Stock',
        4.8,
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
        'cruise',
        8,
        '[{"time": "09:00", "title": "Boarding", "description": "Welcome aboard our luxury sailing catamaran at Grand Baie jetty."}, {"time": "10:30", "title": "Coin de Mire Snorkeling", "description": "Crystal clear waters with abundant marine life at the base of the majestic rock."}, {"time": "12:00", "title": "Flat Island Landing", "description": "Time to explore the white sand beaches and the old lighthouse."}, {"time": "13:30", "title": "Catamaran BBQ", "description": "Full BBQ lunch grilled on board: chicken, fish, sausages, and fresh salads."}, {"time": "15:00", "title": "Gabriel Island Relaxation", "description": "Walk between the islands at low tide or swim in the protected lagoon."}, {"time": "16:00", "title": "Sunset Return Sailing", "description": "Leisurely sail back with music and cocktails as the sun begins to lower."}]'::jsonb,
        '["3 Northern Islands", "On-board BBQ", "Snorkeling at Coin de Mire", "Open Bar"]'::jsonb,
        '["Full Day Cruise", "BBQ Lunch", "Unlimited Drinks", "Snorkeling Gear"]'::jsonb
    ) RETURNING id INTO service_id;
    INSERT INTO public.service_categories (service_id, category_id) VALUES (service_id, cat_cruises);
END IF;

-- 5. Rodrigues: Rodrigues Authentic Discovery
IF NOT EXISTS (SELECT 1 FROM public.services WHERE name = 'Rodrigues Authentic Discovery') THEN
    INSERT INTO public.services (name, description, location, region, base_price, status, rating, image_url, service_type, duration_days, itinerary, highlights, included)
    VALUES (
        'Rodrigues Authentic Discovery',
        'Experience the untouched charm of Rodrigues: a journey through time and nature.',
        'Port Mathurin',
        'Rodrigues',
        8500.00,
        'In Stock',
        4.9,
        'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0',
        'activity',
        3,
        '[{"day": "1", "title": "The Northern Heights", "description": "Visit Mont Limon for the highest view point and the local market of Port Mathurin."}, {"day": "2", "title": "Giant Tortoises & Caves", "description": "Guided tour of Francois Leguat Nature Reserve and the impressive caves of Grande Caverne."}, {"day": "3", "title": "Coastal Hike", "description": "Trekking from Graviers to Trou d''Argent - widely rated as the most beautiful beach in the Indian Ocean."}]'::jsonb,
        '["Slow Life Experience", "Giant Tortoise Reserve", "Famous Trou d''Argent", "Rodriguan Culinary Tour"]'::jsonb,
        '["Internal Transfers", "Guide", "Entry to Reserves", "Lunch for all 3 days"]'::jsonb
    ) RETURNING id INTO service_id;
    INSERT INTO public.service_categories (service_id, category_id) VALUES (service_id, cat_rodrigues);
END IF;

END $$;
