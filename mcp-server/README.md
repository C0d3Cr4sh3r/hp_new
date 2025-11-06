# Next.js Project MCP Server

Ein Model Context Protocol (MCP) Server für erweiterte Projektanalyse und -management.

## Features

### 🔍 Projektanalyse
- **Projektstruktur**: Vollständige Verzeichnisbaum-Analyse
- **Package-Info**: Dependencies und Scripts-Analyse  
- **Komponenten-Discovery**: React/Next.js Komponenten finden und analysieren
- **Build-Status**: Next.js Konfiguration und Build-Informationen

### 🛠️ Verfügbare Tools

#### `read_project_structure`
Analysiert die vollständige Projektverzeichnisstruktur.
```json
{
  "path": "." // Optional: Spezifischer Pfad (Standard: Projektwurzel)
}
```

#### `get_package_info`
Liefert detaillierte package.json Informationen.
```json
{} // Keine Parameter erforderlich
```

#### `analyze_components`
Findet und analysiert React-Komponenten im Projekt.
```json
{
  "directory": "src/app" // Optional: Verzeichnis (Standard: src/app)
}
```

#### `get_build_info`
Zeigt Next.js Konfiguration und Build-Status.
```json
{} // Keine Parameter erforderlich
```

## Installation & Setup

### 1. Dependencies installieren
```bash
cd mcp-server
npm install
```

### 2. Server starten
```bash
npm start
# oder für Development mit Watch-Mode:
npm run dev
```

### 3. VS Code Integration
Der Server ist bereits in `.vscode/mcp-config.json` konfiguriert:

```json
{
  "mcpServers": {
    "nextjs-project": {
      "command": "node",
      "args": ["./mcp-server/index.js"],
      "cwd": ".",
      "env": {
        "NODE_ENV": "development"
      }
    }
  }
}
```

## Entwicklung

### Architektur
- **Framework**: Model Context Protocol SDK
- **Transport**: StdIO (Standard Input/Output)
- **Sprache**: JavaScript (ES Modules)
- **Error Handling**: Umfassende Fehlerbehandlung mit McpError

### Code-Struktur
```
mcp-server/
├── index.js          # Haupt-Server-Implementation
├── package.json      # Dependencies und Scripts
├── .gitignore        # Git-Ausschlüsse
└── node_modules/     # Dependencies (automatisch installiert)
```

### Error Handling
Der Server behandelt folgende Fehlertypen:
- `MethodNotFound`: Unbekannte Tool-Aufrufe
- `InternalError`: Server-interne Fehler
- Dateisystem-Fehler mit graceful fallbacks

### Performance-Optimierungen
- **Tiefenbegrenzung**: Verhindert endlose Rekursion bei Verzeichnisanalyse
- **Smart Filtering**: Überspringt node_modules, .git, .next automatisch
- **Async Operations**: Alle I/O-Operationen sind asynchron

## Debugging

### Server-Logs
```bash
# Server mit Debug-Output starten
NODE_ENV=development npm start
```

### Häufige Probleme

#### Server startet nicht
- Überprüfen Sie Node.js Version (>=18.0.0 empfohlen)
- Stellen Sie sicher, dass Dependencies installiert sind: `npm install`

#### Tool-Aufrufe schlagen fehl
- Überprüfen Sie die Parameter-Syntax (JSON-Format erforderlich)
- Stellen Sie sicher, dass Dateipfade existieren und lesbar sind

## Erweiterte Nutzung

### Custom Tool Development
Neue Tools können durch Erweiterung der `setupToolHandlers()` Methode hinzugefügt werden:

```javascript
// Neues Tool registrieren
this.server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      // ... bestehende Tools
      {
        name: 'custom_tool',
        description: 'Beschreibung des neuen Tools',
        inputSchema: {
          type: 'object',
          properties: {
            // Parameter-Definition
          }
        }
      }
    ]
  };
});

// Tool-Handler implementieren
case 'custom_tool':
  return await this.handleCustomTool(args);
```

### Integration mit anderen MCP-Clients
Der Server ist kompatibel mit allen MCP-Standard-Clients:
- Claude Desktop
- VS Code mit MCP-Extension
- Andere MCP-kompatible IDEs

## Roadmap

### Geplante Features
- [ ] Git-Integration (Branch-Info, Commit-History)
- [ ] Performance-Metriken (Bundle-Größe, Build-Zeit)
- [ ] Dependency-Vulnerability-Scanning  
- [ ] Automatische Code-Qualitäts-Checks
- [ ] Test-Coverage-Reports
- [ ] Deployment-Status-Monitoring

### Version History
- **v1.0.0**: Initial Release mit Grundfunktionalität
  - Projektstruktur-Analyse
  - Package-Info-Extraktion
  - Komponenten-Discovery
  - Build-Status-Monitoring

## Contributing

Contributions sind willkommen! Bitte:
1. Fork das Repository
2. Erstelle einen Feature-Branch
3. Implementiere Tests für neue Features
4. Erstelle einen Pull Request

## License

MIT License - siehe [LICENSE](../LICENSE) für Details.