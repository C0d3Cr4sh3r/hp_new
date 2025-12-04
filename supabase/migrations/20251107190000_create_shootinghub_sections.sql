-- Create table for ShootingHub landing content
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
    image_storage_path TEXT,
    image_width INTEGER,
    image_height INTEGER,
    sort_order INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure updated_at column stays in sync
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_shootinghub_sections_updated_at ON shootinghub_sections;
CREATE TRIGGER update_shootinghub_sections_updated_at
    BEFORE UPDATE ON shootinghub_sections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed default content if table is empty
INSERT INTO shootinghub_sections (
    section_key,
    headline,
    subheadline,
    description,
    bullets,
    cta_label,
    cta_url,
    image_url,
    sort_order,
    is_active
) VALUES (
    'shootinghub',
    'ShootingHub',
    'Die ultimative App für Fotografen',
    'Verwalte deine Shootings, Kunden und Termine in einer einzigen, professionellen App. ShootingHub revolutioniert dein Fotografie-Business.',
    '["Shooting-Verwaltung & Terminplanung","Kundenverwaltung & Model-Database","Automatische Rechnungserstellung","Portfolio & Galerie-Management","Analytics & Business-Insights","Cross-Platform für iOS & Android"]'::jsonb,
    'App herunterladen',
    '#downloads',
    '/api/placeholder/600/400?text=ShootingHub+App+Screenshot',
    1,
    TRUE
)
ON CONFLICT (section_key) DO NOTHING;

-- Enable RLS and allow broad read access
ALTER TABLE shootinghub_sections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "shootinghub_sections_read" ON shootinghub_sections;
CREATE POLICY "shootinghub_sections_read" ON shootinghub_sections
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "shootinghub_sections_mutate" ON shootinghub_sections;
CREATE POLICY "shootinghub_sections_mutate" ON shootinghub_sections
    FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
