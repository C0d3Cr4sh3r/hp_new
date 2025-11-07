-- Services Tabelle für das Services-Management-System
-- Dieses Script erstellt/repariert die Services-Tabelle in Supabase

-- 1. Prüfung und Löschung falls die Tabelle fehlerhaft existiert
DO $$
BEGIN
    -- Prüfe ob services Tabelle existiert
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'services') THEN
        -- Prüfe ob alle notwendigen Spalten existieren
        IF NOT EXISTS (
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'services' 
            AND column_name = 'short_description'
        ) THEN
            -- Tabelle ist unvollständig, lösche sie
            DROP TABLE IF EXISTS services CASCADE;
            RAISE NOTICE 'Alte services Tabelle gelöscht (fehlende Spalten)';
        END IF;
    END IF;
END $$;

-- 2. Services Tabelle erstellen (nur wenn sie nicht existiert)
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

-- 3. Indizes für bessere Performance
CREATE INDEX IF NOT EXISTS idx_services_sort_order ON services(sort_order);
CREATE INDEX IF NOT EXISTS idx_services_status ON services(status);
CREATE INDEX IF NOT EXISTS idx_services_featured ON services(is_featured);

-- 4. Update-Trigger für timestamps
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

-- 5. Row Level Security aktivieren
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies für Services (lösche alte zuerst)
DROP POLICY IF EXISTS "Public read access for services" ON services;
DROP POLICY IF EXISTS "Public insert access for services" ON services;
DROP POLICY IF EXISTS "Public update access for services" ON services;
DROP POLICY IF EXISTS "Public delete access for services" ON services;

-- Neue Policies erstellen
CREATE POLICY "Public read access for services" ON services
    FOR SELECT USING (true);

CREATE POLICY "Public insert access for services" ON services
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Public update access for services" ON services
    FOR UPDATE USING (true);

CREATE POLICY "Public delete access for services" ON services
    FOR DELETE USING (true);

-- 7. Lösche eventuell vorhandene Einträge und füge neue ein
TRUNCATE TABLE services RESTART IDENTITY CASCADE;

-- 8. Beispiel-Service-Einträge einfügen
INSERT INTO services (title, description, short_description, icon, features, category, price_info, technologies, deliverables, sort_order, is_featured, status) VALUES
(
    'Web-Entwicklung',
    'Moderne, responsive Websites und Webanwendungen mit neuesten Technologien. Von einfachen Visitenkarten-Websites bis hin zu komplexen E-Commerce-Lösungen.',
    'Moderne Websites & Webanwendungen',
    '🌐',
    ARRAY['Responsive Design für alle Geräte', 'SEO-optimierte Entwicklung', 'Performance-Optimierung', 'Content Management System', 'E-Commerce Integration', 'Wartung & Support'],
    'development',
    'Ab 2.500€',
    ARRAY['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Node.js'],
    ARRAY['Vollständige Website', 'Responsive Design', 'CMS-Integration', 'SEO-Setup', '3 Monate Support'],
    1,
    true,
    'active'
),
(
    'ShootingHub App',
    'Professionelle Mobile App für Fotografen zur Verwaltung von Shootings, Kunden und Terminen. Umfassendes Business-Management in einer App.',
    'Shooting-Management für Fotografen',
    '📱',
    ARRAY['Termin- & Kundenverwaltung', 'Automatische Rechnungserstellung', 'Model-Release & Verträge', 'Shooting-Planung & Checklisten', 'Galerie & Bildverwaltung', 'Analytics & Reporting'],
    'apps',
    'Ab 4.999€',
    ARRAY['React Native', 'TypeScript', 'Supabase', 'Expo'],
    ARRAY['iOS & Android App', 'Backend-System', 'Admin-Panel', 'Dokumentation', '6 Monate Support'],
    2,
    true,
    'active'
),
(
    'CMS & Admin-Bereiche',
    'Maßgeschneiderte Content Management Systeme und Administrationsbereich für effiziente Inhaltsverwaltung und Geschäftsprozesse.',
    'Content Management & Admin-Systeme',
    '⚙️',
    ARRAY['Benutzerfreundliche Oberfläche', 'Rollen- & Rechteverwaltung', 'Content-Editor mit Vorschau', 'Medien-Verwaltung', 'Backup & Versionierung', 'Multi-Language Support'],
    'systems',
    'Ab 1.999€',
    ARRAY['Next.js', 'TypeScript', 'Prisma', 'PostgreSQL', 'TinyMCE'],
    ARRAY['Admin-Panel', 'Content-Editor', 'Benutzerverwaltung', 'Dokumentation', '3 Monate Support'],
    3,
    true,
    'active'
),
(
    'Analytics & Performance',
    'Umfassende Analyse-Tools und Performance-Optimierung für Ihre digitalen Projekte. Datengetriebene Insights für bessere Geschäftsentscheidungen.',
    'Datenanalyse & Performance-Optimierung',
    '📊',
    ARRAY['Custom Analytics Dashboard', 'Performance-Monitoring', 'A/B-Testing Framework', 'Conversion-Tracking', 'SEO-Analyse & Optimierung', 'Reporting & Insights'],
    'analytics',
    'Ab 1.499€',
    ARRAY['Google Analytics', 'Vercel Analytics', 'Mixpanel', 'Lighthouse', 'GTM'],
    ARRAY['Analytics-Setup', 'Performance-Audit', 'Monitoring-Dashboard', 'Monatliche Reports', 'Ongoing Support'],
    4,
    true,
    'active'
);

-- 9. Prüfe Ergebnis
SELECT 'Services Tabelle erfolgreich erstellt!' as status;
SELECT id, title, short_description, icon, category, is_featured, status FROM services ORDER BY sort_order;