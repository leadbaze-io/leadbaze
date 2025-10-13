import { useNavigate } from 'react-router-dom'
import { Mail, Phone } from 'lucide-react'
import { useState, useEffect } from 'react'
import { getCurrentUser } from '../../lib/supabaseClient'
import LogoImage from '../LogoImage'
import type { User } from '@supabase/supabase-js'

export default function MobileFooter() {
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const checkUser = async () => {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
    }
    checkUser()
  }, [])

  const handleNavigation = (path: string) => {
    navigate(path)
    // Scroll para o topo após navegação
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 100)
  }

  return (
    <footer className="md:hidden relative text-white overflow-hidden" style={{backgroundColor: '#1A3A3A'}}>
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-48 h-48 bg-gradient-to-br from-green-500/20 to-cyan-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-gradient-to-br from-green-500/20 to-cyan-500/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-md mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Logo e Descrição */}
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <LogoImage className="h-8 w-auto" />
            </div>
            <p className="text-gray-300 mb-4 text-sm leading-relaxed">
              A plataforma mais eficiente para gerar leads qualificados usando dados do Google Maps.
              Transforme localizações em oportunidades de negócio.
            </p>
            <div className="space-y-2">
              <div className="flex items-center justify-center space-x-2 text-gray-300">
                <Mail className="w-4 h-4" />
                <span className="text-xs">leadbaze@gmail.com</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-gray-300">
                <Phone className="w-4 h-4" />
                <span className="text-xs">31 97266-1278</span>
              </div>
            </div>
          </div>

          {/* Links Rápidos */}
          <div className="text-center">
            <h3 className="text-base font-semibold mb-3 text-white">Links Rápidos</h3>
            <div className="space-y-2">
              {/* Links para usuários NÃO logados */}
              {!user && (
                <>
                  <button
                    onClick={() => {
                      handleNavigation('/')
                      setTimeout(() => {
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                      }, 100)
                    }}
                    className="block text-gray-300 hover:text-white transition-colors text-sm w-full"
                  >
                    Início
                  </button>
                  <button
                    onClick={() => {
                      if (window.location.pathname === '/') {
                        document.getElementById('pricing-plans-section')?.scrollIntoView({
                          behavior: 'smooth'
                        })
                      } else {
                        navigate('/')
                        setTimeout(() => {
                          let pricingSection = document.getElementById('pricing-plans-section')
                          if (pricingSection && pricingSection.classList.contains('md:hidden')) {
                            pricingSection = null
                          }
                          if (!pricingSection) {
                            pricingSection = document.querySelector('section[id*="pricing"]:not(.md\\:hidden)')
                          }
                          if (!pricingSection) {
                            const sections = document.querySelectorAll('section:not(.md\\:hidden)')
                            for (const section of sections) {
                              if (section.textContent?.includes('Plano') || section.textContent?.includes('Preço')) {
                                pricingSection = section as HTMLElement
                                break
                              }
                            }
                          }
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
                            window.scrollTo({
                              top: document.body.scrollHeight,
                              behavior: 'smooth'
                            })
                          }
                        }, 1000)
                      }
                    }}
                    className="block text-gray-300 hover:text-white transition-colors text-sm w-full"
                  >
                    Planos
                  </button>
                  <button
                    onClick={() => {
                      handleNavigation('/blog/sobre')
                      setTimeout(() => {
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                      }, 100)
                    }}
                    className="block text-gray-300 hover:text-white transition-colors text-sm w-full"
                  >
                    Sobre
                  </button>
                  <button
                    onClick={() => {
                      handleNavigation('/blog')
                      setTimeout(() => {
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                      }, 100)
                    }}
                    className="block text-gray-300 hover:text-white transition-colors text-sm w-full"
                  >
                    Blog
                  </button>
                </>
              )}

              {/* Links para usuários logados */}
              {user && (
                <>
                  <button
                    onClick={() => {
                      handleNavigation('/profile')
                      setTimeout(() => {
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                      }, 100)
                    }}
                    className="block text-gray-300 hover:text-white transition-colors text-sm w-full"
                  >
                    Meu Perfil
                  </button>
                  <button
                    onClick={() => {
                      handleNavigation('/dashboard')
                      setTimeout(() => {
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                      }, 100)
                    }}
                    className="block text-gray-300 hover:text-white transition-colors text-sm w-full"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => {
                      handleNavigation('/gerador')
                      setTimeout(() => {
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                      }, 100)
                    }}
                    className="block text-gray-300 hover:text-white transition-colors text-sm w-full"
                  >
                    Gerar Leads
                  </button>
                  <button
                    onClick={() => {
                      handleNavigation('/disparador')
                      setTimeout(() => {
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                      }, 100)
                    }}
                    className="block text-gray-300 hover:text-white transition-colors text-sm w-full"
                  >
                    Disparador
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Suporte */}
          <div className="text-center">
            <h3 className="text-base font-semibold mb-3 text-white">Suporte</h3>
            <div className="space-y-2">
              <button
                onClick={() => {
                  const faqSection = document.getElementById('faq-section-mobile');
                  if (faqSection) {
                    faqSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="block text-gray-300 hover:text-white transition-colors text-sm w-full"
              >
                FAQ
              </button>
              <button
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="block text-gray-300 hover:text-white transition-colors text-sm w-full"
              >
                Contato
              </button>
            </div>
          </div>
        </div>

        {/* Linha de Copyright */}
        <div className="border-t border-gray-800 mt-6 pt-6 text-center">
          <p className="text-gray-400 text-xs">
            © 2025 LeadBaze. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}