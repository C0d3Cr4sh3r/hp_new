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

