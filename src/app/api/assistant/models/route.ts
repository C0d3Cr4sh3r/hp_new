import { NextResponse } from 'next/server'

interface GoogleModel {
  name: string
  displayName: string
  description?: string
  supportedGenerationMethods?: string[]
}

interface GoogleModelsResponse {
  models: GoogleModel[]
}

// Preisinfos basierend auf Google's offizieller Preisliste
// https://ai.google.dev/pricing
// Stand: Dezember 2024 - Preise können sich ändern!
const MODEL_PRICING: Record<string, { free: boolean; inputPer1M?: number; outputPer1M?: number; note?: string }> = {
  // Gemini 2.5 Flash - Kostenlos mit Limits
  'gemini-2.5-flash': { free: true, note: 'Kostenlos (Fair-Use-Limit)' },
  'gemini-2.5-flash-preview-05-20': { free: true, note: 'Kostenlos (Fair-Use-Limit)' },

  // Gemini 2.5 Pro - Kostenpflichtig
  'gemini-2.5-pro': { free: false, inputPer1M: 1.25, outputPer1M: 10.00, note: 'Kostenpflichtig' },
  'gemini-2.5-pro-preview-05-06': { free: false, inputPer1M: 1.25, outputPer1M: 10.00, note: 'Kostenpflichtig' },

  // Gemini 2.0 Flash - Kostenlos
  'gemini-2.0-flash': { free: true, note: 'Kostenlos (Fair-Use-Limit)' },
  'gemini-2.0-flash-exp': { free: true, note: 'Kostenlos (experimentell)' },
  'gemini-2.0-flash-lite': { free: true, note: 'Kostenlos (Fair-Use-Limit)' },

  // Fallback für unbekannte Modelle
  'default-flash': { free: true, note: 'Vermutlich kostenlos' },
  'default-pro': { free: false, inputPer1M: 1.25, outputPer1M: 5.00, note: 'Vermutlich kostenpflichtig' },
}

function getPricing(modelId: string): { free: boolean; inputPer1M?: number; outputPer1M?: number; note: string } {
  // Exakte Übereinstimmung prüfen
  if (MODEL_PRICING[modelId]) {
    return MODEL_PRICING[modelId] as { free: boolean; inputPer1M?: number; outputPer1M?: number; note: string }
  }

  // Fallback basierend auf Modelltyp
  if (modelId.includes('flash')) {
    return { free: true, note: 'Vermutlich kostenlos (Flash)' }
  }
  if (modelId.includes('pro') || modelId.includes('ultra')) {
    return { free: false, inputPer1M: 1.25, outputPer1M: 5.00, note: 'Vermutlich kostenpflichtig' }
  }

  return { free: true, note: 'Preis unbekannt' }
}

export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      { error: 'GEMINI_API_KEY nicht konfiguriert' },
      { status: 500 }
    )
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        next: { revalidate: 3600 }, // Cache für 1 Stunde
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Google API Fehler:', errorText)
      return NextResponse.json(
        { error: 'Konnte Modelle nicht laden' },
        { status: response.status }
      )
    }

    const data: GoogleModelsResponse = await response.json()

    // Nur relevante Modelle filtern:
    // - Muss generateContent unterstützen (Chat-fähig)
    // - Muss "gemini" im Namen haben
    // - Keine veralteten 1.0/1.5 Versionen
    // - Keine reinen Embedding/Vision-only Modelle
    // - Keine "tuning" oder "aqa" Modelle
    const chatModels = data.models
      .filter((model) => {
        const modelId = model.name.replace('models/', '')

        // Muss Chat-fähig sein
        if (!model.supportedGenerationMethods?.includes('generateContent')) return false

        // Muss Gemini sein
        if (!modelId.includes('gemini')) return false

        // Alte Versionen ausschließen (1.0, 1.5)
        if (modelId.includes('gemini-1.0') || modelId.includes('gemini-1.5')) return false

        // Spezielle Modelle ausschließen
        if (modelId.includes('tuning') || modelId.includes('aqa') || modelId.includes('embedding')) return false

        // Nur Haupt-Modelle (flash, pro, ultra) - keine Thinking-Varianten
        if (modelId.includes('thinking')) return false

        return true
      })
      .map((model) => {
        // "models/gemini-2.0-flash" -> "gemini-2.0-flash"
        const modelId = model.name.replace('models/', '')

        // Kategorisierung für bessere Sortierung
        let priority = 50
        let recommended = false
        let tier: 'fast' | 'balanced' | 'powerful' = 'balanced'

        // Neueste Versionen priorisieren
        if (modelId.includes('2.5')) priority = 10
        else if (modelId.includes('2.0')) priority = 20

        // Flash = schnell & günstig (empfohlen für die meisten Aufgaben)
        if (modelId.includes('flash')) {
          tier = 'fast'
          if (!modelId.includes('exp')) {
            recommended = true
            priority -= 5
          }
        }

        // Pro = ausgewogen
        if (modelId.includes('pro')) {
          tier = 'balanced'
        }

        // Ultra = maximale Power
        if (modelId.includes('ultra')) {
          tier = 'powerful'
          priority += 5
        }

        // Experimentelle Modelle ans Ende, aber noch sichtbar
        if (modelId.includes('exp')) {
          priority += 15
        }

        // Preisinformationen holen
        const pricing = getPricing(modelId)

        return {
          value: modelId,
          label: model.displayName || modelId,
          description: model.description,
          recommended,
          tier,
          priority,
          free: pricing.free,
          pricing: {
            inputPer1M: pricing.inputPer1M,
            outputPer1M: pricing.outputPer1M,
            note: pricing.note,
          },
        }
      })
      .sort((a, b) => a.priority - b.priority)
      // Maximal 10 Modelle anzeigen
      .slice(0, 10)

    return NextResponse.json({
      models: chatModels,
      pricingSource: 'https://ai.google.dev/pricing',
      pricingDate: '2024-12',
    })
  } catch (error) {
    console.error('Fehler beim Laden der Modelle:', error)
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    )
  }
}

