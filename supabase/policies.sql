
-- ─────────────────────────────────────────────────────────────────────────────
-- TRAVEL LOUNGE INCLUSIVE SECURITY ARCHITECTURE 2026
-- ─────────────────────────────────────────────────────────────────────────────
-- Broadens staff access to prevent role-based CRUD failures (e.g., Sales role editing Services).

-- 1. UNIFIED HELPER FUNCTIONS
-- ─────────────────────────────────────────────────────────────────────────────

-- ELEVATED: Authority for personnel and meta-settings
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

-- STAFF (Authorized): Generic staff access for ALL operational and content tasks
-- This covers Sales, Consultants, Accountants, etc.
CREATE OR REPLACE FUNCTION public.is_authorized_staff()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admins 
        WHERE user_id = auth.uid()
        AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Compatibility Aliases (Keep for existing policy references)
CREATE OR REPLACE FUNCTION public.can_manage_operations() RETURNS BOOLEAN AS $$ BEGIN RETURN public.is_authorized_staff(); END; $$ LANGUAGE plpgsql;
CREATE OR REPLACE FUNCTION public.can_manage_content() RETURNS BOOLEAN AS $$ BEGIN RETURN public.is_authorized_staff(); END; $$ LANGUAGE plpgsql;
CREATE OR REPLACE FUNCTION public.is_active_staff() RETURNS BOOLEAN AS $$ BEGIN RETURN public.is_authorized_staff(); END; $$ LANGUAGE plpgsql;
CREATE OR REPLACE FUNCTION public.is_admin_v2() RETURNS BOOLEAN AS $$ BEGIN RETURN public.is_authorized_staff(); END; $$ LANGUAGE plpgsql;


-- 2. TABLE POLICIES (ROBUST WITH CHECK)
-- ─────────────────────────────────────────────────────────────────────────────

DO $$ 
DECLARE
    r record;
BEGIN
    FOR r IN SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
    END LOOP;
END $$;

-- 2.1 STAFF & CUSTOMERS
CREATE POLICY "staff_read_all" ON public.admins FOR SELECT USING (public.is_authorized_staff());
CREATE POLICY "staff_privileged_manage" ON public.admins FOR ALL USING (public.is_elevated_admin() OR user_id = auth.uid()) WITH CHECK (public.is_elevated_admin() OR user_id = auth.uid());
CREATE POLICY "staff_manage_customers" ON public.customers FOR ALL USING (public.is_authorized_staff()) WITH CHECK (public.is_authorized_staff());
CREATE POLICY "customers_self_manage" ON public.customers FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- 2.2 CATALOG & JUNCTION (Services, categories, service_categories)
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "catalog_staff_manage" ON public.services FOR ALL USING (public.is_authorized_staff()) WITH CHECK (public.is_authorized_staff());
CREATE POLICY "catalog_public_read" ON public.services FOR SELECT USING (true);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories_staff_manage" ON public.categories FOR ALL USING (public.is_authorized_staff()) WITH CHECK (public.is_authorized_staff());
CREATE POLICY "categories_public_read" ON public.categories FOR SELECT USING (true);

ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "junction_staff_manage" ON public.service_categories FOR ALL USING (public.is_authorized_staff()) WITH CHECK (public.is_authorized_staff());
CREATE POLICY "junction_public_read" ON public.service_categories FOR SELECT USING (true);

-- 2.3 CMS & WEB PROPS (Nav, slides, posts, blocks)
ALTER TABLE public.navigations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cms_staff_manage_nav" ON public.navigations FOR ALL USING (public.is_authorized_staff()) WITH CHECK (public.is_authorized_staff());
CREATE POLICY "cms_public_read_nav" ON public.navigations FOR SELECT USING (is_active = true);

ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cms_staff_manage_slides" ON public.hero_slides FOR ALL USING (public.is_authorized_staff()) WITH CHECK (public.is_authorized_staff());
CREATE POLICY "cms_public_read_slides" ON public.hero_slides FOR SELECT USING (is_active = true);

ALTER TABLE public.content_blocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cms_staff_manage_blocks" ON public.content_blocks FOR ALL USING (public.is_authorized_staff()) WITH CHECK (public.is_authorized_staff());
CREATE POLICY "cms_public_read_blocks" ON public.content_blocks FOR SELECT USING (true);

ALTER TABLE public.editorial_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cms_staff_manage_posts" ON public.editorial_posts FOR ALL USING (public.is_authorized_staff()) WITH CHECK (public.is_authorized_staff());
CREATE POLICY "cms_public_read_posts" ON public.editorial_posts FOR SELECT USING (status = 'published');

-- 2.4 BUSINESS DATA (Bookings, Inquiries, Orders, Reviews)
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ops_staff_manage_bookings" ON public.bookings FOR ALL USING (public.is_authorized_staff()) WITH CHECK (public.is_authorized_staff());
CREATE POLICY "self_view_bookings" ON public.bookings FOR SELECT USING (customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid()));

ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ops_staff_manage_inquiries" ON public.inquiries FOR ALL USING (public.is_authorized_staff()) WITH CHECK (public.is_authorized_staff());
CREATE POLICY "public_post_inquiries" ON public.inquiries FOR INSERT WITH CHECK (true);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ops_staff_manage_reviews" ON public.reviews FOR ALL USING (public.is_authorized_staff()) WITH CHECK (public.is_authorized_staff());
CREATE POLICY "public_view_reviews" ON public.reviews FOR SELECT USING (status = 'approved');
CREATE POLICY "public_post_reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 2.5 INFRASTRUCTURE (Settings, Partners, Destinations)
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff_read_settings" ON public.site_settings FOR SELECT USING (public.is_authorized_staff());
CREATE POLICY "elevated_manage_settings" ON public.site_settings FOR ALL USING (public.is_elevated_admin()) WITH CHECK (public.is_elevated_admin());

ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff_manage_partners" ON public.partners FOR ALL USING (public.is_authorized_staff()) WITH CHECK (public.is_authorized_staff());
CREATE POLICY "public_read_partners" ON public.partners FOR SELECT USING (is_active = true);

ALTER TABLE public.popular_destinations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff_manage_destinations" ON public.popular_destinations FOR ALL USING (public.is_authorized_staff()) WITH CHECK (public.is_authorized_staff());
CREATE POLICY "public_read_destinations" ON public.popular_destinations FOR SELECT USING (true);
