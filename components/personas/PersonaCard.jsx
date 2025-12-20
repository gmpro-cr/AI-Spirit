import { useRouter } from 'next/router'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'

export default function PersonaCard({ persona, onEdit, onLikeChange }) {
  const router = useRouter()
  const { user } = useAuth()
  const [isLiked, setIsLiked] = useState(false)

  // Chakra-inspired category colors (spiritual minimalism)
  const getCategoryBorderColor = (category) => {
    const colors = {
      'Relationships': 'border-l-chakra-root',
      'Wellness': 'border-l-chakra-sacral',
      'Career': 'border-l-chakra-solar',
      'Lifestyle': 'border-l-purple-600',
      'Finance': 'border-l-green-700',
      'Health': 'border-l-chakra-heart',
      'Spiritual': 'border-l-chakra-third-eye',
      'Parenting': 'border-l-orange-600',
      'Legal': 'border-l-slate-700',
      'Communication': 'border-l-chakra-throat',
      'Wisdom': 'border-l-chakra-crown',
    }
    return colors[category] || 'border-l-spirit-primary'
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
      className={`
        group relative bg-white
        border-l-4 ${getCategoryBorderColor(persona.category)}
        border-y border-r border-gray-200
        hover:shadow-md hover:border-l-spirit-accent
        transition-all duration-200
        cursor-pointer
      `}
      onClick={handleClick}
    >
      {/* Image Container - Clean, minimal rounding */}
      <div className="relative w-full h-32 md:h-40 overflow-hidden bg-gray-100">
        <Image
          src={persona.image_url || persona.avatar_url || '/default-persona.png'}
          alt={persona.name}
          fill
          className="object-cover object-[center_25%] group-hover:scale-105 transition-transform duration-300"
        />
        {/* Subtle overlay on hover - adds depth */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-200" />
      </div>

      {/* Info Section - Clean typography */}
      <div className="p-3 space-y-1">
        <div className="flex items-start justify-between gap-2">
          {/* Name - Uses display font */}
          <h3 className="font-display text-sm md:text-base font-semibold text-gray-900 flex-1 min-w-0 truncate">
            {persona.name}
          </h3>

          {/* Like Button - Minimal, gold when liked */}
          <button
            onClick={handleLike}
            className="flex-shrink-0 p-1 hover:opacity-70 transition-opacity"
            title={isLiked ? "Unlike persona" : "Like persona"}
            aria-label={isLiked ? "Unlike persona" : "Like persona"}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 md:h-5 md:w-5"
              fill={isLiked ? "#D4AF37" : "none"}
              viewBox="0 0 24 24"
              stroke={isLiked ? "#D4AF37" : "currentColor"}
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

        {/* Description - Muted color for hierarchy */}
        <p className="text-gray-600 text-[10px] md:text-xs line-clamp-2 leading-relaxed">
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
          className="absolute top-2 right-2 bg-white/95 hover:bg-white p-2 border border-gray-200 transition-colors"
          title="Edit persona"
          aria-label="Edit persona"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 text-gray-700"
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
