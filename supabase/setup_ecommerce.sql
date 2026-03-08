-- 1. Create Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    stock INTEGER DEFAULT 0,
    status TEXT DEFAULT 'In Stock', -- 'In Stock', 'Low Stock', 'Out of Stock'
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    customer_name TEXT, -- Denormalized for quick display if customer is deleted
    amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    status TEXT DEFAULT 'Pending', -- 'Pending', 'Processing', 'Shipped', 'Completed', 'Cancelled'
    payment_method TEXT, -- 'Credit Card', 'PayPal', 'Bank Transfer', 'Cash'
    items JSONB DEFAULT '[]'::jsonb,
    total_items INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Invoices Table
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    customer_name TEXT, -- Denormalized
    amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    status TEXT DEFAULT 'Pending', -- 'Pending', 'Paid', 'Overdue', 'Cancelled'
    service TEXT NOT NULL,
    reference TEXT UNIQUE,
    due_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- 5. Create Policies
CREATE POLICY "Enable all for admins on products" ON public.products FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for admins on orders" ON public.orders FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for admins on invoices" ON public.invoices FOR ALL USING (auth.role() = 'authenticated');

-- 6. Add updated_at triggers
CREATE TRIGGER update_products_modtime BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_orders_modtime BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_invoices_modtime BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 7. Seed Data
-- Products
INSERT INTO public.products (name, category, price, stock, status, description)
VALUES 
('Premium Executive Lounge Access', 'Lounge Access', 49.99, 150, 'In Stock', 'Full day access to our premium executive lounges with complimentary refreshments.'),
('Business Meeting Room', 'Meeting Space', 149.99, 8, 'Low Stock', 'Private meeting room with high-speed WiFi, projector, and catering options.'),
('Deluxe Spa Treatment', 'Wellness', 89.99, 25, 'In Stock', 'Relaxing spa treatment including massage and aromatherapy.');

-- Seed Orders (using subqueries for customer_id)
INSERT INTO public.orders (customer_id, customer_name, amount, status, payment_method, items, total_items)
SELECT id, (first_name || ' ' || last_name), 149.99, 'Completed', 'Credit Card', '[{"name": "Business Meeting Room", "quantity": 1}]'::jsonb, 1 
FROM public.customers WHERE email = 'emma.j@travellounge.mu' LIMIT 1;

-- Seed Invoices
INSERT INTO public.invoices (customer_id, customer_name, amount, status, service, reference, due_date)
SELECT id, 'Corporate Client A', 2499.92, 'Paid', 'Annual Lounge Access', 'INV-2023-001', NOW() + INTERVAL '14 days'
FROM public.customers WHERE email = 'emma.j@travellounge.mu' LIMIT 1; -- Just using a placeholder customer
