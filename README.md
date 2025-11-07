# ArcanePixels Admin Hub

Next.js 16 App-Router Projekt mit TypeScript, Tailwind CSS und einer Supabase-Anbindung für redaktionelle Inhalte. Der Admin-Bereich bündelt Downloads, News-Management, Theme-Konfiguration sowie einen Gemini-gestützten KI-Assistenten.

## Features

- **ArcanePixels Control Center**: Downloads, News/Changelog, Theme- und Bug-Panels in einer App-Router Seite.
- **Supabase-News**: News werden serverseitig über `/api/news` persistiert (CRUD via Service-Route + Admin-UI).
- **Supabase-Downloads**: APK-Verwaltung inkl. Markdown-Changelog & SHA-256 Prüfsumme über `/api/downloads` + Admin-Panel.
- **Landing Content Editor**: Pflege die ShootingHub-Sektion (Texte, Bullet-Points, CTA + optimiertes Hero-Bild) direkt im Admin.
- **TinyMCE**: Selbst gehosteter Editor (`public/tinymce`) für strukturierte Inhalte.
- **Google Gemini Assistent**: Chat-Panel im Admin mit Quick Actions und separatem Einstellungs-Tab.
- **API-Routen**: `/api/news` (CRUD) und `/api/assistant` (Gemini Relay) kapseln serverseitige Aufrufe.

## Lokale Entwicklung

```bash
npm install
npm run dev
# erreicht den Adminbereich über http://localhost:3000/admin
```

## Umgebungsvariablen

| Variable | Beschreibung |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Projekt-URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | öffentlicher Supabase Key |
| `SUPABASE_SERVICE_ROLE_KEY` | **Erforderlich** für Admin-API-Routen (Downloads, News, Settings, etc.) |
| `ADMIN_PASSWORD` | Passwort für den geschützten Admin-Bereich (wird nicht ins Frontend geleakt) |
| `GEMINI_API_KEY` | Google Gemini API-Schlüssel (alternativ `GOOGLE_API_KEY`) |
| `GEMINI_MODEL` | optionales Standardmodell, z. B. `gemini-2.5-flash` |

> **Wichtig**: `SUPABASE_SERVICE_ROLE_KEY` ist erforderlich für alle Admin-Operationen (Downloads, News, Site Settings, etc.). Ohne diesen Schlüssel schlagen API-Aufrufe mit einem 500 Fehler fehl. Den Service Role Key finden Sie in Ihrem Supabase Projekt unter Settings > API.

### Admin-Zugriff

- Login erfolgt über `/admin/login`. Nach erfolgreicher Anmeldung wird ein HTTP-only Cookie gesetzt, das zwölf Stunden gültig ist.
- Der Admin-Bereich und alle mutierenden API-Routen (`POST/PUT/DELETE`) prüfen dieses Cookie serverseitig.
- Ohne gesetztes `ADMIN_PASSWORD` wird keine Sitzung ausgestellt; Deployment ohne Secret blockiert somit den Zugriff.

## KI-Assistent konfigurieren

- Im Admin-Dashboard gibt es zwei Tabs: **KI-Assistent** (Chat) und **Assistent Einstellungen**.
- Einstellungen (System-Prompt, Temperatur, Modell, Quick Actions) werden im Browser lokal gespeichert.
- Die Route `/api/assistant` nutzt den Gemini SDK-Client und übergibt die Einstellungen als Systeminstruktionen.
- Der Assistent erzeugt Vorschläge (read-only). Automatisierte Änderungen erfordern zusätzliche Backend-Workflows.

## News-Workflow

- Admin-News-Panel nutzt `/api/news` zum Erstellen, Auflisten und Löschen (Supabase `news` Tabelle erwartet Spalten `id`, `title`, `slug`, `content`, `status`, `created_at`, `updated_at`).
- Öffentliche Seite `src/app/(arcane)/arcane/news/page.tsx` liest die gleichen Daten über fetch `/api/news`.

## Download-Workflow

- Admin-Downloads-Panel arbeitet mit `/api/downloads` (Supabase-Tabelle `downloads` mit `title`, `version`, `file_url`, `channel`, `available_in_store`, `store_url`, `changelog_markdown`, `changelog_file_name`, `security_hash`).
- Markdown-Dateien können importiert werden; aus dem Markdown lässt sich ein SHA-256 Hash erzeugen und optional manuell überschreiben.
- Öffentliche Seite `src/app/(arcane)/arcane/downloads/page.tsx` bietet Download-Link, Store-Hinweis, Prüfsumme und Changelog-Dropdown.

## Landing-Content-Workflow

- Tabelle `tfp_sections` (Spalten `section_key` text PK, `headline` text, `subheadline` text, `description` text, `bullets` jsonb, `cta_label` text, `cta_url` text, `image_url` text, `image_alt` text, `image_width` int4, `image_height` int4, `image_storage_path` text, `created_at` timestamptz default now(), `updated_at` timestamptz).
- Storage-Bucket `landing-assets` (öffentlich). Uploads laufen über `/api/shootinghub-section/upload` und werden serverseitig mit [`sharp`](https://sharp.pixelplumbing.com/) auf max. 1600 px Breite (900 px Höhe, fit `inside`) reduziert und als WebP abgelegt.
- Admin-Tab **Landing Content** (`src/components/admin/landing/LandingContentPanel.tsx`) verwaltet Texte, Bullet-Points, CTA-Link sowie das optimierte Hero-Bild.
- Öffentliche Sektion (`src/components/arcane/ArcaneGallery.tsx`, Abschnitt `#shootinghub`) lädt Inhalte über `/api/shootinghub-section` und fällt bei fehlenden Daten auf `DEFAULT_SHOOTINGHUB_SECTION` zurück.

## Fehlerbehebung

### Site Settings API 500 Fehler
Wenn beim Laden oder Speichern der Site Settings ein 500 Fehler auftritt:
1. Prüfen Sie, ob `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` gesetzt ist
2. Der Service Role Key ist unter Supabase Dashboard > Settings > API zu finden
3. Nach dem Setzen der Variable den Server neu starten: `npm run dev`

Weitere Details siehe [SITE_SETTINGS_FIX.md](./SITE_SETTINGS_FIX.md)

## Tests & Linting

```bash
npm run lint
```
