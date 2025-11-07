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
  angle = 215,
  className = "",
}: MeteorsProps) => {
  const meteors = new Array(number || 20).fill(true)

  return (
    <>
      {meteors.map((_, idx) => {
        // Distribuição horizontal aleatória - de -50% a +50% da largura
        const leftPercent = (Math.random() * 100 - 50) // Entre -50% e +50%
        // Delay aleatório para distribuição temporal (chuva contínua)
        const delay = Math.random() * (maxDelay - minDelay) + minDelay
        // Duração aleatória para variedade na velocidade
        const duration = Math.random() * (maxDuration - minDuration) + minDuration
        
        return (
          <span
            key={"meteor" + idx}
            className={`absolute h-px w-px rounded-full ${className}`}
            style={{
              position: 'absolute',
              top: 0,
              left: `calc(50% + ${leftPercent}vw)`,
              width: '1px',
              height: '1px',
              borderRadius: '9999px',
              boxShadow: `0 0 0 1px rgba(34, 197, 94, 0.1), 0 0 0 1px rgba(34, 197, 94, 0.1), 0 0 8px rgba(34, 197, 94, 0.4)`,
              background: 'linear-gradient(to right, rgb(34, 197, 94), transparent)',
              animation: `meteor ${duration}s linear ${delay}s infinite`,
              transform: `rotate(${angle}deg) translateX(0) translateY(0)`,
              transformOrigin: 'top center',
              pointerEvents: 'none',
              zIndex: 5,
            }}
          >
            <span
              className="absolute h-px"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '50px',
                height: '1px',
                background: 'linear-gradient(to right, rgba(34, 197, 94, 0.8), rgba(34, 197, 94, 0.4), transparent)',
                transform: `rotate(${angle}deg)`,
                transformOrigin: 'left center',
                pointerEvents: 'none',
              }}
            />
          </span>
        )
      })}
      <style>{`
        @keyframes meteor {
          0% {
            transform: rotate(${angle}deg) translateX(0) translateY(-150vh);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          70% {
            opacity: 1;
          }
          100% {
            transform: rotate(${angle}deg) translateX(-500px) translateY(150vh);
            opacity: 0;
          }
        }
      `}</style>
    </>
  )
}
