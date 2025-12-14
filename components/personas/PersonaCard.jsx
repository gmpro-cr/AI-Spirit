import { useRouter } from 'next/router'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'

export default function PersonaCard({ persona, onEdit, onLikeChange }) {
  const router = useRouter()
  const { user } = useAuth()
  const [isLiked, setIsLiked] = useState(false)

  // Category-based subtle accent colors
  const getCategoryAccent = (category) => {
    const accents = {
      'Relationships': 'hover:border-pink-300',
      'Wellness': 'hover:border-green-300',
      'Career': 'hover:border-blue-300',
      'Lifestyle': 'hover:border-purple-300',
      'Finance': 'hover:border-emerald-300',
      'Health': 'hover:border-teal-300',
      'Spiritual': 'hover:border-amber-300',
      'Parenting': 'hover:border-orange-300',
      'Legal': 'hover:border-slate-400'
    }
    return accents[category] || 'hover:border-gray-400'
  }

  useEffect(() => {
    // Check if persona is liked from localStorage
    const likedPersonas = JSON.parse(localStorage.getItem('esperit_liked_personas') || '[]')
    setIsLiked(likedPersonas.includes(persona.slug))
  }, [persona.slug])

  const handleClick = () => {
    router.push(`/chat/${persona.slug}`)
  }

  const syncToServer = async (newLikedPersonas) => {
    if (!user) return

    try {
      await fetch('/api/user/liked-personas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          likedPersonas: newLikedPersonas
        })
      })
    } catch (error) {
      console.error('Error syncing likes:', error)
    }
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

    // Sync to server for logged-in users
    syncToServer(newLikedPersonas)

    // Notify parent component about the change
    if (onLikeChange) {
      onLikeChange()
    }
  }

  return (
    <div
      className={`bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group relative ${getCategoryAccent(persona.category)}`}
      onClick={handleClick}
    >
      {/* Persona Image */}
      {/* Persona Image */}
      <div className="relative w-full h-32 md:h-40">
        <Image
          src={persona.image_url || persona.avatar_url || '/default-persona.png'}
          alt={persona.name}
          fill
          className="object-cover object-[center_25%] rounded-t-lg"
          onError={(e) => {
            // next/image doesn't support onError directly like img, 
            // but we can handle fallbacks in the src logic or a wrapper if needed.
            // For now, we rely on the src fallback above.
          }}
        />
      </div>

      {/* Persona Info */}
      <div className="p-2">
        <div className="flex items-start justify-between gap-1">
          <h3 className="font-display text-sm md:text-base font-semibold text-black group-hover:text-gray-600 transition-colors flex-1 min-w-0 truncate">
            {persona.name}
          </h3>
          {/* Like Button (Heart) */}
          <button
            onClick={handleLike}
            className="flex-shrink-0 hover:scale-110 transition-transform mt-0.5"
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
        <p className="text-black text-[10px] md:text-xs mt-0.5 line-clamp-1">
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
