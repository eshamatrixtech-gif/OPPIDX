const NAMED_ENTITIES: Record<string, string> = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“',
  mdash: '—', ndash: '–', hellip: '…',
}

function decodeEntities(text: string): string {
  return text.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (match, code: string) => {
    if (code[0] === '#') {
      const codePoint = code[1] === 'x' || code[1] === 'X'
        ? parseInt(code.slice(2), 16)
        : parseInt(code.slice(1), 10)
      return Number.isFinite(codePoint) ? String.fromCodePoint(codePoint) : match
    }
    return NAMED_ENTITIES[code] ?? match
  })
}

/** Strips tags from API-supplied HTML down to plain text. Some sources (e.g.
 * Greenhouse) return HTML that's itself entity-encoded — tags appear as
 * "&lt;div&gt;" rather than "<div>" — so entities are decoded before AND
 * after tag-stripping to unwrap both that and ordinary nested entities. */
export function stripHtml(html: string): string {
  const withRealTags = decodeEntities(html)
  const textOnly = withRealTags.replace(/<[^>]*>/g, ' ')
  return decodeEntities(textOnly).replace(/\s+/g, ' ').trim()
}
