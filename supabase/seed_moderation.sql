-- ==============================================================================
-- SEED DATA: Inquiry Inbox, Newsletter Subscribers, and Review Moderation
-- ==============================================================================

-- 1. SEED PROFILES (to link to reviews)
-- NOTE: We use profiles for review associations as defined in the schema.
INSERT INTO public.profiles (id, name, email, phone)
VALUES 
('a1111111-1111-1111-1111-111111111111', 'Alice Wonder', 'alice@example.com', '+230 5111 1111'),
('b2222222-2222-2222-2222-222222222222', 'Bob Builder', 'bob@example.com', '+230 5222 2222'),
('c3333333-3333-3333-3333-333333333333', 'Charlie Check', 'charlie@example.com', '+230 5333 3333'),
('d4444444-4444-4444-4444-444444444444', 'David Doe', 'david@example.com', '+230 5444 4444'),
('e5555555-5555-5555-5555-555555555555', 'Eve Online', 'eve@example.com', '+230 5555 5555'),
('f6666666-6666-6666-6666-666666666666', 'Frank Furter', 'frank@example.com', '+230 5666 6666'),
('07777777-7777-7777-7777-777777777777', 'Grace Kelly', 'grace@example.com', '+230 5777 7777')
ON CONFLICT (email) DO NOTHING;

-- 2. SEED INQUIRIES (Inquiry Inbox)
INSERT INTO public.inquiries (name, email, phone, subject, message, status)
VALUES 
('Zoe Miller', 'zoe@example.com', '+230 5000 0001', 'Booking Inquiry', 'I would like to know more about the Deluxe Spa Treatment.', 'unread'),
('Kevin Tan', 'kevin@example.com', '+230 5000 0002', 'General Question', 'Do you provide airport transfers?', 'unread'),
('Lily White', 'lily@example.com', '+230 5000 0003', 'Feedback', 'Your website is very easy to use!', 'read'),
('Mark Stone', 'mark.s@example.com', '+230 5000 0004', 'Corporate Event', 'We are planning a team building in Mauritius.', 'read'),
('Sarah Green', 'sarah.g@example.com', '+230 5000 0005', 'Honeymoon Package', 'Looking for a romantic cruise option.', 'unread'),
('Tom Brown', 'tom.b@example.com', '+230 5000 0006', 'Special Request', 'Can we bring pets to the resort?', 'unread'),
('Anna Lee', 'anna.l@example.com', '+230 5000 0007', 'Cancellation Policy', 'Where can I find details on cancellation?', 'read');

-- 3. SEED SUBSCRIBERS (Newsletter Subscribers)
INSERT INTO public.subscribers (email, status)
VALUES 
('news1@example.com', 'active'),
('news2@example.com', 'active'),
('news3@example.com', 'active'),
('news4@example.com', 'unsubscribed'),
('news5@example.com', 'active'),
('news6@example.com', 'active'),
('news7@example.com', 'active')
ON CONFLICT (email) DO NOTHING;

-- 4. SEED REVIEWS (Review Moderation)
-- Using existing service IDs found in previous search
INSERT INTO public.reviews (service_id, service_type, customer_id, customer_name, rating, comment, status)
VALUES 
('9f9f1881-7dec-4a46-bb44-abef28e40b5e', 'tour', 'a1111111-1111-1111-1111-111111111111', 'Alice Wonder', 5, 'Amazing view at Chamarel!', 'approved'),
('36a7f0c9-df60-4eb4-9782-65164832ae71', 'activity', 'b2222222-2222-2222-2222-222222222222', 'Bob Builder', 4, 'Very relaxing spa session.', 'approved'),
('df2140b6-3c95-4feb-b2f0-29e89c471520', 'hotel', 'c3333333-3333-3333-3333-333333333333', 'Charlie Check', 3, 'Nice hotel but service was slow.', 'pending'),
('4e356424-d213-43cd-8b04-4e3bec94ce36', 'hotel', 'd4444444-4444-4444-4444-444444444444', 'David Doe', 5, 'Best villas in Mauritius!', 'pending'),
('d283ca97-2a7d-4e3f-8920-11c160e8f049', 'hotel', 'e5555555-5555-5555-5555-555555555555', 'Eve Online', 2, 'Bad experience, room was not clean.', 'rejected'),
('ff8cc932-72d7-42c9-9a01-b7a67bc52dff', 'hotel', 'f6666666-6666-6666-6666-666666666666', 'Frank Furter', 4, 'Great food and pool area.', 'pending'),
('6669b1b7-07ab-41d8-904a-74bb213ee98b', 'hotel', '07777777-7777-7777-7777-777777777777', 'Grace Kelly', 5, 'Excellent value for money.', 'approved');
