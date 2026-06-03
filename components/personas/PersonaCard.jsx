import { useRouter } from 'next/router'
import Image from 'next/image'

function formatCount(num) {
  if (!num || num === 0) return null
  if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K'
  return num.toString()
}

export default function PersonaCard({ persona, onEdit, messageCount, onClick }) {
  const router = useRouter()

  const handleClick = () => {
    if (onClick) {
      onClick(persona)
    } else {
      router.push(`/chat/${persona.slug}`)
    }
  }

  const formattedCount = formatCount(messageCount)

  return (
    <div
      className="group relative rounded-2xl overflow-hidden cursor-pointer bg-gray-50"
      style={{
        boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)',
        transition: 'box-shadow 0.25s ease, transform 0.25s ease',
      }}
      onClick={handleClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.10), 0 0 0 1px rgba(0,0,0,0.06)'
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      {/* Image */}
      <div className="relative w-full overflow-hidden" style={{ paddingTop: '115%' }}>
        <Image
          src={persona.image_url || persona.avatar_url || '/default-persona.png'}
          alt={persona.name}
          fill
          className="object-cover object-[center_20%] transition-transform duration-500 ease-out group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
        />

        {/* Bottom gradient — always visible for name legibility */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.28) 40%, transparent 70%)',
          }}
        />

        {/* Chat count badge — top right */}
        {formattedCount && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded-full px-2 py-0.5">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="text-[10px] font-medium text-white/80">{formattedCount}</span>
          </div>
        )}

        {/* Name + description overlaid at bottom */}
        <div className="absolute bottom-0 left-0 right-0 px-3 pb-3 pt-6">
          <h3 className="font-display text-[15px] font-semibold text-white leading-snug line-clamp-1">
            {persona.name}
          </h3>
          <p className="text-white/60 text-[11px] leading-snug line-clamp-1 mt-0.5">
            {persona.description || persona.bio}
          </p>
        </div>
      </div>

      {/* Edit button for custom personas */}
      {onEdit && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onEdit(persona)
          }}
          className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm p-1.5 rounded-xl border border-black/[0.06] shadow-soft hover:bg-white transition-all duration-200 active:scale-90"
          title="Edit persona"
          aria-label="Edit persona"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3.5 w-3.5 text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
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
