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

  return (
    <div className="relative group">
      <Link href={`/chat/${persona.slug}`}>
        <div className="relative bg-gradient-to-br from-white/15 via-white/10 to-white/5 backdrop-blur-2xl border-2 border-white/40 rounded-3xl h-[140px] flex overflow-hidden hover:from-white/25 hover:via-white/20 hover:to-white/10 hover:border-white/60 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] hover:shadow-[0_8px_32px_0_rgba(255,255,255,0.2)] transition-all duration-300 cursor-pointer hover:scale-[1.02] active:scale-[0.98] before:absolute before:inset-0 before:rounded-3xl before:bg-gradient-to-tr before:from-white/30 before:via-transparent before:to-transparent before:opacity-60 before:pointer-events-none after:absolute after:inset-[1px] after:rounded-3xl after:bg-gradient-to-br after:from-transparent after:via-white/5 after:to-white/10 after:pointer-events-none">
          {/* Left - Image (40%) */}
          <div className="relative w-[40%] flex-shrink-0 z-10 overflow-hidden">
            <div className="absolute inset-0 m-2 rounded-2xl overflow-hidden bg-gradient-to-br from-white/30 via-white/20 to-white/10 backdrop-blur-md">
              {persona.avatar_url ? (
                <Image
                  src={persona.avatar_url}
                  alt={persona.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                  {persona.name[0]}
                </div>
              )}
            </div>
          </div>

          {/* Right - Details (60%) */}
          <div className="relative flex-1 flex flex-col justify-start z-10 min-w-0 px-4 py-3">
            <h3 className="font-semibold text-sm text-white drop-shadow-[0_2px_8px_rgba(255,255,255,0.3)] break-words line-clamp-2 mb-1 leading-tight">
              {persona.name}
            </h3>
            <p className="text-[11px] text-white/70 line-clamp-2 leading-tight mb-2">
              {persona.description}
            </p>
            {persona.is_custom && (
              <span className="inline-block px-1.5 py-0.5 rounded-full text-[10px] bg-gradient-to-br from-white via-white/95 to-white/90 text-black font-bold shadow-[0_4px_12px_rgba(255,255,255,0.4)] border border-white/60 w-fit">
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
          className="absolute top-2 right-2 z-20 w-8 h-8 bg-white/20 backdrop-blur-xl border-2 border-white/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-white/30 hover:border-white/70 transition-all duration-300 shadow-lg"
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
