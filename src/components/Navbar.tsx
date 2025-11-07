import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { LogOut, Menu, X, Home, FileText, Info, BarChart3, Users, MessageCircle, ArrowRight, Crown, CreditCard } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { getCurrentUser, signOut, supabase } from '../lib/supabaseClient'
import LogoImage from './LogoImage'
import ThemeToggle from './ThemeToggle'
import { useSubscription } from '../hooks/useSubscription'
import type { User as SupabaseUser } from '@supabase/supabase-js'

export default function Navbar() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAdminAuthorized, setIsAdminAuthorized] = useState(false)
  const [isPlansSectionActive, setIsPlansSectionActive] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { subscription, isLoading: subscriptionLoading } = useSubscription()

  // Páginas onde o ThemeToggle deve aparecer (APENAS páginas da aplicação)
  // Blog não tem ThemeToggle - sempre modo claro
  const showThemeToggle = ['/login', '/dashboard', '/profile', '/gerador', '/disparador', '/disparador-novo', '/plans'].some(path =>

    location.pathname.startsWith(path)
  ) || location.pathname.startsWith('/lista/')

  // Verificar se deve mostrar o botão "Assinar Plano"
  const shouldShowSubscribeButton = user && !subscriptionLoading && (
    !subscription ||

    subscription.status === 'cancelled' ||

    subscription.status === 'expired'
  )

  // Função para verificar se usuário é admin autorizado
  const checkAdminAuthorization = async (userEmail: string | undefined) => {
    if (!userEmail) {
      setIsAdminAuthorized(false);
      return;
    }

    // Verificação por e-mail direto (fallback)
    if (userEmail === 'creaty12345@gmail.com') {
      setIsAdminAuthorized(true);
      return;
    }

    // Verificação por hash (mais seguro)
    try {
      const salt = 'leadflow-blog-automation-2024';
      const encoder = new TextEncoder();
      const keyData = encoder.encode(salt);
      const messageData = encoder.encode(userEmail);

      const key = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );

      const signature = await crypto.subtle.sign('HMAC', key, messageData);
      const hashArray = Array.from(new Uint8Array(signature));
      const emailHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      const expectedHash = '742b0188bdd92a56f71b6cd8cd3f10679af59842413ae26468f681e129584747';

      setIsAdminAuthorized(emailHash === expectedHash);
    } catch (error) {

      setIsAdminAuthorized(false);
    }
  };

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
    if (path === '/profile') {
      return location.pathname === '/profile'
    }
    if (path === '/gerador') {
      return location.pathname === '/gerador'
    }
    if (path === '/disparador') {
      return location.pathname === '/disparador' || location.pathname === '/disparador-novo'
    }
    if (path === '/admin/blog-automation') {
      return location.pathname === '/admin/blog-automation'
    }
    return location.pathname.startsWith(path)
  }

  // Função para verificar se o botão Planos está ativo (na seção de planos)
  const isPlansActive = () => {
    if (location.pathname !== '/') return false

    // Verificar se há um elemento de planos visível na tela
    const pricingSection = document.getElementById('pricing-plans-section')
    if (!pricingSection) return false

    const rect = pricingSection.getBoundingClientRect()
    const windowHeight = window.innerHeight

    // Considerar ativo se a seção está visível na tela (pelo menos 30% visível)
    return rect.top < windowHeight * 0.7 && rect.bottom > windowHeight * 0.3
  }

  // Animações para os links - otimizadas para suavidade e consistência
  const linkVariants = {
    hover: {
      y: -2,
      scale: 1.05,
      transition: {
        duration: 0.3,
        ease: "easeOut" as const
      }
    },
    tap: {
      scale: 0.95,
      y: 0,
      transition: {
        duration: 0.15
      }
    }
  }
  useEffect(() => {
    // Verificar usuário logado inicialmente
    const checkUser = async () => {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
      await checkAdminAuthorization(currentUser?.email)
    }
    checkUser()

    // Configurar listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {

        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user)
          await checkAdminAuthorization(session.user.email)
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setIsAdminAuthorized(false)
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          setUser(session.user)
          await checkAdminAuthorization(session.user.email)
        }
      }
    )

    // Cleanup do listener
    return () => subscription.unsubscribe()
  }, [])

  // Monitorar scroll para detectar se a seção de planos está ativa
  useEffect(() => {
    const handleScroll = () => {
      if (location.pathname === '/') {
        setIsPlansSectionActive(isPlansActive())
      } else {
        setIsPlansSectionActive(false)
      }
    }

    // Verificar inicialmente
    handleScroll()

    // Adicionar listener de scroll
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [location.pathname])

  const handleLogout = async () => {
    await signOut()
    setUser(null)
    navigate('/')
  }

  // Componente para links da NavBar com animações
  const NavLink = ({ to, children, className = "", variants = linkVariants, onClick }: {

    to: string;

    children: React.ReactNode;

    className?: string;
    variants?: any;
    onClick?: () => void;
  }) => (
    <motion.div
      variants={variants}
      whileHover="hover"
      whileTap="tap"
      className="relative"
    >
      <Link

        to={to}

        className={`relative px-3 py-2 rounded-lg font-medium transition-all duration-300 z-10 ${className}`}
        onClick={onClick}
      >
        {/* Efeito de fundo no hover - com z-index menor */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg opacity-0"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          style={{ zIndex: -1 }}
        />
        {children}
        {/* Indicador de página ativa - Nova animação */}
        {isActiveLink(to) && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg"
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
            className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full"
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
    <nav className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo com animação */}
          <motion.div

            className="flex items-center"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.15 }}
          >
            <Link 
              to="/" 
              className="flex items-center"
              onClick={(e) => {
                // Se estiver na landing page, fazer scroll suave para o topo
                if (location.pathname === '/') {
                  e.preventDefault()
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }
              }}
            >
              <LogoImage className="h-8 w-auto" />
            </Link>
          </motion.div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-2">
            {/* Links para usuários NÃO logados */}
            {!user && (
              <>
                <NavLink

                  to="/"

                  className={`text-white hover:text-green-400 transition-colors ${
                    isActiveLink('/') ? 'text-green-400 font-semibold' : ''
                  }`}
                  onClick={() => {
                    // Scroll para o topo após navegação
                    setTimeout(() => {
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }, 100)
                  }}
                >
                  Início
                </NavLink>
                <motion.div
                  variants={linkVariants}
                  whileHover="hover"
                  whileTap="tap"
                  className="relative"
                >
                  <motion.button
                    onClick={() => {
                      // Buscar TODAS as seções desktop e encontrar a de planos
                      const findPlansSection = () => {
                        // Primeiro tentar pelo ID
                        let section = document.getElementById('pricing-plans-section-desktop')
                        if (section) {
                          const h2 = section.querySelector('h2')
                          const text = h2?.textContent || ''
                          if (!text.includes('Líderes de Vendas') && text.includes('Escolha o Plano')) {
                            return section
                          }
                        }
                        
                        // Se não encontrou, buscar em todas as seções desktop
                        const desktopContainer = document.querySelector('div.hidden.md\\:block')
                        if (desktopContainer) {
                          const allSections = desktopContainer.querySelectorAll('section')
                          for (const s of allSections) {
                            const section = s as HTMLElement
                            if (section.id === 'testimonials-section') continue
                            
                            const h2 = section.querySelector('h2')
                            if (!h2) continue
                            
                            const text = h2.textContent || ''
                            if (text.includes('Escolha o Plano') && 
                                text.includes('Perfeito para Você') &&
                                !text.includes('Líderes de Vendas')) {
                              return section
                            }
                          }
                        }
                        return null
                      }
                      
                      if (location.pathname === '/') {
                        const section = findPlansSection()
                        if (section) {
                          section.scrollIntoView({ behavior: 'smooth', block: 'start' })
                        } else {
                          setTimeout(() => {
                            const section = findPlansSection()
                            if (section) {
                              section.scrollIntoView({ behavior: 'smooth', block: 'start' })
                            }
                          }, 100)
                        }
                      } else {
                        navigate('/')
                        setTimeout(() => {
                          const section = findPlansSection()
                          if (section) {
                            section.scrollIntoView({ behavior: 'smooth', block: 'start' })
                          }
                        }, 500)
                      }
                    }}
                    className={`relative px-3 py-2 rounded-lg font-medium transition-all duration-300 z-10 ${
                      isPlansSectionActive ? 'text-green-400 font-semibold' : 'text-white hover:text-green-400'
                    }`}
                  >
                    {/* Efeito de fundo no hover - com z-index menor */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg opacity-0"
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      style={{ zIndex: -1 }}
                    />
                    Planos
                    {/* Indicador de página ativa - Nova animação */}
                    {isPlansSectionActive && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{
                          duration: 0.3,
                          ease: "easeOut"
                        }}
                      />
                    )}
                    {/* Linha inferior quando ativo */}
                    {isPlansSectionActive && (
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full"
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
                    {/* Linha inferior no hover (quando não ativo) */}
                    {!isPlansSectionActive && (
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full"
                        initial={{ scaleX: 0, opacity: 0 }}
                        whileHover={{ scaleX: 1, opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        style={{ transformOrigin: "left" }}
                      />
                    )}
                  </motion.button>
                </motion.div>
                <NavLink

                  to="/blog/sobre"

                  className={`text-white hover:text-green-400 transition-colors ${
                    isActiveLink('/blog/sobre') ? 'text-green-400 font-semibold' : ''
                  }`}
                  onClick={() => {
                    // Scroll para o topo após navegação
                    setTimeout(() => {
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }, 100)
                  }}
                >
                  Sobre
                </NavLink>
                <NavLink

                  to="/blog"

                  className={`text-white hover:text-green-400 transition-colors ${
                    isActiveLink('/blog') ? 'text-green-400 font-semibold' : ''
                  }`}
                  onClick={() => {
                    // Scroll para o topo após navegação
                    setTimeout(() => {
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }, 100)
                  }}
                >
                  Blog
                </NavLink>
              </>
            )}

            {user ? (
              <>
                <NavLink

                  to="/dashboard"

                  className={`text-white hover:text-green-400 transition-colors ${
                    isActiveLink('/dashboard') ? 'text-green-400 font-semibold' : ''
                  }`}
                  onClick={() => {
                    // Scroll para o topo após navegação
                    setTimeout(() => {
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }, 100)
                  }}
                >
                  Dashboard
                </NavLink>
                <NavLink

                  to="/gerador"

                  className={`text-white hover:text-green-400 transition-colors ${
                    isActiveLink('/gerador') ? 'text-green-400 font-semibold' : ''
                  }`}
                  onClick={() => {
                    // Scroll para o topo após navegação
                    setTimeout(() => {
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }, 100)
                  }}
                >
                  Gerar Leads
                </NavLink>
                <NavLink

                  to="/disparador"

                  className={`text-white hover:text-green-400 transition-colors ${
                    isActiveLink('/disparador') ? 'text-green-400 font-semibold' : ''
                  }`}
                  onClick={() => {
                    // Scroll para o topo após navegação
                    setTimeout(() => {
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }, 100)
                  }}
                >
                  Disparador
                </NavLink>
                <NavLink

                  to="/profile"

                  className={`text-white hover:text-green-400 transition-colors ${
                    isActiveLink('/profile') ? 'text-green-400 font-semibold' : ''
                  }`}
                  onClick={() => {
                    // Scroll para o topo após navegação
                    setTimeout(() => {
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }, 100)
                  }}
                >
                  Meu Perfil
                </NavLink>

                {/* Blog Automation Dashboard - Apenas para admin autorizado */}
                {isAdminAuthorized && (
                  <NavLink

                    to="/admin/blog-automation"

                    className={`text-white hover:text-green-400 transition-colors ${
                      isActiveLink('/admin/blog-automation') ? 'text-green-400 font-semibold' : ''
                    }`}
                  >
                    Blog Auto
                  </NavLink>
                )}
                <div className="flex items-center space-x-4 ml-4">
                  <div className="w-10 h-10 flex items-center justify-center">
                    {showThemeToggle ? (
                      <ThemeToggle />
                    ) : (
                      <div className="w-10 h-10" />
                    )}
                  </div>

                  {/* Botão Assinar Plano - apenas para usuários sem assinatura ativa */}
                  {shouldShowSubscribeButton && (
                    <motion.button
                      onClick={() => navigate('/plans')}
                      className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg font-semibold transition-all duration-200"
                      whileHover={{ scale: 1.02, y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Assinar Plano</span>
                    </motion.button>
                  )}

                  <motion.button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-3 py-2 text-red-400 hover:text-red-300 transition-colors rounded-lg hover:bg-red-900/20"
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

                    className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-2.5 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-medium shadow-lg hover:shadow-lg"
                  >
                    Entrar
                  </Link>
                </motion.div>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <div className="w-10 h-10 flex items-center justify-center">
              {user && showThemeToggle ? (
                <ThemeToggle />
              ) : (
                <div className="w-10 h-10" />
              )}
            </div>

            {/* Botão Assinar Plano - Mobile - apenas para usuários sem assinatura ativa */}
            {shouldShowSubscribeButton && (
              <motion.button
                onClick={() => navigate('/plans')}
                className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg font-semibold text-xs transition-all duration-200 shadow-sm"
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.15 }}
              >
                <CreditCard className="w-3 h-3" />
                <span>Assinar</span>
              </motion.button>
            )}

            <motion.button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:text-green-400 transition-colors p-2 rounded-lg hover:bg-gray-700"
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
                className="bg-gray-900/95 backdrop-blur-xl border-t border-gray-700/50 shadow-2xl"
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
                    className="px-6 py-4 border-b border-gray-700"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full animate-pulse"></div>
                        <span className="text-sm font-semibold text-white">
                          Menu de Navegação
                        </span>
                      </div>
                      <motion.button
                        onClick={() => setIsMenuOpen(false)}
                        className="p-2 rounded-full hover:bg-gray-700 transition-colors"
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                      >
                        <X className="w-5 h-5 text-white" />
                      </motion.button>
                    </div>
                  </motion.div>

                  {/* Links de navegação */}
                  <motion.div className="py-2">
                    {/* Links para usuários NÃO logados */}
                    {!user && (
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

                              ? 'bg-gradient-to-r from-green-900/50 to-emerald-900/50 border-l-4 border-green-500 shadow-lg'

                              : 'hover:bg-gray-800'
                          }`}
                          onClick={() => {
                            setIsMenuOpen(false)
                            // Scroll para o topo após navegação
                            setTimeout(() => {
                              window.scrollTo({ top: 0, behavior: 'smooth' })
                            }, 100)
                          }}
                        >
                          <motion.div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                              isActiveLink('/')

                                ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg'

                                : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                            }`}
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Home className="w-4 h-4" />
                          </motion.div>
                          <div className="flex-1">
                            <span className={`text-sm font-medium transition-colors ${
                              isActiveLink('/')

                                ? 'text-green-400'

                                : 'text-white group-hover:text-green-400'
                            }`}>
                              Início
                            </span>
                            {isActiveLink('/') && (
                              <motion.div
                                className="text-xs text-green-600 mt-1"
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
                              className="w-2 h-2 bg-green-500 rounded-full"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
                            />
                          )}
                        </Link>

                        {/* Botão Planos para mobile */}
                        <motion.button
                          onClick={() => {
                            setIsMenuOpen(false)
                            // Verificar se estamos na landing page
                            if (location.pathname === '/') {
                              setTimeout(() => {
                                // Tentar múltiplos métodos para encontrar a seção
                                let pricingSection = document.getElementById('pricing-plans-section')

                                // Para mobile, usar a seção mobile (md:hidden)
                                if (pricingSection && !pricingSection.classList.contains('md:hidden')) {

                                  pricingSection = document.querySelector('section[id*="pricing"].md\\:hidden')
                                }

                                // Se não encontrar, tentar por classe
                                if (!pricingSection) {
                                  pricingSection = document.querySelector('[id*="pricing"]')
                                }

                                // Se ainda não encontrar, tentar por texto
                                if (!pricingSection) {
                                  const sections = document.querySelectorAll('section')
                                  for (const section of sections) {
                                    if (section.textContent?.includes('Plano') || section.textContent?.includes('Preço')) {
                                      pricingSection = section
                                      break
                                    }
                                  }
                                }

                                if (pricingSection) {
                                  // Scroll com offset para compensar navbar fixa
                                  const elementPosition = pricingSection.getBoundingClientRect().top
                                  const offsetPosition = elementPosition + window.pageYOffset - 80

                                  window.scrollTo({
                                    top: offsetPosition,
                                    behavior: 'smooth'
                                  })
                                } else {
                                  // Método alternativo: scroll para o final da página
                                  window.scrollTo({
                                    top: document.body.scrollHeight,
                                    behavior: 'smooth'
                                  })
                                }
                              }, 300)
                            } else {
                              // Se não estiver na landing page, navegar para lá
                              navigate('/')
                              setTimeout(() => {
                                // Tentar múltiplos métodos para encontrar a seção
                                let pricingSection = document.getElementById('pricing-plans-section')

                                // Para mobile, usar a seção mobile (md:hidden)
                                if (pricingSection && !pricingSection.classList.contains('md:hidden')) {

                                  pricingSection = document.querySelector('section[id*="pricing"].md\\:hidden')
                                }

                                // Se não encontrar, tentar por classe
                                if (!pricingSection) {
                                  pricingSection = document.querySelector('[id*="pricing"]')
                                }

                                // Se ainda não encontrar, tentar por texto
                                if (!pricingSection) {
                                  const sections = document.querySelectorAll('section')
                                  for (const section of sections) {
                                    if (section.textContent?.includes('Plano') || section.textContent?.includes('Preço')) {
                                      pricingSection = section
                                      break
                                    }
                                  }
                                }

                                if (pricingSection) {
                                  const elementPosition = pricingSection.getBoundingClientRect().top
                                  const offsetPosition = elementPosition + window.pageYOffset - 80

                                  window.scrollTo({
                                    top: offsetPosition,
                                    behavior: 'smooth'
                                  })
                                } else {
                                  // Método alternativo: scroll para o final da página
                                  window.scrollTo({
                                    top: document.body.scrollHeight,
                                    behavior: 'smooth'
                                  })
                                }
                              }, 1000)
                            }
                          }}
                          className="group flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 hover:bg-gray-800 w-full text-left"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <motion.div
                            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg"
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Crown className="w-4 h-4" />
                          </motion.div>
                          <div className="flex-1">
                            <span className="text-sm font-medium transition-colors text-white group-hover:text-green-400">
                              Planos
                            </span>
                            <motion.div
                              className="text-xs text-gray-500 mt-1"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.2 }}
                            >
                              Ver preços
                            </motion.div>
                          </div>
                        </motion.button>

                        <Link
                          to="/blog/sobre"
                          className={`group flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                            isActiveLink('/blog/sobre')

                              ? 'bg-gradient-to-r from-green-900/50 to-emerald-900/50 border-l-4 border-green-500 shadow-lg'

                              : 'hover:bg-gray-800'
                          }`}
                          onClick={() => {
                            setIsMenuOpen(false)
                            // Scroll para o topo após navegação
                            setTimeout(() => {
                              window.scrollTo({ top: 0, behavior: 'smooth' })
                            }, 100)
                          }}
                        >
                          <motion.div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                              isActiveLink('/blog/sobre')

                                ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg'

                                : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                            }`}
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Info className="w-4 h-4" />
                          </motion.div>
                          <div className="flex-1">
                            <span className={`text-sm font-medium transition-colors ${
                              isActiveLink('/blog/sobre')

                                ? 'text-green-400'

                                : 'text-white group-hover:text-green-400'
                            }`}>
                              Sobre
                            </span>
                            {isActiveLink('/blog/sobre') && (
                              <motion.div
                                className="text-xs text-green-600 mt-1"
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
                              className="w-2 h-2 bg-green-500 rounded-full"
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

                              ? 'bg-gradient-to-r from-green-900/50 to-emerald-900/50 border-l-4 border-green-500 shadow-lg'

                              : 'hover:bg-gray-800'
                          }`}
                          onClick={() => {
                            setIsMenuOpen(false)
                            // Scroll para o topo após navegação
                            setTimeout(() => {
                              window.scrollTo({ top: 0, behavior: 'smooth' })
                            }, 100)
                          }}
                        >
                          <motion.div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                              isActiveLink('/blog')

                                ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg'

                                : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                            }`}
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            transition={{ duration: 0.2 }}
                          >
                            <FileText className="w-4 h-4" />
                          </motion.div>
                          <div className="flex-1">
                            <span className={`text-sm font-medium transition-colors ${
                              isActiveLink('/blog')

                                ? 'text-green-400'

                                : 'text-white group-hover:text-green-400'
                            }`}>
                              Blog
                            </span>
                            {isActiveLink('/blog') && (
                              <motion.div
                                className="text-xs text-green-600 mt-1"
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
                              className="w-2 h-2 bg-green-500 rounded-full"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
                            />
                          )}
                        </Link>
                      </motion.div>
                    )}

                    {/* Links do usuário logado */}
                    {user && (
                      <motion.div
                        className="px-2 py-1 border-t border-gray-700"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                      >
                        <div className="px-4 py-2">
                          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Área do Usuário
                          </span>
                        </div>

                        <Link
                          to="/dashboard"
                          className={`group flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                            isActiveLink('/dashboard')

                              ? 'bg-gradient-to-r from-green-900/50 to-emerald-900/50 border-l-4 border-green-500 shadow-lg'

                              : 'hover:bg-gray-800'
                          }`}
                          onClick={() => {
                            setIsMenuOpen(false)
                            // Scroll para o topo após navegação
                            setTimeout(() => {
                              window.scrollTo({ top: 0, behavior: 'smooth' })
                            }, 100)
                          }}
                        >
                          <motion.div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                              isActiveLink('/dashboard')

                                ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg'

                                : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                            }`}
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            transition={{ duration: 0.2 }}
                          >
                            <BarChart3 className="w-4 h-4" />
                          </motion.div>
                          <div className="flex-1">
                            <span className={`text-sm font-medium transition-colors ${
                              isActiveLink('/dashboard')

                                ? 'text-green-400'

                                : 'text-white group-hover:text-green-400'
                            }`}>
                              Dashboard
                            </span>
                            {isActiveLink('/dashboard') && (
                              <motion.div
                                className="text-xs text-green-600 mt-1"
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
                              className="w-2 h-2 bg-green-500 rounded-full"
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

                              ? 'bg-gradient-to-r from-green-900/50 to-emerald-900/50 border-l-4 border-green-500 shadow-lg'

                              : 'hover:bg-gray-800'
                          }`}
                          onClick={() => {
                            setIsMenuOpen(false)
                            // Scroll para o topo após navegação
                            setTimeout(() => {
                              window.scrollTo({ top: 0, behavior: 'smooth' })
                            }, 100)
                          }}
                        >
                          <motion.div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                              isActiveLink('/gerador')

                                ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg'

                                : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                            }`}
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Users className="w-4 h-4" />
                          </motion.div>
                          <div className="flex-1">
                            <span className={`text-sm font-medium transition-colors ${
                              isActiveLink('/gerador')

                                ? 'text-green-400'

                                : 'text-white group-hover:text-green-400'
                            }`}>
                              Gerar Leads
                            </span>
                            {isActiveLink('/gerador') && (
                              <motion.div
                                className="text-xs text-green-600 mt-1"
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
                              className="w-2 h-2 bg-green-500 rounded-full"
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

                              ? 'bg-gradient-to-r from-green-900/50 to-emerald-900/50 border-l-4 border-green-500 shadow-lg'

                              : 'hover:bg-gray-800'
                          }`}
                          onClick={() => {
                            setIsMenuOpen(false)
                            // Scroll para o topo após navegação
                            setTimeout(() => {
                              window.scrollTo({ top: 0, behavior: 'smooth' })
                            }, 100)
                          }}
                        >
                          <motion.div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                              isActiveLink('/disparador')

                                ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg'

                                : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                            }`}
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            transition={{ duration: 0.2 }}
                          >
                            <MessageCircle className="w-4 h-4" />
                          </motion.div>
                          <div className="flex-1">
                            <span className={`text-sm font-medium transition-colors ${
                              isActiveLink('/disparador')

                                ? 'text-green-400'

                                : 'text-white group-hover:text-green-400'
                            }`}>
                              Disparador
                            </span>
                            {isActiveLink('/disparador') && (
                              <motion.div
                                className="text-xs text-green-600 mt-1"
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
                              className="w-2 h-2 bg-green-500 rounded-full"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
                            />
                          )}
                        </Link>

                        <Link
                          to="/profile"
                          className={`group flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                            isActiveLink('/profile')

                              ? 'bg-gradient-to-r from-green-900/50 to-emerald-900/50 border-l-4 border-green-500 shadow-lg'

                              : 'hover:bg-gray-800'
                          }`}
                          onClick={() => {
                            setIsMenuOpen(false)
                            setTimeout(() => {
                              window.scrollTo({ top: 0, behavior: 'smooth' })
                            }, 100)
                          }}
                        >
                          <motion.div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                              isActiveLink('/profile')

                                ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg'

                                : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                            }`}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Users className="w-4 h-4" />
                          </motion.div>
                          <div className="flex-1">
                            <span className={`text-sm font-medium transition-colors ${
                              isActiveLink('/profile')

                                ? 'text-green-400'

                                : 'text-white group-hover:text-green-400'
                            }`}>
                              Meu Perfil
                            </span>
                            {isActiveLink('/profile') && (
                              <motion.div
                                className="text-xs text-green-600 mt-1"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                              >
                                Página atual
                              </motion.div>
                            )}
                          </div>
                          {isActiveLink('/profile') && (
                            <motion.div
                              className="w-2 h-2 bg-green-500 rounded-full"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
                            />
                          )}
                        </Link>

                      </motion.div>
                    )}

                    {/* Blog Automation Dashboard - Mobile - Apenas para admin */}
                    {isAdminAuthorized && (
                      <motion.div
                        className="px-2 py-1"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                      >
                        <Link
                          to="/admin/blog-automation"
                          className={`group flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                            isActiveLink('/admin/blog-automation')

                              ? 'bg-gradient-to-r from-green-50 to-green-100 border-l-4 border-green-500 shadow-lg'

                              : 'hover:bg-gray-800'
                          }`}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <motion.div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                              isActiveLink('/admin/blog-automation')

                                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg'

                                : 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg'
                            }`}
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            transition={{ duration: 0.2 }}
                          >
                            <span className="text-sm font-bold">BA</span>
                          </motion.div>
                          <div className="flex-1">
                            <span className={`text-sm font-medium transition-colors ${
                              isActiveLink('/admin/blog-automation')

                                ? 'text-green-400'

                                : 'text-white group-hover:text-green-400'
                            }`}>
                              Blog Automation
                            </span>
                            {isActiveLink('/admin/blog-automation') && (
                              <motion.div
                                className="text-xs text-green-600 mt-1"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                              >
                                Página atual
                              </motion.div>
                            )}
                          </div>
                          {isActiveLink('/admin/blog-automation') && (
                            <motion.div
                              className="w-2 h-2 bg-green-500 rounded-full"
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
                      className="px-2 py-1 border-t border-gray-100"
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
                          className="group w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-all duration-300"
                          whileHover={{ x: 4, scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          transition={{ duration: 0.2 }}
                        >
                          <motion.div
                            className="w-8 h-8 rounded-lg bg-red-900/30 flex items-center justify-center group-hover:bg-red-800/40 transition-colors"
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
                            className="block w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white text-center py-3 px-6 rounded-xl font-medium hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
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