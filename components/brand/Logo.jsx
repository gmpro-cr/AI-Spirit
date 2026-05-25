import Link from 'next/link'

/**
 * AI Spirit — spirit-flame mark + Crimson Text wordmark
 *
 * Mark anatomy (viewBox 0 0 22 34):
 *   • Elongated teardrop/flame — outline only (stroke, no fill)
 *     widest point sits at ~72% down the height, mimicking real fire
 *   • Center filled node at the widest zone — the AI within the spirit
 */
export default function Logo({ size = 'md', dark = false, markOnly = false, className = '' }) {
  const cfg = {
    sm: { w: 14, h: 21, fontSize: '0.95rem', gap: '0.55rem' },
    md: { w: 18, h: 28, fontSize: '1.2rem',  gap: '0.65rem' },
    lg: { w: 26, h: 40, fontSize: '1.6rem',  gap: '0.85rem' },
  }

  const { w, h, fontSize, gap } = cfg[size] ?? cfg.md
  const ink = dark ? '#ffffff' : '#0a0a0a'

  // ViewBox 22 × 34
  // Tip: (11, 1.5)  — symmetrical, vertical axis
  // Widest: x 1→21 at y ≈ 24.5  (72% of height)
  // Base:   (11, 32.5)
  const glyph = (
    <svg
      width={w}
      height={h}
      viewBox="0 0 22 34"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ flexShrink: 0, display: 'block' }}
    >
      {/* Spirit flame — outline only */}
      <path
        d="M 11 1.5
           C 19 6,  21 16, 21 24
           C 21 30, 17 33, 11 33
           C  5 33,  1 30,  1 24
           C  1 16,  3  6, 11 1.5
           Z"
        stroke={ink}
        strokeWidth="1.35"
        fill="none"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* AI node — intelligence at the heart of spirit */}
      <circle cx="11" cy="22" r="2.2" fill={ink} />
    </svg>
  )

  if (markOnly) {
    return (
      <span className={className} style={{ display: 'inline-flex', alignItems: 'center' }}>
        {glyph}
      </span>
    )
  }

  return (
    <span
      className={className}
      style={{ display: 'inline-flex', alignItems: 'center', gap }}
    >
      {glyph}
      <span
        style={{
          fontFamily: '"Crimson Text", Georgia, serif',
          fontStyle:  'italic',
          fontSize,
          lineHeight: 1,
          letterSpacing: '-0.01em',
          userSelect: 'none',
          display: 'inline-flex',
          alignItems: 'baseline',
          gap: '0.2em',
        }}
      >
        {/* "AI" — heavier weight creates visual anchor */}
        <span style={{ color: ink, fontWeight: 600 }}>AI</span>
        {/* "Spirit" — lighter, receding — like spirit itself */}
        <span style={{ color: dark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.52)', fontWeight: 400 }}>
          Spirit
        </span>
      </span>
    </span>
  )
}

export function LogoLink({ href = '/', size, dark, markOnly, className, ...linkProps }) {
  return (
    <Link href={href} {...linkProps}>
      <Logo size={size} dark={dark} markOnly={markOnly} className={className} />
    </Link>
  )
}
