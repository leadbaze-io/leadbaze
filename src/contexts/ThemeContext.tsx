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
    // Páginas que sempre devem estar no modo claro (Landing Page, Blog e Sobre)
    // Usar comparação exata para evitar conflitos
    return currentPath === '/' || 
           currentPath.startsWith('/blog') || 
           currentPath === '/about'
  }

  useEffect(() => {
    const updateTheme = () => {
      let shouldBeDark = false

      // Aplicar tema baseado na escolha do usuário
      if (theme === 'dark') {
        shouldBeDark = true
      } else if (theme === 'light') {
        shouldBeDark = false
      } else {
        // system
        shouldBeDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      }

      // Forçar modo claro para páginas específicas
      if (shouldForceLightMode()) {
        shouldBeDark = false
      }
      
      console.log('🎨 Theme Update:', { theme, shouldBeDark, path: window.location.pathname })
      
      setIsDark(shouldBeDark)

      // Aplicar classe ao documento diretamente
      if (shouldBeDark) {
        document.documentElement.classList.add('dark')
        document.body.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
        document.body.classList.remove('dark')
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

    // Listener para mudanças de rota (navegação)
    const handleRouteChange = () => {
      updateTheme()
    }

    // Listener para popstate (botão voltar/avançar do navegador)
    window.addEventListener('popstate', handleRouteChange)
    
    // Observer para mudanças no histórico (navegação SPA)
    const originalPushState = window.history.pushState
    const originalReplaceState = window.history.replaceState
    
    window.history.pushState = function(...args) {
      originalPushState.apply(this, args)
      handleRouteChange()
    }
    
    window.history.replaceState = function(...args) {
      originalReplaceState.apply(this, args)
      handleRouteChange()
    }

    return () => {
      mediaQuery.removeEventListener('change', handler)
      window.removeEventListener('popstate', handleRouteChange)
      window.history.pushState = originalPushState
      window.history.replaceState = originalReplaceState
    }
  }, [theme])

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme)
    localStorage.setItem('leadbaze-theme', newTheme)

    // Aplicar tema imediatamente
    let shouldBeDark = false

    // Aplicar tema baseado na escolha do usuário
    if (newTheme === 'dark') {
      shouldBeDark = true
    } else if (newTheme === 'light') {
      shouldBeDark = false
    } else {
      shouldBeDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    }

    // Forçar modo claro para páginas específicas
    if (shouldForceLightMode()) {
      shouldBeDark = false
    }

    console.log('🔄 Theme Changed:', { newTheme, shouldBeDark })

    // Atualizar estado imediatamente para evitar bugs visuais
    setIsDark(shouldBeDark)

    if (shouldBeDark) {
      document.documentElement.classList.add('dark')
      document.body.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
      document.body.classList.remove('dark')
    }
  }

  const forceLightMode = () => {
    setIsDark(false)
    document.documentElement.classList.remove('dark')
    document.body.classList.remove('dark')

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
