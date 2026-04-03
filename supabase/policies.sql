
-- ─────────────────────────────────────────────────────────────────────────────
-- TRAVEL LOUNGE COMPREHENSIVE SECURITY ARCHITECTURE 2026
-- ─────────────────────────────────────────────────────────────────────────────
-- Full-spectrum RLS coverage for all tables in the infrastructure.

-- 1. SECURITY DEFINER HELPER FUNCTIONS
-- ─────────────────────────────────────────────────────────────────────────────

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

CREATE OR REPLACE FUNCTION public.can_manage_content()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admins 
        WHERE user_id = auth.uid()
        AND role IN ('super_admin', 'admin', 'director', 'manager', 'editor', 'tech')
        AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.can_manage_operations()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admins 
        WHERE user_id = auth.uid()
        AND role IN (
            'super_admin', 'admin', 'director', 'manager', 'editor', 'tech',
            'sales', 'sales_corporate_sr', 'sales_corporate', 'sales_leisure',
            'consultant', 'staff', 'accountant', 'receptionist', 'secretary'
        )
        AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Compatibility Aliases
CREATE OR REPLACE FUNCTION public.is_active_staff() RETURNS BOOLEAN AS $$ BEGIN RETURN public.can_manage_operations(); END; $$ LANGUAGE plpgsql;
CREATE OR REPLACE FUNCTION public.is_admin_v2() RETURNS BOOLEAN AS $$ BEGIN RETURN public.can_manage_operations(); END; $$ LANGUAGE plpgsql;

-- 2. RESET & ENABLE RLS
-- ─────────────────────────────────────────────────────────────────────────────

DO $$ 
DECLARE
    t text;
BEGIN
    FOR t IN SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
        -- Clean up all existing policies to ensure no conflicts
        FOR t IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = t
        LOOP
            EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t, t);
        END LOOP;
    END LOOP;
END $$;

-- 3. UNIFIED TABLE POLICIES
-- ─────────────────────────────────────────────────────────────────────────────

-- 3.1 ADMINS
CREATE POLICY "admins_public_view" ON public.admins FOR SELECT USING (is_active = true AND show_on_front_page = true);
CREATE POLICY "admins_staff_read" ON public.admins FOR SELECT USING (public.can_manage_operations());
CREATE POLICY "admins_privileged_manage" ON public.admins FOR ALL USING (public.is_elevated_admin() OR user_id = auth.uid());

-- 3.2 CUSTOMERS & PROFILES
CREATE POLICY "customers_ops_manage" ON public.customers FOR ALL USING (public.can_manage_operations());
CREATE POLICY "customers_self_manage" ON public.customers FOR ALL USING (user_id = auth.uid());
CREATE POLICY "profiles_staff_read" ON public.profiles FOR SELECT USING (public.can_manage_operations());
CREATE POLICY "profiles_self_manage" ON public.profiles FOR ALL USING (id = auth.uid());

-- 3.3 BOOKINGS & ITEMS
CREATE POLICY "bookings_ops_manage" ON public.bookings FOR ALL USING (public.can_manage_operations());
CREATE POLICY "bookings_self_read" ON public.bookings FOR SELECT USING (customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid()));
CREATE POLICY "bookings_public_insert" ON public.bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "booking_items_ops_manage" ON public.booking_items FOR ALL USING (public.can_manage_operations());
CREATE POLICY "booking_items_public_insert" ON public.booking_items FOR INSERT WITH CHECK (true);

