-- Downloads Tabelle erstellen falls sie nicht existiert
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

-- RLS aktivieren
ALTER TABLE downloads ENABLE ROW LEVEL SECURITY;

-- Öffentlicher Lesezugriff
DROP POLICY IF EXISTS "Public read access for downloads" ON downloads;
CREATE POLICY "Public read access for downloads" ON downloads
    FOR SELECT USING (true);

-- Öffentlicher Schreibzugriff für Admin
DROP POLICY IF EXISTS "Public write access for downloads" ON downloads;  
CREATE POLICY "Public write access for downloads" ON downloads
    FOR ALL USING (true);

-- Test-Daten einfügen
INSERT INTO downloads (title, version, file_url, channel, available_in_store, changelog_markdown) VALUES
('ShootingHub', '2.5.0', 'https://example.com/downloads/shootinghub-2.5.0.zip', 'stable', true, '# ShootingHub 2.5.0\n\n- Verbesserte Shooting-Verwaltung\n- Neue Community-Features\n- Performance-Optimierungen'),
('ShootingHub Beta', '2.6.0-beta.1', 'https://example.com/downloads/shootinghub-2.6.0-beta.zip', 'beta', false, '# ShootingHub 2.6.0 Beta\n\n- Experimentelle Features\n- Neue UI-Komponenten\n- Erweiterte API')
ON CONFLICT DO NOTHING;

-- Prüfe Ergebnis
SELECT id, title, version, channel FROM downloads;