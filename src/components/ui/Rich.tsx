import { Fragment, type ElementType } from 'react'

/**
 * Renders a content string in which **double asterisks** mark a key term.
 * Safe: plain React text nodes, no HTML parsing. Unmatched ** are shown literally.
 */
export function Rich({ text, as: Tag = Fragment as ElementType, className }: { text?: string; as?: ElementType; className?: string }) {
  if (!text) return null
  const parts = text.split(/(\*\*[^*]+?\*\*)/g)
  const nodes = parts.map((p, i) =>
    p.length > 4 && p.startsWith('**') && p.endsWith('**') ? (
      <strong key={i} className="font-semibold text-paper">
        {p.slice(2, -2)}
      </strong>
    ) : (
      <Fragment key={i}>{p}</Fragment>
    ),
  )
  if (Tag === Fragment) return <>{nodes}</>
  return <Tag className={className}>{nodes}</Tag>
}

/** Plain text with the ** markers removed (for aria-labels, titles). */
export const plain = (text?: string) => (text ?? '').replace(/\*\*([^*]+?)\*\*/g, '$1')
