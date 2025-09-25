import React, { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  isDark: boolean
  forceLightMode: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem('leadbaze-theme')
    const initialTheme = (stored as Theme) || 'system'

    return initialTheme
  })

  const [isDark, setIsDark] = useState(false)

  // Função para verificar se deve forçar modo claro
  const shouldForceLightMode = () => {
    const currentPath = window.location.pathname
    // Páginas que sempre devem estar no modo claro
    const lightModePages = ['/login']
    return lightModePages.some(page => currentPath.startsWith(page))
  }

  useEffect(() => {
    const updateTheme = () => {
      let shouldBeDark = false

      // Verificar se deve forçar modo claro
      if (shouldForceLightMode()) {
        shouldBeDark = false

      } else if (theme === 'dark') {
        shouldBeDark = true

      } else if (theme === 'light') {
        shouldBeDark = false

      } else {
        // system
        shouldBeDark = window.matchMedia('(prefers-color-scheme: dark)').matches

      }
      setIsDark(shouldBeDark)

      // Aplicar classe ao documento diretamente
      if (shouldBeDark) {
        document.documentElement.classList.add('dark')

      } else {
        document.documentElement.classList.remove('dark')

      }

      // Atualizar meta theme-color para mobile
      const metaThemeColor = document.querySelector('meta[name="theme-color"]')
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', shouldBeDark ? '#1f2937' : '#ffffff')
      }
    }

    // Aplicar tema imediatamente na inicialização
    updateTheme()

    // Listener para mudanças no sistema
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => {
      if (theme === 'system') {
        updateTheme()
      }
    }

    mediaQuery.addEventListener('change', handler)

    // Listener para mudanças de rota (para forçar modo claro em páginas específicas)
    const handleRouteChange = () => {
      updateTheme()
    }

    // Adicionar listener para mudanças de rota
    window.addEventListener('popstate', handleRouteChange)

    return () => {
      mediaQuery.removeEventListener('change', handler)
      window.removeEventListener('popstate', handleRouteChange)
    }
  }, [theme])

  const handleSetTheme = (newTheme: Theme) => {

    setTheme(newTheme)
    localStorage.setItem('leadbaze-theme', newTheme)

    // Aplicar tema imediatamente
    let shouldBeDark = false

    // Verificar se deve forçar modo claro
    if (shouldForceLightMode()) {
      shouldBeDark = false

    } else if (newTheme === 'dark') {
      shouldBeDark = true

    } else if (newTheme === 'light') {
      shouldBeDark = false

    } else {
      shouldBeDark = window.matchMedia('(prefers-color-scheme: dark)').matches

    }

    // Atualizar estado imediatamente para evitar bugs visuais
    setIsDark(shouldBeDark)

    if (shouldBeDark) {
      document.documentElement.classList.add('dark')

    } else {
      document.documentElement.classList.remove('dark')

    }
  }

  const forceLightMode = () => {

    setIsDark(false)
    document.documentElement.classList.remove('dark')

    // Atualizar meta theme-color para mobile
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', '#ffffff')
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme: handleSetTheme, isDark, forceLightMode }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
