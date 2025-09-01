import { Link } from 'react-router-dom'
import { Mail, Phone } from 'lucide-react'
import LogoImage from './LogoImage'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
                <span className="text-sm">contato@mindflowdigital.com.br</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300">
                <Phone className="w-4 h-4" />
                <span className="text-sm">31 97266-1278</span>
              </div>
            </div>
          </div>

          {/* Links Rápidos */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Links Rápidos</h3>
            <div className="space-y-2">
              <Link to="/" className="block text-gray-300 hover:text-white transition-colors">
                Início
              </Link>
              <Link to="/dashboard" className="block text-gray-300 hover:text-white transition-colors">
                Dashboard
              </Link>
              <Link to="/gerador" className="block text-gray-300 hover:text-white transition-colors">
                Gerar Leads
              </Link>
              <Link to="/disparador" className="block text-gray-300 hover:text-white transition-colors">
                Disparador
              </Link>
            </div>
          </div>

          {/* Suporte */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Suporte</h3>
            <div className="space-y-2">
              <a href="#" className="block text-gray-300 hover:text-white transition-colors">
                Central de Ajuda
              </a>
              <a href="#" className="block text-gray-300 hover:text-white transition-colors">
                Documentação
              </a>
              <a href="#" className="block text-gray-300 hover:text-white transition-colors">
                FAQ
              </a>
              <a href="#" className="block text-gray-300 hover:text-white transition-colors">
                Contato
              </a>
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