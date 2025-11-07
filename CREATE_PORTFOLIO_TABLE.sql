-- Portfolio Tabelle für das Portfolio-Management-System
-- Führe dieses SQL in der Supabase Console aus

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
    technologies TEXT[], -- Array für verwendete Technologien
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
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_portfolios_updated_at ON portfolios;
CREATE TRIGGER update_portfolios_updated_at BEFORE UPDATE ON portfolios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. Row Level Security aktivieren
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies für Portfolios
-- Alle können Portfolios sehen
DROP POLICY IF EXISTS "Public read access for portfolios" ON portfolios;
CREATE POLICY "Public read access for portfolios" ON portfolios
    FOR SELECT USING (true);

-- Alle können Portfolios erstellen (für Admin-Panel)
DROP POLICY IF EXISTS "Public insert access for portfolios" ON portfolios;
CREATE POLICY "Public insert access for portfolios" ON portfolios
    FOR INSERT WITH CHECK (true);

-- Alle können Portfolios bearbeiten (für Admin-Panel) 
DROP POLICY IF EXISTS "Public update access for portfolios" ON portfolios;
CREATE POLICY "Public update access for portfolios" ON portfolios
    FOR UPDATE USING (true);

-- Alle können Portfolios löschen (für Admin-Panel)
DROP POLICY IF EXISTS "Public delete access for portfolios" ON portfolios;
CREATE POLICY "Public delete access for portfolios" ON portfolios
    FOR DELETE USING (true);

-- 6. Storage Bucket für Portfolio-Bilder (falls noch nicht existiert)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'portfolios',
    'portfolios',
    true,
    52428800, -- 50MB in bytes
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- 7. Storage Policies für Portfolios
-- Alle können Portfolio-Bilder lesen
DROP POLICY IF EXISTS "Public Access Portfolios" ON storage.objects;
CREATE POLICY "Public Access Portfolios" ON storage.objects
    FOR SELECT USING (bucket_id = 'portfolios');

-- Authentifizierte Nutzer können Portfolio-Bilder hochladen
DROP POLICY IF EXISTS "Authenticated users can upload portfolios" ON storage.objects;
CREATE POLICY "Authenticated users can upload portfolios" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'portfolios' AND 
        auth.role() = 'authenticated'
    );

-- Authentifizierte Nutzer können Portfolio-Bilder löschen/updaten
DROP POLICY IF EXISTS "Authenticated users can update portfolios" ON storage.objects;
CREATE POLICY "Authenticated users can update portfolios" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'portfolios' AND 
        auth.role() = 'authenticated'
    );

DROP POLICY IF EXISTS "Authenticated users can delete portfolios" ON storage.objects;
CREATE POLICY "Authenticated users can delete portfolios" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'portfolios' AND 
        auth.role() = 'authenticated'
    );

-- 8. Beispiel-Portfolio-Einträge einfügen
INSERT INTO portfolios (title, description, category, image_url, image_alt, client_name, project_date, project_url, technologies, sort_order, is_featured, status) VALUES
('Hochzeitsfotografie München', 'Romantische Hochzeitsreportage in München mit natürlichen Momenten', 'photography', '/api/placeholder/800/600?text=Hochzeit+München', 'Hochzeitsfotografie München', 'Familie Müller', '2024-09-15', 'https://example.com/hochzeit-muenchen', ARRAY['Canon EOS R5', 'Lightroom', 'Photoshop'], 1, true, 'active'),
('Fotografen-Portfolio Website', 'Moderne Portfolio-Website für professionelle Fotografin', 'websites', '/api/placeholder/800/600?text=Portfolio+Website', 'Fotografen Portfolio Website', 'Sarah Photography', '2024-08-20', 'https://sarah-photography.com', ARRAY['Next.js', 'TypeScript', 'Tailwind CSS', 'Supabase'], 2, true, 'active'),
('Porträtshooting Business', 'Professionelle Business-Porträts für Unternehmenswebsite', 'photography', '/api/placeholder/800/600?text=Business+Portraits', 'Business Porträtshooting', 'TechStart GmbH', '2024-07-10', null, ARRAY['Sony A7R IV', 'Studio-Blitze', 'Capture One'], 3, false, 'active'),
('Shooting-Management App', 'Mobile App zur Verwaltung von Fotoshootings und Terminen', 'apps', '/api/placeholder/800/600?text=ShootingHub+App', 'ShootingHub Mobile App', 'ShootingHub', '2024-10-01', 'https://shootinghub.com', ARRAY['React Native', 'Node.js', 'PostgreSQL', 'Firebase'], 4, true, 'active'),
('Restaurant Marketing Kampagne', 'Komplette Marketing-Kampagne mit Food-Fotografie', 'marketing', '/api/placeholder/800/600?text=Restaurant+Marketing', 'Restaurant Marketing Fotos', 'Bella Italia Restaurant', '2024-06-25', 'https://bella-italia.com', ARRAY['Canon EOS 5D', 'Foodstyling', 'Instagram Marketing'], 5, false, 'active'),
('Architekturfotografie', 'Moderne Architektur-Dokumentation für Immobilienunternehmen', 'photography', '/api/placeholder/800/600?text=Architektur+Fotos', 'Architekturfotografie modern', 'Immobilien Stark', '2024-05-30', null, ARRAY['Canon TS-E 24mm', 'Drone DJI Mavic', 'Lightroom'], 6, false, 'active'),
('E-Commerce Website', 'Online-Shop für Fotografiebedarf mit integriertem Booking-System', 'websites', '/api/placeholder/800/600?text=E-Commerce+Shop', 'E-Commerce Website für Fotografen', 'PhotoGear Store', '2024-09-01', 'https://photogear-store.com', ARRAY['Shopify', 'Liquid', 'JavaScript', 'Stripe API'], 7, false, 'active'),
('Event-Fotografie', 'Lebendige Event-Dokumentation einer Firmenfeier', 'photography', '/api/placeholder/800/600?text=Event+Fotografie', 'Event Fotografie Firmenfeier', 'Tech Solutions AG', '2024-08-05', null, ARRAY['Canon EOS R6', 'Sigma 24-70mm', 'Available Light'], 8, false, 'active')
ON CONFLICT DO NOTHING;

-- 9. Prüfe Ergebnis
SELECT id, title, category, client_name, is_featured, status FROM portfolios ORDER BY sort_order;