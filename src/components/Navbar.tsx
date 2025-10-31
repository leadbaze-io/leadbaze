import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { LogOut, Menu, X, Home, FileText, Info, BarChart3, Users, MessageCircle, ArrowRight, Crown, CreditCard } from 'lucide-react'
import { getCurrentUser, signOut, supabase } from '../lib/supabaseClient'
import LogoImage from './LogoImage'
import ThemeToggle from './ThemeToggle'
import { useSubscription } from '../hooks/useSubscription'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import './Navbar.css'

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

  // Animações removidas - usando CSS puro para melhor performance
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

  // Componente para links da NavBar com CSS transitions
  const NavLink = ({ to, children, className = "", onClick }: {
    to: string;
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
  }) => (
    <div className="nav-link-wrapper relative">
      <Link
        to={to}
        className={`relative px-3 py-2 rounded-lg font-medium transition-all duration-300 z-10 ${className}`}
        onClick={onClick}
      >
        {/* Efeito de fundo no hover - CSS puro */}
        <div className="nav-link-hover-bg" />
        {children}
        {/* Indicador de página ativa - CSS puro */}
        {isActiveLink(to) && (
          <>
            <div className="nav-link-active-bg" />
            <div className="nav-link-active-line" />
          </>
        )}
      </Link>
    </div>
  )

  return (
    <nav className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo com animação CSS pura */}
          <div className="flex items-center btn-animate-hover">
            <Link to="/" className="flex items-center">
              <LogoImage className="h-8 w-auto" />
            </Link>
          </div>

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
                <div className="relative nav-link-wrapper">
                  <button
                    onClick={() => {
                      // Verificar se estamos na landing page
                      if (location.pathname === '/') {

                        // Tentar múltiplos métodos para encontrar a seção
                        let pricingSection = document.getElementById('pricing-plans-section')

                        // Verificar se é a seção correta (não mobile)
                        if (pricingSection && pricingSection.classList.contains('md:hidden')) {

                          pricingSection = null
                        }

                        // Se não encontrar, tentar por classe (desktop)
                        if (!pricingSection) {
                          pricingSection = document.querySelector('section[id*="pricing"]:not(.md\\:hidden)')

                        }

                        // Se ainda não encontrar, tentar por texto (desktop)
                        if (!pricingSection) {
                          const sections = document.querySelectorAll('section:not(.md\\:hidden)')
                          for (const section of sections) {
                            if (section.textContent?.includes('Plano') || section.textContent?.includes('Preço')) {
                              pricingSection = section as HTMLElement

                              break
                            }
                          }
                        }

                        // Fallback: usar qualquer seção com pricing
                        if (!pricingSection) {
                          pricingSection = document.querySelector('[id*="pricing"]')

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
                      } else {

                        // Se não estiver na landing page, navegar para lá
                        navigate('/')
                        setTimeout(() => {

                          // Tentar múltiplos métodos para encontrar a seção
                          let pricingSection = document.getElementById('pricing-plans-section')

                          // Verificar se é a seção correta (não mobile)
                          if (pricingSection && pricingSection.classList.contains('md:hidden')) {

                            pricingSection = null
                          }

                          // Se não encontrar, tentar por classe (desktop)
                          if (!pricingSection) {
                            pricingSection = document.querySelector('section[id*="pricing"]:not(.md\\:hidden)')

                          }

                          // Se ainda não encontrar, tentar por texto (desktop)
                          if (!pricingSection) {
                            const sections = document.querySelectorAll('section:not(.md\\:hidden)')
                            for (const section of sections) {
                              if (section.textContent?.includes('Plano') || section.textContent?.includes('Preço')) {
                                pricingSection = section as HTMLElement

                                break
                              }
                            }
                          }

                          // Fallback: usar qualquer seção com pricing
                          if (!pricingSection) {
                            pricingSection = document.querySelector('[id*="pricing"]')

                          }

                          if (pricingSection) {
                            const elementPosition = pricingSection.getBoundingClientRect().top
                            const offsetPosition = elementPosition + window.pageYOffset - 80

                            window.scrollTo({
                              top: offsetPosition,
                              behavior: 'smooth'
                            })

                          } else {

                          }
                        }, 1000)
                      }
                    }}
                    className={`relative px-3 py-2 rounded-lg font-medium transition-all duration-300 z-10 btn-animate-hover ${
                      isPlansSectionActive ? 'text-green-400 font-semibold' : 'text-white hover:text-green-400'
                    }`}
                  >
                    {/* Efeito de fundo no hover - com z-index menor */}
                    <div
                      className="absolute inset-0 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg nav-link-hover-bg"
                      style={{ zIndex: -1 }}
                    />
                    Planos
                    {/* Indicador de página ativa - Nova animação */}
                    {isPlansSectionActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg nav-link-active-bg" />
                    )}
                    {/* Linha inferior quando ativo */}
                    {isPlansSectionActive && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full nav-link-active-line" style={{ transformOrigin: "left" }} />
                    )}
                    {/* Linha inferior no hover (quando não ativo) */}
                    {!isPlansSectionActive && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full opacity-0 hover:opacity-100 transition-opacity duration-300" style={{ transformOrigin: "left" }} />
                    )}
                  </button>
                </div>
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
                    <button
                      onClick={() => navigate('/plans')}
                      className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg font-semibold transition-all duration-200 btn-animate-hover"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Assinar Plano</span>
                    </button>
                  )}

                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-3 py-2 text-red-400 hover:text-red-300 transition-colors rounded-lg hover:bg-red-900/20 btn-animate-hover"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sair</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <div className="btn-animate-hover">
                  <Link

                    to="/login"

                    className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-2.5 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-medium shadow-lg hover:shadow-lg"
                  >
                    Entrar
                  </Link>
                </div>
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
              <button
                onClick={() => navigate('/plans')}
                className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg font-semibold text-xs transition-all duration-200 shadow-sm btn-animate-hover"
              >
                <CreditCard className="w-3 h-3" />
                <span>Assinar</span>
              </button>
            )}

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:text-green-400 transition-colors p-2 rounded-lg hover:bg-gray-700 btn-animate-hover"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu - Versão Profissional */}
        {isMenuOpen && (
          <>
              {/* Overlay de fundo */}
              <div
                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden mobile-menu-overlay show"
                onClick={() => setIsMenuOpen(false)}
              />

              {/* Menu principal */}
              <div
                className="absolute top-full left-0 right-0 z-50 md:hidden mobile-menu-container show"
              >
                {/* Container do menu */}
              <div
                className="bg-gray-900/95 backdrop-blur-xl border-t border-gray-700/50 shadow-2xl mobile-menu-content show"
                style={{ transformOrigin: "top" }}
              >
                  {/* Header do menu */}
                  <div
                    className="px-6 py-4 border-b border-gray-700"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full animate-pulse"></div>
                        <span className="text-sm font-semibold text-white">
                          Menu de Navegação
                        </span>
                      </div>
                      <button
                        onClick={() => setIsMenuOpen(false)}
                        className="p-2 rounded-full hover:bg-gray-700 transition-colors"
                      >
                        <X className="w-5 h-5 text-white" />
                      </button>
                    </div>
                  </div>

                  {/* Links de navegação */}
                  <div className="py-2">
                    {/* Links para usuários NÃO logados */}
                    {!user && (
                      <div
                        className="px-2 py-1"
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
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                              isActiveLink('/')

                                ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg'

                                : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                            }`}
                          >
                            <Home className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <span className={`text-sm font-medium transition-colors ${
                              isActiveLink('/')

                                ? 'text-green-400'

                                : 'text-white group-hover:text-green-400'
                            }`}>
                              Início
                            </span>
                            {isActiveLink('/') && (
                              <div
                                className="text-xs text-green-600 mt-1"
                              >
                                Página atual
                              </div>
                            )}
                          </div>
                          {isActiveLink('/') && (
                            <div
                              className="w-2 h-2 bg-green-500 rounded-full"
                            />
                          )}
                        </Link>

                        {/* Botão Planos para mobile */}
                        <button
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
                          className="group flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 hover:bg-gray-800 w-full text-left btn-animate-hover"
                        >
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg"
                          >
                            <Crown className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <span className="text-sm font-medium transition-colors text-white group-hover:text-green-400">
                              Planos
                            </span>
                            <div
                              className="text-xs text-gray-500 mt-1"
                            >
                              Ver preços
                            </div>
                          </div>
                        </button>

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
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                              isActiveLink('/blog/sobre')

                                ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg'

                                : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                            }`}
                          >
                            <Info className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <span className={`text-sm font-medium transition-colors ${
                              isActiveLink('/blog/sobre')

                                ? 'text-green-400'

                                : 'text-white group-hover:text-green-400'
                            }`}>
                              Sobre
                            </span>
                            {isActiveLink('/blog/sobre') && (
                              <div
                                className="text-xs text-green-600 mt-1"
                              >
                                Página atual
                              </div>
                            )}
                          </div>
                          {isActiveLink('/blog/sobre') && (
                            <div
                              className="w-2 h-2 bg-green-500 rounded-full"
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
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                              isActiveLink('/blog')

                                ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg'

                                : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                            }`}
                          >
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <span className={`text-sm font-medium transition-colors ${
                              isActiveLink('/blog')

                                ? 'text-green-400'

                                : 'text-white group-hover:text-green-400'
                            }`}>
                              Blog
                            </span>
                            {isActiveLink('/blog') && (
                              <div
                                className="text-xs text-green-600 mt-1"
                              >
                                Página atual
                              </div>
                            )}
                          </div>
                          {isActiveLink('/blog') && (
                            <div
                              className="w-2 h-2 bg-green-500 rounded-full"
                            />
                          )}
                        </Link>
                      </div>
                    )}

                    {/* Links do usuário logado */}
                    {user && (
                      <div
                        className="px-2 py-1 border-t border-gray-700"
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
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                              isActiveLink('/dashboard')

                                ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg'

                                : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                            }`}
                          >
                            <BarChart3 className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <span className={`text-sm font-medium transition-colors ${
                              isActiveLink('/dashboard')

                                ? 'text-green-400'

                                : 'text-white group-hover:text-green-400'
                            }`}>
                              Dashboard
                            </span>
                            {isActiveLink('/dashboard') && (
                              <div
                                className="text-xs text-green-600 mt-1"
                              >
                                Página atual
                              </div>
                            )}
                          </div>
                          {isActiveLink('/dashboard') && (
                            <div
                              className="w-2 h-2 bg-green-500 rounded-full"
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
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                              isActiveLink('/gerador')

                                ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg'

                                : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                            }`}
                          >
                            <Users className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <span className={`text-sm font-medium transition-colors ${
                              isActiveLink('/gerador')

                                ? 'text-green-400'

                                : 'text-white group-hover:text-green-400'
                            }`}>
                              Gerar Leads
                            </span>
                            {isActiveLink('/gerador') && (
                              <div
                                className="text-xs text-green-600 mt-1"
                              >
                                Página atual
                              </div>
                            )}
                          </div>
                          {isActiveLink('/gerador') && (
                            <div
                              className="w-2 h-2 bg-green-500 rounded-full"
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
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                              isActiveLink('/disparador')

                                ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg'

                                : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                            }`}
                          >
                            <MessageCircle className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <span className={`text-sm font-medium transition-colors ${
                              isActiveLink('/disparador')

                                ? 'text-green-400'

                                : 'text-white group-hover:text-green-400'
                            }`}>
                              Disparador
                            </span>
                            {isActiveLink('/disparador') && (
                              <div
                                className="text-xs text-green-600 mt-1"
                              >
                                Página atual
                              </div>
                            )}
                          </div>
                          {isActiveLink('/disparador') && (
                            <div
                              className="w-2 h-2 bg-green-500 rounded-full"
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
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                              isActiveLink('/profile')

                                ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg'

                                : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                            }`}
                          >
                            <Users className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <span className={`text-sm font-medium transition-colors ${
                              isActiveLink('/profile')

                                ? 'text-green-400'

                                : 'text-white group-hover:text-green-400'
                            }`}>
                              Meu Perfil
                            </span>
                            {isActiveLink('/profile') && (
                              <div
                                className="text-xs text-green-600 mt-1"
                              >
                                Página atual
                              </div>
                            )}
                          </div>
                          {isActiveLink('/profile') && (
                            <div
                              className="w-2 h-2 bg-green-500 rounded-full"
                            />
                          )}
                        </Link>

                      </div>
                    )}

                    {/* Blog Automation Dashboard - Mobile - Apenas para admin */}
                    {isAdminAuthorized && (
                      <div
                        className="px-2 py-1"
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
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                              isActiveLink('/admin/blog-automation')

                                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg'

                                : 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg'
                            }`}
                          >
                            <span className="text-sm font-bold">BA</span>
                          </div>
                          <div className="flex-1">
                            <span className={`text-sm font-medium transition-colors ${
                              isActiveLink('/admin/blog-automation')

                                ? 'text-green-400'

                                : 'text-white group-hover:text-green-400'
                            }`}>
                              Blog Automation
                            </span>
                            {isActiveLink('/admin/blog-automation') && (
                              <div
                                className="text-xs text-green-600 mt-1"
                              >
                                Página atual
                              </div>
                            )}
                          </div>
                          {isActiveLink('/admin/blog-automation') && (
                            <div
                              className="w-2 h-2 bg-green-500 rounded-full"
                            />
                          )}
                        </Link>
                      </div>
                    )}

                    {/* Botão de logout ou login */}
                    <div
                      className="px-2 py-1 border-t border-gray-100"
                    >
                      {user ? (
                        <button
                          onClick={() => {
                            handleLogout()
                            setIsMenuOpen(false)
                          }}
                          className="group w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-all duration-300 btn-animate-hover"
                        >
                          <div
                            className="w-8 h-8 rounded-lg bg-red-900/30 flex items-center justify-center group-hover:bg-red-800/40 transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-medium">Sair da Conta</span>
                          <div
                            className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        </button>
                      ) : (
                        <div className="px-4 py-3">
                          <Link
                            to="/login"
                            className="block w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white text-center py-3 px-6 rounded-xl font-medium hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            Entrar na Plataforma
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
      </div>
    </nav>
  )
}