import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'

export default function PersonaCard({ persona, onEdit, onLikeChange }) {
  const router = useRouter()
  const [isLiked, setIsLiked] = useState(false)

  useEffect(() => {
    // Check if persona is liked from localStorage
    const likedPersonas = JSON.parse(localStorage.getItem('esperit_liked_personas') || '[]')
    setIsLiked(likedPersonas.includes(persona.slug))
  }, [persona.slug])

  const handleClick = () => {
    router.push(`/chat/${persona.slug}`)
  }

  const handleLike = (e) => {
    e.stopPropagation()

    const likedPersonas = JSON.parse(localStorage.getItem('esperit_liked_personas') || '[]')
    let newLikedPersonas

    if (isLiked) {
      // Unlike
      newLikedPersonas = likedPersonas.filter(slug => slug !== persona.slug)
    } else {
      // Like
      newLikedPersonas = [...likedPersonas, persona.slug]
    }

    localStorage.setItem('esperit_liked_personas', JSON.stringify(newLikedPersonas))
    setIsLiked(!isLiked)

    // Notify parent component about the change
    if (onLikeChange) {
      onLikeChange()
    }
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
        className="w-full h-48 md:h-56 object-cover object-[center_25%] rounded-t-lg"
        onError={(e) => {
          e.target.src = '/default-persona.png'
        }}
      />

      {/* Persona Info */}
      <div className="p-2 md:p-3 bg-white/90">
        <div className="flex items-center justify-between">
          <h3 className="text-base md:text-lg font-bold text-black group-hover:text-blue-600 transition-colors flex-1">
            {persona.name}
          </h3>
          {/* Like Button (Heart) */}
          <button
            onClick={handleLike}
            className="flex-shrink-0 ml-2 p-1.5 border-2 border-black rounded-full hover:scale-110 hover:bg-gray-100 transition-all"
            title={isLiked ? "Unlike persona" : "Like persona"}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 md:h-5 md:w-5 transition-colors"
              fill={isLiked ? "red" : "none"}
              viewBox="0 0 24 24"
              stroke={isLiked ? "red" : "black"}
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>
        </div>
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
