import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'

function formatCount(num) {
  if (!num || num === 0) return null
  if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K'
  return num.toString()
}

export default function PersonaCard({ persona, onEdit, messageCount, onClick, priority = false }) {
  const formattedCount = formatCount(messageCount)
  const href = `/chat/${persona.slug}`
  // Portraits are the whole point of the grid; until one arrives, show a
  // shimmering placeholder rather than a dead grey rectangle.
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageSrc, setImageSrc] = useState(
    persona.image_url || persona.avatar_url || '/default-persona.png'
  )

  // A real anchor, so the card is keyboard-operable, cmd/middle-clickable and
  // crawlable. onClick still runs for callers that want to intercept (analytics,
  // client-side routing side effects) but never replaces the href.
  const handleClick = (e) => {
    if (!onClick) return
    // Let the browser handle modified clicks (new tab / new window) natively.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
    e.preventDefault()
    onClick(persona)
  }

  return (
    <div className="group relative">
      <Link
        href={href}
        onClick={handleClick}
        aria-label={`Chat with ${persona.name}`}
        className="block rounded-2xl overflow-hidden bg-gray-50 dark:bg-white/[0.05] shadow-[0_1px_3px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.04)] transition-[box-shadow,transform] duration-[250ms] ease-out hover:shadow-[0_8px_24px_rgba(0,0,0,0.10),0_0_0_1px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
      >
        {/* Image */}
        <div className="relative w-full overflow-hidden" style={{ paddingTop: '115%' }}>
          {!imageLoaded && (
            <div
              className="absolute inset-0 animate-shimmer bg-shimmer"
              style={{ backgroundSize: '200% 100%' }}
              aria-hidden="true"
            />
          )}

          <Image
            src={imageSrc}
            alt=""
            fill
            priority={priority}
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              setImageSrc('/default-persona.png')
              setImageLoaded(true)
            }}
            className={`object-cover object-[center_20%] transition-[transform,opacity] duration-500 ease-out group-hover:scale-105 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
          />

          {/* Bottom scrim — always visible for name legibility */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.45) 32%, rgba(0,0,0,0.05) 62%, transparent 78%)',
            }}
          />

          {/* Chat count badge — top right */}
          {formattedCount && (
            <div className="absolute top-2 right-2 flex items-center gap-1 glass-pill-dark px-2 py-0.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white/90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="text-[10px] font-medium text-white">
                <span className="sr-only">Messages: </span>{formattedCount}
              </span>
            </div>
          )}

          {/* Name + description overlaid at bottom */}
          <div className="absolute bottom-0 left-0 right-0 px-3 pb-3 pt-6">
            <h3 className="font-display text-[15px] font-semibold text-white leading-snug line-clamp-1">
              {persona.name}
            </h3>
            <p className="text-white/85 text-[11px] leading-snug line-clamp-2 mt-0.5">
              {persona.description || persona.bio}
            </p>
          </div>
        </div>
      </Link>

      {/* Edit button for custom personas — sibling of the link, not nested inside it */}
      {onEdit && (
        <button
          type="button"
          onClick={() => onEdit(persona)}
          className="absolute top-2 left-2 z-10 glass-pill !rounded-xl p-1.5 hover:bg-white/80 transition-all duration-200 active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
          aria-label={`Edit ${persona.name}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3.5 w-3.5 text-gray-700 dark:text-white/80"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
            />
          </svg>
        </button>
      )}
    </div>
  )
}
