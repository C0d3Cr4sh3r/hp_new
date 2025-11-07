-- Services Tabelle für das Services-Management-System
-- Führe dieses SQL in der Supabase Console aus

-- 1. Services Tabelle erstellen
CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    short_description TEXT,
    icon VARCHAR(100), -- Emoji oder Icon-Bezeichner
    features TEXT[], -- Array für Service-Features/Bullet Points
    category VARCHAR(100),
    price_info VARCHAR(255),
    technologies TEXT[], -- Array für verwendete Technologien
    deliverables TEXT[], -- Array für Lieferumfang
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
-- Alle können Services sehen
DROP POLICY IF EXISTS "Public read access for services" ON services;
CREATE POLICY "Public read access for services" ON services
    FOR SELECT USING (true);

-- Alle können Services erstellen (für Admin-Panel)
DROP POLICY IF EXISTS "Public insert access for services" ON services;
CREATE POLICY "Public insert access for services" ON services
    FOR INSERT WITH CHECK (true);

-- Alle können Services bearbeiten (für Admin-Panel) 
DROP POLICY IF EXISTS "Public update access for services" ON services;
CREATE POLICY "Public update access for services" ON services
    FOR UPDATE USING (true);

-- Alle können Services löschen (für Admin-Panel)
DROP POLICY IF EXISTS "Public delete access for services" ON services;
CREATE POLICY "Public delete access for services" ON services
    FOR DELETE USING (true);

-- 6. Beispiel-Service-Einträge einfügen
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
)
ON CONFLICT DO NOTHING;

-- 7. Prüfe Ergebnis
SELECT id, title, short_description, icon, category, is_featured, status FROM services ORDER BY sort_order;