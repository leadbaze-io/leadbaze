import { useState, useEffect, useRef, type ReactNode } from 'react'

interface LazySectionProps {
  children: ReactNode
  fallback?: ReactNode
  rootMargin?: string
  threshold?: number
}

/**
 * Componente otimizado que lazy load children com Intersection Observer
 * Carrega mais cedo para animações fluidas e experiência profissional
 */
export function LazySection({ 
  children, 
  fallback = <div className="min-h-[200px]" />,
  rootMargin = '500px', // Aumentado para carregar mais cedo e garantir fluidez
  threshold = 0.01
}: LazySectionProps) {
  const [shouldLoad, setShouldLoad] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (shouldLoad) {
      // Animar entrada quando carregar
      requestAnimationFrame(() => {
        setIsVisible(true)
      })
      return
    }

    // Função otimizada para verificar proximidade
    const checkIfNearViewport = () => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect()
        const margin = parseInt(rootMargin.toString().replace('px', '')) || 500
        const isNear = rect.top < window.innerHeight + margin
        if (isNear) {
          setShouldLoad(true)
          return true
        }
      }
      return false
    }

    // Verificar imediatamente
    if (checkIfNearViewport()) {
      return
    }

    // Observer com rootMargin maior para carregar mais cedo
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting || entry.boundingClientRect.top < window.innerHeight + 500) {
            setShouldLoad(true)
            observer.disconnect()
          }
        })
      },
      { 
        rootMargin: typeof rootMargin === 'string' ? rootMargin : '500px',
        threshold 
      }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    // Handlers otimizados para scroll e resize
    let scrollTimeout: NodeJS.Timeout
    const handleScroll = () => {
      clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(() => {
        if (checkIfNearViewport()) {
          observer.disconnect()
          window.removeEventListener('scroll', handleScroll, { passive: true } as any)
        }
      }, 50)
    }
    
    let resizeTimeout: NodeJS.Timeout
    const handleResize = () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(() => {
        if (checkIfNearViewport()) {
          observer.disconnect()
          window.removeEventListener('resize', handleResize, { passive: true } as any)
          window.removeEventListener('scroll', handleScroll, { passive: true } as any)
        }
      }, 50)
    }
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleResize, { passive: true })

    return () => {
      observer.disconnect()
      clearTimeout(scrollTimeout)
      clearTimeout(resizeTimeout)
      window.removeEventListener('scroll', handleScroll, { passive: true } as any)
      window.removeEventListener('resize', handleResize, { passive: true } as any)
    }
  }, [shouldLoad, rootMargin, threshold])

  if (shouldLoad) {
    return (
      <div 
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
          willChange: 'opacity, transform'
        }}
      >
        {children}
      </div>
    )
  }

  return (
    <div ref={ref} className="min-h-[200px]">
      {fallback}
    </div>
  )
}

