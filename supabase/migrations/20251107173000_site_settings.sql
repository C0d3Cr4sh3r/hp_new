-- Site settings table to store legal and branding information
CREATE TABLE IF NOT EXISTS site_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    site_name TEXT NOT NULL DEFAULT 'ArcanePixels',
    tagline TEXT,
    support_email TEXT,
    imprint TEXT,
    privacy TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger to keep updated_at in sync
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

-- RLS configuration
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read access for site settings" ON site_settings;
CREATE POLICY "Public read access for site settings" ON site_settings
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service role manages site settings" ON site_settings;
CREATE POLICY "Service role manages site settings" ON site_settings
    FOR ALL USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- Seed default row (idempotent)
INSERT INTO site_settings (id, site_name, tagline, support_email, imprint, privacy)
VALUES (
    'default',
    'ArcanePixels',
    'Digitale Experiences für Fotografen & Kreative',
    'support@arcanepixels.com',
    'ArcanePixels GmbH · Musterstraße 12 · 12345 Berlin',
    'Wir verarbeiten personenbezogene Daten ausschließlich nach DSGVO-Richtlinien.'
)
ON CONFLICT (id) DO NOTHING;
