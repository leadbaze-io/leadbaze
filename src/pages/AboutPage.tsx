import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Target, 
  TrendingUp, 
  Users, 
  BarChart3, 
  Zap, 
  Mail, 
  Linkedin, 
  Calendar,
  Phone
} from 'lucide-react';
import LogoImage from '../components/LogoImage';

export default function AboutPage() {
  // Forçar modo claro na página Sobre
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    console.log('✅ Página Sobre - modo claro forçado');
  }, []);



  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-purple-50 to-pink-50">
      

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              <span className="text-gray-900">Sobre o </span>
              <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                LeadBaze
              </span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
              Transformar a prospecção B2B através da educação, automação e inovação. 
              Somos a fonte definitiva para profissionais que buscam dominar a arte de 
              gerar leads qualificados e escalar suas operações de vendas.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Por que o LeadBaze */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Por que o LeadBaze?
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Em um mercado saturado de informações genéricas sobre marketing, o LeadBaze se destaca 
              por sua especialização única: <span className="font-semibold text-purple-600">prospecção B2B inteligente</span>. 
              Nossa abordagem combina estratégias comprovadas com as mais recentes tecnologias de 
              automação e IA.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Nossa Especialização */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Nossa Especialização
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Domine as estratégias mais eficazes de prospecção B2B com metodologias 
              comprovadas e ferramentas de última geração.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {[
              {
                icon: Target,
                title: "Prospecção B2B",
                description: "Estratégias avançadas para identificar e qualificar leads de alta qualidade no mercado B2B.",
                color: "from-blue-500 to-blue-600"
              },
              {
                icon: TrendingUp,
                title: "Outbound Marketing",
                description: "Táticas de cold outreach que realmente funcionam e geram resultados mensuráveis para sua empresa.",
                color: "from-purple-500 to-purple-600"
              },
              {
                icon: Users,
                title: "Gestão de Vendas",
                description: "Processos para escalar equipes de vendas B2B e otimizar o funil de conversão.",
                color: "from-emerald-500 to-emerald-600"
              },
              {
                icon: BarChart3,
                title: "Inteligência de Dados",
                description: "Como usar analytics e dados para otimizar resultados comerciais e tomar decisões baseadas em evidências.",
                color: "from-orange-500 to-orange-600"
              },
                             {
                 icon: Zap,
                 title: "Automação de Vendas",
                 description: "Ferramentas e workflows para maximizar eficiência e escalar operações de vendas.",
                 color: "from-rose-500 to-rose-600"
               },
               {
                 icon: Phone,
                 title: "Atendimento ao Cliente",
                 description: "Estratégias para melhorar a experiência do cliente e aumentar a retenção.",
                 color: "from-teal-500 to-teal-600"
               }
            ].map((item, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="group bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-gray-200"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300`}>
                  <item.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-center leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Nossa Metodologia */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Nossa Metodologia
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Cada artigo, guia e case study do LeadBaze é baseado em princípios sólidos 
              e resultados comprovados no mercado.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {[
              {
                title: "Dados Reais",
                description: "Análises de mercado e métricas comprovadas que você pode replicar em seu negócio.",
                icon: "📊"
              },
              {
                title: "Experiência Prática",
                description: "Testes em campo com empresas reais e resultados mensuráveis e verificáveis.",
                icon: "🎯"
              },
              {
                title: "Inovação Tecnológica",
                description: "Integração com as melhores ferramentas do mercado e automação via N8N.",
                icon: "⚡"
              },
              {
                title: "Resultados Mensuráveis",
                description: "KPIs e métricas que realmente importam para o crescimento do seu negócio.",
                icon: "📈"
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="flex items-start space-x-6 p-8 bg-gray-50 rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300"
              >
                <div className="text-4xl flex-shrink-0">{item.icon}</div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-lg">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Para Quem Escrevemos */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Para Quem Escrevemos
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Nossos conteúdos são desenvolvidos especificamente para profissionais 
              que buscam excelência em prospecção B2B.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {[
              "SDRs e BDRs que querem superar suas metas de prospecção",
              "Vendedores B2B que buscam qualificar leads de forma mais eficiente",
              "Gerentes de Vendas que precisam escalar suas operações",
              "Empreendedores que querem construir funis de vendas escaláveis",
              "Profissionais de Marketing que buscam entender o processo de vendas",
              "Consultores que desejam oferecer valor real aos clientes"
            ].map((item, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="flex items-center space-x-4 p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all duration-200"
              >
                <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex-shrink-0"></div>
                <span className="text-gray-700 leading-relaxed font-medium">{item}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Nossa Promessa */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold text-white mb-8">
              Nossa Promessa
            </h2>
            <p className="text-xl text-gray-200 leading-relaxed max-w-4xl mx-auto">
              Não oferecemos soluções mágicas ou fórmulas secretas. Oferecemos{' '}
              <span className="font-bold text-white">
                estratégias comprovadas, ferramentas testadas e insights acionáveis
              </span>{' '}
              que você pode implementar hoje mesmo para transformar sua prospecção B2B.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Conecte-se Conosco */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Conecte-se Conosco
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Mantenha-se atualizado com as melhores práticas de prospecção B2B 
              e conecte-se com outros profissionais da área.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              {
                icon: Mail,
                title: "Newsletter Semanal",
                description: "Insights exclusivos sobre prospecção B2B diretamente na sua caixa de entrada.",
                buttonText: "Inscrever-se",
                color: "from-blue-500 to-blue-600"
              },
              {
                icon: Linkedin,
                title: "Comunidade",
                description: "Junte-se a outros profissionais no LinkedIn e participe de discussões exclusivas.",
                buttonText: "Conectar",
                color: "from-purple-500 to-purple-600"
              },
              {
                icon: Calendar,
                title: "Consultoria",
                description: "Agende uma sessão estratégica com nossa equipe para otimizar sua prospecção.",
                buttonText: "Agendar",
                color: "from-emerald-500 to-emerald-600"
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="text-center p-8 bg-gray-50 rounded-2xl border border-gray-100 hover:shadow-xl hover:border-gray-200 transition-all duration-300"
              >
                <div className={`w-20 h-20 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center mb-6 mx-auto`}>
                  <item.icon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {item.title}
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {item.description}
                </p>
                <button className={`bg-gradient-to-r ${item.color} text-white px-8 py-3 rounded-xl hover:shadow-lg transition-all duration-200 font-semibold`}>
                  {item.buttonText}
                </button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Footer - Cópia Exata da Landing Page */}
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
                <button className="block text-gray-300 hover:text-white transition-colors text-left w-full">
                  Início
                </button>
                <button className="block text-gray-300 hover:text-white transition-colors text-left w-full">
                  Dashboard
                </button>
                <button className="block text-gray-300 hover:text-white transition-colors text-left w-full">
                  Gerar Leads
                </button>
                <button className="block text-gray-300 hover:text-white transition-colors text-left w-full">
                  Disparador
                </button>
                <button className="block text-gray-300 hover:text-white transition-colors text-left w-full">
                  Blog
                </button>
              </div>
            </div>

            {/* Suporte */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Suporte</h3>
              <div className="space-y-2">
                <button className="block text-gray-300 hover:text-white transition-colors text-left w-full">
                  FAQ
                </button>
                <button className="block text-gray-300 hover:text-white transition-colors text-left w-full">
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
    </div>
  );
}
