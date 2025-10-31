import Link from 'next/link'
import Image from 'next/image'

export default function PersonaCard({ persona }) {
  return (
    <Link href={`/chat/${persona.slug}`}>
      <div className="glass-panel p-6 hover:border-neon-cyan transition-all cursor-pointer group">
        <div className="flex items-center space-x-4 mb-4">
          <div className="relative w-16 h-16 rounded-full overflow-hidden bg-black-tertiary">
            {persona.avatar_url ? (
              <Image
                src={persona.avatar_url}
                alt={persona.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl">
                {persona.name[0]}
              </div>
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg group-hover:text-neon-cyan transition">
              {persona.name}
            </h3>
            <p className="text-text-muted text-sm">{persona.category}</p>
          </div>
        </div>
        <p className="text-text-secondary text-sm line-clamp-2">
          {persona.description}
        </p>
        <div className="mt-4">
          <span className="inline-block px-3 py-1 rounded-full text-xs bg-black-tertiary text-text-secondary">
            {persona.language === 'hi' ? 'हिंदी' : persona.language === 'en' ? 'English' : 'Hinglish'}
          </span>
        </div>
      </div>
    </Link>
  )
}
