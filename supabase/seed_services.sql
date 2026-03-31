-- Set realistic short descriptions for existing services
UPDATE public.services 
SET short_description = 'Experience luxury and comfort with our ' || name || ' package, designed for the discerning traveler.'
WHERE short_description IS NULL OR short_description = '';

-- Insert new premium seed data
WITH new_services AS (
    INSERT INTO public.services (
        name, 
        description, 
        short_description, 
        location, 
        region, 
        base_price, 
        rating, 
        duration_days, 
        duration_hours, 
        service_type, 
        is_seasonal_deal, 
        deal_note, 
        status, 
        amenities, 
        highlights, 
        included, 
        image_url
    ) VALUES 
    (
        'Sunset Catamaran Cruise', 
        'Sail into the golden hour on a luxurious catamaran. Enjoy gourmet appetizers and premium drinks as you watch the sun dip below the horizon of the Indian Ocean.', 
        'Golden hour sailing with gourmet snacks and premium open bar.', 
        'Grand Baie', 
        'North', 
        4500, 
        4.9, 
        0, 
        4, 
        'cruise', 
        true, 
        '10% OFF', 
        'In Stock', 
        '["Open Bar", "Live Music", "Appetizers", "WiFi"]', 
        '["Stunning Sunset Views", "Premium Catamaran", "Gourmet Catering"]', 
        '["Drinks", "Snacks", "Transport", "Skipper"]', 
        '/assets/placeholders/hero-cruise.png'
    ),
    (
        'Ile aux Cerfs Premium Package', 
        'A full day of tropical bliss. Transfer to the island, private beach access, a three-course lunch, and unlimited water sports.', 
        'A full day of tropical island bliss with private beach access.', 
        'Trou d''Eau Douce', 
        'East', 
        3200, 
        4.8, 
        1, 
        8, 
        'activity', 
        false, 
        null, 
        'In Stock', 
        '["Private Beach", "Lunch Included", "Water Sports", "Showers"]', 
        '["Turquoise Lagoons", "White Sandy Beaches", "Coral Reef Snorkeling"]', 
        '["Lunch", "Boat Transfer", "Snorkeling Gear"]', 
        '/assets/placeholders/hero-island.png'
    ),
    (
        'Le Morne Peak Challenge', 
        'Hike the iconic UNESCO World Heritage site. A challenging but rewarding trek offering the best views in Mauritius.', 
        'Challenging UNESCO World Heritage trek with breathtaking views.', 
        'Le Morne', 
        'South-West', 
        1800, 
        4.7, 
        0, 
        5, 
        'activity', 
        true, 
        'UNESCO Special', 
        'In Stock', 
        '["Pro Guide", "Water Provided", "Certificates", "First Aid"]', 
        '["360 Degree Views", "Rich History", "Rare Flora & Fauna"]', 
        '["Guide", "Snacks"]', 
        '/assets/placeholders/hero-trek.png'
    ),
    (
        'Chamarel 7-Colored Earth Tour', 
        'Visit the world-famous volcanic formation, the cascading waterfalls, and the Ebony Forest.', 
        'Explore the world-famous volcanic formation and lush Ebony Forest.', 
        'Chamarel', 
        'South', 
        2500, 
        4.6, 
        0, 
        6, 
        'activity', 
        false, 
        null, 
        'In Stock', 
        '["Transport", "Entry Fees", "Lunch", "Guided Tour"]', 
        '["Unique Geology", "Giant Tortoises", "Lush Waterfalls"]', 
        '["Entry Fees", "Transport"]', 
        '/assets/placeholders/hero-nature.png'
    ),
    (
        'Luxury Mauritius South Tour', 
        'A curated journey through the wild south. Grand Bassin, Black River Gorges, and a private lunch at a colonial estate.', 
        'A curated journey through the wild south with a private colonial lunch.', 
        'Black River', 
        'South', 
        5500, 
        4.9, 
        1, 
        10, 
        'activity', 
        true, 
        'Group Discount', 
        'In Stock', 
        '["Private Van", "Gourmet Lunch", "Photography Service", "Entry Fees"]', 
        '["Spiritual Grand Bassin", "Endemic Wildlife", "Heritage Dining"]', 
        '["Lunch", "Transport", "Guide"]', 
        '/assets/placeholders/hero-south.png'
    ),
    (
        'Rodrigues Island Escape', 
        'Escape to the authentic sister island. 3 nights in a beachfront lodge with daily excursions to hidden coves.', 
        '3-night authentic escape with beachfront lodging and hidden cove trips.', 
        'Port Mathurin', 
        'Rodrigues', 
        15000, 
        5.0, 
        4, 
        0, 
        'hotel', 
        true, 
        'Exclusive', 
        'In Stock', 
        '["Beachfront", "Lodge Stay", "Daily Breakfast", "Car Rental"]', 
        '["Untouched Nature", "Local Gastronomy", "Starlit Nights"]', 
        '["Accommodation", "Inter-island Flight", "Breakfast"]', 
        '/assets/placeholders/hero-hotel.png'
    ),
    (
        'Blue Safari Submarine', 
        'Dive 35 meters deep without getting wet. Discover shipwrecks and vibrant coral formations from the comfort of a submarine.', 
        'Exploration of shipwrecks and coral formations from 35 meters deep.', 
        'Trou aux Biches', 
        'North', 
        4900, 
        4.8, 
        0, 
        2, 
        'activity', 
        false, 
        null, 
        'In Stock', 
        '["Air Conditioned", "Window View", "Certificates", "Refreshments"]', 
        '["Starry Reef Life", "Shipwreck Discovery", "Professional Crew"]', 
        '["Submarine Dive", "Pilot Guidance"]', 
        '/assets/placeholders/hero-aqua.png'
    ),
    (
        'Luxury Airport Transfer', 
        'Arrival in style. Private chauffeur service in a Mercedes S-Class with onboard refreshments and cold towels.', 
        'Arrival in style with a private Mercedes S-Class chauffeur service.', 
        'Plaine Magnien', 
        'South', 
        3500, 
        5.0, 
        0, 
        2, 
        'transfer', 
        false, 
        null, 
        'In Stock', 
        '["Leather Interior", "Bottled Water", "WiFi", "Newspaper"]', 
        '["VIP Reception", "Comfortable Ride", "Professional Logistics"]', 
        '["Transport", "Meet & Greet"]', 
        '/assets/placeholders/hero-taxi.png'
    )
    RETURNING id, name, service_type
)
INSERT INTO public.service_categories (service_id, category_id)
SELECT ns.id, c.id
FROM new_services ns
CROSS JOIN public.categories c
WHERE 
    -- Map new services to appropriate categories
    (ns.service_type = 'cruise' AND c.name = 'Cruises') OR
    (ns.service_type = 'hotel' AND ns.name NOT LIKE '%Rodrigues%' AND c.name = 'Hotels') OR
    (ns.service_type = 'activity' AND ns.name NOT LIKE '%Rodrigues%' AND c.name = 'Activities') OR
    (ns.name LIKE '%Rodrigues%' AND c.name = 'Rodrigues') OR
    (ns.name LIKE '%Tour%' AND c.name = 'Group Tours') OR
    (ns.name LIKE '%Package%' AND c.name = 'Day Packages');
