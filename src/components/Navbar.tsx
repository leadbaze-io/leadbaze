import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { User, LogOut, Menu, X } from 'lucide-react'
import { getCurrentUser, signOut, supabase } from '../lib/supabaseClient'
import LogoImage from './LogoImage'
import ThemeToggle from './ThemeToggle'
import type { User as SupabaseUser } from '@supabase/supabase-js'

export default function Navbar() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  // Páginas onde o ThemeToggle deve aparecer (APENAS páginas da aplicação)
  // Blog não tem ThemeToggle - sempre modo claro
  const showThemeToggle = ['/login', '/dashboard', '/gerador', '/disparador'].some(path => 
    location.pathname.startsWith(path)
  ) || location.pathname.startsWith('/lista/')



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
        console.log('🔄 Auth state changed:', event, session?.user?.email)
        
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
    navigate('/')
  }

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <LogoImage className="h-8 w-auto" />
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              Início
            </Link>
            <Link 
              to="/blog" 
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              Blog
            </Link>
            
            {user ? (
              <>
                <Link 
                  to="/dashboard" 
                  className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
                >
                  Dashboard
                </Link>
                <Link 
                  to="/gerador" 
                  className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
                >
                  Gerar Leads
                </Link>
                <Link 
                  to="/disparador" 
                  className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
                >
                  Disparador
                </Link>
                <div className="flex items-center space-x-4">
                  {showThemeToggle && <ThemeToggle />}
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-600">{user.user_metadata?.name || user.email}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 text-red-600 hover:text-red-700 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sair</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/login" 
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Entrar
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-3">
            {user && showThemeToggle && <ThemeToggle />}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4 bg-white shadow-lg rounded-b-lg">
            <div className="flex flex-col space-y-4">
              <Link 
                to="/" 
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Início
              </Link>
              <Link 
                to="/blog" 
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Blog
              </Link>
              
              {user ? (
                <>
                  <Link 
                    to="/dashboard" 
                    className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    to="/gerador" 
                    className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Gerar Leads
                  </Link>
                  <Link 
                    to="/disparador" 
                    className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Disparador
                  </Link>
                  <div className="pt-2 border-t border-gray-200">
                    <div className="flex items-center space-x-2 mb-3">
                      <User className="w-4 h-4 text-gray-600" />
                      <span className="text-sm text-gray-600">{user.user_metadata?.name || user.email}</span>
                    </div>
                    <button
                      onClick={() => {
                        handleLogout()
                        setIsMenuOpen(false)
                      }}
                      className="flex items-center space-x-1 text-red-600 hover:text-red-700 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sair</span>
                    </button>
                  </div>
                </>
              ) : (
                <Link 
                  to="/login" 
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium w-fit"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Entrar
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}