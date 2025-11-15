import { useRouter } from 'next/router'

export default function PersonaCard({ persona, onEdit }) {
  const router = useRouter()

  const handleClick = () => {
    router.push(`/chat/${persona.slug}`)
  }

  return (
    <div
      className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-xl transition-shadow duration-300 cursor-pointer group relative"
      onClick={handleClick}
    >
      {/* Persona Image */}
      <img
        src={persona.image_url || persona.avatar_url || '/default-persona.png'}
        alt={persona.name}
        className="w-full h-32 md:h-40 object-cover object-[center_top] rounded-t-lg"
        onError={(e) => {
          e.target.src = '/default-persona.png'
        }}
      />

      {/* Persona Info */}
      <div className="p-2 md:p-3 bg-white/90">
        <h3 className="text-base md:text-lg font-bold text-black group-hover:text-blue-600 transition-colors">
          {persona.name}
        </h3>
        <p className="text-black text-xs mt-1 line-clamp-1 md:line-clamp-2">
          {persona.description || persona.bio}
        </p>
      </div>

      {/* Edit Button (if custom persona) */}
      {onEdit && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onEdit(persona)
          }}
          className="absolute top-2 right-2 bg-white/90 hover:bg-white p-2 rounded-full shadow-md transition-all"
          title="Edit persona"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 text-black"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
            />
          </svg>
        </button>
      )}
    </div>
  )
}
