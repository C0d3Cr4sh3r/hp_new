-- Portfolio Tabelle für das Portfolio-Management-System

-- 1. Portfolio Tabelle erstellen
CREATE TABLE IF NOT EXISTS portfolios (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL CHECK (category IN ('photography', 'websites', 'apps', 'marketing')) DEFAULT 'photography',
    image_url TEXT NOT NULL,
    image_alt VARCHAR(255),
    image_width INTEGER,
    image_height INTEGER,
    image_storage_path TEXT,
    client_name VARCHAR(255),
    project_date DATE,
    project_url TEXT,
    technologies TEXT[],
    sort_order INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Indizes für bessere Performance
CREATE INDEX IF NOT EXISTS idx_portfolios_category ON portfolios(category);
CREATE INDEX IF NOT EXISTS idx_portfolios_sort_order ON portfolios(sort_order);
CREATE INDEX IF NOT EXISTS idx_portfolios_status ON portfolios(status);
CREATE INDEX IF NOT EXISTS idx_portfolios_featured ON portfolios(is_featured);

-- 3. Update-Trigger für timestamps
DROP TRIGGER IF EXISTS update_portfolios_updated_at ON portfolios;
CREATE TRIGGER update_portfolios_updated_at BEFORE UPDATE ON portfolios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. Row Level Security aktivieren
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies für Portfolios
DROP POLICY IF EXISTS "Public read access for portfolios" ON portfolios;
CREATE POLICY "Public read access for portfolios" ON portfolios
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public insert access for portfolios" ON portfolios;
CREATE POLICY "Public insert access for portfolios" ON portfolios
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public update access for portfolios" ON portfolios;
CREATE POLICY "Public update access for portfolios" ON portfolios
    FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public delete access for portfolios" ON portfolios;
CREATE POLICY "Public delete access for portfolios" ON portfolios
    FOR DELETE USING (true);

-- 6. Storage Bucket für Portfolio-Bilder
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'portfolios',
    'portfolios',
    true,
    52428800,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

