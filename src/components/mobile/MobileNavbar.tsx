import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, LogOut, Menu, X, CreditCard } from 'lucide-react'
import { getCurrentUser, signOut, supabase } from '../../lib/supabaseClient'
import { useSubscription } from '../../hooks/useSubscription'
import LogoImage from '../LogoImage'
import type { User as SupabaseUser } from '@supabase/supabase-js'

export default function MobileNavbar() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const navigate = useNavigate()
  const { subscription, isLoading: subscriptionLoading } = useSubscription()

  // Verificar se deve mostrar o botão "Assinar Plano"
  const shouldShowSubscribeButton = user && !subscriptionLoading && (
    !subscription ||

    subscription.status === 'cancelled' ||

    subscription.status === 'expired'
  )
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

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  return (
    <nav className="md:hidden bg-white dark:bg-gray-900 shadow-lg sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-md mx-auto px-4">
        <div className="flex justify-between items-center h-14">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center" onClick={closeMenu}>
              <LogoImage className="h-7 w-auto" />
            </Link>
          </div>

          {/* Botão Assinar Plano + Menu Button */}
          <div className="flex items-center gap-2">
            {/* Botão Assinar Plano - apenas para usuários sem assinatura ativa */}
            {shouldShowSubscribeButton && (
              <button
                onClick={() => {
                  navigate('/plans')
                  closeMenu()
                }}
                className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg font-semibold text-sm transition-all duration-200 shadow-sm"
              >
                <CreditCard className="w-3 h-3" />
                <span className="hidden sm:inline">Assinar</span>
              </button>
            )}

            {/* Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-900 shadow-lg border-t border-gray-200 dark:border-gray-700 transition-colors duration-300">
            <div className="px-4 py-4 space-y-3">
              {/* Navigation Links */}
              <Link

                to="/"

                className="block py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
                onClick={closeMenu}
              >
                Início
              </Link>

              {user ? (
                <>
                  <Link

                    to="/dashboard"

                    className="block py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
                    onClick={closeMenu}
                  >
                    Dashboard
                  </Link>
                  <Link

                    to="/gerador"

                    className="block py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
                    onClick={closeMenu}
                  >
                    Gerar Leads
                  </Link>
                  <Link

                    to="/disparador"

                    className="block py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
                    onClick={closeMenu}
                  >
                    Disparador
                  </Link>

                  {/* User Info */}
                  <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-2 py-2">
                      <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {user.user_metadata?.name || user.email}
                      </span>
                    </div>

                    {/* Logout Button */}
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 py-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors w-full"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm font-medium">Sair</span>
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link

                    to="/login"

                    className="block py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
                    onClick={closeMenu}
                  >
                    Entrar
                  </Link>
                  <Link

                    to="/login"

                    className="block py-2 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-center"
                    onClick={closeMenu}
                  >
                    Começar Agora
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
