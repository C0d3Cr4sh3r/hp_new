-- =====================================================
-- FIX: Alle Tabellen erstellen und initialisieren
-- =====================================================
-- Führe diese SQL-Datei in der Supabase SQL Console aus:
-- https://supabase.com/dashboard/project/[PROJECT-ID]/sql/new
-- =====================================================

-- =====================================================
-- TEIL 1: SITE SETTINGS
-- =====================================================

CREATE TABLE IF NOT EXISTS site_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    site_name TEXT NOT NULL DEFAULT 'ArcanePixels',
    tagline TEXT,
    support_email TEXT,
    imprint TEXT,
    privacy TEXT,
    hero_title TEXT,
    hero_subtitle TEXT,
    hero_description TEXT,
    hero_primary_cta_label TEXT,
    hero_primary_cta_url TEXT,
    hero_secondary_cta_label TEXT,
    hero_secondary_cta_url TEXT,
    services_section_eyebrow TEXT,
    services_section_title TEXT,
    services_section_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Fehlende Spalten hinzufügen (falls Tabelle bereits existiert)
ALTER TABLE site_settings 
ADD COLUMN IF NOT EXISTS hero_title TEXT,
ADD COLUMN IF NOT EXISTS hero_subtitle TEXT,
ADD COLUMN IF NOT EXISTS hero_description TEXT,
ADD COLUMN IF NOT EXISTS hero_primary_cta_label TEXT,
ADD COLUMN IF NOT EXISTS hero_primary_cta_url TEXT,
ADD COLUMN IF NOT EXISTS hero_secondary_cta_label TEXT,
ADD COLUMN IF NOT EXISTS hero_secondary_cta_url TEXT,
ADD COLUMN IF NOT EXISTS services_section_eyebrow TEXT,
ADD COLUMN IF NOT EXISTS services_section_title TEXT,
ADD COLUMN IF NOT EXISTS services_section_description TEXT;

-- 3. RLS aktivieren und Policies setzen
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Öffentlicher Lesezugriff
DROP POLICY IF EXISTS "Public read access for site settings" ON site_settings;
CREATE POLICY "Public read access for site settings" ON site_settings
    FOR SELECT USING (true);

-- Service-Role kann alles
DROP POLICY IF EXISTS "Service role manages site settings" ON site_settings;
CREATE POLICY "Service role manages site settings" ON site_settings
    FOR ALL USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- 4. Default-Eintrag erstellen (falls nicht vorhanden)
INSERT INTO site_settings (
    id, 
    site_name, 
    tagline, 
    support_email,
    hero_title,
    hero_subtitle,
    hero_description,
    hero_primary_cta_label,
    hero_primary_cta_url,
    hero_secondary_cta_label,
    hero_secondary_cta_url,
    services_section_eyebrow,
    services_section_title,
    services_section_description
)
VALUES (
    'default',
    'ArcanePixels',
    'Digitale Experiences für Fotografen & Kreative',
    'support@arcanepixels.com',
    'Willkommen bei ArcanePixels',
    'Kreative Webentwicklung',
    'Wir entwickeln maßgeschneiderte digitale Lösungen für Fotografen und Kreative.',
    'Jetzt starten',
    '/arcane/events',
    'Mehr erfahren',
    '#features',
    'Unsere Services',
    'Was wir bieten',
    'Entdecke unsere Dienstleistungen für deinen kreativen Erfolg.'
)
ON CONFLICT (id) DO NOTHING;

CREATE OR REPLACE FUNCTION update_site_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_site_settings_updated_at ON site_settings;
CREATE TRIGGER update_site_settings_updated_at
    BEFORE UPDATE ON site_settings
    FOR EACH ROW EXECUTE FUNCTION update_site_settings_updated_at();

-- =====================================================
-- TEIL 2: DOWNLOADS
-- =====================================================

