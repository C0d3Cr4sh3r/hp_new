-- Seed Daten für die Entwicklung

-- Admin User Profile erstellen (falls nicht vorhanden)
INSERT INTO user_profiles (id, name, role, bio) 
VALUES (
    '00000000-0000-0000-0000-000000000000', 
    'Admin User', 
    'admin', 
    'System Administrator für Screenshot-Management'
) ON CONFLICT (id) DO NOTHING;

-- Zusätzliche Screenshot-Beispiele für Entwicklung
INSERT INTO screenshots (title, description, category, file_name, file_path, alt_text, sort_order, is_featured) VALUES
('Mobile App View', 'Responsive Design auf mobilen Geräten', 'app', 'mobile-view.webp', '/screenshots/app/mobile-view.webp', 'Mobile Ansicht der App', 5, false),
('Admin Panel', 'Verwaltungsbereich für Fotografen und Events', 'app', 'admin-panel.webp', '/screenshots/app/admin-panel.webp', 'Administrator Panel', 6, false),
('Event Calendar', 'Kalender-Integration für Event-Übersicht', 'app', 'calendar-view.webp', '/screenshots/app/calendar-view.webp', 'Event Kalender Ansicht', 7, false),
('Client Portfolio', 'Beispiel Kunden-Portfolio Website', 'portfolio', 'client-portfolio.webp', '/screenshots/portfolio/client-portfolio.webp', 'Kunden Portfolio Beispiel', 8, true),
('Photography Showcase', 'Professionelle Fotografie-Präsentation', 'portfolio', 'photo-showcase.webp', '/screenshots/portfolio/photo-showcase.webp', 'Fotografie Showcase', 9, false),
('Service Landing', 'Service-orientierte Landing Page', 'marketing', 'service-landing.webp', '/screenshots/marketing/service-landing.webp', 'Service Landing Page', 10, false),
('Contact Form', 'Kontaktformular für Kundenanfragen', 'marketing', 'contact-form.webp', '/screenshots/marketing/contact-form.webp', 'Kontakt Formular', 11, false)
ON CONFLICT (title) DO NOTHING;