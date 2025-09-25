import { useNavigate } from 'react-router-dom'
import { Mail, Phone } from 'lucide-react'
import LogoImage from '../LogoImage'

export default function MobileFooter() {
  const navigate = useNavigate()

  const handleNavigation = (path: string) => {
    navigate(path)
    // Scroll para o topo após navegação
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 100)
  }

  return (
    <footer className="md:hidden bg-gray-900 text-white">
      <div className="max-w-md mx-auto px-4 py-8">
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
            <h3 className="text-base font-semibold mb-3">Links Rápidos</h3>
            <div className="space-y-2">
              <button

                onClick={() => handleNavigation('/')}
                className="block text-gray-300 hover:text-white transition-colors text-sm w-full"
              >
                Início
              </button>
              <button

                onClick={() => handleNavigation('/dashboard')}
                className="block text-gray-300 hover:text-white transition-colors text-sm w-full"
              >
                Dashboard
              </button>
              <button

                onClick={() => handleNavigation('/gerador')}
                className="block text-gray-300 hover:text-white transition-colors text-sm w-full"
              >
                Gerar Leads
              </button>
              <button

                onClick={() => handleNavigation('/disparador')}
                className="block text-gray-300 hover:text-white transition-colors text-sm w-full"
              >
                Disparador
              </button>
              <button

                onClick={() => handleNavigation('/blog')}
                className="block text-gray-300 hover:text-white transition-colors text-sm w-full"
              >
                Blog
              </button>
            </div>
          </div>
          {/* Suporte */}
          <div className="text-center">
            <h3 className="text-base font-semibold mb-3">Suporte</h3>
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
