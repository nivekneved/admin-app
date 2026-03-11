-- ==============================================================================
-- 1. ENABLE ROW LEVEL SECURITY
-- ==============================================================================

ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotel_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.editorial_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 2. HELPER FUNCTIONS FOR ROLE CHECKING
-- ==============================================================================

-- Function to check if the current user is an admin or staff
CREATE OR REPLACE FUNCTION public.is_admin_or_staff()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admins 
        WHERE email = (SELECT auth.jwt() ->> 'email')
        AND role IN ('admin', 'manager', 'staff', 'sales', 'editor', 'receptionist', 'secretary')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if the current user is specifically an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admins 
        WHERE email = (SELECT auth.jwt() ->> 'email')
        AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if the current user is specifically a secretary
CREATE OR REPLACE FUNCTION public.is_secretary()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admins 
        WHERE email = (SELECT auth.jwt() ->> 'email')
        AND role = 'secretary'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- 3. POLICIES
-- ==============================================================================

-- --- Admins Table ---
CREATE POLICY "Admins can manage admins" ON public.admins 
    FOR ALL USING (public.is_admin());
CREATE POLICY "Staff can view their own record" ON public.admins 
    FOR SELECT USING (email = (SELECT auth.jwt() ->> 'email'));

-- --- Customers Table ---
CREATE POLICY "Admins and Staff can manage customers" ON public.customers 
    FOR ALL USING (public.is_admin_or_staff());
CREATE POLICY "Users can manage their own profile" ON public.customers 
    FOR ALL USING (user_id = auth.uid());

-- --- Categories Table ---
CREATE POLICY "Public can view categories" ON public.categories 
    FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage categories" ON public.categories 
    FOR ALL USING (public.is_admin());

-- --- Services Table ---
CREATE POLICY "Public can view services" ON public.services 
    FOR SELECT USING (true);
CREATE POLICY "Admins and Staff can manage services" ON public.services 
    FOR ALL USING (public.is_admin_or_staff());

-- --- Service Categories (Bridge) ---
CREATE POLICY "Public can view service_categories" ON public.service_categories 
    FOR SELECT USING (true);
CREATE POLICY "Admins can manage service_categories" ON public.service_categories 
    FOR ALL USING (public.is_admin());

-- --- Hotel Rooms ---
CREATE POLICY "Public can view hotel_rooms" ON public.hotel_rooms 
    FOR SELECT USING (is_active = true);
CREATE POLICY "Admins and Staff can manage hotel_rooms" ON public.hotel_rooms 
    FOR ALL USING (public.is_admin_or_staff());

-- --- Bookings Table ---
CREATE POLICY "Admins and Staff can manage all bookings" ON public.bookings 
    FOR ALL USING (public.is_admin_or_staff());
CREATE POLICY "Secretaries can manage bookings" ON public.bookings 
    FOR ALL USING (public.is_secretary());
CREATE POLICY "Users can view their own bookings" ON public.bookings 
    FOR SELECT USING (customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid()));

-- --- Orders Table ---
CREATE POLICY "Admins and Staff can manage all orders" ON public.orders 
    FOR ALL USING (public.is_admin_or_staff());
CREATE POLICY "Users can view their own orders" ON public.orders 
    FOR SELECT USING (customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid()));

-- --- Invoices Table ---
CREATE POLICY "Admins and Staff can manage all invoices" ON public.invoices 
    FOR ALL USING (public.is_admin_or_staff());
CREATE POLICY "Users can view their own invoices" ON public.invoices 
    FOR SELECT USING (customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid()));

-- --- CMS: Hero Slides ---
CREATE POLICY "Public can view active hero slides" ON public.hero_slides 
    FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage hero slides" ON public.hero_slides 
    FOR ALL USING (public.is_admin());

-- --- CMS: Editorial Posts (Blog) ---
CREATE POLICY "Public can view published posts" ON public.editorial_posts 
    FOR SELECT USING (status = 'published');
CREATE POLICY "Admins and Editors can manage posts" ON public.editorial_posts 
    FOR ALL USING (public.is_admin_or_staff());

-- --- Reviews ---
CREATE POLICY "Public can view approved reviews" ON public.reviews 
    FOR SELECT USING (status = 'approved');
CREATE POLICY "Users can insert reviews" ON public.reviews 
    FOR INSERT WITH CHECK (customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid()));
CREATE POLICY "Admins and Staff can manage reviews" ON public.reviews 
    FOR ALL USING (public.is_admin_or_staff());

-- --- FAQ ---
CREATE POLICY "Public can view published FAQs" ON public.faqs 
    FOR SELECT USING (is_published = true);
CREATE POLICY "Admins call manage FAQs" ON public.faqs 
    FOR ALL USING (public.is_admin());

-- --- CMS: Content Blocks ---
CREATE POLICY "Public can view content blocks" ON public.content_blocks 
    FOR SELECT USING (true);
CREATE POLICY "Admins can manage content blocks" ON public.content_blocks 
    FOR ALL USING (public.is_admin());

-- --- Contact Inquiries ---
CREATE POLICY "Anyone can insert inquiries" ON public.inquiries 
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins and Secretaries can manage inquiries" ON public.inquiries 
    FOR ALL USING (public.is_admin_or_staff());

-- --- Newsletter Subscribers ---
CREATE POLICY "Anyone can subscribe" ON public.subscribers 
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can manage subscribers" ON public.subscribers 
    FOR ALL USING (public.is_admin());

-- --- Email Templates ---
CREATE POLICY "Admins can manage email templates" ON public.email_templates 
    FOR ALL USING (public.is_admin());

-- --- Popup Advertisements ---
ALTER TABLE public.popup_ads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view popup ads" ON public.popup_ads FOR SELECT USING (true);
CREATE POLICY "Anyone can manage popup ads" ON public.popup_ads FOR ALL USING (true);
