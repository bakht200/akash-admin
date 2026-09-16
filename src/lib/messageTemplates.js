/** Resolve only [Name]. Other bracketed placeholders stay visible in the draft. */
export function applyTemplateName(text, firstName) {
  const name = String(firstName || '').trim()
  if (!name) return String(text || '')
  return String(text || '').split('[Name]').join(name)
}
