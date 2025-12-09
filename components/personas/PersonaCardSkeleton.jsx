export default function PersonaCardSkeleton() {
    return (
        <div className="bg-gray-100 rounded-2xl overflow-hidden animate-pulse">
            {/* Image skeleton */}
            <div className="aspect-square bg-gray-200" />

            {/* Content skeleton */}
            <div className="p-4">
                {/* Name */}
                <div className="h-5 bg-gray-200 rounded-full w-3/4 mb-2" />

                {/* Description */}
                <div className="h-3 bg-gray-200 rounded-full w-full mb-1" />
                <div className="h-3 bg-gray-200 rounded-full w-2/3" />

                {/* Category badge */}
                <div className="mt-3">
                    <div className="h-6 bg-gray-200 rounded-full w-16" />
                </div>
            </div>
        </div>
    )
}

export function PersonaGridSkeleton({ count = 10 }) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {Array.from({ length: count }).map((_, index) => (
                <PersonaCardSkeleton key={index} />
            ))}
        </div>
    )
}
