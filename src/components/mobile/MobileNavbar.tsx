import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, LogOut, Menu, X } from 'lucide-react'
import { getCurrentUser, signOut, supabase } from '../../lib/supabaseClient'
import LogoImage from '../LogoImage'
import type { User as SupabaseUser } from '@supabase/supabase-js'

export default function MobileNavbar() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
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
    <nav className="md:hidden bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-md mx-auto px-4">
        <div className="flex justify-between items-center h-14">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center" onClick={closeMenu}>
              <LogoImage className="h-7 w-auto" />
            </Link>
          </div>

          {/* Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white shadow-lg border-t border-gray-200">
            <div className="px-4 py-4 space-y-3">
              {/* Navigation Links */}
              <Link 
                to="/" 
                className="block py-2 text-gray-700 hover:text-blue-600 transition-colors font-medium"
                onClick={closeMenu}
              >
                Início
              </Link>
              
              {user ? (
                <>
                  <Link 
                    to="/dashboard" 
                    className="block py-2 text-gray-700 hover:text-blue-600 transition-colors font-medium"
                    onClick={closeMenu}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    to="/gerador" 
                    className="block py-2 text-gray-700 hover:text-blue-600 transition-colors font-medium"
                    onClick={closeMenu}
                  >
                    Gerar Leads
                  </Link>
                  <Link 
                    to="/disparador" 
                    className="block py-2 text-gray-700 hover:text-blue-600 transition-colors font-medium"
                    onClick={closeMenu}
                  >
                    Disparador
                  </Link>
                  
                  {/* User Info */}
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex items-center space-x-2 py-2">
                      <User className="w-4 h-4 text-gray-600" />
                      <span className="text-sm text-gray-600">
                        {user.user_metadata?.name || user.email}
                      </span>
                    </div>
                    
                    {/* Logout Button */}
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 py-2 text-red-600 hover:text-red-700 transition-colors w-full"
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
                    className="block py-2 text-gray-700 hover:text-blue-600 transition-colors font-medium"
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
