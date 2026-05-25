import Link from 'next/link'

/**
 * AI Spirit logo — infinity lemniscate mark + wordmark
 * @param {'sm'|'md'|'lg'} size
 * @param {boolean} dark — light-on-dark rendering
 * @param {boolean} markOnly — glyph only, no wordmark
 * @param {string} className
 */
export default function Logo({ size = 'md', dark = false, markOnly = false, className = '' }) {
  const sizes = {
    sm: { mark: 26, markH: 13, wordmarkFontSize: '1rem', gap: '0.6rem' },
    md: { mark: 36, markH: 18, wordmarkFontSize: '1.25rem', gap: '0.75rem' },
    lg: { mark: 50, markH: 25, wordmarkFontSize: '1.65rem', gap: '1rem' },
  }

  const { mark, markH, wordmarkFontSize, gap } = sizes[size] || sizes.md
  const color = dark ? '#ffffff' : '#000000'
  const mutedColor = dark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)'

  // Lemniscate in a 40×20 viewBox — elongated for the proper ∞ aspect ratio
  // Right loop: C 20 3, 37 3, 37 10  ↘  C 37 17, 20 17, 20 10
  // Left loop:  C 20 3, 3 3, 3 10    ↙  C 3 17, 20 17, 20 10
  const glyph = (
    <svg
      width={mark}
      height={markH}
      viewBox="0 0 40 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ flexShrink: 0, display: 'block' }}
    >
      {/* Right loop */}
      <path
        d="M 20 10 C 20 3, 37 3, 37 10 C 37 17, 20 17, 20 10"
        stroke={color}
        strokeWidth="1.4"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Left loop */}
      <path
        d="M 20 10 C 20 3, 3 3, 3 10 C 3 17, 20 17, 20 10"
        stroke={color}
        strokeWidth="1.4"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Center node — the AI / spirit convergence point */}
      <circle cx="20" cy="10" r="1.8" fill={color} />
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
          display: 'inline-flex',
          alignItems: 'baseline',
          gap: '0.28em',
          fontFamily: '"Crimson Text", Georgia, serif',
          fontSize: wordmarkFontSize,
          fontStyle: 'italic',
          letterSpacing: '-0.01em',
          lineHeight: 1,
          userSelect: 'none',
        }}
      >
        <span style={{ color, fontWeight: 400 }}>AI</span>
        <span style={{
          color: mutedColor,
          fontSize: '0.7em',
          fontStyle: 'normal',
          letterSpacing: '0.14em',
          fontFamily: 'inherit',
        }}>
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
