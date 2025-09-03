import React, { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  isDark: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem('leadbaze-theme')
    return (stored as Theme) || 'system'
  })

  const [isDark, setIsDark] = useState(false)

  // Função para carregar CSS do tema dinamicamente
  const loadThemeCSS = async (themeName: 'light' | 'dark') => {
    try {
      // Importar o CSS do tema dinamicamente
      if (themeName === 'dark') {
        await import('../styles/themes/dark-theme.css')
      } else {
        await import('../styles/themes/light-theme.css')
      }
    } catch (error) {
      console.warn(`Erro ao carregar tema ${themeName}:`, error)
    }
  }

  useEffect(() => {
    const updateTheme = () => {
      let shouldBeDark = false

      if (theme === 'dark') {
        shouldBeDark = true
      } else if (theme === 'light') {
        shouldBeDark = false
      } else {
        // system
        shouldBeDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      }

      setIsDark(shouldBeDark)
      
      // Aplicar classe ao documento e carregar CSS do tema
      if (shouldBeDark) {
        document.documentElement.classList.add('dark')
        loadThemeCSS('dark')
      } else {
        document.documentElement.classList.remove('dark')
        loadThemeCSS('light')
      }

      // Atualizar meta theme-color para mobile
      const metaThemeColor = document.querySelector('meta[name="theme-color"]')
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', shouldBeDark ? '#1f2937' : '#ffffff')
      }
    }

    updateTheme()

    // Listener para mudanças no sistema
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => {
      if (theme === 'system') {
        updateTheme()
      }
    }

    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [theme])

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme)
    localStorage.setItem('leadbaze-theme', newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme: handleSetTheme, isDark }}>
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
