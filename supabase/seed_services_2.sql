-- Update ALL existing services to have realistic regional metadata if they have defaults
UPDATE public.services 
SET region = CASE 
    WHEN location ILIKE '%Grand Baie%' THEN 'North'
    WHEN location ILIKE '%Trou aux Biches%' THEN 'North'
    WHEN location ILIKE '%Port Louis%' THEN 'West'
    WHEN location ILIKE '%Flic en Flac%' THEN 'West'
    WHEN location ILIKE '%Le Morne%' THEN 'South-West'
    WHEN location ILIKE '%Black River%' THEN 'South-West'
    WHEN location ILIKE '%Souillac%' THEN 'South'
    WHEN location ILIKE '%Mahebourg%' THEN 'South-East'
    WHEN location ILIKE '%Blue Bay%' THEN 'South-East'
    WHEN location ILIKE '%Trou d''Eau Douce%' THEN 'East'
    WHEN location ILIKE '%Belle Mare%' THEN 'East'
    WHEN location ILIKE '%Curepipe%' THEN 'Central'
    WHEN location ILIKE '%Rodrigues%' THEN 'Rodrigues'
    ELSE region
END
WHERE region IS NULL OR region = 'Mauritius';

-- Insert another variety of services
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
        'Grand Baie Luxury Penthouse', 
        'Enjoy panoramic views of the turquoise lagoon from your private rooftop infinity pool. This 3-bedroom luxury penthouse offers the ultimate privacy and style in the heart of Grand Baie.', 
        'Panoramic lagoon views and private rooftop infinity pool.', 
        'Grand Baie', 
        'North', 
        25000, 
        4.9, 
        7, 
        0, 
        'hotel', 
        true, 
        'Luxury Choice', 
        'In Stock', 
        ARRAY['Private Pool', 'Chef Service', 'Gym', 'High-speed WiFi'], 
        '["Rooftop Infinity Pool", "Heart of Grand Baie", "Daily Housekeeping"]'::jsonb, 
        '["Accommodation", "Welcome Hamper", "Concierge"]'::jsonb, 
        'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?fm=jpg&q=80&w=2070'
    ),
    (
        'Deep Sea Fishing Expedition', 
        'Target Blue Marlin, Tuna, and Wahoo on our fully equipped twin-engine sport fisherman. Our experienced crew will guide you through the best fishing spots in the Indian Ocean.', 
        'Target Blue Marlin and Tuna on a fully equipped sport fisherman.', 
        'Black River', 
        'South-West', 
        12000, 
        4.8, 
        0, 
        8, 
        'activity', 
        true, 
        'Big Game Special', 
        'In Stock', 
        ARRAY['Fishing Gear', 'Safety Equipment', 'Professional Crew', 'Cold Drinks'], 
        '["Big Game Experience", "Expert Fishing Guides", "Quality Equipment"]'::jsonb, 
        '["Boat Rental", "Crew", "Drinks", "Snacks"]'::jsonb, 
        'https://images.unsplash.com/photo-1544551763-46a013bb70d5?fm=jpg&q=80&w=2070'
    ),
    (
        'Black River Gorges Hiking', 
        'Traverse the largest national park in Mauritius. Discover rare endemic species, stunning waterfalls, and the unique Macchabee Forest.', 
        'Discover endemic species and stunning waterfalls in the largest park.', 
        'Black River Gorges', 
        'South-West', 
        1500, 
        4.7, 
        0, 
        6, 
        'activity', 
        false, 
        null, 
        'In Stock', 
        ARRAY['Expert Guide', 'Walking Sticks', 'Photography', 'Binoculars'], 
        '["Endemic Bird Watching", "Cascade Views", "Nature Photography"]'::jsonb, 
        '["Guide Fees", "National Park Entry"]'::jsonb, 
        'https://images.unsplash.com/photo-1501785888041-af3ef285b470?fm=jpg&q=80&w=2070'
    ),
    (
        'Belle Mare Coastal Horse Riding', 
        'The perfect way to start your day. Ride white horses along the pristine sandy shores of Belle Mare while the sun rises over the horizon.', 
        'Ride along white sandy shores as the sun rises over the horizon.', 
        'Belle Mare', 
        'East', 
        3500, 
        4.9, 0, 2, 
        'activity', 
        false, 
        null, 
        'In Stock', 
        ARRAY['Well-trained Horses', 'Safety Riding Gear', 'Guide', 'Photo Ops'], 
        '["Sunrise Coastal Views", "Pristine Beaches", "Majestic Horses"]'::jsonb, 
        '["Riding Session", "Gear", "Photos"]'::jsonb, 
        'https://images.unsplash.com/photo-1553247407-23251ce81f59?fm=jpg&q=80&w=2070'
    ),
    (
        'Authentic Creole Cooking Class', 
        'Visit a local market with our chef to pick fresh ingredients, then learn to prepare a traditional Mauritian feast in a colonial-style kitchen.', 
        'Learn to prepare a traditional Mauritian feast with a local market visit.', 
        'Moka', 
        'Central', 
        4200, 
        5.0, 
        0, 
        5, 
        'activity', 
        true, 
        'Best Cultural Tour', 
        'In Stock', 
        ARRAY['Cooking Station', 'Aprons', 'Recipe Booklet', 'Full Meal'], 
        '["Market Experience", "Secret Local Recipes", "Dining with the Chef"]'::jsonb, 
        '["Market Tour", "Ingredients", "Lunch", "Drinks"]'::jsonb, 
        'https://images.unsplash.com/photo-1556910103-1c02745aae4d?fm=jpg&q=80&w=2070'
    ),
    (
        'Coco Island Snorkeling Adventure', 
        'Take a traditional pirogue to the protected marine park of Rodrigues. Crystal clear waters and an abundance of coral life await.', 
        'Explore a protected marine park with crystal clear waters and coral life.', 
        'Ile aux Cocos', 
        'Rodrigues', 
        2800, 
        4.8, 
        0, 
        6, 
        'activity', 
        false, 
        null, 
        'In Stock', 
        ARRAY['Boat Transfer', 'Snorkeling Kit', 'Picnic Lunch', 'Sunbed'], 
        '["Bird Sanctuary", "Pristine Coral Reefs", "Isolated Beauty"]'::jsonb, 
        '["Picnic Lunch", "Boat Transfer", "Snorkeling Equipment"]'::jsonb, 
        'https://images.unsplash.com/photo-1544551763-46a013bb70d5?fm=jpg&q=80&w=2070'
    ),
    (
        'Luxury Port Louis Sightseeing', 
        'Discover the capital in style. Visit the Citadel, Caudan Waterfront, and Central Market with a private guide and luxury transport.', 
        'Discover the capital style with private guides and luxury transport.', 
        'Port Louis', 
        'West', 
        2500, 
        4.7, 
        0, 
        6, 
        'activity', 
        false, 
        null, 
        'In Stock', 
        ARRAY['Private Car', 'Expert Guide', 'Lunch', 'Entrance Fees'], 
        '["Historical Citadel", "Waterfront Shopping", "Local Gastronomy"]'::jsonb, 
        '["Transport", "Professional Guide", "Lunch"]'::jsonb, 
        'https://images.unsplash.com/photo-1543852786-1cf6624b9987?fm=jpg&q=80&w=2070'
    ),
    (
        'Northern Islands Catamaran Cruise', 
        'Explore Coin de Mire, Gabriel Island, and Flat Island. Snorkel in crystal clear lagoons and enjoy a BBQ lunch prepared by our crew.', 
        'Explore Coin de Mire and snorkel in crystal clear lagoons with BBQ lunch.', 
        'Grand Baie', 
        'North', 
        3800, 
        4.9, 
        0, 
        8, 
        'cruise', 
        true, 
        'Highly Rated', 
        'In Stock', 
        ARRAY['Large Deck', 'Music System', 'BBQ Pit', 'Changing Rooms'], 
        '["Iconic Coin de Mire", "White Beach Islands", "Fresh Seafood BBQ"]'::jsonb, 
        '["Lunch", "Open Bar", "Skipper", "Snorkeling Equipment"]'::jsonb, 
        'https://images.unsplash.com/photo-1544551763-46a013bb70d5?fm=jpg&q=80&w=2070'
    ),
    (
        'Heritage Awali Golf Stay', 
        'Play like a pro on an award-winning championship course. Package includes green fees, buggy, and all-inclusive luxury accommodation.', 
        'Play on an award-winning championship course with luxury stay.', 
        'Bel Ombre', 
        'South', 
        18500, 
        4.9, 
        2, 
        0, 
        'hotel', 
        true, 
        'Golfer''s Dream', 
        'In Stock', 
        ARRAY['Golf Course Access', 'Buggy', 'Pro Shop', 'All-inclusive Dining'], 
        '["Championship Golf", "Beachfront View", "World-class Spa"]'::jsonb, 
        '["Accommodation", "Green Fees", "All-inclusive Meals"]'::jsonb, 
        'https://images.unsplash.com/photo-1587518903126-adda28243099?fm=jpg&q=80&w=2070'
    ),
    (
        'Underwater Sea Walk Experience', 
        'Walk on the ocean floor and breathe normally through a specialized helmet. Perfect for non-swimmers to discover the underwater world.', 
        'Ocean floor walking with a specialized helmet for non-swimmers.', 
        'Grand Baie', 
        'North', 
        2200, 
        4.6, 
        0, 
        2, 
        'activity', 
        false, 
        null, 
        'In Stock', 
        ARRAY['Specialized Helmet', 'Underwater Camera', 'Safety Divers', 'Wetsuits'], 
        '["Zero Swimming Skills Needed", "Friendly Fish Feeding", "Safe & Fun Category"]'::jsonb, 
        '["Walk Session", "Equipment", "Digital Photos"]'::jsonb, 
        'https://images.unsplash.com/photo-1544551763-46a013bb70d5?fm=jpg&q=80&w=2070'
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
    (ns.name LIKE '%Rodrigues%' OR ns.location LIKE '%Ile aux Cocos%' AND c.name = 'Rodrigues') OR
    (ns.name LIKE '%Tour%' OR ns.name LIKE '%Sightseeing%' AND c.name = 'Group Tours') OR
    (ns.name LIKE '%Package%' OR ns.name LIKE '%Stay%' AND c.name = 'Day Packages');
