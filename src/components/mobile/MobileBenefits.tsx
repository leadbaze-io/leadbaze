import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function MobileBenefits() {
  const [currentIndex, setCurrentIndex] = useState(0)

  // Depoimentos de empresas B2B fictícias com fotos
  const testimonials = [
    {
      company: "TechCorp Solutions",
      name: "Carlos Mendes",
      position: "Diretor de Vendas",
      photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      color: "from-blue-500 to-blue-600",
      quote: "A LeadBaze revolucionou nossa estratégia de prospecção. Em apenas 3 semanas, conseguimos qualificar mais de 500 leads de alta qualidade.",
      rating: 5
    },
    {
      company: "DataFlow Analytics",
      name: "Ana Silva",
      position: "Head de Growth",
      photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face",
      color: "from-purple-500 to-purple-600",
      quote: "A precisão dos dados e a facilidade de uso nos permitiu aumentar nossa taxa de conversão em 40% no primeiro mês.",
      rating: 5
    },
    {
      company: "InnovateLab",
      name: "Roberto Santos",
      position: "CEO",
      photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      color: "from-green-500 to-green-600",
      quote: "Como startup, precisávamos de uma solução eficiente e escalável. A LeadBaze superou todas as nossas expectativas.",
      rating: 5
    },
    {
      company: "FutureTech Systems",
      name: "Mariana Costa",
      position: "VP de Marketing",
      photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      color: "from-orange-500 to-orange-600",
      quote: "A integração com WhatsApp e a qualidade dos contatos nos permitiu reduzir o tempo de qualificação de leads em 60%.",
      rating: 5
    },
    {
      company: "SmartSolutions",
      name: "Pedro Almeida",
      position: "Diretor Comercial",
      photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
      color: "from-red-500 to-red-600",
      quote: "Em 6 meses, nossa equipe de vendas dobrou a produtividade graças aos leads qualificados da LeadBaze.",
      rating: 5
    },
    {
      company: "DigitalCore",
      name: "Fernanda Lima",
      position: "CTO",
      photo: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face",
      color: "from-indigo-500 to-indigo-600",
      quote: "A arquitetura escalável da LeadBaze nos permitiu processar milhões de leads sem comprometer a performance.",
      rating: 5
    },
    {
      company: "CloudTech",
      name: "Ricardo Oliveira",
      position: "VP de Vendas",
      photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face",
      color: "from-teal-500 to-teal-600",
      quote: "Nossa equipe de vendas triplicou a eficiência graças aos leads qualificados e segmentados da LeadBaze.",
      rating: 5
    },
    {
      company: "NextGen Solutions",
      name: "Camila Rodrigues",
      position: "Diretora de Marketing",
      photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
      color: "from-pink-500 to-pink-600",
      quote: "A segmentação inteligente dos leads nos permitiu criar campanhas muito mais direcionadas e eficazes.",
      rating: 5
    }
  ]

  // Rotação automática dos depoimentos
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [testimonials.length])

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  return (
    <section className="md:hidden py-16 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-md mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Líderes de Vendas confiam na <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent font-extrabold" style={{WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>LeadBaze</span>!
          </h2>
        </div>

        {/* Carrossel Vertical de Depoimentos */}
        <div className="relative">
          {/* Container do Carrossel */}
          <div className="relative">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
            >
              {/* Header com Gradiente */}
              <div className={`h-20 bg-gradient-to-r ${testimonials[currentIndex].color} relative overflow-hidden`}>
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>

              {/* Conteúdo */}
              <div className="p-6 -mt-10 relative">
                {/* Foto do Empresário */}
                <div className="flex justify-center mb-4">
                  <motion.div
                    className="w-16 h-16 rounded-full border-4 border-white shadow-lg overflow-hidden"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  >
                    <img

                      src={testimonials[currentIndex].photo}

                      alt={testimonials[currentIndex].name}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                </div>

                {/* Informações */}
                <div className="text-center mb-4">
                  <h4 className="text-base font-bold text-gray-900 mb-1">
                    {testimonials[currentIndex].name}
                  </h4>
                  <p className="text-sm text-blue-600 font-semibold mb-1">
                    {testimonials[currentIndex].position}
                  </p>
                  <p className="text-xs text-gray-600 font-medium">
                    {testimonials[currentIndex].company}
                  </p>
                </div>

                {/* Quote */}
                <blockquote className="text-sm text-gray-700 leading-relaxed italic mb-4 text-center">
                  "{testimonials[currentIndex].quote}"
                </blockquote>

                {/* Rating */}
                <div className="flex justify-center space-x-1 mb-4">
                  {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className="w-4 h-4 text-yellow-400"
                    >
                      ★
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Navegação */}
            <div className="flex justify-between items-center mt-6">
              {/* Seta Esquerda */}
              <motion.button
                onClick={prevSlide}
                className="w-10 h-10 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:text-blue-600 hover:shadow-xl transition-all duration-300"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                ←
              </motion.button>

              {/* Indicadores */}
              <div className="flex space-x-2">
                {testimonials.map((_, index) => (
                  <motion.button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentIndex ? 'bg-blue-600 w-4' : 'bg-gray-300'
                    }`}
                    whileHover={{ scale: 1.2 }}
                  />
                ))}
              </div>

              {/* Seta Direita */}
              <motion.button
                onClick={nextSlide}
                className="w-10 h-10 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:text-blue-600 hover:shadow-xl transition-all duration-300"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                →
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
