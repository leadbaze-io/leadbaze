interface MeteorsProps {
  number?: number
  minDelay?: number
  maxDelay?: number
  minDuration?: number
  maxDuration?: number
  angle?: number
  className?: string
}

export const Meteors = ({
  number = 20,
  minDelay = 0.2,
  maxDelay = 1.2,
  minDuration = 2,
  maxDuration = 10,
  className = "",
}: MeteorsProps) => {
  const meteors = new Array(number || 20).fill(true)

  return (
    <>
      <style>{`
        @keyframes meteor-fall {
          0% {
            transform: rotate(215deg) translateX(0) translateY(-100vh);
            opacity: 0;
          }
          2% {
            opacity: 1;
          }
          85% {
            opacity: 1;
          }
          98% {
            opacity: 1;
          }
          100% {
            transform: rotate(215deg) translateX(-600px) translateY(100vh);
            opacity: 0;
          }
        }
      `}</style>
      {meteors.map((_, idx) => {
        // Distribuição horizontal limitada à viewport - de -50% a +50% da largura
        const leftPercent = (Math.random() * 100 - 50) // Entre -50% e +50%
        // Delays mais variados para distribuição temporal melhor
        const delay = Math.random() * (maxDelay - minDelay) + minDelay
        // Duração mais longa - de 4s a 10s para não desaparecerem tão rápido
        const duration = Math.floor(Math.random() * (maxDuration - (minDuration + 2)) + (minDuration + 2))
        
        return (
          <span
            key={"meteor" + idx}
            className={`absolute rounded-full bg-green-400 ${className}`}
            style={{
              left: `calc(50% + ${leftPercent}vw)`,
              top: '-5%',
              width: '2px',
              height: '2px',
              boxShadow: '0 0 0 1px rgba(0, 255, 0, 0.3), 0 0 8px rgba(0, 255, 0, 0.2)',
              animation: `meteor-fall ${duration}s linear ${delay}s infinite`,
              position: 'absolute',
              zIndex: 5,
              transformOrigin: 'center center',
              pointerEvents: 'none',
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: '50%',
                left: '0',
                transform: 'translateY(-50%)',
                width: '60px',
                height: '1px',
                background: 'linear-gradient(to right, rgb(34, 197, 94), rgba(34, 197, 94, 0.6), transparent)',
                pointerEvents: 'none',
              }}
            />
          </span>
        )
      })}
    </>
  )
}
