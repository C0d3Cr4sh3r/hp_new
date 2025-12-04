-- Screenshots Tabelle für das Screenshot-Management-System

-- 1. Screenshots Tabelle erstellen
CREATE TABLE IF NOT EXISTS screenshots (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL CHECK (category IN ('app', 'portfolio', 'marketing', 'websites')) DEFAULT 'app',
    image_url TEXT NOT NULL,
    image_alt VARCHAR(255),
    image_width INTEGER,
    image_height INTEGER,
    image_storage_path TEXT,
    sort_order INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Indizes für bessere Performance
CREATE INDEX IF NOT EXISTS idx_screenshots_category ON screenshots(category);
CREATE INDEX IF NOT EXISTS idx_screenshots_sort_order ON screenshots(sort_order);
CREATE INDEX IF NOT EXISTS idx_screenshots_status ON screenshots(status);

-- 3. Update-Trigger für timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_screenshots_updated_at ON screenshots;
CREATE TRIGGER update_screenshots_updated_at BEFORE UPDATE ON screenshots
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. Row Level Security aktivieren
ALTER TABLE screenshots ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies für Screenshots
DROP POLICY IF EXISTS "Public read access for screenshots" ON screenshots;
CREATE POLICY "Public read access for screenshots" ON screenshots
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public insert access for screenshots" ON screenshots;
CREATE POLICY "Public insert access for screenshots" ON screenshots
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public update access for screenshots" ON screenshots;
CREATE POLICY "Public update access for screenshots" ON screenshots
    FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public delete access for screenshots" ON screenshots;
CREATE POLICY "Public delete access for screenshots" ON screenshots
    FOR DELETE USING (true);

-- 6. Storage Bucket für Screenshots erstellen
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'screenshots',
    'screenshots',
    true,
    52428800,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

