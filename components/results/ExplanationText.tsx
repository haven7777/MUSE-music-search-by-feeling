'use client'

interface ExplanationTextProps {
  text: string
}

export function ExplanationText({ text }: ExplanationTextProps) {
  return (
    <p
      className="text-[0.78rem] italic leading-relaxed mt-2 pl-3"
      style={{
        color: 'rgba(148, 163, 184, 0.85)', // ~0.65 opacity for better contrast
        borderLeft: '2px solid var(--muse-primary)',
      }}
    >
      {text}
    </p>
  )
}
