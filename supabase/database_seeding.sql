-- 1. Seed Hero Slides
INSERT INTO public.hero_slides (title, subtitle, description, image_url, cta_text, cta_link, order_index, is_active, media_type)
VALUES 
('Escape to Paradise', 'Mauritius Luxury Collection', 'Experience the ultimate luxury in Mauritius with our exclusive resort collections and private villas.', 'https://images.unsplash.com/photo-1544551763-47a0159f963f?auto=format&fit=crop&q=80&w=2070', 'Discover More', '/products', 1, true, 'image'),
('Ocean Adventures', 'Private Laguna Cruises', 'Set sail on a private catamaran and explore the crystal clear lagoons of the Indian Ocean.', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=2070', 'Book a Cruise', '/products?category=Cruises', 2, true, 'image'),
('Authentic Experiences', 'Heart of the Island', 'Connect with the heart of Mauritius through our curated cultural and nature tours.', 'https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&q=80&w=2070', 'Explore Tours', '/products?category=Activities', 3, true, 'image')
ON CONFLICT DO NOTHING;

-- 2. Seed Email Templates
INSERT INTO public.email_templates (name, subject, body, variables)
VALUES 
('order_confirmation', 'Your Order is Confirmed!', 'Hi {{customer_name}},\n\nThank you for choosing TravelLounge! We have received your order #{{order_id}} for a total of {{total_amount}} MUR. Our team is preparing everything for you.\n\nWarm regards,\nThe TravelLounge Team', '{"customer_name": "Customer Name", "order_id": "Order Reference", "total_amount": "Total Price"}'),
('booking_confirmation', 'Your Booking is Confirmed!', 'Hi {{customer_name}},\n\nYour booking for {{activity_name}} is officially confirmed! Your booking ID is {{booking_id}}.\n\nWe look forward to seeing you soon!\n\nTravelLounge Mauritius', '{"customer_name": "Customer Name", "booking_id": "Booking reference", "activity_name": "Activity Name"}')
ON CONFLICT DO NOTHING;

-- 3. Seed Hotel Rooms from existing Products
-- First, handle those with explicit room_types JSON
INSERT INTO public.hotel_rooms (service_id, name, type, price_per_night, total_units, size, view, bed, features)
SELECT 
    p.id as service_id,
    p.name || ' - ' || (elem->>'type') as name,
    elem->>'type' as type,
    (elem->'prices'->>'mon')::numeric as price_per_night,
    10 as total_units,
    '45sqm' as size,
    'Garden View' as view,
    'King Size' as bed,
    '["AC", "WiFi", "Mini Bar", "TV"]'::jsonb as features
FROM public.products p, jsonb_array_elements(p.room_types) elem
WHERE p.category = 'Hotels' AND jsonb_array_length(p.room_types) > 0;

-- Second, handle those with empty room_types by adding a default "Standard Room"
INSERT INTO public.hotel_rooms (service_id, name, type, price_per_night, total_units, size, view, bed, features)
SELECT 
    id as service_id,
    name || ' - Standard Room' as name,
    'Standard' as type,
    price as price_per_night,
    5 as total_units,
    '30sqm' as size,
    'Resort View' as view,
    'Queen Size' as bed,
    '["AC", "WiFi", "TV"]'::jsonb as features
FROM public.products
WHERE category = 'Hotels' AND (room_types IS NULL OR jsonb_array_length(room_types) = 0);
