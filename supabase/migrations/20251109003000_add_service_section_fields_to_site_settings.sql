-- Extend site settings with Service section copy fields
ALTER TABLE site_settings
ADD COLUMN IF NOT EXISTS services_section_eyebrow TEXT,
ADD COLUMN IF NOT EXISTS services_section_title TEXT,
ADD COLUMN IF NOT EXISTS services_section_description TEXT;

COMMENT ON COLUMN site_settings.services_section_eyebrow IS 'Eyebrow label displayed above the services headline';
COMMENT ON COLUMN site_settings.services_section_title IS 'Main heading for the services section';
COMMENT ON COLUMN site_settings.services_section_description IS 'Supporting description text for the services section';

UPDATE site_settings
SET
  services_section_eyebrow = COALESCE(services_section_eyebrow, 'Unsere Services'),
  services_section_title = COALESCE(services_section_title, 'Web-Entwicklung für kreative Professionals'),
  services_section_description = COALESCE(
    services_section_description,
    'Von maßgeschneiderten Photographer-Websites bis hin zu innovativen Apps - wir entwickeln digitale Lösungen für deine kreativen Projekte.'
  )
WHERE id = 'default';
