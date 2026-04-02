
-- ─────────────────────────────────────────────────────────────────────────────
-- TRAVEL LOUNGE SECURITY ARCHITECTURE 2026
-- ─────────────────────────────────────────────────────────────────────────────
-- Granular and Robust RLS Policy system for Travel Lounge Ecosystem.
-- Uses Security Definer functions to avoid recursion and optimize performance.

-- 1. HELPER FUNCTIONS (SECURITY DEFINER)
-- ─────────────────────────────────────────────────────────────────────────────

-- ELEVATED: Absolute authority (Manage staff, settings, finance)
CREATE OR REPLACE FUNCTION public.is_elevated_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admins 
        WHERE user_id = auth.uid()
        AND role IN ('super_admin', 'admin', 'director')
        AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- CONTENT: Can manage services, blog posts, CMS content, and operations
CREATE OR REPLACE FUNCTION public.can_manage_content()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admins 
        WHERE user_id = auth.uid()
        AND role IN ('super_admin', 'admin', 'director', 'manager', 'editor')
        AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- OPERATIONS: Can manage customers, bookings, inquiries, and reviews
CREATE OR REPLACE FUNCTION public.can_manage_operations()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admins 
        WHERE user_id = auth.uid()
        AND role IN ('super_admin', 'admin', 'director', 'manager', 'sales', 'sales_corporate_sr', 'sales_corporate', 'consultant', 'staff', 'receptionist', 'accountant')
        AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ACTIVE STAFF: Anyone currently authorized to access the admin portal (for read access)
CREATE OR REPLACE FUNCTION public.is_active_staff()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admins 
        WHERE user_id = auth.uid()
        AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- LEGACY COMPATIBILITY (Maps to new granular functions)
CREATE OR REPLACE FUNCTION public.is_admin_or_staff() RETURNS BOOLEAN AS $$ BEGIN RETURN public.is_active_staff(); END; $$ LANGUAGE plpgsql;
CREATE OR REPLACE FUNCTION public.is_admin() RETURNS BOOLEAN AS $$ BEGIN RETURN public.is_elevated_admin(); END; $$ LANGUAGE plpgsql;


-- 2. TABLE POLICIES
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable RLS for all tables in public schema
DO $$ 
DECLARE
    t text;
BEGIN
    FOR t IN SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    END LOOP;
END $$;

-- 2.1 ADMINS
DROP POLICY IF EXISTS "Elevated can manage staff" ON public.admins;
DROP POLICY IF EXISTS "Staff can view staff" ON public.admins;
DROP POLICY IF EXISTS "Public can view active staff" ON public.admins;
DROP POLICY IF EXISTS "Admins can manage admins" ON public.admins;

CREATE POLICY "Elevated can manage staff" ON public.admins FOR ALL USING (public.is_elevated_admin() OR user_id = auth.uid());
CREATE POLICY "Staff can view staff" ON public.admins FOR SELECT USING (public.is_active_staff());
CREATE POLICY "Public can view active staff" ON public.admins FOR SELECT USING (is_active = true AND show_on_front_page = true);

-- 2.2 CUSTOMERS & PROFILES
DROP POLICY IF EXISTS "Ops can manage customers" ON public.customers;
DROP POLICY IF EXISTS "Users can manage own profile" ON public.customers;
DROP POLICY IF EXISTS "Staff can view profiles" ON public.profiles;

CREATE POLICY "Ops manage customers" ON public.customers FOR ALL USING (public.can_manage_operations());
CREATE POLICY "Users manage own profile" ON public.customers FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Staff view profiles" ON public.profiles FOR SELECT USING (public.is_active_staff());

-- 2.3 BOOKINGS & FINANCIALS
DROP POLICY IF EXISTS "Ops can manage bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can view own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins and Staff can manage all bookings" ON public.bookings;

CREATE POLICY "Ops manage bookings" ON public.bookings FOR ALL USING (public.can_manage_operations());
CREATE POLICY "Users view own bookings" ON public.bookings FOR SELECT USING (customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid()));
CREATE POLICY "Ops manage booking items" ON public.booking_items FOR ALL USING (public.can_manage_operations());

