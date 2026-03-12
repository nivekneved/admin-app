-- Run this SQL in your Supabase SQL Editor to create the navigations table

CREATE TABLE IF NOT EXISTS navigations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    label TEXT NOT NULL,
    link TEXT NOT NULL,
    icon TEXT, -- Lucide icon name
    parent_id UUID REFERENCES navigations(id) ON DELETE CASCADE,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS
ALTER TABLE navigations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on navigations"
ON navigations FOR SELECT
USING (true);

CREATE POLICY "Allow admin write access on navigations"
ON navigations FOR ALL
USING (EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()));

-- Insert some default navigation items
INSERT INTO navigations (label, link, display_order) VALUES
('Cruises', '/cruises', 1),
('Flights', '/flights', 2),
('Hotels', '/hotels', 3),
('Activities', '/activities', 4),
('About', '/about', 5),
('Contact', '/contact', 6)
ON CONFLICT DO NOTHING;
