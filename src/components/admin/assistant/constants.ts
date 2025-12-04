import type { AssistantSettings } from './types'

export const ASSISTANT_SETTINGS_STORAGE_KEY = 'arcane-admin-assistant-settings-v1'

export const DEFAULT_ASSISTANT_SETTINGS: AssistantSettings = {
  instructions:
    'Du bist der KI-Assistent für den ArcanePixels Admin-Bereich. Hilf bei Content-Entwürfen, Bug-Priorisierungen und redaktionellen Aufgaben. Wenn du dir unsicher bist, frage nach weiteren Details.',
  temperature: 0.7,
  enableQuickActions: true,
  model: 'gemini-2.5-flash',
  enableGlobalAssistant: false,
}

export const AVAILABLE_GEMINI_MODELS: Array<{ value: string; label: string; recommended?: boolean }> = [
  { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash (schnell)', recommended: true },
  { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro (präzise)' },
]
