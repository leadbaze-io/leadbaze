import { useEffect, useState } from 'react'

/**
 * Hook para detectar preferência de movimento reduzido
 * Útil para desabilitar animações pesadas em dispositivos de baixo desempenho
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    // Verificar preferência do sistema
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    
    // Verificar se é dispositivo móvel ou com baixa performance
    const isLowEndDevice = 
      (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) ||
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    
    // Definir valor inicial
    setPrefersReducedMotion(mediaQuery.matches || isLowEndDevice)

    // Listener para mudanças na preferência
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches || isLowEndDevice)
    }

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    } else {
      // Fallback para navegadores antigos
      // @ts-ignore - addListener está deprecated mas ainda suportado
      mediaQuery.addListener(handleChange)
      // @ts-ignore
      return () => mediaQuery.removeListener(handleChange)
    }
  }, [])

  return prefersReducedMotion
}

