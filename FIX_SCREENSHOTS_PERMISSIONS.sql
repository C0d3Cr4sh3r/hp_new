-- Verbesserte RLS-Policies für Screenshots-Management
-- Führe dieses SQL in der Supabase Console aus um die Lösch-Probleme zu beheben

-- 1. Aktuelle Policies entfernen
DROP POLICY IF EXISTS "Authenticated users can manage screenshots" ON screenshots;
DROP POLICY IF EXISTS "Screenshots are viewable by everyone" ON screenshots;

-- 2. Neue, permissivere Policies für Admin-Bereich
-- Alle können Screenshots sehen
CREATE POLICY "Public read access for screenshots" ON screenshots
    FOR SELECT USING (true);

-- Alle können Screenshots erstellen (für Admin-Panel)
CREATE POLICY "Public insert access for screenshots" ON screenshots
    FOR INSERT WITH CHECK (true);

-- Alle können Screenshots bearbeiten (für Admin-Panel) 
CREATE POLICY "Public update access for screenshots" ON screenshots
    FOR UPDATE USING (true);

-- Alle können Screenshots löschen (für Admin-Panel)
CREATE POLICY "Public delete access for screenshots" ON screenshots
    FOR DELETE USING (true);

-- 3. Test: Screenshot erstellen und wieder löschen
INSERT INTO screenshots (title, description, category, image_url, image_alt, sort_order, status) 
VALUES ('Delete Test', 'Test zum Löschen', 'app', '/api/placeholder/800/600?text=DeleteTest', 'Delete Test', 999, 'active');

-- Zeige Test-Screenshot
SELECT id, title FROM screenshots WHERE title = 'Delete Test';

-- Lösche Test-Screenshot wieder (ID von oben verwenden)
-- DELETE FROM screenshots WHERE title = 'Delete Test';

-- 4. Überprüfe finale Screenshots
SELECT id, title, category, status FROM screenshots ORDER BY id;