-- 3.4 CATALOG (Services, Categories, Rooms)
CREATE POLICY "catalog_public_read" ON public.services FOR SELECT USING (true);
CREATE POLICY "catalog_staff_manage" ON public.services FOR ALL USING (public.can_manage_content());
CREATE POLICY "categories_public_read" ON public.categories FOR SELECT USING (is_active = true);
CREATE POLICY "categories_staff_manage" ON public.categories FOR ALL USING (public.can_manage_content());
CREATE POLICY "junction_public_read" ON public.service_categories FOR SELECT USING (true);
CREATE POLICY "junction_staff_manage" ON public.service_categories FOR ALL USING (public.can_manage_content());
CREATE POLICY "hotel_rooms_public_read" ON public.hotel_rooms FOR SELECT USING (is_active = true);
CREATE POLICY "hotel_rooms_staff_manage" ON public.hotel_rooms FOR ALL USING (public.can_manage_content());

-- 3.5 CMS CONTENT (Slides, Posts, Nav, Blocks)
CREATE POLICY "slides_public_read" ON public.hero_slides FOR SELECT USING (is_active = true);
CREATE POLICY "slides_staff_manage" ON public.hero_slides FOR ALL USING (public.can_manage_content());
CREATE POLICY "posts_public_read" ON public.editorial_posts FOR SELECT USING (status = 'published');
CREATE POLICY "posts_staff_manage" ON public.editorial_posts FOR ALL USING (public.can_manage_content());
CREATE POLICY "blocks_public_read" ON public.content_blocks FOR SELECT USING (true);
CREATE POLICY "blocks_staff_manage" ON public.content_blocks FOR ALL USING (public.can_manage_content());
CREATE POLICY "nav_public_read" ON public.navigations FOR SELECT USING (is_active = true);
CREATE POLICY "nav_staff_manage" ON public.navigations FOR ALL USING (public.can_manage_content());

-- 3.6 SETTINGS & INFRASTRUCTURE
CREATE POLICY "settings_public_read" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "settings_elevated_manage" ON public.site_settings FOR ALL USING (public.is_elevated_admin());
CREATE POLICY "templates_staff_read" ON public.email_templates FOR SELECT USING (public.can_manage_operations());
CREATE POLICY "templates_elevated_manage" ON public.email_templates FOR ALL USING (public.is_elevated_admin());
CREATE POLICY "audit_elevated_read" ON public.auth_audit_logs FOR SELECT USING (public.is_elevated_admin());

-- 3.7 ENGAGEMENT (Reviews, Inquiries, Subscribers)
CREATE POLICY "reviews_public_read" ON public.reviews FOR SELECT USING (status = 'approved');
CREATE POLICY "reviews_auth_insert" ON public.reviews FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "reviews_ops_manage" ON public.reviews FOR ALL USING (public.can_manage_operations());
CREATE POLICY "inquiries_public_insert" ON public.inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "inquiries_ops_manage" ON public.inquiries FOR ALL USING (public.can_manage_operations());
CREATE POLICY "subscribers_public_insert" ON public.subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "subscribers_ops_manage" ON public.subscribers FOR ALL USING (public.can_manage_operations());

-- 3.8 EXTERNAL (Partners, Destinations, Ads)
CREATE POLICY "partners_public_read" ON public.partners FOR SELECT USING (is_active = true);
CREATE POLICY "partners_staff_manage" ON public.partners FOR ALL USING (public.can_manage_content());
CREATE POLICY "destinations_public_read" ON public.popular_destinations FOR SELECT USING (true);
CREATE POLICY "destinations_staff_manage" ON public.popular_destinations FOR ALL USING (public.can_manage_content());
CREATE POLICY "ads_public_read" ON public.popup_ads FOR SELECT USING (is_active = true);
CREATE POLICY "ads_staff_manage" ON public.popup_ads FOR ALL USING (public.can_manage_content());

-- 4. RECONCILIATION
-- ─────────────────────────────────────────────────────────────────────────────
UPDATE public.admins SET user_id = (SELECT id FROM auth.users WHERE LOWER(email) = LOWER(public.admins.email) LIMIT 1) WHERE user_id IS NULL;
UPDATE public.customers SET user_id = (SELECT id FROM auth.users WHERE LOWER(email) = LOWER(public.customers.email) LIMIT 1) WHERE user_id IS NULL;
