-- Extend theme settings with configurable footer meta content
ALTER TABLE theme_settings
    ADD COLUMN IF NOT EXISTS footer_meta_lines TEXT[],
    ADD COLUMN IF NOT EXISTS footer_show_updated_at BOOLEAN;

-- Remove previously seeded footer defaults so content can remain empty
UPDATE theme_settings
SET
    footer_meta_lines = NULL,
    footer_show_updated_at = NULL
WHERE id = 'default';
