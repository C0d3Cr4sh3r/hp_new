# Projekt-Migrations-Plan: PHP zu Next.js Hybrid-Lösung

## 🎯 Zielsetzung
- Zusammenlegung zweier PHP-Projekte in ein modernes Next.js-Frontend
- Beibehaltung der bestehenden Supabase-Datenbankstruktur
- Vollständige Übernahme des Event-Systems
- Klare Trennung zwischen den verschiedenen Bereichen

## 🏗️ Empfohlene Architektur

### **Option 1: Hybrid-Lösung (Empfohlen)**
```
hp_new/
├── src/app/                    # Next.js Frontend (Haupt-Website)
│   ├── (main)/                # Haupt-Website Routen
│   ├── (arcane)/              # ArcanePixels Bereich
│   ├── api/                   # Next.js API Routes
│   └── components/            # Shared Components
├── php-backend/               # PHP API Server
│   ├── api/                   # PHP API Endpoints
│   ├── events/                # Event-System (PHP)
│   ├── database/              # Supabase Integration
│   └── legacy/                # Bestehende PHP-Logik
└── shared/
    ├── types/                 # TypeScript Interfaces
    └── utils/                 # Geteilte Utilities
```

### **Option 2: Vollständige Next.js Migration**
```
hp_new/
├── src/app/
│   ├── (main)/               # Haupt-Website
│   ├── (arcane)/             # ArcanePixels Bereich  
│   ├── api/                  # Alle APIs in Next.js
│   │   ├── events/           # Event-System (TypeScript)
│   │   ├── supabase/         # Datenbank-Operationen
│   │   └── legacy/           # Migrierte PHP-Logik
│   └── components/
├── lib/
│   ├── supabase/             # Supabase Client
│   ├── events/               # Event-Management
│   └── database/             # Database Utilities
└── types/                    # TypeScript Definitionen
```

## 🔗 Routing & Verlinkung mit klaren Grenzen

### **URL-Struktur**
- `https://hp-new.vercel.app/` - Haupt-Website (bestehend)
- `https://hp-new.vercel.app/arcane/` - ArcanePixels Bereich
- `https://hp-new.vercel.app/api/` - Gemeinsame APIs
- `https://hp-new.vercel.app/events/` - Event-System

### **Navigation-Konzept**
```typescript
// Separate Navigation-Komponenten
<MainNavigation />      // Für Haupt-Website
<ArcaneNavigation />    // Für ArcanePixels Bereich
<SharedNavigation />    // Gemeinsame Elemente

// Klare Trennung durch Route Groups
app/
├── (main)/            # Layout für Haupt-Website
├── (arcane)/          # Layout für ArcanePixels
└── layout.tsx         # Root Layout (shared)
```

## 📊 Datenbank-Strategie

### **Supabase Integration**
```typescript
// lib/supabase/client.ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Bestehende Tabellenstruktur beibehalten
interface Database {
  events: {
    // Bestehende Event-Struktur
  }
  // Weitere bestehende Tabellen...
}
```

### **Event-System Übernahme**
```typescript
// lib/events/manager.ts
export class EventManager {
  // Direkte Übernahme der PHP-Event-Logik
  async createEvent(data: EventData) {
    // Supabase Integration
    return await supabase.from('events').insert(data)
  }
  
  async getEvents(filters?: EventFilters) {
    // Bestehende Filter-Logik übernehmen
  }
}
```

## 🚀 Migrations-Phasen

### **Phase 1: Vorbereitung**
- [ ] Supabase Client Setup in Next.js
- [ ] TypeScript Interfaces für bestehende Datenstrukturen
- [ ] PHP-Backend als temporäre API beibehalten

### **Phase 2: Frontend Migration**  
- [ ] ArcanePixels Komponenten in Next.js erstellen
- [ ] Routing-Struktur mit Route Groups implementieren
- [ ] Shared Components entwickeln

### **Phase 3: Backend Integration**
- [ ] Event-System in TypeScript migrieren
- [ ] Supabase-Operationen implementieren
- [ ] API-Endpunkte testen

### **Phase 4: Finalisierung**
- [ ] PHP-Backend schrittweise abbauen
- [ ] Performance-Optimierung
- [ ] Testing & Deployment

## 💡 Konkrete Umsetzungs-Schritte

### **1. Route Groups Setup**
```bash
mkdir -p src/app/\(main\)
mkdir -p src/app/\(arcane\)
mv src/app/page.tsx src/app/\(main\)/page.tsx
```

### **2. Supabase Integration**
```bash
npm install @supabase/supabase-js
npm install @supabase/auth-helpers-nextjs
```

### **3. Environment Setup**
```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
DATABASE_URL=your_database_connection
```

## 🎨 Design-Konsistenz

### **Gemeinsame Design-Tokens**
```typescript
// tailwind.config.ts erweitern
export default {
  theme: {
    extend: {
      colors: {
        'main': { /* Haupt-Website Farben */ },
        'arcane': { /* ArcanePixels Farben */ },
        'shared': { /* Gemeinsame Farben */ }
      }
    }
  }
}
```

### **Component Library**
```
src/components/
├── ui/                 # Shared UI Components
├── main/              # Haupt-Website spezifisch
├── arcane/            # ArcanePixels spezifisch
└── layout/            # Layout Components
```

## 🔧 Entwickler-Experience

### **Unified Development**
```json
// package.json scripts erweitern
{
  "scripts": {
    "dev": "next dev",
    "dev:php": "php -S localhost:8000 -t php-backend",
    "dev:full": "concurrently \"npm run dev\" \"npm run dev:php\"",
    "migrate:events": "node scripts/migrate-events.js"
  }
}
```

### **TypeScript Integration**
```typescript
// types/database.ts
export interface EventData {
  // Bestehende Event-Struktur aus PHP übernehmen
}

export interface ArcaneProject {
  // ArcanePixels Projekt-Struktur
}
```

## 📋 Empfohlene Reihenfolge

1. **Sofort starten**: Route Groups Setup für klare Trennung
2. **Supabase Integration**: Bestehende DB-Struktur anbinden
3. **Event-System Migration**: Schrittweise von PHP zu TypeScript
4. **UI-Komponenten**: ArcanePixels Interface in Next.js
5. **Performance-Optimierung**: SSR/SSG für beide Bereiche

## 🎯 Vorteile dieser Architektur

- ✅ **Klare Trennung**: Route Groups ermöglichen separate Bereiche
- ✅ **Performance**: Next.js SSR/SSG für beide Projekte
- ✅ **Skalierbarkeit**: Modulare Architektur
- ✅ **SEO**: Optimiert für beide Bereiche
- ✅ **Wartbarkeit**: Modern TypeScript Stack
- ✅ **Flexibilität**: Schrittweise Migration möglich