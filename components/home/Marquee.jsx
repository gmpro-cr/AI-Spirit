// Infinite Scrolling Text Band
// Pure Black strip with White text
export default function Marquee() {
    return (
        <div className="relative flex overflow-x-hidden bg-black text-white py-4 border-y border-white/10">
            <div className="animate-marquee whitespace-nowrap flex items-center gap-12 font-display text-lg tracking-[0.2em] uppercase">
                <span className="mx-4">Intelligence</span>
                <span className="w-2 h-2 rounded-full bg-white/50"></span>
                <span className="mx-4">Spirit</span>
                <span className="w-2 h-2 rounded-full bg-white/50"></span>
                <span className="mx-4">Connection</span>
                <span className="w-2 h-2 rounded-full bg-white/50"></span>
                <span className="mx-4">Knowledge</span>
                <span className="w-2 h-2 rounded-full bg-white/50"></span>
                <span className="mx-4">Judgment Free</span>
                <span className="w-2 h-2 rounded-full bg-white/50"></span>
                <span className="mx-4">24/7 Access</span>
                <span className="w-2 h-2 rounded-full bg-white/50"></span>

                {/* Duplicate for seamless loop */}
                <span className="mx-4">Intelligence</span>
                <span className="w-2 h-2 rounded-full bg-white/50"></span>
                <span className="mx-4">Spirit</span>
                <span className="w-2 h-2 rounded-full bg-white/50"></span>
                <span className="mx-4">Connection</span>
                <span className="w-2 h-2 rounded-full bg-white/50"></span>
                <span className="mx-4">Knowledge</span>
                <span className="w-2 h-2 rounded-full bg-white/50"></span>
                <span className="mx-4">Judgment Free</span>
                <span className="w-2 h-2 rounded-full bg-white/50"></span>
                <span className="mx-4">24/7 Access</span>
                <span className="w-2 h-2 rounded-full bg-white/50"></span>
            </div>

            {/* Helper gradient fades */}
            <div className="absolute top-0 left-0 w-20 h-full bg-gradient-to-r from-black to-transparent z-10"></div>
            <div className="absolute top-0 right-0 w-20 h-full bg-gradient-to-l from-black to-transparent z-10"></div>
        </div>
    )
}
