const SOURCE_LABELS: Record<string, string> = {
  first_hand:   'First-hand',
  observation:  'Observation',
  research:     'Research-based',
  hypothetical: 'Hypothetical',
}

const CONFIDENCE_LABELS: Record<string, string> = {
  exploring:          'Exploring',
  somewhat_confident: 'Somewhat confident',
  strong_conviction:  'Strong conviction',
  open_to_change:     'Open to being changed',
}

const DEBATE_LABELS: Record<string, string> = {
  open_to_debate:     'Open to debate',
  neutral:            'Just sharing',
  seeking_opposition: 'Seeking strong opposition',
  not_debating:       'Not looking to debate',
}

interface Props {
  sourceType:      string | null
  confidenceLevel: string | null
  debateIntent:    string | null
}

export default function PostTags({ sourceType, confidenceLevel, debateIntent }: Props) {
  const tags = [
    sourceType      ? SOURCE_LABELS[sourceType]      : null,
    confidenceLevel ? CONFIDENCE_LABELS[confidenceLevel] : null,
    debateIntent    ? DEBATE_LABELS[debateIntent]    : null,
  ].filter(Boolean) as string[]

  if (tags.length === 0) return null

  return (
    <div className="flex flex-wrap gap-1.5 mt-2 mb-3">
      {tags.map(tag => (
        <span
          key={tag}
          className="text-xs text-stone-400 border border-stone-200 px-2 py-0.5 rounded-full"
        >
          {tag}
        </span>
      ))}
    </div>
  )
}
