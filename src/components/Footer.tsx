import { useNavigate } from 'react-router-dom'
import { Mail, Phone } from 'lucide-react'
import { useState, useEffect } from 'react'
import { getCurrentUser } from '../lib/supabaseClient'
import LogoImage from './LogoImage'
import type { User } from '@supabase/supabase-js'

export default function Footer() {
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
    <footer className="relative text-white overflow-hidden bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-t border-gray-700">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo e Descrição */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <LogoImage className="h-9 w-auto" />
            </div>
            <p className="text-gray-300 mb-6 max-w-md">
              A plataforma mais eficiente para gerar leads qualificados usando dados do Google Maps.

              Transforme localizações em oportunidades de negócio.
            </p>
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2 text-gray-300">
                <Mail className="w-4 h-4" />
                <span className="text-sm">leadbaze@gmail.com</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300">
                <Phone className="w-4 h-4" />
                <span className="text-sm">31 97266-1278</span>
              </div>
            </div>
          </div>

          {/* Links Rápidos */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Links Rápidos</h3>
            <div className="space-y-2">
              {/* Links para usuários NÃO logados */}
              {!user && (
                <>
                  <button

                    onClick={() => {
                      handleNavigation('/')
                      // Scroll para o topo após navegação
                      setTimeout(() => {
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                      }, 100)
                    }}
                    className="block text-gray-300 hover:text-white transition-colors text-left w-full"
                  >
                    Início
                  </button>
                  <button

                    onClick={() => {
                      // Verificar se estamos na landing page
                      if (window.location.pathname === '/') {
                        document.getElementById('pricing-plans-section')?.scrollIntoView({

                          behavior: 'smooth'

                        })
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
                            // Método alternativo: scroll para o final da página
                            window.scrollTo({
                              top: document.body.scrollHeight,
                              behavior: 'smooth'
                            })
                          }
                        }, 1000)
                      }
                    }}
                    className="block text-gray-300 hover:text-white transition-colors text-left w-full"
                  >
                    Planos
                  </button>
                  <button

                    onClick={() => {
                      handleNavigation('/blog/sobre')
                      // Scroll para o topo após navegação
                      setTimeout(() => {
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                      }, 100)
                    }}
                    className="block text-gray-300 hover:text-white transition-colors text-left w-full"
                  >
                    Sobre
                  </button>
                  <button

                    onClick={() => {
                      handleNavigation('/blog')
                      // Scroll para o topo após navegação
                      setTimeout(() => {
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                      }, 100)
                    }}
                    className="block text-gray-300 hover:text-white transition-colors text-left w-full"
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
                      // Scroll para o topo após navegação
                      setTimeout(() => {
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                      }, 100)
                    }}
                    className="block text-gray-300 hover:text-white transition-colors text-left w-full"
                  >
                    Meu Perfil
                  </button>
                  <button

                    onClick={() => {
                      handleNavigation('/dashboard')
                      // Scroll para o topo após navegação
                      setTimeout(() => {
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                      }, 100)
                    }}
                    className="block text-gray-300 hover:text-white transition-colors text-left w-full"
                  >
                    Dashboard
                  </button>
                  <button

                    onClick={() => {
                      handleNavigation('/gerador')
                      // Scroll para o topo após navegação
                      setTimeout(() => {
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                      }, 100)
                    }}
                    className="block text-gray-300 hover:text-white transition-colors text-left w-full"
                  >
                    Gerar Leads
                  </button>
                  <button

                    onClick={() => {
                      handleNavigation('/disparador')
                      // Scroll para o topo após navegação
                      setTimeout(() => {
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                      }, 100)
                    }}
                    className="block text-gray-300 hover:text-white transition-colors text-left w-full"
                  >
                    Disparador
                  </button>
                </>
              )}
            </div>
          </div>
          {/* Suporte */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Suporte</h3>
            <div className="space-y-2">
              <button

                onClick={() => {

                  // Verificar se o elemento existe
                  const faqSection = document.getElementById('faq-section-desktop');

                  if (faqSection) {
                    console.log('   - getBoundingClientRect():', faqSection.getBoundingClientRect());

                    // Verificar posição atual da página
                    const currentScroll = window.pageYOffset || document.documentElement.scrollTop;

                    // Verificar se o elemento está visível
                    faqSection.getBoundingClientRect();
                    // Tentar scroll

                    try {
                      faqSection.scrollIntoView({

                        behavior: 'smooth',

                        block: 'start'
                      });

                    } catch (error) {

                    }

                    // Verificar posição após scroll
                    setTimeout(() => {
                      const newScroll = window.pageYOffset || document.documentElement.scrollTop;
                      // Tentar método alternativo se não funcionou
                      if (Math.abs(newScroll - currentScroll) < 10) {

                        const targetPosition = faqSection.offsetTop - 100;
                        window.scrollTo({
                          top: targetPosition,
                          behavior: 'smooth'
                        });

                      }
                    }, 500);

                  } else {
                    // Procurar por elementos similares
                    const allSections = document.querySelectorAll('section');

                    allSections.forEach((_section, _index) => {

                    });

                    // Procurar por elementos com "faq" no ID ou classe
                    const faqElements = document.querySelectorAll('[id*="faq"], [class*="faq"]');

                    faqElements.forEach((_el, _index) => {

                    });
                  }

                }}
                className="block text-gray-300 hover:text-white transition-colors text-left w-full"
              >
                FAQ
              </button>
              <button

                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="block text-gray-300 hover:text-white transition-colors text-left w-full"
              >
                Contato
              </button>
            </div>
          </div>
        </div>

        {/* Linha de Copyright */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © 2025 LeadBaze. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}