-- 2.4 SERVICES & PRODUCT CATALOG
DROP POLICY IF EXISTS "Public view services" ON public.services;
DROP POLICY IF EXISTS "Content managers manage services" ON public.services;
DROP POLICY IF EXISTS "Admins and Staff can manage services" ON public.services;

CREATE POLICY "Everyone can view services" ON public.services FOR SELECT USING (true);
CREATE POLICY "Content managers manage services" ON public.services FOR ALL USING (public.can_manage_content());
CREATE POLICY "Everyone can view categories" ON public.categories FOR SELECT USING (is_active = true);
CREATE POLICY "Content managers manage categories" ON public.categories FOR ALL USING (public.can_manage_content());
CREATE POLICY "Content managers manage rooms" ON public.hotel_rooms FOR ALL USING (public.can_manage_content());
CREATE POLICY "Content managers manage room types" ON public.room_types FOR ALL USING (public.can_manage_content());

-- 2.5 DYNAMIC CMS (Posts, Blocks, Nav, Slides)
DROP POLICY IF EXISTS "Content managers manage CMS" ON public.content_blocks;
DROP POLICY IF EXISTS "Content managers manage blog" ON public.editorial_posts;

CREATE POLICY "Public view published" ON public.editorial_posts FOR SELECT USING (status = 'published');
CREATE POLICY "Content managers manage blog" ON public.editorial_posts FOR ALL USING (public.can_manage_content());
CREATE POLICY "Content managers manage CMS" ON public.content_blocks FOR ALL USING (public.can_manage_content());
CREATE POLICY "Everyone view nav" ON public.navigations FOR SELECT USING (is_active = true);
CREATE POLICY "Content managers manage nav" ON public.navigations FOR ALL USING (public.can_manage_content());
CREATE POLICY "Content managers manage slides" ON public.hero_slides FOR ALL USING (public.can_manage_content());

-- 2.6 SETTINGS & INFRASTRUCTURE
DROP POLICY IF EXISTS "Elevated manage settings" ON public.site_settings;
DROP POLICY IF EXISTS "Staff view settings" ON public.site_settings;

CREATE POLICY "Elevated manage settings" ON public.site_settings FOR ALL USING (public.is_elevated_admin());
CREATE POLICY "Staff view settings" ON public.site_settings FOR SELECT USING (public.is_active_staff());
CREATE POLICY "Elevated manage templates" ON public.email_templates FOR ALL USING (public.is_elevated_admin());
CREATE POLICY "Staff view templates" ON public.email_templates FOR SELECT USING (public.is_active_staff());

-- 2.7 COMMUNICATIONS (Inquiries, Subscribers, Reviews)
DROP POLICY IF EXISTS "Public post inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Ops manage inquiries" ON public.inquiries;

CREATE POLICY "Everyone can send inquiries" ON public.inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Ops manage inquiries" ON public.inquiries FOR ALL USING (public.can_manage_operations());
CREATE POLICY "Everyone can subscribe" ON public.subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "Ops manage subscribers" ON public.subscribers FOR ALL USING (public.can_manage_operations());
CREATE POLICY "Everyone can view reviews" ON public.reviews FOR SELECT USING (status = 'approved');
CREATE POLICY "Everyone can post reviews" ON public.reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Ops manage reviews" ON public.reviews FOR ALL USING (public.can_manage_operations());

-- 2.8 EXTERNAL DATA (Partners, Destinations)
CREATE POLICY "Everyone view partners" ON public.partners FOR SELECT USING (is_active = true);
CREATE POLICY "Content managers manage partners" ON public.partners FOR ALL USING (public.can_manage_content());
CREATE POLICY "Everyone view destinations" ON public.popular_destinations FOR SELECT USING (true);
CREATE POLICY "Content managers manage destinations" ON public.popular_destinations FOR ALL USING (public.can_manage_content());
