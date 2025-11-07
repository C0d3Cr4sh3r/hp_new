-- Screenshots Table für das Screenshot-Management-System
CREATE TABLE IF NOT EXISTS screenshots (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL CHECK (category IN ('app', 'portfolio', 'marketing')) DEFAULT 'app',
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    width INTEGER,
    height INTEGER,
    alt_text VARCHAR(255),
    sort_order INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index für bessere Performance
CREATE INDEX IF NOT EXISTS idx_screenshots_category ON screenshots(category);
CREATE INDEX IF NOT EXISTS idx_screenshots_sort_order ON screenshots(sort_order);
CREATE INDEX IF NOT EXISTS idx_screenshots_featured ON screenshots(is_featured);

-- Update Trigger für timestamps
DROP TRIGGER IF EXISTS update_screenshots_updated_at ON screenshots;
CREATE TRIGGER update_screenshots_updated_at BEFORE UPDATE ON screenshots
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security aktivieren
ALTER TABLE screenshots ENABLE ROW LEVEL SECURITY;

-- RLS Policies für Screenshots
-- Alle können Screenshots sehen
DROP POLICY IF EXISTS "Screenshots are viewable by everyone" ON screenshots;
CREATE POLICY "Screenshots are viewable by everyone" ON screenshots
    FOR SELECT USING (true);

-- Nur Admins können Screenshots verwalten
DROP POLICY IF EXISTS "Admins can manage screenshots" ON screenshots;
CREATE POLICY "Admins can manage screenshots" ON screenshots
    FOR ALL USING (auth.uid() IN (
        SELECT id FROM user_profiles WHERE role = 'admin'
    ));

-- Storage Bucket für Screenshots erstellen
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'screenshots',
    'screenshots',
    true,
    52428800, -- 50MB in bytes
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Storage Policy: Alle können Screenshots lesen
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects
    FOR SELECT USING (bucket_id = 'screenshots');

-- Storage Policy: Nur authentifizierte Nutzer können Screenshots hochladen
DROP POLICY IF EXISTS "Authenticated users can upload screenshots" ON storage.objects;
CREATE POLICY "Authenticated users can upload screenshots" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'screenshots' AND 
        auth.role() = 'authenticated'
    );

-- Storage Policy: Nur Eigentümer oder Admins können Screenshots löschen/updaten
DROP POLICY IF EXISTS "Users can update own screenshots or admins can update any" ON storage.objects;
CREATE POLICY "Users can update own screenshots or admins can update any" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'screenshots' AND (
            auth.uid()::text = (storage.foldername(name))[1] OR
            auth.uid() IN (
                SELECT id FROM user_profiles WHERE role = 'admin'
            )
        )
    );

DROP POLICY IF EXISTS "Users can delete own screenshots or admins can delete any" ON storage.objects;
CREATE POLICY "Users can delete own screenshots or admins can delete any" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'screenshots' AND (
            auth.uid()::text = (storage.foldername(name))[1] OR
            auth.uid() IN (
                SELECT id FROM user_profiles WHERE role = 'admin'
            )
        )
    );

-- Beispiel-Screenshots einfügen
INSERT INTO screenshots (title, description, category, file_name, file_path, alt_text, sort_order, is_featured) VALUES
('ShootingHub Dashboard', 'Übersicht des Hauptdashboards mit Event-Management', 'app', 'dashboard-overview.webp', '/screenshots/app/dashboard-overview.webp', 'ShootingHub Dashboard Übersicht', 1, true),
('Event-Planung Interface', 'Benutzerfreundliche Event-Erstellung und Verwaltung', 'app', 'event-planning.webp', '/screenshots/app/event-planning.webp', 'Event Planungs-Interface', 2, false),
('Portfolio Galerie', 'Responsive Portfolio-Ansicht für Fotografen', 'portfolio', 'portfolio-gallery.webp', '/screenshots/portfolio/portfolio-gallery.webp', 'Portfolio Galerie Ansicht', 3, false),
('Marketing Landing', 'Moderne Landing Page für Fotografen-Services', 'marketing', 'landing-page.webp', '/screenshots/marketing/landing-page.webp', 'Marketing Landing Page', 4, true)
ON CONFLICT DO NOTHING;