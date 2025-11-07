import { NextRequest, NextResponse } from 'next/server'
import { getGenerativeModel } from '@/lib/gemini'
import { ensureAdminAccess } from '@/lib/admin/serverAuth'

const DEFAULT_SYSTEM_INSTRUCTION = `Du bist der KI-Assistent für den ArcanePixels Admin-Bereich. Du hilfst bei redaktionellen Texten, Bug-Priorisierungen und Content-Strategien. Antworte strukturiert, konkret und in gutem Deutsch. Wenn Informationen fehlen, stelle Rückfragen.`

type ConversationMessage = {
  role: 'user' | 'assistant'
  content: string
}

type AssistantRequestBody = {
  messages?: ConversationMessage[]
  instructions?: string
  temperature?: number
  model?: string
}

function normalizeMessages(messages: ConversationMessage[]): { role: 'user' | 'model'; parts: Array<{ text: string }> }[] {
  return messages
    .filter((message) => typeof message?.content === 'string' && message.content.trim().length > 0)
    .map((message) => ({
      role: message.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: message.content.trim() }],
    }))
}

export async function POST(request: NextRequest) {
  const authResponse = ensureAdminAccess(request)
  if (authResponse) {
    return authResponse
  }

  try {
    const body = (await request.json()) as AssistantRequestBody

    const messages = Array.isArray(body.messages) ? body.messages : []
    if (messages.length === 0) {
      return NextResponse.json(
        { error: 'Keine Konversation übergeben.' },
        { status: 400 },
      )
    }

    const systemInstruction = [DEFAULT_SYSTEM_INSTRUCTION, body.instructions?.trim()]
      .filter((value) => value && value.length > 0)
      .join('\n\nZusätzliche Hinweise:\n')

    const temperature = typeof body.temperature === 'number' ? Math.min(Math.max(body.temperature, 0), 1) : 0.7

    const model = getGenerativeModel({
      systemInstruction,
      model: body.model,
    })

    const contents = normalizeMessages(messages)
    if (contents.length === 0) {
      return NextResponse.json(
        { error: 'Mindestens eine Nachricht mit Inhalt wird benötigt.' },
        { status: 400 },
      )
    }

    const result = await model.generateContent({
      contents,
      generationConfig: {
        temperature,
      },
    })

    const text = result?.response?.text()?.trim()
    if (!text) {
      return NextResponse.json(
        { reply: 'Ich konnte keine sinnvolle Antwort erzeugen.' },
        { status: 200 },
      )
    }

    return NextResponse.json({ reply: text })
  } catch (error) {
    console.error('Assistant invocation failed:', error)
    const message =
      error instanceof Error && typeof error.message === 'string'
        ? error.message
        : 'Unbekannter Fehler beim Aufruf des KI-Assistenten.'

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
