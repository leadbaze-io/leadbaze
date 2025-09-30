import { Sun, Moon, Monitor } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../contexts/ThemeContext'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { Button } from './ui/button'

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const themes = [
    { value: 'light', label: 'Claro', icon: Sun },
    { value: 'dark', label: 'Escuro', icon: Moon },
    { value: 'system', label: 'Sistema', icon: Monitor },
  ] as const

  const currentTheme = themes.find(t => t.value === theme)
  const CurrentIcon = currentTheme?.icon || Monitor

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {

    setTheme(newTheme)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="w-10 h-10 p-0 relative overflow-hidden hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={theme}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <CurrentIcon className={`h-5 w-5 ${
                theme === 'light' ? 'text-yellow-500 drop-shadow-sm' :

                theme === 'dark' ? 'text-blue-400 drop-shadow-sm' :

                'text-gray-600 dark:text-gray-300'
              }`} />
            </motion.div>
          </AnimatePresence>
          <span className="sr-only">Alternar tema</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-36 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-xl">
        {themes.map((themeOption) => {
          const Icon = themeOption.icon
          const isActive = theme === themeOption.value

          return (
            <DropdownMenuItem
              key={themeOption.value}
              onClick={() => handleThemeChange(themeOption.value)}
              className={`cursor-pointer transition-colors text-gray-900 dark:text-gray-100 ${
                isActive

                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'

                  : 'hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center space-x-2 w-full">
                <Icon className={`h-5 w-5 ${
                  themeOption.value === 'light' ? 'text-yellow-500 drop-shadow-sm' :
                  themeOption.value === 'dark' ? 'text-blue-400 drop-shadow-sm' :
                  'text-gray-600 dark:text-gray-300'
                }`} />
                <span className="flex-1">{themeOption.label}</span>
                {isActive && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"
                  />
                )}
              </div>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Versão compacta para mobile/navbar
export function ThemeToggleCompact() {
  const { isDark, setTheme } = useTheme()

  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark'

    setTheme(newTheme)
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="w-10 h-10 p-0 relative overflow-hidden hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={isDark ? 'dark' : 'light'}
          initial={{ rotate: -180, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          exit={{ rotate: 180, opacity: 0 }}
          transition={{ duration: 0.3, type: "spring" }}
          className="absolute inset-0 flex items-center justify-center"
        >
          {isDark ? (
            <Sun className="h-5 w-5 text-yellow-500 drop-shadow-sm" />
          ) : (
            <Moon className="h-5 w-5 text-blue-600 drop-shadow-sm" />
          )}
        </motion.div>
      </AnimatePresence>
      <span className="sr-only">Alternar tema</span>
    </Button>
  )
}
