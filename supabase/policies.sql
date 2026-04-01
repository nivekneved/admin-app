
DO $$ 
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    END LOOP;
END $$;

CREATE OR REPLACE FUNCTION public.is_admin_or_staff()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admins 
        WHERE user_id = auth.uid()
        AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admins 
        WHERE user_id = auth.uid()
        AND (role = 'admin' OR role = 'super_admin')
        AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.get_auth_admin_status(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'is_admin_or_staff', EXISTS (SELECT 1 FROM public.admins WHERE user_id = p_user_id AND is_active = true),
        'role', (SELECT role FROM public.admins WHERE user_id = p_user_id AND is_active = true LIMIT 1)
    ) INTO v_result;
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP POLICY IF EXISTS "Admins can manage admins" ON public.admins;
DROP POLICY IF EXISTS "Anyone authenticated can view the staff roster" ON public.admins;
DROP POLICY IF EXISTS "Public can view active team members" ON public.admins;

CREATE POLICY "Admins can manage admins" ON public.admins 
    FOR ALL USING (
        user_id = auth.uid() 
        OR (SELECT role FROM public.admins WHERE user_id = auth.uid()) IN ('admin', 'super_admin')
    );
CREATE POLICY "Anyone authenticated can view the staff roster" ON public.admins 
    FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Public can view active team members" ON public.admins
    FOR SELECT USING (is_active = true AND show_on_front_page = true);

CREATE POLICY "Admins and Staff can manage customers" ON public.customers 
    FOR ALL USING (public.is_admin_or_staff());
CREATE POLICY "Users can manage their own profile" ON public.customers 
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Public can view categories" ON public.categories 
    FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage categories" ON public.categories 
    FOR ALL USING (public.is_admin_or_staff());

CREATE POLICY "Public can view services" ON public.services 
    FOR SELECT USING (true);
CREATE POLICY "Admins and Staff can manage services" ON public.services 
    FOR ALL USING (public.is_admin_or_staff());

CREATE POLICY "Public can view service_categories" ON public.service_categories 
    FOR SELECT USING (true);
CREATE POLICY "Admins can manage service_categories" ON public.service_categories 
    FOR ALL USING (public.is_admin_or_staff());

CREATE POLICY "Public can view hotel rooms" ON public.hotel_rooms FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage hotel rooms" ON public.hotel_rooms FOR ALL USING (public.is_admin_or_staff());
CREATE POLICY "Public can view room types" ON public.room_types FOR SELECT USING (true);
CREATE POLICY "Admins can manage room types" ON public.room_types FOR ALL USING (public.is_admin_or_staff());

CREATE POLICY "Admins and Staff can manage all bookings" ON public.bookings 
    FOR ALL USING (public.is_admin_or_staff());
CREATE POLICY "Users can view their own bookings" ON public.bookings 
    FOR SELECT USING (customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid()));

CREATE POLICY "Admins and Staff can manage all booking items" ON public.booking_items 
    FOR ALL USING (public.is_admin_or_staff());
CREATE POLICY "Users can view their own booking items" ON public.booking_items 
    FOR SELECT USING (booking_id IN (SELECT id FROM public.bookings WHERE customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid())));

CREATE POLICY "Public can view active hero slides" ON public.hero_slides FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage hero slides" ON public.hero_slides FOR ALL USING (public.is_admin_or_staff());
CREATE POLICY "Public can view published posts" ON public.editorial_posts FOR SELECT USING (status = 'published');
CREATE POLICY "Admins and Editors can manage posts" ON public.editorial_posts FOR ALL USING (public.is_admin_or_staff());

CREATE POLICY "Public can view content blocks" ON public.content_blocks FOR SELECT USING (true);
CREATE POLICY "Admins can manage content blocks" ON public.content_blocks FOR ALL USING (public.is_admin_or_staff());
CREATE POLICY "Public can view navigations" ON public.navigations FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage navigations" ON public.navigations FOR ALL USING (public.is_admin_or_staff());
CREATE POLICY "Public can view active popup ads" ON public.popup_ads FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage popup ads" ON public.popup_ads FOR ALL USING (public.is_admin_or_staff());

CREATE POLICY "Anyone can insert inquiries" ON public.inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can manage inquiries" ON public.inquiries FOR ALL USING (public.is_admin_or_staff());
CREATE POLICY "Anyone can subscribe" ON public.subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can manage subscribers" ON public.subscribers FOR ALL USING (public.is_admin_or_staff());
CREATE POLICY "Public can view approved reviews" ON public.reviews FOR SELECT USING (status = 'approved');
CREATE POLICY "Users can insert reviews" ON public.reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can manage reviews" ON public.reviews FOR ALL USING (public.is_admin_or_staff());

CREATE POLICY "Public can view site settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage site settings" ON public.site_settings FOR ALL USING (public.is_admin_or_staff());
CREATE POLICY "Public can view FAQs" ON public.faqs FOR SELECT USING (is_published = true);
CREATE POLICY "Admins can manage FAQs" ON public.faqs FOR ALL USING (public.is_admin_or_staff());
CREATE POLICY "Admins can manage email templates" ON public.email_templates FOR ALL USING (public.is_admin_or_staff());
CREATE POLICY "Public can view popular destinations" ON public.popular_destinations FOR SELECT USING (true);
CREATE POLICY "Admins can manage popular destinations" ON public.popular_destinations FOR ALL USING (public.is_admin_or_staff());
CREATE POLICY "Public can view partners" ON public.partners FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage partners" ON public.partners FOR ALL USING (public.is_admin_or_staff());
