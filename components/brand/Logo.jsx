import Link from 'next/link'

/**
 * AI Spirit logo — consciousness eye mark + wordmark
 * @param {object} props
 * @param {'sm'|'md'|'lg'} props.size
 * @param {boolean} props.dark — true for light-on-dark rendering
 * @param {boolean} props.markOnly — render glyph without wordmark
 * @param {string} props.className
 */
export default function Logo({ size = 'md', dark = false, markOnly = false, className = '' }) {
  const sizes = {
    sm: { mark: 28, wordmarkFontSize: '1rem', gap: '0.55rem' },
    md: { mark: 36, wordmarkFontSize: '1.25rem', gap: '0.75rem' },
    lg: { mark: 48, wordmarkFontSize: '1.65rem', gap: '1rem' },
  }

  const { mark, wordmarkFontSize, gap } = sizes[size] || sizes.md
  const color = dark ? '#ffffff' : '#000000'
  const mutedColor = dark ? 'rgba(255,255,255,0.38)' : 'rgba(0,0,0,0.38)'

  const glyph = (
    <svg
      width={mark}
      height={mark}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      {/* Outer ring — universe / completeness */}
      <circle
        cx="20"
        cy="20"
        r="18.5"
        stroke={color}
        strokeWidth="1.2"
        fill="none"
      />
      {/* Vertical vesica — spirit / consciousness flame */}
      <path
        d="M 20 4.5 C 29.5 9, 29.5 31, 20 35.5 C 10.5 31, 10.5 9, 20 4.5 Z"
        stroke={color}
        strokeWidth="1.2"
        fill="none"
      />
      {/* Center dot — AI node / point of self-awareness */}
      <circle
        cx="20"
        cy="20"
        r="2.6"
        fill={color}
      />
    </svg>
  )

  if (markOnly) {
    return <span className={className} style={{ display: 'inline-flex' }}>{glyph}</span>
  }

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap,
      }}
    >
      {glyph}

      {/* Wordmark */}
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'baseline',
          gap: '0.3em',
          fontFamily: '"Crimson Text", Georgia, serif',
          fontSize: wordmarkFontSize,
          fontStyle: 'italic',
          letterSpacing: '-0.01em',
          lineHeight: 1,
          userSelect: 'none',
        }}
      >
        <span style={{ color, fontWeight: 400 }}>AI</span>
        <span style={{ color: mutedColor, fontSize: '0.72em', fontStyle: 'normal', letterSpacing: '0.12em', fontFamily: 'inherit' }}>
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
