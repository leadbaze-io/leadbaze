import { cn } from "../../lib/utils"
import { useEffect, useRef, useState } from "react"

interface AnimatedBeamProps {
  children: React.ReactNode
  className?: string
  delay?: number
}

// Versão otimizada com animações CSS suaves e performáticas
export function AnimatedBeam({ children, className, delay = 0 }: AnimatedBeamProps) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Intersection Observer otimizado com rootMargin maior para animar mais cedo
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Usar requestAnimationFrame para animação mais suave
            requestAnimationFrame(() => {
              setTimeout(() => setIsVisible(true), delay * 1000)
            })
            observer.disconnect()
          }
        })
      },
      { threshold: 0.05, rootMargin: '200px' } // Aumentado para animar mais cedo
    )

    if (ref.current) {
      observer.observe(ref.current)
      // Verificar se já está visível imediatamente
      const rect = ref.current.getBoundingClientRect()
      if (rect.top < window.innerHeight + 200) {
        requestAnimationFrame(() => {
          setTimeout(() => setIsVisible(true), delay * 1000)
        })
        observer.disconnect()
      }
    }

    return () => observer.disconnect()
  }, [delay])

  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animated-beam-visible {
          animation: fadeInUp 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }
      `}</style>
      <div 
        ref={ref}
        className={cn(
          "relative",
          isVisible && "animated-beam-visible",
          className
        )}
        style={{ 
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
          transition: isVisible 
            ? 'opacity 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94)' 
            : 'none',
          willChange: 'opacity, transform'
        }}
      >
        {children}
      </div>
    </>
  )
}