CREATE TABLE IF NOT EXISTS downloads (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    version VARCHAR(100) NOT NULL,
    file_url TEXT NOT NULL,
    channel VARCHAR(50) DEFAULT 'stable' CHECK (channel IN ('stable', 'beta', 'legacy')),
    available_in_store BOOLEAN DEFAULT false,
    store_url TEXT,
    changelog_markdown TEXT,
    changelog_file_name VARCHAR(255),
    security_hash VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE downloads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read access for downloads" ON downloads;
CREATE POLICY "Public read access for downloads" ON downloads
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service role manages downloads" ON downloads;
CREATE POLICY "Service role manages downloads" ON downloads
    FOR ALL USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- =====================================================
-- TEIL 3: THEME SETTINGS
-- =====================================================

CREATE TABLE IF NOT EXISTS theme_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    primary_color VARCHAR(7) DEFAULT '#9333ea',
    accent_color VARCHAR(7) DEFAULT '#ec4899',
    footer_brand_name TEXT DEFAULT 'ArcanePixels',
    footer_brand_description TEXT,
    footer_badges JSONB DEFAULT '[]'::jsonb,
    footer_sections JSONB DEFAULT '[]'::jsonb,
    footer_meta_lines JSONB DEFAULT '[]'::jsonb,
    footer_show_updated_at BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE theme_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read access for theme settings" ON theme_settings;
CREATE POLICY "Public read access for theme settings" ON theme_settings
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service role manages theme settings" ON theme_settings;
CREATE POLICY "Service role manages theme settings" ON theme_settings
    FOR ALL USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

INSERT INTO theme_settings (id, footer_brand_name, footer_brand_description)
VALUES ('default', 'ArcanePixels', 'Kreative Weblösungen für Fotografen')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- NEWS TABLE (für News & Changelog)
-- =====================================================
CREATE TABLE IF NOT EXISTS news (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    content TEXT NOT NULL,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fehlende Spalten hinzufügen (falls Tabelle bereits existiert)
ALTER TABLE news ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft';
ALTER TABLE news ADD COLUMN IF NOT EXISTS slug TEXT;

ALTER TABLE news ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read published news" ON news;
CREATE POLICY "Public can read published news" ON news
    FOR SELECT USING (status = 'published' OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role manages news" ON news;
CREATE POLICY "Service role manages news" ON news
    FOR ALL USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- =====================================================
-- PORTFOLIOS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS portfolios (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    image_url TEXT,
    image_alt VARCHAR(255),
    image_width INTEGER,
    image_height INTEGER,
    image_storage_path TEXT,
    project_url TEXT,
    client_name VARCHAR(255),
    project_date VARCHAR(100),
    technologies TEXT[] DEFAULT '{}',
    is_featured BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fehlende Spalten hinzufügen (falls Tabelle bereits existiert)
ALTER TABLE portfolios ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';
ALTER TABLE portfolios ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read access for portfolios" ON portfolios;
CREATE POLICY "Public read access for portfolios" ON portfolios
    FOR SELECT USING (status = 'active');

DROP POLICY IF EXISTS "Service role manages portfolios" ON portfolios;
CREATE POLICY "Service role manages portfolios" ON portfolios
    FOR ALL USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- =====================================================
-- NAVIGATION LINKS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS navigation_links (
    id SERIAL PRIMARY KEY,
    label VARCHAR(100) NOT NULL,
    href TEXT NOT NULL,
    external BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    visible BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE navigation_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read access for navigation_links" ON navigation_links;
CREATE POLICY "Public read access for navigation_links" ON navigation_links
    FOR SELECT USING (visible = true);

DROP POLICY IF EXISTS "Service role manages navigation_links" ON navigation_links;
CREATE POLICY "Service role manages navigation_links" ON navigation_links
    FOR ALL USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- Default Navigation Links einfügen
INSERT INTO navigation_links (label, href, external, sort_order, visible) VALUES
    ('Home', '/', false, 1, true),
    ('Services', '/#services', false, 2, true),
    ('Portfolio', '/#portfolio', false, 3, true),
    ('ShootingHub', '/#shootinghub', false, 4, true),
    ('News', '/arcane/news', false, 5, true),
    ('Downloads', '/arcane/downloads', false, 6, true),
    ('Bug Tracker', '/arcane/bugs', false, 7, true),
    ('EventHub', 'https://eventhub-cms.vercel.app', true, 8, true),
    ('Admin', '/admin', false, 9, true)
ON CONFLICT DO NOTHING;

-- =====================================================
-- TEIL 4: SCREENSHOTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS screenshots (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL DEFAULT 'app' CHECK (category IN ('app', 'portfolio', 'marketing', 'websites', 'photography')),
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

-- Fehlende Spalten hinzufügen (falls Tabelle bereits existiert)
ALTER TABLE screenshots ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';
ALTER TABLE screenshots ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

ALTER TABLE screenshots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read access for screenshots" ON screenshots;
CREATE POLICY "Public read access for screenshots" ON screenshots
    FOR SELECT USING (status = 'active');

DROP POLICY IF EXISTS "Service role manages screenshots" ON screenshots;
CREATE POLICY "Service role manages screenshots" ON screenshots
    FOR ALL USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- Trigger für updated_at
CREATE OR REPLACE FUNCTION update_screenshots_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_screenshots_updated_at ON screenshots;
CREATE TRIGGER update_screenshots_updated_at
    BEFORE UPDATE ON screenshots
    FOR EACH ROW EXECUTE FUNCTION update_screenshots_updated_at();

-- =====================================================
-- TEIL 5: SERVICES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    short_description TEXT,
    icon VARCHAR(100),
    features TEXT[] DEFAULT '{}',
    category VARCHAR(100),
    price_info TEXT,
    technologies TEXT[] DEFAULT '{}',
    deliverables TEXT[] DEFAULT '{}',
    sort_order INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fehlende Spalten hinzufügen (falls Tabelle bereits existiert)
ALTER TABLE services ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';
ALTER TABLE services ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE services ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- Indizes für bessere Performance
CREATE INDEX IF NOT EXISTS idx_services_sort_order ON services(sort_order);
CREATE INDEX IF NOT EXISTS idx_services_status ON services(status);
CREATE INDEX IF NOT EXISTS idx_services_featured ON services(is_featured);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read access for services" ON services;
CREATE POLICY "Public read access for services" ON services
    FOR SELECT USING (status = 'active');

DROP POLICY IF EXISTS "Service role manages services" ON services;
CREATE POLICY "Service role manages services" ON services
    FOR ALL USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- Trigger für updated_at
CREATE OR REPLACE FUNCTION update_services_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_services_updated_at ON services;
CREATE TRIGGER update_services_updated_at
    BEFORE UPDATE ON services
    FOR EACH ROW EXECUTE FUNCTION update_services_updated_at();

-- Default Services einfügen
INSERT INTO services (title, short_description, description, icon, features, status, sort_order) VALUES
    ('Webentwicklung', 'Moderne Websites mit Next.js', 'Professionelle Webentwicklung mit modernsten Technologien für optimale Performance und Benutzererfahrung.', 'CodeBracketIcon', ARRAY['Responsive Design', 'SEO-Optimierung', 'Performance-Tuning', 'CMS-Integration'], 'active', 1),
    ('App-Entwicklung', 'Native & Cross-Platform Apps', 'Entwicklung von mobilen Anwendungen für iOS und Android mit React Native oder nativen Technologien.', 'DevicePhoneMobileIcon', ARRAY['iOS & Android', 'Cross-Platform', 'Push-Notifications', 'Offline-Fähigkeit'], 'active', 2),
    ('UI/UX Design', 'Benutzerfreundliche Interfaces', 'Kreatives Design mit Fokus auf Usability und moderne Ästhetik für Web und Mobile.', 'PaintBrushIcon', ARRAY['Wireframes', 'Prototypen', 'User Testing', 'Design Systems'], 'active', 3),
    ('Consulting', 'Technische Beratung', 'Strategische Beratung zu Technologie-Stack, Architektur und digitaler Transformation.', 'LightBulbIcon', ARRAY['Technologie-Audit', 'Stack-Empfehlung', 'Skalierungs-Strategie', 'Code-Review'], 'active', 4)
ON CONFLICT DO NOTHING;

-- =====================================================
-- TEIL 6: EVENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    time TIME,
    location VARCHAR(255),
    photographer_id TEXT,
    model_id TEXT,
    type VARCHAR(50) NOT NULL CHECK (type IN ('tfp', 'paid', 'collaboration')),
    status VARCHAR(50) NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'confirmed', 'completed', 'cancelled')),
    max_participants INTEGER,
    current_participants INTEGER DEFAULT 0,
    image_url TEXT,
    external_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fehlende Spalten hinzufügen (falls Tabelle bereits existiert)
ALTER TABLE events ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'planned';
ALTER TABLE events ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'tfp';

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read access for events" ON events;
CREATE POLICY "Public read access for events" ON events
    FOR SELECT USING (status != 'cancelled');

DROP POLICY IF EXISTS "Service role manages events" ON events;
CREATE POLICY "Service role manages events" ON events
    FOR ALL USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- Trigger für updated_at
CREATE OR REPLACE FUNCTION update_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_events_updated_at ON events;
CREATE TRIGGER update_events_updated_at
    BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_events_updated_at();

-- =====================================================
-- TEIL 7: BUG REPORTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS bug_reports (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    steps_to_reproduce TEXT,
    expected_behavior TEXT,
    actual_behavior TEXT,
    severity VARCHAR(20) DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed', 'wont_fix')),
    reporter_name VARCHAR(255),
    reporter_email VARCHAR(255),
    assignee VARCHAR(255),
    screenshot_url TEXT,
    browser_info TEXT,
    resolution_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE bug_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read access for bug_reports" ON bug_reports;
CREATE POLICY "Public read access for bug_reports" ON bug_reports
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can create bug_reports" ON bug_reports;
CREATE POLICY "Public can create bug_reports" ON bug_reports
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Service role manages bug_reports" ON bug_reports;
CREATE POLICY "Service role manages bug_reports" ON bug_reports
    FOR ALL USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- Trigger für updated_at
CREATE OR REPLACE FUNCTION update_bug_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_bug_reports_updated_at ON bug_reports;
CREATE TRIGGER update_bug_reports_updated_at
    BEFORE UPDATE ON bug_reports
    FOR EACH ROW EXECUTE FUNCTION update_bug_reports_updated_at();

-- =====================================================
-- TEIL 8: SHOOTINGHUB SECTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS shootinghub_sections (
    section_key TEXT PRIMARY KEY,
    headline TEXT NOT NULL,
    subheadline TEXT,
    description TEXT,
    bullets JSONB DEFAULT '[]'::jsonb,
    cta_label TEXT,
    cta_url TEXT,
    image_url TEXT,
    image_alt TEXT,
    image_width INTEGER,
    image_height INTEGER,
    image_storage_path TEXT,
    sort_order INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE shootinghub_sections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read access for shootinghub_sections" ON shootinghub_sections;
CREATE POLICY "Public read access for shootinghub_sections" ON shootinghub_sections
    FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Service role manages shootinghub_sections" ON shootinghub_sections;
CREATE POLICY "Service role manages shootinghub_sections" ON shootinghub_sections
    FOR ALL USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- Default ShootingHub Section
INSERT INTO shootinghub_sections (section_key, headline, subheadline, description, bullets, cta_label, cta_url, sort_order) VALUES
    ('main', 'ShootingHub', 'Die App für Fotografen & Models', 'Plane und verwalte deine Shootings professionell mit unserer All-in-One Lösung.',
     '["Einfache Terminplanung", "Model-Kartei", "Portfolio-Verwaltung", "Vertrags-Management"]'::jsonb,
     'Mehr erfahren', '/#shootinghub', 1)
ON CONFLICT (section_key) DO NOTHING;

-- Trigger für updated_at
CREATE OR REPLACE FUNCTION update_shootinghub_sections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_shootinghub_sections_updated_at ON shootinghub_sections;
CREATE TRIGGER update_shootinghub_sections_updated_at
    BEFORE UPDATE ON shootinghub_sections
    FOR EACH ROW EXECUTE FUNCTION update_shootinghub_sections_updated_at();

-- =====================================================
-- TEIL 9: SERVICE SECTION SETTINGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS service_section (
    id TEXT PRIMARY KEY DEFAULT 'default',
    eyebrow TEXT DEFAULT 'Unsere Services',
    title TEXT DEFAULT 'Was wir bieten',
    description TEXT DEFAULT 'Entdecke unsere Dienstleistungen für deinen kreativen Erfolg.',
    show_featured_only BOOLEAN DEFAULT false,
    max_items INTEGER DEFAULT 4,
    layout VARCHAR(50) DEFAULT 'grid' CHECK (layout IN ('grid', 'list', 'carousel')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE service_section ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read access for service_section" ON service_section;
CREATE POLICY "Public read access for service_section" ON service_section
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service role manages service_section" ON service_section;
CREATE POLICY "Service role manages service_section" ON service_section
    FOR ALL USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- Default Service Section
INSERT INTO service_section (id, eyebrow, title, description) VALUES
    ('default', 'Unsere Services', 'Was wir bieten', 'Entdecke unsere Dienstleistungen für deinen kreativen Erfolg.')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- TEIL 10: BFSG - BARRIEREFREIHEITSERKLÄRUNG
-- =====================================================
-- Gesetzlich vorgeschriebene Erklärung nach BFSG (ab 28.06.2025)

CREATE TABLE IF NOT EXISTS accessibility_statement (
    id TEXT PRIMARY KEY DEFAULT 'default',
    -- Hauptinhalt der Erklärung (HTML/Markdown)
    content TEXT,
    -- Konformitätsstatus
    conformance_status VARCHAR(50) DEFAULT 'partial' CHECK (conformance_status IN ('full', 'partial', 'none', 'unknown')),
    -- Datum der letzten Überprüfung
    last_reviewed DATE DEFAULT CURRENT_DATE,
    -- Datum der Erstellung
    statement_date DATE DEFAULT CURRENT_DATE,
    -- Kontaktinformationen für Barrierefreiheits-Feedback
    contact_email TEXT,
    contact_phone TEXT,
    contact_address TEXT,
    -- Feedback-Mechanismus (gesetzlich vorgeschrieben)
    feedback_mechanism TEXT,
    -- Durchsetzungsverfahren (Link zur zuständigen Behörde)
    enforcement_procedure_url TEXT DEFAULT 'https://www.bfit-bund.de/DE/Home/home_node.html',
    -- Bekannte Einschränkungen (JSONB Array)
    known_limitations JSONB DEFAULT '[]'::jsonb,
    -- Technische Informationen
    technologies_used JSONB DEFAULT '["HTML5", "CSS3", "JavaScript", "React", "Next.js"]'::jsonb,
    -- Prüfmethode
    assessment_method VARCHAR(100) DEFAULT 'self-assessment',
    -- Erstellt/Aktualisiert
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE accessibility_statement ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read access for accessibility_statement" ON accessibility_statement;
CREATE POLICY "Public read access for accessibility_statement" ON accessibility_statement
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service role manages accessibility_statement" ON accessibility_statement;
CREATE POLICY "Service role manages accessibility_statement" ON accessibility_statement
    FOR ALL USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- Default Barrierefreiheitserklärung
INSERT INTO accessibility_statement (
    id,
    content,
    conformance_status,
    contact_email,
    feedback_mechanism,
    known_limitations,
    assessment_method
) VALUES (
    'default',
    E'# Erklärung zur Barrierefreiheit\n\n## Stand der Konformität\n\nDiese Website ist teilweise konform mit den Web Content Accessibility Guidelines (WCAG) 2.1 Level AA.\n\n## Nicht barrierefreie Inhalte\n\nDie nachfolgend aufgeführten Inhalte sind aus folgenden Gründen nicht barrierefrei:\n\n- Einige Bilder haben möglicherweise keine ausreichenden Alternativtexte\n- Einige interaktive Elemente benötigen verbesserte Tastaturnavigation\n\n## Feedback und Kontakt\n\nWenn Sie Barrieren auf unserer Website feststellen, kontaktieren Sie uns bitte. Wir werden uns bemühen, die Probleme so schnell wie möglich zu beheben.\n\n## Durchsetzungsverfahren\n\nWenn Sie der Meinung sind, dass wir nicht angemessen auf Ihre Anfrage reagiert haben, können Sie sich an die zuständige Durchsetzungsstelle wenden.',
    'partial',
    'barrierefreiheit@arcanepixels.de',
    'Nutzen Sie unser Kontaktformular oder senden Sie eine E-Mail an barrierefreiheit@arcanepixels.de. Wir antworten innerhalb von 2 Wochen.',
    '[{"area": "Bilder", "description": "Einige dekorative Bilder haben noch keine ausreichenden Alt-Texte", "remedy": "Wird bis Q1 2025 behoben"}, {"area": "Formulare", "description": "Einige Formularfelder benötigen bessere Fehlermeldungen", "remedy": "In Bearbeitung"}]'::jsonb,
    'self-assessment'
)
ON CONFLICT (id) DO NOTHING;

-- Trigger für updated_at
CREATE OR REPLACE FUNCTION update_accessibility_statement_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_accessibility_statement_updated_at ON accessibility_statement;
CREATE TRIGGER update_accessibility_statement_updated_at
    BEFORE UPDATE ON accessibility_statement
    FOR EACH ROW EXECUTE FUNCTION update_accessibility_statement_updated_at();

-- =====================================================
-- TEIL 11: BFSG - SKIP LINKS KONFIGURATION
-- =====================================================
CREATE TABLE IF NOT EXISTS accessibility_skip_links (
    id SERIAL PRIMARY KEY,
    label TEXT NOT NULL,
    target_id TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE accessibility_skip_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read access for accessibility_skip_links" ON accessibility_skip_links;
CREATE POLICY "Public read access for accessibility_skip_links" ON accessibility_skip_links
    FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Service role manages accessibility_skip_links" ON accessibility_skip_links;
CREATE POLICY "Service role manages accessibility_skip_links" ON accessibility_skip_links
    FOR ALL USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- Default Skip Links
INSERT INTO accessibility_skip_links (label, target_id, sort_order, is_active) VALUES
    ('Zum Hauptinhalt springen', 'main-content', 1, true),
    ('Zur Navigation springen', 'main-navigation', 2, true),
    ('Zur Suche springen', 'search', 3, false),
    ('Zum Footer springen', 'footer', 4, true)
ON CONFLICT DO NOTHING;

-- =====================================================
-- TEIL 12: BFSG - ARIA LABELS (i18n-fähig)
-- =====================================================
CREATE TABLE IF NOT EXISTS accessibility_aria_labels (
    id SERIAL PRIMARY KEY,
    key TEXT NOT NULL UNIQUE,
    label_de TEXT NOT NULL,
    label_en TEXT,
    description TEXT,
    element_type VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE accessibility_aria_labels ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read access for accessibility_aria_labels" ON accessibility_aria_labels;
CREATE POLICY "Public read access for accessibility_aria_labels" ON accessibility_aria_labels
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service role manages accessibility_aria_labels" ON accessibility_aria_labels;
CREATE POLICY "Service role manages accessibility_aria_labels" ON accessibility_aria_labels
    FOR ALL USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- Default ARIA Labels
INSERT INTO accessibility_aria_labels (key, label_de, label_en, element_type, description) VALUES
    ('nav.main', 'Hauptnavigation', 'Main navigation', 'nav', 'Haupt-Navigationsleiste'),
    ('nav.mobile.open', 'Menü öffnen', 'Open menu', 'button', 'Button zum Öffnen des mobilen Menüs'),
    ('nav.mobile.close', 'Menü schließen', 'Close menu', 'button', 'Button zum Schließen des mobilen Menüs'),
    ('footer.main', 'Fußzeile', 'Footer', 'footer', 'Haupt-Footer der Seite'),
    ('search.input', 'Suche', 'Search', 'input', 'Sucheingabefeld'),
    ('form.submit', 'Absenden', 'Submit', 'button', 'Formular absenden'),
    ('form.cancel', 'Abbrechen', 'Cancel', 'button', 'Aktion abbrechen'),
    ('link.external', 'Öffnet in neuem Tab', 'Opens in new tab', 'link', 'Hinweis für externe Links'),
    ('image.decorative', 'Dekoratives Bild', 'Decorative image', 'img', 'Für dekorative Bilder (alt="" setzen)'),
    ('loading.spinner', 'Wird geladen', 'Loading', 'div', 'Ladeindikator'),
    ('scroll.top', 'Nach oben scrollen', 'Scroll to top', 'button', 'Zurück zum Seitenanfang')
ON CONFLICT (key) DO NOTHING;

-- =====================================================
-- TEIL 13: BFSG - KONTRAST & DISPLAY EINSTELLUNGEN
-- =====================================================
CREATE TABLE IF NOT EXISTS accessibility_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    -- Minimale Kontrastwerte (WCAG AA = 4.5:1, AAA = 7:1)
    min_contrast_ratio DECIMAL(4,2) DEFAULT 4.5,
    target_wcag_level VARCHAR(10) DEFAULT 'AA' CHECK (target_wcag_level IN ('A', 'AA', 'AAA')),
    -- Schriftgrößen
    min_font_size_px INTEGER DEFAULT 16,
    min_line_height DECIMAL(3,2) DEFAULT 1.5,
    min_paragraph_spacing DECIMAL(3,2) DEFAULT 1.5,
    -- Fokus-Indikatoren
    focus_outline_width_px INTEGER DEFAULT 3,
    focus_outline_color VARCHAR(7) DEFAULT '#0066cc',
    focus_outline_offset_px INTEGER DEFAULT 2,
    -- Animationen
    respect_reduced_motion BOOLEAN DEFAULT true,
    max_animation_duration_ms INTEGER DEFAULT 5000,
    -- Touch-Targets (WCAG 2.5.5)
    min_touch_target_px INTEGER DEFAULT 44,
    -- Zeitlimits
    allow_extended_timeouts BOOLEAN DEFAULT true,
    -- Erstellt/Aktualisiert
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE accessibility_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read access for accessibility_settings" ON accessibility_settings;
CREATE POLICY "Public read access for accessibility_settings" ON accessibility_settings
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service role manages accessibility_settings" ON accessibility_settings;
CREATE POLICY "Service role manages accessibility_settings" ON accessibility_settings
    FOR ALL USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- Default Accessibility Settings
INSERT INTO accessibility_settings (
    id,
    min_contrast_ratio,
    target_wcag_level,
    min_font_size_px,
    min_line_height,
    focus_outline_width_px,
    focus_outline_color,
    respect_reduced_motion,
    min_touch_target_px
) VALUES (
    'default',
    4.5,
    'AA',
    16,
    1.5,
    3,
    '#a855f7',
    true,
    44
)
ON CONFLICT (id) DO NOTHING;

-- Trigger für updated_at
CREATE OR REPLACE FUNCTION update_accessibility_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_accessibility_settings_updated_at ON accessibility_settings;
CREATE TRIGGER update_accessibility_settings_updated_at
    BEFORE UPDATE ON accessibility_settings
    FOR EACH ROW EXECUTE FUNCTION update_accessibility_settings_updated_at();

-- =====================================================
-- TEIL 14: BFSG - ACCESSIBILITY AUDIT LOG
-- =====================================================
CREATE TABLE IF NOT EXISTS accessibility_audit_log (
    id SERIAL PRIMARY KEY,
    audit_date DATE NOT NULL DEFAULT CURRENT_DATE,
    auditor_name VARCHAR(255),
    audit_type VARCHAR(50) DEFAULT 'self-assessment' CHECK (audit_type IN ('self-assessment', 'automated', 'expert', 'user-testing')),
    wcag_version VARCHAR(10) DEFAULT '2.1',
    target_level VARCHAR(10) DEFAULT 'AA',
    -- Ergebnisse
    total_issues INTEGER DEFAULT 0,
    critical_issues INTEGER DEFAULT 0,
    major_issues INTEGER DEFAULT 0,
    minor_issues INTEGER DEFAULT 0,
    -- Status
    overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),
    passed BOOLEAN DEFAULT false,
    -- Details
    findings JSONB DEFAULT '[]'::jsonb,
    recommendations JSONB DEFAULT '[]'::jsonb,
    tools_used JSONB DEFAULT '[]'::jsonb,
    notes TEXT,
    -- Erstellt
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE accessibility_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role manages accessibility_audit_log" ON accessibility_audit_log;
CREATE POLICY "Service role manages accessibility_audit_log" ON accessibility_audit_log
    FOR ALL USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- =====================================================
-- VERIFIZIERUNG
-- =====================================================
SELECT 'site_settings' as table_name, COUNT(*) as rows FROM site_settings
UNION ALL
SELECT 'downloads', COUNT(*) FROM downloads
UNION ALL
SELECT 'theme_settings', COUNT(*) FROM theme_settings
UNION ALL
SELECT 'news', COUNT(*) FROM news
UNION ALL
SELECT 'portfolios', COUNT(*) FROM portfolios
UNION ALL
SELECT 'navigation_links', COUNT(*) FROM navigation_links
UNION ALL
SELECT 'screenshots', COUNT(*) FROM screenshots
UNION ALL
SELECT 'services', COUNT(*) FROM services
UNION ALL
SELECT 'events', COUNT(*) FROM events
UNION ALL
SELECT 'bug_reports', COUNT(*) FROM bug_reports
UNION ALL
SELECT 'shootinghub_sections', COUNT(*) FROM shootinghub_sections
UNION ALL
SELECT 'service_section', COUNT(*) FROM service_section
UNION ALL
SELECT 'accessibility_statement', COUNT(*) FROM accessibility_statement
UNION ALL
SELECT 'accessibility_skip_links', COUNT(*) FROM accessibility_skip_links
UNION ALL
SELECT 'accessibility_aria_labels', COUNT(*) FROM accessibility_aria_labels
UNION ALL
SELECT 'accessibility_settings', COUNT(*) FROM accessibility_settings
UNION ALL
SELECT 'accessibility_audit_log', COUNT(*) FROM accessibility_audit_log;

-- =====================================================
-- TEIL 13: LANDING SECTIONS TABLE (Dynamische Landing-Bereiche)
-- =====================================================
CREATE TABLE IF NOT EXISTS landing_sections (
    id SERIAL PRIMARY KEY,
    section_key VARCHAR(100) NOT NULL UNIQUE,
    section_type VARCHAR(50) NOT NULL DEFAULT 'custom'
        CHECK (section_type IN ('hero', 'features', 'cta', 'image-text', 'gallery', 'testimonials', 'pricing', 'faq', 'contact', 'custom')),
    headline TEXT,
    subheadline TEXT,
    description TEXT,
    content JSONB DEFAULT '{}'::jsonb,
    image_url TEXT,
    image_alt TEXT,
    image_position VARCHAR(20) DEFAULT 'right' CHECK (image_position IN ('left', 'right', 'top', 'bottom', 'background')),
    cta_label TEXT,
    cta_url TEXT,
    secondary_cta_label TEXT,
    secondary_cta_url TEXT,
    background_color VARCHAR(50),
    text_color VARCHAR(50),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fehlende Spalten hinzufügen (falls Tabelle bereits existiert)
ALTER TABLE landing_sections ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE landing_sections ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- Indizes
CREATE INDEX IF NOT EXISTS idx_landing_sections_sort_order ON landing_sections(sort_order);
CREATE INDEX IF NOT EXISTS idx_landing_sections_type ON landing_sections(section_type);
CREATE INDEX IF NOT EXISTS idx_landing_sections_active ON landing_sections(is_active);

ALTER TABLE landing_sections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read access for landing_sections" ON landing_sections;
CREATE POLICY "Public read access for landing_sections" ON landing_sections
    FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Service role manages landing_sections" ON landing_sections;
CREATE POLICY "Service role manages landing_sections" ON landing_sections
    FOR ALL USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- Keine Default Landing Sections - diese werden über das Admin-Panel erstellt
-- Die statischen Bereiche (Hero, Features, Gallery) werden direkt in ArcaneLanding.tsx gerendert
-- Über das Admin-Panel können ZUSÄTZLICHE dynamische Sections hinzugefügt werden

-- Trigger für updated_at
CREATE OR REPLACE FUNCTION update_landing_sections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_landing_sections_updated_at ON landing_sections;
CREATE TRIGGER update_landing_sections_updated_at
    BEFORE UPDATE ON landing_sections
    FOR EACH ROW EXECUTE FUNCTION update_landing_sections_updated_at();

-- =====================================================
-- ZUSAMMENFASSUNG
-- =====================================================
-- Diese SQL-Datei erstellt folgende Tabellen:
--
-- CONTENT-TABELLEN:
-- 1.  site_settings        - Website-Einstellungen (Name, Hero, Services-Section)
-- 2.  downloads            - ShootingHub Downloads
-- 3.  theme_settings       - Design/Theme-Einstellungen
-- 4.  news                 - News-Artikel
-- 5.  portfolios           - Portfolio-Einträge
-- 6.  navigation_links     - Navigations-Links
-- 7.  screenshots          - Galerie/Screenshots
-- 8.  services             - Services/Dienstleistungen
-- 9.  events               - Events/Termine
-- 10. bug_reports          - Bug-Tracker
-- 11. shootinghub_sections - ShootingHub Bereich
-- 12. service_section      - Services-Bereich Konfiguration
-- 13. landing_sections     - Dynamische Landing-Page Bereiche
--
-- BFSG/ACCESSIBILITY-TABELLEN:
-- 14. accessibility_statement   - Barrierefreiheitserklärung (gesetzlich)
-- 15. accessibility_skip_links  - Skip-Link Konfiguration
-- 16. accessibility_aria_labels - ARIA-Labels (i18n)
-- 17. accessibility_settings    - Kontrast & Display Einstellungen
-- 18. accessibility_audit_log   - Audit-Protokoll
--
-- ALLE TABELLEN HABEN:
-- - RLS (Row Level Security) aktiviert
-- - Public Read Access für Frontend-Daten
-- - Service Role Access für Admin-Operationen
-- - updated_at Trigger
-- =====================================================
