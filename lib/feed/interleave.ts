export type FeedSlot<A, B> = { kind: 'primary'; item: A } | { kind: 'secondary'; item: B }

/**
 * Interleaves a secondary list into a primary one at a fixed interval —
 * every N primary items, one secondary item, cycling through until the
 * secondary list runs out (never repeats, never pads with nothing real).
 * Used to fold Pulse digest cards into the opportunities feed instead of
 * giving Pulse its own tab or its own paginated section.
 */
export function interleave<A, B>(primary: A[], secondary: B[], every: number): FeedSlot<A, B>[] {
  if (secondary.length === 0) return primary.map(item => ({ kind: 'primary' as const, item }))

  const result: FeedSlot<A, B>[] = []
  let secondaryIndex = 0
  primary.forEach((item, i) => {
    result.push({ kind: 'primary', item })
    if ((i + 1) % every === 0 && secondaryIndex < secondary.length) {
      result.push({ kind: 'secondary', item: secondary[secondaryIndex] })
      secondaryIndex++
    }
  })
  return result
}
