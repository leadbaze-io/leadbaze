import React from 'react'

interface LightRaysProps {
  count?: number
  color?: string
  blur?: number
  opacity?: number
  speed?: number
  length?: string | number
  className?: string
  style?: React.CSSProperties
}

export const LightRays: React.FC<LightRaysProps> = ({
  count = 7,
  color = "rgba(160, 210, 255, 0.2)",
  blur = 36,
  opacity = 0.65,
  speed = 14,
  length = "70vh",
  className = "",
  style,
}) => {
  const rays = Array.from({ length: count }, (_, i) => {
    const delay = (i * speed) / count
    const left = count > 1 ? (i / (count - 1)) * 100 : 50
    const duration = speed + (Math.random() * 2 - 1) // Variação de ±1s

    return {
      id: i,
      delay,
      left,
      duration,
    }
  })

  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      style={style}
    >
      <style>{`
        @keyframes light-ray {
          0% {
            opacity: 0;
            transform: translateY(-100%) scaleY(0);
          }
          20% {
            opacity: ${opacity};
            transform: translateY(0) scaleY(1);
          }
          80% {
            opacity: ${opacity};
            transform: translateY(0) scaleY(1);
          }
          100% {
            opacity: 0;
            transform: translateY(0) scaleY(0.5);
          }
        }
      `}</style>
      {rays.map((ray) => (
        <div
          key={ray.id}
          className="absolute top-0"
          style={{
            left: `${ray.left}%`,
            width: '2px',
            height: typeof length === 'string' ? length : `${length}px`,
            background: `linear-gradient(to bottom, ${color}, transparent)`,
            filter: `blur(${blur}px)`,
            animation: `light-ray ${ray.duration}s ease-in-out ${ray.delay}s infinite`,
            transformOrigin: 'top center',
            pointerEvents: 'none',
          }}
        />
      ))}
    </div>
  )
}

