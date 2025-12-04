-- Add hero section fields to site_settings table
ALTER TABLE site_settings 
ADD COLUMN IF NOT EXISTS hero_title TEXT,
ADD COLUMN IF NOT EXISTS hero_subtitle TEXT,
ADD COLUMN IF NOT EXISTS hero_description TEXT;

-- Add comment to document the new columns
COMMENT ON COLUMN site_settings.hero_title IS 'Main title displayed in the hero section on the homepage';
COMMENT ON COLUMN site_settings.hero_subtitle IS 'Subtitle displayed below the main title in the hero section';
COMMENT ON COLUMN site_settings.hero_description IS 'Description text displayed in the hero section';
