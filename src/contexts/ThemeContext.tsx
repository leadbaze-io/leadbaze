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

      console.log('🎨 ThemeContext - Tema:', theme, 'shouldBeDark:', shouldBeDark)
      setIsDark(shouldBeDark)
      
      // Aplicar classe ao documento diretamente
      if (shouldBeDark) {
        document.documentElement.classList.add('dark')
        console.log('✅ ThemeContext - Classe dark adicionada')
      } else {
        document.documentElement.classList.remove('dark')
        console.log('✅ ThemeContext - Classe dark removida')
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
    return () => mediaQuery.removeEventListener('change', handler)
  }, [theme])

  const handleSetTheme = (newTheme: Theme) => {
    console.log('🔄 Mudando tema para:', newTheme)
    setTheme(newTheme)
    localStorage.setItem('leadbaze-theme', newTheme)
    
    // Aplicar tema imediatamente
    let shouldBeDark = false
    if (newTheme === 'dark') {
      shouldBeDark = true
    } else if (newTheme === 'light') {
      shouldBeDark = false
    } else {
      shouldBeDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    
    if (shouldBeDark) {
      document.documentElement.classList.add('dark')
      console.log('✅ Tema aplicado imediatamente: dark')
    } else {
      document.documentElement.classList.remove('dark')
      console.log('✅ Tema aplicado imediatamente: light')
    }
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
