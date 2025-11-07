# Screenshot Storage Setup Guide

## 🎯 Übersicht

Das Screenshot-Management-System ist jetzt vollständig implementiert und bereit für die Verwendung mit Supabase Storage.

## 📋 Setup-Schritte

### 1. Supabase Datenbank Setup

1. Öffne die **Supabase-Console**: https://app.supabase.com/project/pxiunkdwrferlunaroqd/sql/new
2. Füge den kompletten SQL-Code aus `SETUP_SCREENSHOTS_DATABASE.sql` ein
3. Führe das Skript aus (**RUN** Button)

### 2. Überprüfe Storage-Bucket

1. Gehe zu **Storage** in der Supabase-Console
2. Prüfe, ob der Bucket `screenshots` existiert
3. Falls nicht, erstelle ihn manuell:
   - Name: `screenshots`
   - Public: ✅ **Ja** 
   - Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`, `image/gif`
   - File size limit: `50MB`

### 3. Teste das System

1. **Development Server**: http://localhost:3001
2. **Admin Panel**: http://localhost:3001/admin → Screenshots Tab
3. **Public Gallery**: http://localhost:3001 → Screenshots Sektion

## 🚀 Features

### ✅ Vollständig implementiert:

- **Screenshot Upload** mit automatischer WebP-Konvertierung
- **Kategorisierung** (App, Portfolio, Marketing, Websites)
- **Admin Interface** mit CRUD-Operationen
- **Responsive Gallery** mit Lightbox
- **Supabase Storage** Integration
- **Fallback zu Mock-Daten** bei DB-Fehlern

### 🎨 Admin Panel Features:

- **Drag & Drop Upload**
- **Live Preview**
- **Kategorieverwaltung**
- **Sortierung**
- **Bearbeitung/Löschung**

### 🔧 API Endpoints:

- `GET /api/screenshots` - Alle Screenshots
- `GET /api/screenshots?category=app` - Nach Kategorie
- `POST /api/screenshots` - Neuer Screenshot
- `PUT /api/screenshots/[id]` - Screenshot bearbeiten
- `DELETE /api/screenshots/[id]` - Screenshot löschen
- `POST /api/screenshots/upload` - Datei-Upload

## 🔐 Sicherheit

- **Row Level Security (RLS)** aktiviert
- **Öffentlicher Lesezugriff** für Screenshots
- **Authentifizierung erforderlich** für Upload/Edit/Delete
- **Bildoptimierung** mit Sharp (WebP, Größenanpassung)

## 📁 Kategorien

- **app** - ShootingHub App Screenshots
- **portfolio** - Portfolio/Shooting Beispiele  
- **marketing** - Marketing/Landing Pages
- **websites** - Web-Entwicklungsprojekte

## 🛠️ Troubleshooting

### Mock-Daten werden angezeigt?
1. Prüfe Supabase-Verbindung in der Browser-Konsole
2. Führe das SQL-Setup-Skript aus
3. Überprüfe die Umgebungsvariablen in `.env.local`

### Upload funktioniert nicht?
1. Prüfe Storage-Bucket-Existenz
2. Überprüfe Storage-Policies
3. Teste mit kleiner Datei (<5MB)

### Bilder werden nicht angezeigt?
1. Prüfe öffentliche Storage-URL
2. Überprüfe CORS-Einstellungen in Supabase
3. Teste direkte Bild-URLs

## 📞 Next Steps

1. **Führe das SQL-Setup aus** (`SETUP_SCREENSHOTS_DATABASE.sql`)
2. **Lade Screenshots hoch** über Admin Panel
3. **Teste die öffentliche Galerie**
4. **Customize Categories** nach Bedarf

Das System ist produktionsbereit und vollständig funktional! 🎉