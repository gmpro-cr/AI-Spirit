import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/context/AuthContext'

export default function PersonaCard({ persona, onEdit }) {
  const { user } = useAuth()
  const handleEditClick = (e) => {
    e.preventDefault() // Prevent navigation to chat
    e.stopPropagation()
    if (onEdit) {
      onEdit(persona)
    }
  }

  // Category color gradients
  const categoryColors = {
    'Business': 'from-purple-500 to-pink-500',
    'Historical': 'from-cyan-500 to-blue-500',
    'Spiritual': 'from-green-500 to-emerald-500',
    'Entertainment': 'from-orange-500 to-red-500'
  }

  const categoryGradient = categoryColors[persona.category] || 'from-purple-500 to-pink-500'

  return (
    <div className="relative group">
      <Link href={`/chat/${persona.slug}`}>
        <div className="relative bg-gradient-to-br from-white/15 via-white/10 to-white/5 backdrop-blur-2xl border border-white/30 rounded-3xl h-[200px] lg:h-[120px] flex flex-col lg:flex-row overflow-hidden hover:from-white/22 hover:via-white/16 hover:to-white/10 hover:border-white/45 shadow-[0_8px_32px_-4px_rgba(0,0,0,0.5),0_4px_16px_rgba(0,0,0,0.3),inset_0_2px_1px_rgba(255,255,255,0.12),inset_0_-2px_1px_rgba(0,0,0,0.1)] hover:shadow-[0_12px_48px_-4px_rgba(255,255,255,0.12),0_8px_24px_rgba(0,0,0,0.4),inset_0_2px_1px_rgba(255,255,255,0.18),inset_0_-2px_1px_rgba(0,0,0,0.15)] transition-all duration-500 ease-out cursor-pointer hover:scale-[1.03] hover:-translate-y-1 active:scale-[0.98] overflow-hidden">
          {/* Category color accent - bottom bar */}
          <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${categoryGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-b-3xl`}></div>

          {/* Category color tint overlay */}
          <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${categoryGradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none`}></div>

          {/* Gradient overlays */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          <div className="absolute inset-[1px] rounded-3xl bg-gradient-to-br from-transparent via-white/5 to-white/10 pointer-events-none" />
          <div className={`absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-2xl bg-gradient-to-r ${categoryGradient} -z-10`} />

          {/* Image - Full width on mobile (85% height, no margins), 40% on desktop (with margins) */}
          <div className="relative w-full lg:w-[40%] h-[85%] lg:h-full flex-shrink-0 z-10 overflow-hidden">
            {/* Desktop: Box with margins */}
            <div className="hidden lg:block absolute inset-0 m-2.5 rounded-2xl overflow-hidden bg-gradient-to-br from-white/22 via-white/14 to-white/10 backdrop-blur-md shadow-[0_6px_20px_-2px_rgba(0,0,0,0.4),inset_0_2px_1px_rgba(255,255,255,0.18),inset_0_-2px_1px_rgba(0,0,0,0.1)] group-hover:shadow-[0_8px_28px_-2px_rgba(0,0,0,0.5),inset_0_2px_1px_rgba(255,255,255,0.22)] transition-shadow duration-500">
              {persona.avatar_url ? (
                <Image
                  src={persona.avatar_url}
                  alt={persona.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
                  {persona.name[0]}
                </div>
              )}
            </div>
            {/* Mobile: Full fill without margins */}
            <div className="lg:hidden absolute inset-0 overflow-hidden bg-gradient-to-br from-white/22 via-white/14 to-white/10 backdrop-blur-md">
              {persona.avatar_url ? (
                <Image
                  src={persona.avatar_url}
                  alt={persona.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
                  {persona.name[0]}
                </div>
              )}
            </div>
          </div>

          {/* Details - Below image on mobile (name only), right side on desktop (name + description) */}
          <div className="relative flex-1 flex flex-col justify-center lg:justify-start z-10 min-w-0 px-3 py-2.5">
            <h3 className="font-semibold text-sm lg:text-sm text-white tracking-tight break-words line-clamp-2 mb-1 lg:mb-1 leading-tight text-center lg:text-left">
              {persona.name}
            </h3>
            <p className="hidden lg:block text-[11px] text-white/60 line-clamp-2 leading-tight mb-1.5 font-light tracking-wide">
              {persona.description}
            </p>
            {persona.is_custom && (
              <span className="inline-block px-2 py-0.5 rounded-full text-[10px] bg-gradient-to-br from-white via-white/95 to-white/90 text-black font-semibold shadow-[0_2px_8px_rgba(255,255,255,0.3)] border border-white/40 w-fit tracking-wide mx-auto lg:mx-0">
                Custom
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Edit Button - Only for custom personas owned by current user */}
      {persona.is_custom && onEdit && user && persona.user_id === user.id && (
        <button
          onClick={handleEditClick}
          className="absolute top-2.5 right-2.5 z-20 w-8 h-8 bg-white/20 backdrop-blur-xl border border-white/35 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-white/30 hover:border-white/55 transition-all duration-500 ease-out shadow-[0_6px_16px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.18)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.25)] hover:scale-110 active:scale-95"
          title="Edit persona"
        >
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
      )}
    </div>
  )
}
