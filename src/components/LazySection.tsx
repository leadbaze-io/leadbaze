import { useState, useEffect, useRef, type ReactNode } from 'react'

interface LazySectionProps {
  children: ReactNode
  fallback?: ReactNode
  rootMargin?: string
  threshold?: number
}

/**
 * Componente que lazy load children usando Intersection Observer
 * Carrega apenas quando próximo da viewport para melhorar performance
 */
export function LazySection({ 
  children, 
  fallback = <div className="min-h-[200px]" />,
  rootMargin = '200px', // Carregar quando 200px antes de aparecer
  threshold = 0.1
}: LazySectionProps) {
  const [shouldLoad, setShouldLoad] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (shouldLoad) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldLoad(true)
            observer.disconnect()
          }
        })
      },
      { rootMargin, threshold }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [shouldLoad, rootMargin, threshold])

  if (shouldLoad) {
    return <>{children}</>
  }

  return (
    <div ref={ref} className="min-h-[200px]">
      {fallback}
    </div>
  )
}

