import Link from 'next/link'
import Image from 'next/image'

/**
 * Full-bleed persona portrait with the name set over a dark fade. Used on the
 * home page and on /talk-to related lists, so the persona (not a text card) is
 * what visitors see first.
 */
export default function PortraitCard({ href, name, subtitle, image, sizes, className = '' }) {
  return (
    <Link href={href} className={`group block focus-visible:outline-none ${className}`}>
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-black/5 ring-1 ring-black/5 group-focus-visible:ring-2 group-focus-visible:ring-black">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            sizes={sizes}
            className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-[1.03] motion-reduce:transition-none"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center font-display text-4xl text-black/40">
            {name[0]}
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/75 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-3.5">
          <p className="font-display text-lg leading-tight text-white">{name}</p>
          {subtitle && <p className="text-xs text-white/75 mt-0.5 line-clamp-1">{subtitle}</p>}
        </div>
      </div>
    </Link>
  )
}
