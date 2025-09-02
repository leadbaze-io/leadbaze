import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, LogOut, Menu, X, Home, BarChart3, Zap, Send } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { getCurrentUser, signOut, supabase } from '../../lib/supabaseClient'
import LogoImage from '../LogoImage'
import { ThemeToggleCompact } from '../ThemeToggle'

export default function MobileNavbar() {
  const [user, setUser] = useState<any>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // Verificar usuário logado inicialmente
    const checkUser = async () => {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
    }
    checkUser()

    // Configurar listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Mobile Auth state changed:', event, session?.user?.email)
        
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user)
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          setUser(session.user)
        }
      }
    )

    // Cleanup do listener
    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await signOut()
    setUser(null)
    setIsMenuOpen(false)
    navigate('/')
  }

  const menuItems = [
    { to: '/', label: 'Início', icon: Home },
    { to: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { to: '/gerador', label: 'Gerar Leads', icon: Zap },
    { to: '/disparador', label: 'Disparador', icon: Send },
  ]

  return (
    <>
      <nav className="lg:hidden bg-white dark:bg-gray-900 shadow-lg sticky top-0 z-50 border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
        <div className="px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <LogoImage className="h-8 w-auto" />
            </Link>

            {/* Right side */}
            <div className="flex items-center space-x-3">
              <ThemeToggleCompact />
              
              {/* Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors"
                aria-expanded="false"
              >
                <span className="sr-only">Abrir menu principal</span>
                {isMenuOpen ? (
                  <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
              onClick={() => setIsMenuOpen(false)}
            />
            
            {/* Slide-out Menu */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed top-0 right-0 z-50 h-full w-80 max-w-sm bg-white dark:bg-gray-900 shadow-xl border-l border-gray-200 dark:border-gray-700"
            >
              <div className="h-full flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                  <LogoImage className="h-8 w-auto" />
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {/* User Info */}
                {user && (
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {user.user_metadata?.name || 'Usuário'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation Links */}
                <nav className="flex-1 p-4 space-y-2">
                  {user ? (
                    <>
                      {menuItems.map((item) => {
                        const Icon = item.icon
                        return (
                          <Link
                            key={item.to}
                            to={item.to}
                            onClick={() => setIsMenuOpen(false)}
                            className="flex items-center space-x-3 px-3 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          >
                            <Icon className="w-5 h-5" />
                            <span className="font-medium">{item.label}</span>
                          </Link>
                        )
                      })}
                    </>
                  ) : (
                    <Link
                      to="/"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center space-x-3 px-3 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      <Home className="w-5 h-5" />
                      <span className="font-medium">Início</span>
                    </Link>
                  )}
                </nav>

                {/* Bottom Actions */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                  {user ? (
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                    >
                      <LogOut className="w-5 h-5" />
                      <span className="font-medium">Sair</span>
                    </button>
                  ) : (
                    <Link
                      to="/login"
                      onClick={() => setIsMenuOpen(false)}
                      className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Entrar
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
