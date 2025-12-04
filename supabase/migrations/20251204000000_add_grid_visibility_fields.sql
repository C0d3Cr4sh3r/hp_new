-- Migration: Füge Grid-Bereich Sichtbarkeit und Sortierung hinzu
-- Erstellt: 2024-12-04

-- Grid-Bereich Sichtbarkeit (alle standardmäßig aktiviert)
ALTER TABLE site_settings 
ADD COLUMN IF NOT EXISTS show_hero BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS show_features BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS show_gallery BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS show_services BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS show_portfolio BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS show_shootinghub BOOLEAN DEFAULT true;

-- Grid-Bereich Reihenfolge (sort_order)
ALTER TABLE site_settings 
ADD COLUMN IF NOT EXISTS hero_sort_order INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS features_sort_order INTEGER DEFAULT 2,
ADD COLUMN IF NOT EXISTS gallery_sort_order INTEGER DEFAULT 3,
ADD COLUMN IF NOT EXISTS services_sort_order INTEGER DEFAULT 4,
ADD COLUMN IF NOT EXISTS portfolio_sort_order INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS shootinghub_sort_order INTEGER DEFAULT 6;

-- Kommentare für die neuen Spalten
COMMENT ON COLUMN site_settings.show_hero IS 'Steuert ob der Hero-Bereich auf der Landing Page angezeigt wird';
COMMENT ON COLUMN site_settings.show_features IS 'Steuert ob der Features-Bereich auf der Landing Page angezeigt wird';
COMMENT ON COLUMN site_settings.show_gallery IS 'Steuert ob der Gallery-Bereich auf der Landing Page angezeigt wird';
COMMENT ON COLUMN site_settings.show_services IS 'Steuert ob der Services-Bereich auf der Landing Page angezeigt wird';
COMMENT ON COLUMN site_settings.show_portfolio IS 'Steuert ob der Portfolio-Bereich auf der Landing Page angezeigt wird';
COMMENT ON COLUMN site_settings.show_shootinghub IS 'Steuert ob der ShootingHub-Bereich auf der Landing Page angezeigt wird';

COMMENT ON COLUMN site_settings.hero_sort_order IS 'Reihenfolge des Hero-Bereichs auf der Landing Page';
COMMENT ON COLUMN site_settings.features_sort_order IS 'Reihenfolge des Features-Bereichs auf der Landing Page';
COMMENT ON COLUMN site_settings.gallery_sort_order IS 'Reihenfolge des Gallery-Bereichs auf der Landing Page';
COMMENT ON COLUMN site_settings.services_sort_order IS 'Reihenfolge des Services-Bereichs auf der Landing Page';
COMMENT ON COLUMN site_settings.portfolio_sort_order IS 'Reihenfolge des Portfolio-Bereichs auf der Landing Page';
COMMENT ON COLUMN site_settings.shootinghub_sort_order IS 'Reihenfolge des ShootingHub-Bereichs auf der Landing Page';

-- Aktualisiere bestehende Zeile mit Standardwerten falls noch nicht gesetzt
UPDATE site_settings SET 
  show_hero = COALESCE(show_hero, true),
  show_features = COALESCE(show_features, true),
  show_gallery = COALESCE(show_gallery, true),
  show_services = COALESCE(show_services, true),
  show_portfolio = COALESCE(show_portfolio, true),
  show_shootinghub = COALESCE(show_shootinghub, true),
  hero_sort_order = COALESCE(hero_sort_order, 1),
  features_sort_order = COALESCE(features_sort_order, 2),
  gallery_sort_order = COALESCE(gallery_sort_order, 3),
  services_sort_order = COALESCE(services_sort_order, 4),
  portfolio_sort_order = COALESCE(portfolio_sort_order, 5),
  shootinghub_sort_order = COALESCE(shootinghub_sort_order, 6)
WHERE id = 'default';

