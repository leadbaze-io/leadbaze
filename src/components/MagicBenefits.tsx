import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Building2, MessageCircle, Users } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function MagicBenefits() {
  const [currentLogoIndex, setCurrentLogoIndex] = useState(0)
  const sectionRef = useRef<HTMLDivElement>(null)

  // Logos das empresas B2B (placeholders - você pode substituir por logos reais)
  const companyLogos = [
    { name: "TechCorp", color: "from-blue-500 to-blue-600" },
    { name: "DataFlow", color: "from-purple-500 to-purple-600" },
    { name: "InnovateLab", color: "from-green-500 to-green-600" },
    { name: "FutureTech", color: "from-orange-500 to-orange-600" },
    { name: "SmartSolutions", color: "from-red-500 to-red-600" },
    { name: "DigitalCore", color: "from-indigo-500 to-indigo-600" }
  ]

  // Benefícios principais
  const benefits = [
    {
      icon: Building2,
      title: "Mais de 2MM de contatos B2B mapeados",
      description: "Base de dados massiva com empresas de todos os segmentos e regiões do Brasil.",
      color: "blue"
    },
    {
      icon: MessageCircle,
      title: "87% de Entrega no WhatsApp",
      description: "Taxa de entrega excepcional garantindo que suas mensagens cheguem aos leads.",
      color: "green"
    },
    {
      icon: Users,
      title: "23% Taxa de resposta dos leads",
      description: "Percentual acima da média do mercado, indicando qualidade dos contatos gerados.",
      color: "purple"
    }
  ]

  // Rotação automática dos logos
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentLogoIndex((prev) => (prev + 1) % companyLogos.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [companyLogos.length])

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
      }
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50" ref={sectionRef}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
            Líderes de Vendas confiam na <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">LeadBaze</span>!
          </h2>
          
          {/* Carrossel de Logos */}
          <div className="relative overflow-hidden mb-12">
            <div className="flex justify-center">
              <motion.div
                key={currentLogoIndex}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="flex items-center space-x-8"
              >
                {companyLogos.map((logo, index) => (
                  <motion.div
                    key={logo.name}
                    initial={{ opacity: 0.3, scale: 0.9 }}
                    animate={{ 
                      opacity: index === currentLogoIndex ? 1 : 0.3,
                      scale: index === currentLogoIndex ? 1 : 0.9
                    }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col items-center space-y-2"
                  >
                    <div className={`w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br ${logo.color} rounded-xl flex items-center justify-center text-white font-bold text-sm md:text-base shadow-lg`}>
                      {logo.name.charAt(0)}
                    </div>
                    <span className="text-xs md:text-sm text-gray-600 font-medium">{logo.name}</span>
                  </motion.div>
                ))}
              </motion.div>
            </div>
            
            {/* Indicadores */}
            <div className="flex justify-center space-x-2 mt-6">
              {companyLogos.map((_, index) => (
                <motion.button
                  key={index}
                  onClick={() => setCurrentLogoIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentLogoIndex ? 'bg-blue-600 w-6' : 'bg-gray-300'
                  }`}
                  whileHover={{ scale: 1.2 }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => {
            const colorClasses = getColorClasses(benefit.color)
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.8, 
                  delay: index * 0.2,
                  type: "spring",
                  stiffness: 100,
                  damping: 20
                }}
                whileHover={{ 
                  y: -10,
                  transition: { duration: 0.3 }
                }}
                className="group relative bg-white p-8 rounded-2xl border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-500"
              >
                {/* Background Gradient Effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${colorClasses.bg} rounded-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-500`}></div>
                
                {/* Content */}
                <div className="relative z-10">
                  {/* Icon */}
                  <div className={`inline-flex items-center justify-center w-20 h-20 ${colorClasses.bg} rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <benefit.icon className={`w-10 h-10 ${colorClasses.icon}`} />
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-gray-800 transition-colors leading-tight">
                    {benefit.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 leading-relaxed text-lg">
                    {benefit.description}
                  </p>
                </div>

                {/* Hover Border Effect */}
                <div className={`absolute inset-0 border-2 ${colorClasses.border} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
              </motion.div>
            )
          })}
        </div>


      </div>
    </section>
  )
}