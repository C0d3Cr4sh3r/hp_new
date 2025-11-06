# GitHub Actions Workflows

Dieses Projekt enthält mehrere GitHub Actions Workflows für CI/CD und Automatisierung:

## 🔧 CI Workflow (`.github/workflows/ci.yml`)
- **Trigger**: Push auf `main` und `develop`, Pull Requests auf `main`
- **Funktionen**:
  - Testet mit Node.js 18.x und 20.x
  - Führt ESLint aus
  - Baut das Projekt
  - Führt Tests aus (falls vorhanden)
  - Lädt Build-Artefakte hoch

## 🚀 Deploy Workflow (`.github/workflows/deploy.yml`)
- **Trigger**: Push auf `main`, manueller Trigger
- **Funktionen**:
  - Baut das Projekt für Produktion
  - Deployed auf Vercel (nach Konfiguration der Secrets)

### Erforderliche Secrets für Deployment:
- `VERCEL_TOKEN`: Vercel-Authentifizierungstoken
- `ORG_ID`: Vercel-Organisation ID
- `PROJECT_ID`: Vercel-Projekt ID

## 🔒 Security Workflow (`.github/workflows/security.yml`)
- **Trigger**: Wöchentlich montags um 2 Uhr, Push/PR auf `main`
- **Funktionen**:
  - NPM Security Audit
  - Vulnerability Scanning
  - Überprüfung veralteter Pakete

## 📦 Dependabot (`.github/dependabot.yml`)
- **Automatische Updates**:
  - NPM-Pakete: Wöchentlich
  - GitHub Actions: Wöchentlich
- **Target Branch**: `develop`
- **PR-Limit**: 5 offene PRs

## Setup-Anweisungen

1. **Vercel-Integration**:
   ```bash
   # Vercel CLI installieren
   npm i -g vercel
   
   # Projekt zu Vercel hinzufügen
   vercel link
   
   # Secrets in GitHub Repository hinzufügen:
   # - VERCEL_TOKEN: von Vercel Dashboard
   # - ORG_ID: aus .vercel/project.json
   # - PROJECT_ID: aus .vercel/project.json
   ```

2. **Branch Protection Rules** (empfohlen):
   - `main` Branch schützen
   - PR Reviews erforderlich
   - Status Checks erforderlich (CI Workflow)

3. **Environments**:
   - `production` Environment für Deploy-Workflow erstellen
   - Deployment-Regeln konfigurieren