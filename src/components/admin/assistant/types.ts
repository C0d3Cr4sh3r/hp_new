export type AssistantSettings = {
  instructions: string
  temperature: number
  enableQuickActions: boolean
  model: string
  enableGlobalAssistant: boolean
}

export type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: number
}
