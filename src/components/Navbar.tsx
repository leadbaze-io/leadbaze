import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { LogOut, Menu, X, Home, FileText, Info, BarChart3, Users, MessageCircle, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
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

  // Função para verificar se um link está ativo - otimizada para fluidez
  const isActiveLink = (path: string) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    if (path === '/blog') {
      return location.pathname.startsWith('/blog') && location.pathname !== '/blog/sobre'
    }
    if (path === '/blog/sobre') {
      return location.pathname === '/blog/sobre'
    }
    if (path === '/dashboard') {
      return location.pathname === '/dashboard'
    }
    if (path === '/gerador') {
      return location.pathname === '/gerador'
    }
    if (path === '/disparador') {
      return location.pathname === '/disparador'
    }
    return location.pathname.startsWith(path)
  }

  // Animações para os links - otimizadas para suavidade e consistência
  const linkVariants = {
    hover: {
      y: -1,
      scale: 1.02,
      transition: {
        duration: 0.2,
        ease: "easeOut" as const
      }
    },
    tap: {
      scale: 0.98,
      transition: {
        duration: 0.1
      }
    }
  }



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

  // Componente para links da NavBar com animações
  const NavLink = ({ to, children, className = "" }: { to: string; children: React.ReactNode; className?: string }) => (
    <motion.div
      variants={linkVariants}
      whileHover="hover"
      whileTap="tap"
      className="relative"
    >
      <Link 
        to={to} 
        className={`relative px-3 py-2 rounded-lg font-medium transition-all duration-300 z-10 ${className}`}
      >
        {/* Efeito de fundo no hover - com z-index menor */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg opacity-0"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          style={{ zIndex: -1 }}
        />
        {children}
        {/* Indicador de página ativa - Nova animação */}
        {isActiveLink(to) && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{
              duration: 0.3,
              ease: "easeOut"
            }}
          />
        )}
        {/* Linha inferior sutil */}
        {isActiveLink(to) && (
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            exit={{ scaleX: 0, opacity: 0 }}
            transition={{
              duration: 0.4,
              ease: "easeOut"
            }}
            style={{ transformOrigin: "left" }}
          />
        )}
      </Link>
    </motion.div>
  )

  return (
    <nav className="bg-white/95 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo com animação */}
          <motion.div 
            className="flex items-center"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.15 }}
          >
            <Link to="/" className="flex items-center">
              <LogoImage className="h-8 w-auto" />
            </Link>
          </motion.div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-2">
            <NavLink 
              to="/" 
              className={`text-gray-700 hover:text-blue-600 transition-colors ${
                isActiveLink('/') ? 'text-blue-600 font-semibold' : ''
              }`}
            >
              Início
            </NavLink>
            <NavLink 
              to="/blog" 
              className={`text-gray-700 hover:text-blue-600 transition-colors ${
                isActiveLink('/blog') ? 'text-blue-600 font-semibold' : ''
              }`}
            >
              Blog
            </NavLink>
            <NavLink 
              to="/blog/sobre" 
              className={`text-gray-700 hover:text-blue-600 transition-colors ${
                isActiveLink('/blog/sobre') ? 'text-blue-600 font-semibold' : ''
              }`}
            >
              Sobre
            </NavLink>
            
            {user ? (
              <>
                <NavLink 
                  to="/dashboard" 
                  className={`text-gray-700 hover:text-blue-600 transition-colors ${
                    isActiveLink('/dashboard') ? 'text-blue-600 font-semibold' : ''
                  }`}
                >
                  Dashboard
                </NavLink>
                <NavLink 
                  to="/gerador" 
                  className={`text-gray-700 hover:text-blue-600 transition-colors ${
                    isActiveLink('/gerador') ? 'text-blue-600 font-semibold' : ''
                  }`}
                >
                  Gerar Leads
                </NavLink>
                <NavLink 
                  to="/disparador" 
                  className={`text-gray-700 hover:text-blue-600 transition-colors ${
                    isActiveLink('/disparador') ? 'text-blue-600 font-semibold' : ''
                  }`}
                >
                  Disparador
                </NavLink>
                <div className="flex items-center space-x-4 ml-4">
                  <div className="w-10 h-10 flex items-center justify-center">
                    {showThemeToggle ? (
                      <ThemeToggle />
                    ) : (
                      <div className="w-10 h-10" />
                    )}
                  </div>
                  <motion.button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-3 py-2 text-red-600 hover:text-red-700 transition-colors rounded-lg hover:bg-red-50"
                    whileHover={{ scale: 1.02, x: 1 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sair</span>
                  </motion.button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <motion.div
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                >
                  <Link 
                    to="/login" 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2.5 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg hover:shadow-lg"
                  >
                    Entrar
                  </Link>
                </motion.div>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-3">
            <div className="w-10 h-10 flex items-center justify-center">
              {user && showThemeToggle ? (
                <ThemeToggle />
              ) : (
                <div className="w-10 h-10" />
              )}
            </div>
            <motion.button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-blue-600 transition-colors p-2 rounded-lg hover:bg-gray-100"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.15 }}
            >
              <AnimatePresence mode="wait">
                {isMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -45, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 45, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <X className="w-6 h-6" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 45, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -45, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Menu className="w-6 h-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu - Versão Profissional */}
        <AnimatePresence>
          {isMenuOpen && (
            <>
              {/* Overlay de fundo */}
              <motion.div
                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setIsMenuOpen(false)}
              />
              
              {/* Menu principal */}
              <motion.div
                className="absolute top-full left-0 right-0 z-50 md:hidden"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                {/* Container do menu */}
                <motion.div
                  className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-700/50 shadow-2xl"
                  initial={{ scaleY: 0, opacity: 0 }}
                  animate={{ scaleY: 1, opacity: 1 }}
                  exit={{ scaleY: 0, opacity: 0 }}
                  transition={{ 
                    duration: 0.4, 
                    ease: "easeOut",
                    staggerChildren: 0.05,
                    delayChildren: 0.1
                  }}
                  style={{ transformOrigin: "top" }}
                >
                  {/* Header do menu */}
                  <motion.div
                    className="px-6 py-4 border-b border-gray-100 dark:border-gray-800"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse"></div>
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-900">
                          Menu de Navegação
                        </span>
                      </div>
                      <motion.button
                        onClick={() => setIsMenuOpen(false)}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                      >
                        <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      </motion.button>
                    </div>
                  </motion.div>

                  {/* Links de navegação */}
                  <motion.div className="py-2">
                    {/* Links principais */}
                    <motion.div
                      className="px-2 py-1"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.15 }}
                    >
                                              <Link
                          to="/"
                          className={`group flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                            isActiveLink('/') 
                              ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 border-l-4 border-blue-500 shadow-lg' 
                              : 'hover:bg-gray-50 dark:hover:bg-gray-50'
                          }`}
                          onClick={() => setIsMenuOpen(false)}
                        >
                                                  <motion.div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                            isActiveLink('/') 
                              ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg' 
                              : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                          }`}
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Home className="w-4 h-4" />
                          </motion.div>
                          <div className="flex-1">
                                                  <span className={`text-sm font-medium transition-colors ${
                          isActiveLink('/') 
                            ? 'text-blue-700 dark:text-white' 
                            : 'text-gray-700 dark:text-gray-700 group-hover:text-blue-600 dark:group-hover:text-blue-600'
                        }`}>
                          Início
                        </span>
                          {isActiveLink('/') && (
                            <motion.div
                              className="text-xs text-blue-600 dark:text-blue-400 mt-1"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.2 }}
                            >
                              Página atual
                            </motion.div>
                          )}
                        </div>
                        {isActiveLink('/') && (
                          <motion.div
                            className="w-2 h-2 bg-blue-500 rounded-full"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
                          />
                        )}
                      </Link>

                      <Link
                        to="/blog"
                        className={`group flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                          isActiveLink('/blog') 
                            ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 border-l-4 border-blue-500 shadow-lg' 
                            : 'hover:bg-gray-50 dark:hover:bg-gray-50'
                        }`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <motion.div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                            isActiveLink('/blog') 
                              ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg' 
                              : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                          }`}
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ duration: 0.2 }}
                        >
                          <FileText className="w-4 h-4" />
                        </motion.div>
                        <div className="flex-1">
                                                  <span className={`text-sm font-medium transition-colors ${
                          isActiveLink('/blog') 
                            ? 'text-blue-700 dark:text-white' 
                            : 'text-gray-700 dark:text-gray-700 group-hover:text-blue-600 dark:group-hover:text-blue-600'
                        }`}>
                          Blog
                        </span>
                          {isActiveLink('/blog') && (
                            <motion.div
                              className="text-xs text-blue-600 dark:text-blue-400 mt-1"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.2 }}
                            >
                              Página atual
                            </motion.div>
                          )}
                        </div>
                        {isActiveLink('/blog') && (
                          <motion.div
                            className="w-2 h-2 bg-blue-500 rounded-full"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
                          />
                        )}
                      </Link>

                      <Link
                        to="/blog/sobre"
                        className={`group flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                          isActiveLink('/blog/sobre') 
                            ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 border-l-4 border-blue-500 shadow-lg' 
                            : 'hover:bg-gray-50 dark:hover:bg-gray-50'
                        }`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <motion.div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                            isActiveLink('/blog/sobre') 
                              ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg' 
                              : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                          }`}
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Info className="w-4 h-4" />
                        </motion.div>
                        <div className="flex-1">
                                                  <span className={`text-sm font-medium transition-colors ${
                          isActiveLink('/blog/sobre') 
                            ? 'text-blue-700 dark:text-white' 
                            : 'text-gray-700 dark:text-gray-700 group-hover:text-blue-600 dark:group-hover:text-blue-600'
                        }`}>
                          Sobre
                        </span>
                          {isActiveLink('/blog/sobre') && (
                            <motion.div
                              className="text-xs text-blue-600 dark:text-blue-400 mt-1"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.2 }}
                            >
                              Página atual
                            </motion.div>
                          )}
                        </div>
                        {isActiveLink('/blog/sobre') && (
                          <motion.div
                            className="w-2 h-2 bg-blue-500 rounded-full"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
                          />
                        )}
                      </Link>
                    </motion.div>

                    {/* Links do usuário logado */}
                    {user && (
                      <motion.div
                        className="px-2 py-1 border-t border-gray-100 dark:border-gray-800"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                      >
                        <div className="px-4 py-2">
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-200 uppercase tracking-wider">
                            Área do Usuário
                          </span>
                        </div>
                        
                        <Link
                          to="/dashboard"
                          className={`group flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                            isActiveLink('/dashboard') 
                              ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 border-l-4 border-blue-500 shadow-lg' 
                              : 'hover:bg-gray-50 dark:hover:bg-gray-50'
                          }`}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <motion.div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                              isActiveLink('/dashboard') 
                                ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg' 
                                : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                            }`}
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            transition={{ duration: 0.2 }}
                          >
                            <BarChart3 className="w-4 h-4" />
                          </motion.div>
                          <div className="flex-1">
                            <span className={`text-sm font-medium transition-colors ${
                              isActiveLink('/dashboard') 
                                ? 'text-blue-700 dark:text-white' 
                                : 'text-gray-700 dark:text-gray-700 group-hover:text-blue-600 dark:group-hover:text-blue-600'
                            }`}>
                              Dashboard
                            </span>
                            {isActiveLink('/dashboard') && (
                              <motion.div
                                className="text-xs text-blue-600 dark:text-blue-400 mt-1"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                              >
                                Página atual
                              </motion.div>
                            )}
                          </div>
                          {isActiveLink('/dashboard') && (
                            <motion.div
                              className="w-2 h-2 bg-blue-500 rounded-full"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
                            />
                          )}
                        </Link>

                        <Link
                          to="/gerador"
                          className={`group flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                            isActiveLink('/gerador') 
                              ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 border-l-4 border-blue-500 shadow-lg' 
                              : 'hover:bg-gray-50 dark:hover:bg-gray-50'
                          }`}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <motion.div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                              isActiveLink('/gerador') 
                                ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg' 
                                : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                            }`}
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Users className="w-4 h-4" />
                          </motion.div>
                          <div className="flex-1">
                            <span className={`text-sm font-medium transition-colors ${
                              isActiveLink('/gerador') 
                                ? 'text-blue-700 dark:text-white' 
                                : 'text-gray-700 dark:text-gray-700 group-hover:text-blue-600 dark:group-hover:text-blue-600'
                            }`}>
                              Gerar Leads
                            </span>
                            {isActiveLink('/gerador') && (
                              <motion.div
                                className="text-xs text-blue-600 dark:text-blue-400 mt-1"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                              >
                                Página atual
                              </motion.div>
                            )}
                          </div>
                          {isActiveLink('/gerador') && (
                            <motion.div
                              className="w-2 h-2 bg-blue-500 rounded-full"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
                            />
                          )}
                        </Link>

                        <Link
                          to="/disparador"
                          className={`group flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                            isActiveLink('/disparador') 
                              ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 border-l-4 border-blue-500 shadow-lg' 
                              : 'hover:bg-gray-50 dark:hover:bg-gray-50'
                          }`}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <motion.div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                              isActiveLink('/disparador') 
                                ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg' 
                                : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                            }`}
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            transition={{ duration: 0.2 }}
                          >
                            <MessageCircle className="w-4 h-4" />
                          </motion.div>
                          <div className="flex-1">
                            <span className={`text-sm font-medium transition-colors ${
                              isActiveLink('/disparador') 
                                ? 'text-blue-700 dark:text-white' 
                                : 'text-gray-700 dark:text-gray-700 group-hover:text-blue-600 dark:group-hover:text-blue-600'
                            }`}>
                              Disparador
                            </span>
                            {isActiveLink('/disparador') && (
                              <motion.div
                                className="text-xs text-blue-600 dark:text-blue-400 mt-1"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                              >
                                Página atual
                              </motion.div>
                            )}
                          </div>
                          {isActiveLink('/disparador') && (
                            <motion.div
                              className="w-2 h-2 bg-blue-500 rounded-full"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
                            />
                          )}
                        </Link>
                      </motion.div>
                    )}

                    {/* Botão de logout ou login */}
                    <motion.div
                      className="px-2 py-1 border-t border-gray-100 dark:border-gray-800"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.25 }}
                    >
                      {user ? (
                        <motion.button
                          onClick={() => {
                            handleLogout()
                            setIsMenuOpen(false)
                          }}
                          className="group w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300"
                          whileHover={{ x: 4, scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          transition={{ duration: 0.2 }}
                        >
                          <motion.div
                            className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center group-hover:bg-red-200 dark:group-hover:bg-red-900/50 transition-colors"
                            whileHover={{ scale: 1.1, rotate: -5 }}
                            transition={{ duration: 0.2 }}
                          >
                            <LogOut className="w-4 h-4" />
                          </motion.div>
                          <span className="text-sm font-medium">Sair da Conta</span>
                          <motion.div
                            className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
                            initial={{ x: 10 }}
                            animate={{ x: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ArrowRight className="w-4 h-4" />
                          </motion.div>
                        </motion.button>
                      ) : (
                        <div className="px-4 py-3">
                          <Link
                            to="/login"
                            className="block w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center py-3 px-6 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <motion.span
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.3 }}
                            >
                              Entrar na Plataforma
                            </motion.span>
                          </Link>
                        </div>
                      )}
                    </motion.div>
                  </motion.div>
                </motion.div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </nav>
  )
}