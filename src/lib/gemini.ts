import { GoogleGenerativeAI } from '@google/generative-ai'

const DEFAULT_MODEL = process.env.GEMINI_MODEL ?? 'gemini-2.5-flash'

function resolveApiKey() {
  return process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY ?? process.env.GOOGLE_GEMINI_API_KEY
}

export function getGenerativeModel(options?: { systemInstruction?: string; model?: string }) {
  const apiKey = resolveApiKey()

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY ist nicht gesetzt. Bitte die Umgebungsvariable konfigurieren.')
  }

  const client = new GoogleGenerativeAI(apiKey)
  return client.getGenerativeModel({
    model: options?.model ?? DEFAULT_MODEL,
    ...(options?.systemInstruction ? { systemInstruction: options.systemInstruction } : {}),
  })
}
