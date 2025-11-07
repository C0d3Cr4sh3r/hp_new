-- Schnelle Überprüfung und Erstellung der Screenshots-Tabelle
-- Führe dieses SQL direkt in der Supabase Console aus

-- 1. Prüfe ob Screenshots-Tabelle existiert
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'screenshots'
);

-- 2. Falls sie nicht existiert, erstelle sie
CREATE TABLE IF NOT EXISTS screenshots (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL DEFAULT 'app',
    image_url TEXT NOT NULL,
    image_alt VARCHAR(255),
    image_width INTEGER,
    image_height INTEGER,
    image_storage_path TEXT,
    sort_order INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. RLS aktivieren
ALTER TABLE screenshots ENABLE ROW LEVEL SECURITY;

-- 4. Policies erstellen  
DROP POLICY IF EXISTS "Screenshots are viewable by everyone" ON screenshots;
CREATE POLICY "Screenshots are viewable by everyone" ON screenshots
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage screenshots" ON screenshots;
CREATE POLICY "Authenticated users can manage screenshots" ON screenshots
    FOR ALL USING (auth.uid() IS NOT NULL);

-- 5. Test-Daten einfügen
INSERT INTO screenshots (title, description, category, image_url, image_alt, sort_order, status) VALUES
('Test Screenshot 1', 'Ein Test-Screenshot', 'app', '/api/placeholder/800/600?text=Test1', 'Test Screenshot 1', 1, 'active'),
('Test Screenshot 2', 'Ein weiterer Test-Screenshot', 'portfolio', '/api/placeholder/800/600?text=Test2', 'Test Screenshot 2', 2, 'active')
ON CONFLICT DO NOTHING;

-- 6. Prüfe Ergebnis
SELECT id, title, category, image_url, status FROM screenshots LIMIT 5;