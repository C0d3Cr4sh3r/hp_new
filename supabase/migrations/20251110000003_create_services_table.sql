-- Services Tabelle für das Services-Management-System

-- 1. Services Tabelle erstellen
CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    short_description TEXT,
    icon VARCHAR(100),
    features TEXT[],
    category VARCHAR(100),
    price_info VARCHAR(255),
    technologies TEXT[],
    deliverables TEXT[],
    sort_order INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Indizes für bessere Performance
CREATE INDEX IF NOT EXISTS idx_services_sort_order ON services(sort_order);
CREATE INDEX IF NOT EXISTS idx_services_status ON services(status);
CREATE INDEX IF NOT EXISTS idx_services_featured ON services(is_featured);

-- 3. Update-Trigger für timestamps
CREATE OR REPLACE FUNCTION update_services_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_services_updated_at ON services;
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
    FOR EACH ROW EXECUTE FUNCTION update_services_updated_at_column();

-- 4. Row Level Security aktivieren
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies für Services
DROP POLICY IF EXISTS "Public read access for services" ON services;
CREATE POLICY "Public read access for services" ON services
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public insert access for services" ON services;
CREATE POLICY "Public insert access for services" ON services
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public update access for services" ON services;
CREATE POLICY "Public update access for services" ON services
    FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public delete access for services" ON services;
CREATE POLICY "Public delete access for services" ON services
    FOR DELETE USING (true);

