-- 1. Create product_categories bridge table
CREATE TABLE IF NOT EXISTS public.product_categories (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(product_id, category_id)
);

-- 2. Create service_categories bridge table
CREATE TABLE IF NOT EXISTS public.service_categories (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(service_id, category_id)
);

-- 3. Enable RLS
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies
CREATE POLICY "Allow read for all authenticated users" ON public.product_categories
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow all for authenticated users" ON public.product_categories
    FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow read for all authenticated users" ON public.service_categories
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow all for authenticated users" ON public.service_categories
    FOR ALL TO authenticated USING (true);

-- 5. Migration Logic: Sync existing 'category' strings to the new bridge tables
-- Note: This matches the 'category' text column in products/services to the 'name' in categories.

-- For Products
INSERT INTO public.product_categories (product_id, category_id)
SELECT p.id, c.id
FROM public.products p
JOIN public.categories c ON LOWER(p.category) = LOWER(c.name)
ON CONFLICT DO NOTHING;

-- For Services
INSERT INTO public.service_categories (service_id, category_id)
SELECT s.id, c.id
FROM public.services s
JOIN public.categories c ON LOWER(s.category) = LOWER(c.name)
ON CONFLICT DO NOTHING;

-- 6. Optional: Create a view for easy querying (to avoid complex joins in UI if needed)
CREATE OR REPLACE VIEW public.product_with_categories AS
SELECT 
    p.*,
    COALESCE(
        JSONB_AGG(
            JSONB_BUILD_OBJECT('id', c.id, 'name', c.name, 'slug', c.slug)
        ) FILTER (WHERE c.id IS NOT NULL),
        '[]'
    ) as categories_list
FROM public.products p
LEFT JOIN public.product_categories pc ON p.id = pc.product_id
LEFT JOIN public.categories c ON pc.category_id = c.id
GROUP BY p.id;
