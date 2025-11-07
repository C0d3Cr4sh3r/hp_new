-- Screenshots Tabelle für das Screenshot-Management-System
-- Diese SQL-Befehle in der Supabase SQL-Editor ausführen

-- 1. Screenshots Tabelle erstellen
CREATE TABLE IF NOT EXISTS screenshots (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL CHECK (category IN ('app', 'portfolio', 'marketing', 'websites')) DEFAULT 'app',
    image_url TEXT NOT NULL,
    image_alt VARCHAR(255),
    image_width INTEGER,
    image_height INTEGER,
    image_storage_path TEXT,
    sort_order INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Indizes für bessere Performance
CREATE INDEX IF NOT EXISTS idx_screenshots_category ON screenshots(category);
CREATE INDEX IF NOT EXISTS idx_screenshots_sort_order ON screenshots(sort_order);
CREATE INDEX IF NOT EXISTS idx_screenshots_status ON screenshots(status);

-- 3. Update-Trigger für timestamps (falls update_updated_at_column() existiert)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_screenshots_updated_at ON screenshots;
CREATE TRIGGER update_screenshots_updated_at BEFORE UPDATE ON screenshots
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. Row Level Security aktivieren
ALTER TABLE screenshots ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies für Screenshots
-- Alle können Screenshots sehen
DROP POLICY IF EXISTS "Screenshots are viewable by everyone" ON screenshots;
CREATE POLICY "Screenshots are viewable by everyone" ON screenshots
    FOR SELECT USING (true);

-- Authentifizierte Nutzer können Screenshots erstellen/bearbeiten
DROP POLICY IF EXISTS "Authenticated users can manage screenshots" ON screenshots;
CREATE POLICY "Authenticated users can manage screenshots" ON screenshots
    FOR ALL USING (auth.uid() IS NOT NULL);

-- 6. Storage Bucket für Screenshots erstellen
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'screenshots',
    'screenshots',
    true,
    52428800, -- 50MB in bytes
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- 7. Storage Policies
-- Alle können Screenshots lesen
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects
    FOR SELECT USING (bucket_id = 'screenshots');

-- Authentifizierte Nutzer können Screenshots hochladen
DROP POLICY IF EXISTS "Authenticated users can upload screenshots" ON storage.objects;
CREATE POLICY "Authenticated users can upload screenshots" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'screenshots' AND 
        auth.role() = 'authenticated'
    );

-- Authentifizierte Nutzer können Screenshots löschen/updaten
DROP POLICY IF EXISTS "Authenticated users can update screenshots" ON storage.objects;
CREATE POLICY "Authenticated users can update screenshots" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'screenshots' AND 
        auth.role() = 'authenticated'
    );

DROP POLICY IF EXISTS "Authenticated users can delete screenshots" ON storage.objects;
CREATE POLICY "Authenticated users can delete screenshots" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'screenshots' AND 
        auth.role() = 'authenticated'
    );

-- 8. Beispiel-Screenshots einfügen
INSERT INTO screenshots (title, description, category, image_url, image_alt, sort_order, status) VALUES
('ShootingHub Dashboard', 'Übersicht des Hauptdashboards mit Event-Management', 'app', '/api/placeholder/800/600?text=Dashboard', 'ShootingHub Dashboard Übersicht', 1, 'active'),
('Event-Planung Interface', 'Benutzerfreundliche Event-Erstellung und Verwaltung', 'app', '/api/placeholder/800/600?text=Event+Planning', 'Event Planungs-Interface', 2, 'active'),
('Mobile App View', 'Responsive Design auf mobilen Geräten', 'app', '/api/placeholder/800/600?text=Mobile+View', 'Mobile Ansicht der App', 3, 'active'),
('Portfolio Galerie', 'Responsive Portfolio-Ansicht für Fotografen', 'portfolio', '/api/placeholder/800/600?text=Portfolio', 'Portfolio Galerie Ansicht', 1, 'active'),
('Shooting Calendar', 'Kalender-Integration für Event-Übersicht', 'portfolio', '/api/placeholder/800/600?text=Calendar', 'Shooting Kalender', 2, 'active'),
('Fotografen Website', 'Maßgeschneiderte Website für Fotografen', 'websites', '/api/placeholder/800/600?text=Website', 'Fotografen Website Beispiel', 1, 'active'),
('Marketing Landing', 'Moderne Landing Page für Fotografen-Services', 'marketing', '/api/placeholder/800/600?text=Marketing', 'Marketing Landing Page', 1, 'active')
ON CONFLICT DO NOTHING;