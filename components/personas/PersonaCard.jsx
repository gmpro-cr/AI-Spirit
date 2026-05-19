import { useRouter } from 'next/router'
import Image from 'next/image'

// Format large numbers (e.g., 1234 -> "1.2K", 1234567 -> "1.2M")
function formatCount(num) {
  if (!num || num === 0) return null
  if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K'
  return num.toString()
}

export default function PersonaCard({ persona, onEdit, messageCount, onClick, isLocked, isAccessed }) {
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
      className={`
        group relative bg-white
        border border-gray-100 rounded-2xl overflow-hidden
        shadow-soft hover:shadow-lift hover:border-gray-200
        hover:-translate-y-1
        transition-all duration-300 ease-out
        cursor-pointer
      `}
      onClick={handleClick}
    >
      {/* Image Container */}
      <div className="relative w-full h-36 md:h-44 overflow-hidden bg-gray-50">
        <Image
          src={persona.image_url || persona.avatar_url || '/default-persona.png'}
          alt={persona.name}
          fill
          className={`object-cover object-[center_25%] group-hover:scale-110 transition-transform duration-500 ease-out ${isLocked ? 'brightness-[0.7]' : ''}`}
        />
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Lock Overlay for locked personas */}
        {isLocked && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <div className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        )}

        {/* Premium badge for locked personas */}
        {isLocked && (
          <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm text-white text-[10px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 uppercase tracking-wider">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576L2.049 12.97a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.47 8.14l.813-2.846A.75.75 0 019 4.5zM18 1.5a.75.75 0 01.728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 010 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 01-1.456 0l-.258-1.036a2.625 2.625 0 00-1.91-1.91l-1.036-.258a.75.75 0 010-1.456l1.036-.258a2.625 2.625 0 001.91-1.91l.258-1.036A.75.75 0 0118 1.5z" clipRule="evenodd" />
            </svg>
            Premium
          </div>
        )}

        {/* Free badge for accessed personas */}
        {isAccessed && !isLocked && (
          <div className="absolute top-2 right-2 bg-green-600/90 backdrop-blur-sm text-white text-[10px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 uppercase tracking-wider">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Free
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="p-3 space-y-1">
        <div className="flex items-start justify-between gap-2">
          {/* Name */}
          <h3 className="font-display text-base md:text-lg font-bold text-gray-900 flex-1 min-w-0 line-clamp-2 leading-tight group-hover:text-black transition-colors duration-300">
            {persona.name}
          </h3>

          {/* Chat Count */}
          {formattedCount && (
            <div className="flex items-center gap-1 text-gray-400 flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="text-xs font-medium">{formattedCount}</span>
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-gray-500 text-xs md:text-sm line-clamp-2 leading-relaxed">
          {persona.description || persona.bio}
        </p>
      </div>

      {/* Edit Button for Custom Personas */}
      {onEdit && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onEdit(persona)
          }}
          className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm hover:bg-white p-2 rounded-xl border border-gray-100 shadow-soft hover:shadow-lift transition-all duration-300"
          title="Edit persona"
          aria-label="Edit persona"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 text-gray-600"
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

