import { useState, useEffect, useRef } from 'react'
import { Clock, Target, TrendingUp, Shield, Zap, DollarSign } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function MagicBenefits() {
  const [visibleItems, setVisibleItems] = useState(new Set())
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const itemIndex = parseInt(entry.target.getAttribute('data-benefit') || '0')
            setVisibleItems(prev => new Set([...prev, itemIndex]))
          }
        })
      },
      { threshold: 0.2 }
    )

    const benefitElements = sectionRef.current?.querySelectorAll('[data-benefit]')
    benefitElements?.forEach(el => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  const benefits = [
    {
      icon: Clock,
      title: "Economia de Tempo",
      description: "Automatize o processo de prospecção que levaria horas para ser feito manualmente. Gere centenas de leads em minutos.",
      stat: "90%",
      statLabel: "Menos Tempo",
      color: "blue"
    },
    {
      icon: Target,
      title: "Maior Precisão",
      description: "Dados extraídos diretamente do Google Maps garantem informações atualizadas e precisas dos estabelecimentos.",
      stat: "95%",
      statLabel: "Precisão",
      color: "green"
    },
    {
      icon: TrendingUp,
      title: "Escalabilidade",
      description: "Processe milhares de leads simultaneamente, sem limitações de volume ou região geográfica.",
      stat: "1000+",
      statLabel: "Leads/hora",
      color: "purple"
    },
    {
      icon: DollarSign,
      title: "Maior ROI",
      description: "Invista menos em prospecção e obtenha mais resultados com leads de alta qualidade.",
      stat: "300%",
      statLabel: "Aumento ROI",
      color: "orange"
    },
    {
      icon: Shield,
      title: "Dados Seguros",
      description: "Todas as informações são processadas com segurança e armazenadas de forma criptografada.",
      stat: "100%",
      statLabel: "Segurança",
      color: "red"
    },
    {
      icon: Zap,
      title: "Integração Fácil",
      description: "Conecte facilmente com seu CRM ou ferramenta de vendas através de nossa API ou exports.",
      stat: "5min",
      statLabel: "Setup",
      color: "yellow"
    }
  ]

  const getColorClasses = (color: string) => {
    const colors = {
      blue: {
        bg: "bg-blue-50",
        icon: "text-blue-600",
        border: "border-blue-200",
        gradient: "from-blue-500 to-blue-600"
      },
      green: {
        bg: "bg-green-50",
        icon: "text-green-600",
        border: "border-green-200",
        gradient: "from-green-500 to-green-600"
      },
      purple: {
        bg: "bg-purple-50",
        icon: "text-purple-600",
        border: "border-purple-200",
        gradient: "from-purple-500 to-purple-600"
      },
      orange: {
        bg: "bg-orange-50",
        icon: "text-orange-600",
        border: "border-orange-200",
        gradient: "from-orange-500 to-orange-600"
      },
      red: {
        bg: "bg-red-50",
        icon: "text-red-600",
        border: "border-red-200",
        gradient: "from-red-500 to-red-600"
      },
      yellow: {
        bg: "bg-yellow-50",
        icon: "text-yellow-600",
        border: "border-yellow-200",
        gradient: "from-yellow-500 to-yellow-600"
      }
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50" ref={sectionRef}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <TrendingUp className="w-4 h-4" />
            <span>Por que escolher o LeadBaze?</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Benefícios que 
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Transformam</span>
            <br />
            seu Negócio
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Descubra como o LeadBaze pode revolucionar sua estratégia de prospecção e acelerar o crescimento da sua empresa
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => {
            const colorClasses = getColorClasses(benefit.color)
            
            return (
              <div
                key={index}
                data-benefit={index}
                className={`group relative bg-white p-8 rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-700 transform ${
                  visibleItems.has(index) 
                    ? 'translate-y-0 opacity-100 scale-100' 
                    : 'translate-y-8 opacity-0 scale-95'
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                {/* Background Gradient Effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${colorClasses.bg} rounded-2xl opacity-0 group-hover:opacity-50 transition-opacity duration-300`}></div>
                
                {/* Content */}
                <div className="relative z-10">
                  {/* Icon */}
                  <div className={`inline-flex items-center justify-center w-16 h-16 ${colorClasses.bg} rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <benefit.icon className={`w-8 h-8 ${colorClasses.icon}`} />
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-gray-800 transition-colors">
                    {benefit.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 leading-relaxed mb-6">
                    {benefit.description}
                  </p>

                  {/* Stat */}
                  <div className="flex items-center space-x-3">
                    <div className={`text-2xl font-bold bg-gradient-to-r ${colorClasses.gradient} bg-clip-text text-transparent`}>
                      {benefit.stat}
                    </div>
                    <div className="text-sm text-gray-500">
                      {benefit.statLabel}
                    </div>
                  </div>
                </div>

                {/* Hover Border Effect */}
                <div className={`absolute inset-0 border-2 ${colorClasses.border} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
              </div>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-white p-8 rounded-2xl shadow-lg max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Pronto para acelerar seus resultados?
            </h3>
            <p className="text-gray-600 mb-6">
              Junte-se a centenas de empresas que já transformaram sua prospecção com o LeadBaze
            </p>
            <div className="flex justify-center">
              <Link to="/login">
                <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                  Cadastre-se Agora
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}