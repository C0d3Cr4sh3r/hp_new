-- Nur Screenshots-Tabelle Migration (ohne Konflikte mit bestehenden Tabellen)
CREATE TABLE IF NOT EXISTS screenshots (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL CHECK (category IN ('app', 'portfolio', 'marketing')) DEFAULT 'app',
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

-- Index für bessere Performance
CREATE INDEX IF NOT EXISTS idx_screenshots_category ON screenshots(category);
CREATE INDEX IF NOT EXISTS idx_screenshots_sort_order ON screenshots(sort_order);
CREATE INDEX IF NOT EXISTS idx_screenshots_status ON screenshots(status);

-- Update Trigger für timestamps (wenn update_updated_at_column() bereits existiert)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
        DROP TRIGGER IF EXISTS update_screenshots_updated_at ON screenshots;
        CREATE TRIGGER update_screenshots_updated_at BEFORE UPDATE ON screenshots
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Row Level Security aktivieren
ALTER TABLE screenshots ENABLE ROW LEVEL SECURITY;

-- RLS Policies für Screenshots
-- Alle können Screenshots sehen
DROP POLICY IF EXISTS "Screenshots are viewable by everyone" ON screenshots;
CREATE POLICY "Screenshots are viewable by everyone" ON screenshots
    FOR SELECT USING (true);

-- Authentifizierte Nutzer können Screenshots erstellen/bearbeiten
DROP POLICY IF EXISTS "Authenticated users can manage screenshots" ON screenshots;
CREATE POLICY "Authenticated users can manage screenshots" ON screenshots
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Beispiel-Screenshots einfügen
INSERT INTO screenshots (title, description, category, image_url, image_alt, sort_order, status) VALUES
('ShootingHub Dashboard', 'Übersicht des Hauptdashboards mit Event-Management', 'app', '/screenshots/app/dashboard-overview.webp', 'ShootingHub Dashboard Übersicht', 1, 'active'),
('Event-Planung Interface', 'Benutzerfreundliche Event-Erstellung und Verwaltung', 'app', '/screenshots/app/event-planning.webp', 'Event Planungs-Interface', 2, 'active'),
('Portfolio Galerie', 'Responsive Portfolio-Ansicht für Fotografen', 'portfolio', '/screenshots/portfolio/portfolio-gallery.webp', 'Portfolio Galerie Ansicht', 3, 'active'),
('Marketing Landing', 'Moderne Landing Page für Fotografen-Services', 'marketing', '/screenshots/marketing/landing-page.webp', 'Marketing Landing Page', 4, 'active')
ON CONFLICT DO NOTHING;