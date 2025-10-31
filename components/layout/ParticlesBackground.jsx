export default function ParticlesBackground() {
  // Generate 80 particles with random properties
  const particles = Array.from({ length: 80 }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2, // 2-6px
    left: Math.random() * 100, // 0-100%
    animationDuration: Math.random() * 20 + 15, // 15-35s
    animationDelay: Math.random() * -20, // stagger start times
    opacity: Math.random() * 0.4 + 0.2, // 0.2-0.6
  }))

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full bg-white animate-float"
          style={{
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            left: `${particle.left}%`,
            bottom: '-10px',
            opacity: particle.opacity,
            animation: `float ${particle.animationDuration}s linear infinite`,
            animationDelay: `${particle.animationDelay}s`,
          }}
        />
      ))}

      <style jsx>{`
        @keyframes float {
          0% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: ${Math.random() * 0.4 + 0.2};
          }
          90% {
            opacity: ${Math.random() * 0.4 + 0.2};
          }
          100% {
            transform: translateY(-100vh) translateX(${Math.random() * 100 - 50}px);
            opacity: 0;
          }
        }

        .animate-float {
          will-change: transform, opacity;
        }
      `}</style>
    </div>
  )
}
