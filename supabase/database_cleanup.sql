-- Rename unused or redundant tables to tmp_ prefix
DO $$
BEGIN
    -- Services & Legacy Categories
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'services' AND table_schema = 'public') THEN
        ALTER TABLE public.services RENAME TO tmp_services;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'service_categories' AND table_schema = 'public') THEN
        ALTER TABLE public.service_categories RENAME TO tmp_service_categories;
    END IF;

    -- CMS & Content (Not used in current admin-app)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pages' AND table_schema = 'public') THEN
        ALTER TABLE public.pages RENAME TO tmp_pages;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'menus' AND table_schema = 'public') THEN
        ALTER TABLE public.menus RENAME TO tmp_menus;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'site_settings' AND table_schema = 'public') THEN
        ALTER TABLE public.site_settings RENAME TO tmp_site_settings;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'page_content' AND table_schema = 'public') THEN
        ALTER TABLE public.page_content RENAME TO tmp_page_content;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'seo_metadata' AND table_schema = 'public') THEN
        ALTER TABLE public.seo_metadata RENAME TO tmp_seo_metadata;
    END IF;

    -- Marketing & Feedback
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'promotions' AND table_schema = 'public') THEN
        ALTER TABLE public.promotions RENAME TO tmp_promotions;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'newsletter_subscribers' AND table_schema = 'public') THEN
        ALTER TABLE public.newsletter_subscribers RENAME TO tmp_newsletter_subscribers;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'testimonials' AND table_schema = 'public') THEN
        ALTER TABLE public.testimonials RENAME TO tmp_testimonials;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reviews' AND table_schema = 'public') THEN
        ALTER TABLE public.reviews RENAME TO tmp_reviews;
    END IF;

    -- Logistics & Misc
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'flights' AND table_schema = 'public') THEN
        ALTER TABLE public.flights RENAME TO tmp_flights;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'media' AND table_schema = 'public') THEN
        ALTER TABLE public.media RENAME TO tmp_media;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_logs' AND table_schema = 'public') THEN
        ALTER TABLE public.audit_logs RENAME TO tmp_audit_logs;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'room_daily_prices' AND table_schema = 'public') THEN
        ALTER TABLE public.room_daily_prices RENAME TO tmp_room_daily_prices;
    END IF;
END $$;
