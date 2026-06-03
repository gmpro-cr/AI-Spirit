export default function PersonaCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden animate-pulse bg-gray-100" style={{ paddingTop: '115%', position: 'relative' }}>
      <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200" />
      {/* Shimmer overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.5) 50%, transparent 60%)',
          backgroundSize: '200% 100%',
          animation: 'skeleton-shimmer 1.6s ease-in-out infinite',
        }}
      />
      {/* Simulated name bar at bottom */}
      <div className="absolute bottom-3 left-3 right-3 space-y-1.5">
        <div className="h-3.5 bg-white/30 rounded-full w-3/4" />
        <div className="h-2.5 bg-white/20 rounded-full w-1/2" />
      </div>
    </div>
  )
}

export function PersonaGridSkeleton({ count = 10 }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <PersonaCardSkeleton key={index} />
      ))}
    </div>
  )
}
