import { useState, useEffect, useRef } from 'react'
import { Link2, Zap, Database, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function MagicSteps() {
  const [visibleSteps, setVisibleSteps] = useState(new Set())
  const stepsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const stepIndex = parseInt(entry.target.getAttribute('data-step') || '0')
            setVisibleSteps(prev => new Set([...prev, stepIndex]))
          }
        })
      },
      { threshold: 0.2 }
    )

    const stepElements = stepsRef.current?.querySelectorAll('[data-step]')
    stepElements?.forEach(el => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  const steps = [
    {
      icon: Link2,
      title: "Cole o Link do Google Maps",
      description: "Simplesmente cole o link de uma busca no Google Maps da região ou tipo de negócio que você quer prospectar.",
      color: "blue"
    },
    {
      icon: Zap,
      title: "Processamento Automático",
      description: "Nossa IA processa automaticamente os dados e extrai informações relevantes de todos os estabelecimentos encontrados.",
      color: "purple"
    },
    {
      icon: Database,
      title: "Dados Organizados",
      description: "Receba uma lista completa com nome, endereço, telefone, avaliações e outras informações importantes de cada lead.",
      color: "green"
    },
    {
      icon: TrendingUp,
      title: "Comece a Converter",
      description: "Use os leads qualificados para expandir sua base de clientes e aumentar suas vendas de forma eficiente.",
      color: "orange"
    }
  ]

  const getColorClasses = (color: string) => {
    const colors = {
      blue: "bg-blue-100 text-blue-600 border-blue-200",
      purple: "bg-purple-100 text-purple-600 border-purple-200",
      green: "bg-green-100 text-green-600 border-green-200",
      orange: "bg-orange-100 text-orange-600 border-orange-200"
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  return (
    <section className="py-20 bg-white" ref={stepsRef}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Como Funciona o 
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> LeadBaze</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Em apenas 4 passos simples, transforme links do Google Maps em listas de leads qualificados
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Linha conectora - apenas desktop */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 transform -translate-y-1/2"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div
                key={index}
                data-step={index}
                className={`relative bg-white p-6 rounded-2xl border border-gray-100 shadow-lg transition-all duration-700 transform ${
                  visibleSteps.has(index) 
                    ? 'translate-y-0 opacity-100 scale-100' 
                    : 'translate-y-8 opacity-0 scale-95'
                }`}
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                {/* Número do Step */}
                <div className="absolute -top-4 left-6 w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm z-10">
                  {index + 1}
                </div>

                {/* Ícone */}
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 ${getColorClasses(step.color)}`}>
                  <step.icon className="w-8 h-8" />
                </div>

                {/* Conteúdo */}
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>

                {/* Efeito de hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-300 -z-10"></div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Bottom */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            <span>Pronto para começar?</span>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-gray-900">
              Comece a gerar leads agora mesmo
            </h3>
            <p className="text-gray-600 mb-6">
              Sem burocracias, sem complicações. Resultados em minutos.
            </p>
            <Link to="/login">
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                Experimentar Gratuitamente
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}