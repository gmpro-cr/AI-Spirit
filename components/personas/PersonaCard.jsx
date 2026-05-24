import { useRouter } from 'next/router'
import Image from 'next/image'

// Format large numbers (e.g., 1234 -> "1.2K", 1234567 -> "1.2M")
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
          className="object-cover object-[center_25%] group-hover:scale-110 transition-transform duration-500 ease-out"
        />
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

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

