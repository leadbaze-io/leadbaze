import { useTheme } from '../contexts/ThemeContext'

export default function ThemeTest() {
  const { theme, setTheme, isDark } = useTheme()

  return (
    <div className="fixed top-20 right-4 z-50 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
        Teste de Tema
      </div>
      <div className="space-y-2">
        <div className="text-xs text-gray-600 dark:text-gray-300">
          Tema atual: {theme}
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-300">
          Modo escuro: {isDark ? 'Sim' : 'Não'}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setTheme('light')}
            className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Claro
          </button>
          <button
            onClick={() => setTheme('dark')}
            className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Escuro
          </button>
          <button
            onClick={() => setTheme('system')}
            className="px-2 py-1 text-xs bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            Sistema
          </button>
        </div>
      </div>
    </div>
  )
}
