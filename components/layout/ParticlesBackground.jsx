export default function ParticlesBackground() {
  // Generate 175 small floating dots with random directions
  const dots = Array.from({ length: 175 }, (_, i) => {
    const size = Math.random() * 2 + 2 // 2-4px - very small dots
    const animations = ['float-up', 'float-down', 'float-left', 'float-right', 'float-diagonal-up', 'float-diagonal-down']
    const randomAnimation = animations[Math.floor(Math.random() * animations.length)]

    return {
      id: i,
      size,
      left: Math.random() * 100, // 0-100% across screen
      top: Math.random() * 100, // 0-100% across screen
      duration: Math.random() * 15 + 20, // 20-35s - slow, gentle movement
      delay: Math.random() * -20, // stagger start times
      opacity: Math.random() * 0.3 + 0.3, // 0.3-0.6 opacity - subtle but visible
      animation: randomAnimation,
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
        zIndex: 5,
      }}
    >
      {dots.map((dot) => (
        <div
          key={dot.id}
          className={`dot-${dot.animation}`}
          style={{
            position: 'absolute',
            width: `${dot.size}px`,
            height: `${dot.size}px`,
            left: `${dot.left}%`,
            top: `${dot.top}%`,
            borderRadius: '50%',
            backgroundColor: '#FFFFFF',
            opacity: dot.opacity,
            boxShadow: `
              0 0 ${dot.size * 2}px rgba(255, 255, 255, 0.4),
              0 0 ${dot.size * 3}px rgba(255, 255, 255, 0.2)
            `,
            animationDuration: `${dot.duration}s`,
            animationDelay: `${dot.delay}s`,
          }}
        />
      ))}
    </div>
  )
}
