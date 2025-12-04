const SCRIPT_TAG_REGEX = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi
const EVENT_HANDLER_ATTR_REGEX = /\son[a-z]+\s*=\s*("[^"]*"|'[^']*')/gi
const DANGEROUS_PROTOCOL_REGEX = /(href|src)\s*=\s*("|')(javascript:|data:)([^"']*)("|')/gi
const INLINE_STYLE_IMPORT_REGEX = /style\s*=\s*("|')[^"']*(expression|url\s*\()[^"']*("|')/gi
const UNSAFE_TAG_REGEX = /<\/?(iframe|object|embed|form|input|button|link|meta|style)[^>]*>/gi
const HTML_TAG_REGEX = /<\/?[a-z][^>]*>/i

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const normalizeLineBreaks = (value: string): string => value.replace(/\r\n?/g, '\n')

const convertPlainTextToHtml = (value: string): string => {
  const normalized = normalizeLineBreaks(value)
  const paragraphs = normalized.split(/\n{2,}/g)

  return paragraphs
    .map((paragraph) => {
      const trimmed = paragraph.trim()
      if (!trimmed) return ''
      const withLineBreaks = escapeHtml(trimmed).replace(/\n/g, '<br />')
      return `<p>${withLineBreaks}</p>`
    })
    .filter(Boolean)
    .join('\n')
}

const sanitizeHtml = (value: string): string =>
  value
    .replace(SCRIPT_TAG_REGEX, '')
    .replace(UNSAFE_TAG_REGEX, '')
    .replace(EVENT_HANDLER_ATTR_REGEX, '')
    .replace(DANGEROUS_PROTOCOL_REGEX, '$1="#"')
    .replace(INLINE_STYLE_IMPORT_REGEX, '')

export const prepareLegalHtml = (content: string | null | undefined): string | null => {
  if (typeof content !== 'string') {
    return null
  }

  const trimmed = content.trim()
  if (!trimmed) {
    return null
  }

  if (HTML_TAG_REGEX.test(trimmed)) {
    return sanitizeHtml(trimmed)
  }

  return convertPlainTextToHtml(trimmed)
}
