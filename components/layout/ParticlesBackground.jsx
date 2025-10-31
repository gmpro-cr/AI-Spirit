export default function ParticlesBackground() {
  // Generate 80 particles with simple, visible properties
  const particles = Array.from({ length: 80 }, (_, i) => {
    const size = Math.random() * 8 + 4 // 4-12px - MUCH larger
    const drift = (Math.random() - 0.5) * 100 // -50px to 50px horizontal drift

    return {
      id: i,
      size,
      left: Math.random() * 100, // 0-100%
      duration: Math.random() * 15 + 20, // 20-35s
      delay: Math.random() * -25, // stagger start times
      drift,
    }
  })

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 1,
      }}
    >
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="particle-float"
          style={{
            position: 'absolute',
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            left: `${particle.left}%`,
            bottom: '-15px',
            borderRadius: '50%',
            backgroundColor: '#FFFFFF',
            opacity: 0.85,
            boxShadow: `
              0 0 ${particle.size * 2}px rgba(255, 255, 255, 0.9),
              0 0 ${particle.size * 4}px rgba(255, 255, 255, 0.6),
              0 0 ${particle.size * 6}px rgba(255, 255, 255, 0.3)
            `,
            animationDuration: `${particle.duration}s`,
            animationDelay: `${particle.delay}s`,
            '--drift': `${particle.drift}px`,
          }}
        />
      ))}
    </div>
  )
}
