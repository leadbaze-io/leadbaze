import { useNavigate } from 'react-router-dom'
import { Mail, Phone } from 'lucide-react'
import LogoImage from './LogoImage'

export default function Footer() {
  const navigate = useNavigate()

  const handleNavigation = (path: string) => {
    navigate(path)
    // Scroll para o topo após navegação
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 100)
  }

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
            <h3 className="text-lg font-semibold mb-4">Links Rápidos</h3>
            <div className="space-y-2">
              <button 
                onClick={() => handleNavigation('/')}
                className="block text-gray-300 hover:text-white transition-colors text-left w-full"
              >
                Início
              </button>
              <button 
                onClick={() => handleNavigation('/dashboard')}
                className="block text-gray-300 hover:text-white transition-colors text-left w-full"
              >
                Dashboard
              </button>
              <button 
                onClick={() => handleNavigation('/gerador')}
                className="block text-gray-300 hover:text-white transition-colors text-left w-full"
              >
                Gerar Leads
              </button>
              <button 
                onClick={() => handleNavigation('/disparador')}
                className="block text-gray-300 hover:text-white transition-colors text-left w-full"
              >
                Disparador
              </button>
            </div>
          </div>

          {/* Suporte */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Suporte</h3>
            <div className="space-y-2">
              <button 
                onClick={() => {
                  console.log('🔍 === DEBUG FAQ BUTTON ===');
                  console.log('📍 1. Botão FAQ clicado');
                  
                  // Verificar se o elemento existe
                  const faqSection = document.getElementById('faq-section-desktop');
                  console.log('📍 2. Elemento FAQ encontrado:', faqSection);
                  
                  if (faqSection) {
                    console.log('📍 3. Propriedades do elemento FAQ:');
                    console.log('   - ID:', faqSection.id);
                    console.log('   - Tag:', faqSection.tagName);
                    console.log('   - Classes:', faqSection.className);
                    console.log('   - offsetTop:', faqSection.offsetTop);
                    console.log('   - offsetHeight:', faqSection.offsetHeight);
                    console.log('   - getBoundingClientRect():', faqSection.getBoundingClientRect());
                    
                    // Verificar posição atual da página
                    const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
                    console.log('📍 4. Posição atual do scroll:', currentScroll);
                    
                    // Verificar se o elemento está visível
                    const rect = faqSection.getBoundingClientRect();
                    console.log('📍 5. Posição relativa ao viewport:', rect);
                    console.log('   - Está visível?', rect.top >= 0 && rect.bottom <= window.innerHeight);
                    
                    // Tentar scroll
                    console.log('📍 6. Tentando scroll...');
                    try {
                      faqSection.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'start'
                      });
                      console.log('✅ scrollIntoView executado com sucesso');
                    } catch (error) {
                      console.error('❌ Erro no scrollIntoView:', error);
                    }
                    
                    // Verificar posição após scroll
                    setTimeout(() => {
                      const newScroll = window.pageYOffset || document.documentElement.scrollTop;
                      console.log('📍 7. Nova posição do scroll após 500ms:', newScroll);
                      console.log('📍 8. Diferença:', newScroll - currentScroll);
                      
                      // Tentar método alternativo se não funcionou
                      if (Math.abs(newScroll - currentScroll) < 10) {
                        console.log('📍 9. scrollIntoView não funcionou, tentando window.scrollTo...');
                        const targetPosition = faqSection.offsetTop - 100;
                        window.scrollTo({
                          top: targetPosition,
                          behavior: 'smooth'
                        });
                        console.log('📍 10. window.scrollTo executado para posição:', targetPosition);
                      }
                    }, 500);
                    
                  } else {
                    console.log('❌ Elemento FAQ não encontrado!');
                    console.log('📍 Procurando por elementos com ID similar...');
                    
                    // Procurar por elementos similares
                    const allSections = document.querySelectorAll('section');
                    console.log('📍 Todas as seções encontradas:', allSections.length);
                    allSections.forEach((section, index) => {
                      console.log(`   ${index}:`, section.id, section.className);
                    });
                    
                    // Procurar por elementos com "faq" no ID ou classe
                    const faqElements = document.querySelectorAll('[id*="faq"], [class*="faq"]');
                    console.log('📍 Elementos com "faq" no ID ou classe:', faqElements.length);
                    faqElements.forEach((el, index) => {
                      console.log(`   ${index}:`, el.tagName, el.id, el.className);
                    });
                  }
                  
                  console.log('🔍 === FIM DEBUG FAQ ===');
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