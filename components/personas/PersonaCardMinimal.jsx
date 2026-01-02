import { useRouter } from 'next/router'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'

export default function PersonaCardMinimal({ persona, onLikeChange }) {
    const router = useRouter()
    const { user } = useAuth()
    const [isLiked, setIsLiked] = useState(false)

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
            className="group relative cursor-pointer"
            onClick={handleClick}
        >
            {/* Image Container - Sharp Edges, High Contrast Border */}
            <div className="relative aspect-[3/4] w-full overflow-hidden border border-black bg-white transition-all duration-300 group-hover:border-b-4 group-hover:border-r-4">
                {/* Grayscale by default, color on hover */}
                <div className="absolute inset-0 transition-all duration-500 group-hover:scale-105">
                    <Image
                        src={persona.image_url || persona.avatar_url || '/default-persona.png'}
                        alt={persona.name}
                        fill
                        className="object-cover object-top filter grayscale group-hover:grayscale-0 transition-all duration-500"
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                    />
                </div>

                {/* Minimal Overlay for Like Button */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                    <button
                        onClick={handleLike}
                        className={`p-2 border border-black transition-all ${isLiked ? 'bg-black text-white' : 'bg-white text-black hover:bg-black hover:text-white'}`}
                        aria-label={isLiked ? "Unlike" : "Like"}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill={isLiked ? "currentColor" : "none"}
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.5}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                            />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Info Section - Minimalist Typography */}
            <div className="mt-4 space-y-1">
                <h3 className="font-display text-lg font-bold text-black uppercase tracking-wide truncate">
                    {persona.name}
                </h3>
                <p className="text-sm text-gray-500 line-clamp-1 font-light border-l-2 border-black pl-2 group-hover:text-black transition-colors">
                    {persona.description || persona.bio}
                </p>
            </div>
        </div>
    )
}
