-- Hero-Konfiguration um CTA-Felder erweitern
ALTER TABLE site_settings
ADD COLUMN IF NOT EXISTS hero_primary_cta_label TEXT,
ADD COLUMN IF NOT EXISTS hero_primary_cta_url TEXT,
ADD COLUMN IF NOT EXISTS hero_secondary_cta_label TEXT,
ADD COLUMN IF NOT EXISTS hero_secondary_cta_url TEXT;

COMMENT ON COLUMN site_settings.hero_primary_cta_label IS 'Text fuer den primaeren Hero-Call-to-Action-Button';
COMMENT ON COLUMN site_settings.hero_primary_cta_url IS 'Ziel-URL fuer den primaeren Hero-CTA-Button';
COMMENT ON COLUMN site_settings.hero_secondary_cta_label IS 'Text fuer den sekundaren Hero-Call-to-Action-Link';
COMMENT ON COLUMN site_settings.hero_secondary_cta_url IS 'Ziel-URL fuer den sekundaren Hero-CTA-Link';
