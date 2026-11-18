/** Level slugs seeded by the backend (`planets`, `exams.levelSlug`, `vocab.level`). */
const LEVEL_LABELS: Record<string, string> = {
  ioe: 'IOE',
  starters: 'Starters (Pre A1)',
  movers: 'Movers (A1)',
  flyers: 'Flyers (A2)',
  toefl_primary: 'TOEFL Primary',
}

export const LEVEL_OPTIONS = Object.entries(LEVEL_LABELS).map(([value, label]) => ({
  value,
  label,
}))

export function levelLabel(slug: string): string {
  if (!slug) return '—'
  return Object.hasOwn(LEVEL_LABELS, slug) ? (LEVEL_LABELS[slug] ?? slug) : slug
}
