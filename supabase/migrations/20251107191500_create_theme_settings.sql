-- Theme settings table stores global layout and footer configuration
CREATE TABLE IF NOT EXISTS theme_settings (
    id TEXT PRIMARY KEY,
    primary_color TEXT NOT NULL DEFAULT '#6366f1',
    accent_color TEXT NOT NULL DEFAULT '#ec4899',
    navigation_style TEXT NOT NULL DEFAULT 'classic',
  footer_layout TEXT NOT NULL DEFAULT 'compact',
    footer_brand_name TEXT NOT NULL DEFAULT 'HP New',
    footer_brand_description TEXT,
    footer_badges TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    footer_sections JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT navigation_style_valid CHECK (navigation_style IN ('classic', 'minimal', 'split')),
    CONSTRAINT footer_layout_valid CHECK (footer_layout IN ('compact', 'columns'))
);

-- Ensure updated_at stays current
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS theme_settings_set_updated_at ON theme_settings;
CREATE TRIGGER theme_settings_set_updated_at
    BEFORE UPDATE ON theme_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Seed default row if table is empty
INSERT INTO theme_settings (
    id,
    primary_color,
    accent_color,
    navigation_style,
    footer_layout,
    footer_brand_name,
    footer_brand_description,
    footer_badges,
    footer_sections
) VALUES (
    'default',
    '#6366f1',
    '#ec4899',
    'classic',
  'compact',
    'HP New',
    'Ein modernes Webentwicklungsprojekt mit Next.js, TypeScript und MCP-Integration für professionelle Anwendungen.',
    ARRAY['Next.js 16', 'TypeScript', 'MCP'],
    '[
      {
        "title": "Projekt",
        "links": [
          { "label": "GitHub Repository", "href": "https://github.com/C0d3Cr4sh3r/hp_new", "external": true },
          { "label": "Issues", "href": "https://github.com/C0d3Cr4sh3r/hp_new/issues", "external": true },
          { "label": "Pull Requests", "href": "https://github.com/C0d3Cr4sh3r/hp_new/pulls", "external": true },
          { "label": "Releases", "href": "https://github.com/C0d3Cr4sh3r/hp_new/releases", "external": true }
        ]
      },
      {
        "title": "Technologien",
        "links": [
          { "label": "Next.js", "href": "https://nextjs.org", "external": true },
          { "label": "TypeScript", "href": "https://typescriptlang.org", "external": true },
          { "label": "Tailwind CSS", "href": "https://tailwindcss.com", "external": true },
          { "label": "Vercel", "href": "https://vercel.com", "external": true }
        ]
      },
      {
        "title": "Ressourcen",
        "links": [
          { "label": "Dokumentation", "href": "https://github.com/C0d3Cr4sh3r/hp_new#readme", "external": true },
          { "label": "MCP Protocol", "href": "https://modelcontextprotocol.io", "external": true },
          { "label": "GitHub Actions", "href": "https://github.com/features/actions", "external": true },
          { "label": "Dependabot", "href": "https://github.com/dependabot", "external": true }
        ]
      }
    ]'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- Apply RLS so only the service role can modify data while allowing reads
ALTER TABLE theme_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS theme_settings_read ON theme_settings;
CREATE POLICY theme_settings_read ON theme_settings
    FOR SELECT
    USING (true);

DROP POLICY IF EXISTS theme_settings_mutate ON theme_settings;
CREATE POLICY theme_settings_mutate ON theme_settings
    FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');
