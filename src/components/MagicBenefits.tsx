import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'

export default function MagicBenefits() {
  const [currentLogoIndex, setCurrentLogoIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const sectionRef = useRef<HTMLDivElement>(null)
  const carouselRef = useRef<HTMLDivElement>(null)

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

  // Criar carrossel infinito duplicando os cards
  const infiniteTestimonials = [...testimonials, ...testimonials, ...testimonials]
  // Funções para drag do carrossel
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setStartX(e.pageX - (carouselRef.current?.offsetLeft || 0))
    setScrollLeft(currentLogoIndex * 320)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    e.preventDefault()

    const x = e.pageX - (carouselRef.current?.offsetLeft || 0)
    const walk = (x - startX) * 1.5 // Reduzido para movimento mais suave

    // Calcula o novo índice com suavização
    const newIndex = (scrollLeft - walk) / 320
    const targetIndex = Math.round(newIndex)

    // Aplica suavização para evitar mudanças bruscas
    const smoothIndex = currentLogoIndex + (targetIndex - currentLogoIndex) * 0.1

    // Carrossel infinito - quando passa do último, volta ao primeiro
    let finalIndex = smoothIndex
    if (finalIndex >= infiniteTestimonials.length) {
      finalIndex = finalIndex % infiniteTestimonials.length
    } else if (finalIndex < 0) {
      finalIndex = infiniteTestimonials.length + (finalIndex % infiniteTestimonials.length)
    }

    setCurrentLogoIndex(finalIndex)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    // Snap para o card mais próximo
    const snappedIndex = Math.round(currentLogoIndex)

    // Garantir que o índice esteja dentro dos limites do array infinito
    let finalIndex = snappedIndex
    if (finalIndex >= infiniteTestimonials.length) {
      finalIndex = finalIndex % infiniteTestimonials.length
    } else if (finalIndex < 0) {
      finalIndex = infiniteTestimonials.length + (finalIndex % infiniteTestimonials.length)
    }

    setCurrentLogoIndex(finalIndex)
  }

  // Carrossel infinito verdadeiro - sem delays
  const nextSlide = useCallback(() => {
    setCurrentLogoIndex((prev) => {
      const next = prev + 1
      // Se chegar ao final do array infinito, volta ao início dos cards originais
      if (next >= infiniteTestimonials.length) {
        return testimonials.length // Volta ao primeiro card do segundo conjunto
      }
      return next
    })
  }, [infiniteTestimonials.length, testimonials.length])

  const prevSlide = () => {
    setCurrentLogoIndex((prev) => {
      const prevIndex = prev - 1
      // Se chegar ao início, vai para o final do array infinito
      if (prevIndex < 0) {
        return infiniteTestimonials.length - testimonials.length - 1 // Vai para o último card do primeiro conjunto
      }
      return prevIndex
    })
  }

  // Rotação automática dos depoimentos (carrossel infinito)
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide()
    }, 4000)
    return () => clearInterval(interval)
  }, [nextSlide])
  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50" ref={sectionRef}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-8">
            Líderes de Vendas confiam na <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent font-extrabold" style={{WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>LeadBaze</span>!
          </h2>

          {/* Carrossel Horizontal de Depoimentos */}
          <div className="relative overflow-hidden mb-16">
            <div className="max-w-6xl mx-auto">
              {/* Container do Carrossel */}
              <div

                className={`relative cursor-grab active:cursor-grabbing transition-all duration-200 ${
                  isDragging ? 'scale-[0.98] opacity-90' : 'scale-100 opacity-100'
                }`}
                ref={carouselRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <motion.div
                  className="flex space-x-6"
                  animate={{
                    x: `-${currentLogoIndex * 320}px`
                  }}
                  transition={{
                    duration: isDragging ? 0.1 : 0.8,
                    ease: isDragging ? "linear" : "easeInOut"
                  }}
                  style={{ userSelect: 'none' }}
                >
                  {infiniteTestimonials.map((testimonial, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8, y: 20 }}
                      animate={{

                        opacity: 1,

                        scale: 1,

                        y: 0,
                        rotateY: index === currentLogoIndex ? 0 : 5
                      }}
                      transition={{

                        duration: 0.6,

                        delay: index * 0.1,
                        type: "spring",
                        stiffness: 100
                      }}
                      whileHover={{

                        scale: 1.05,
                        y: -10,
                        rotateY: 0,
                        transition: { duration: 0.3 }
                      }}
                      className="flex-shrink-0 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden group"
                    >
                      {/* Header com Gradiente */}
                      <div className={`h-24 bg-gradient-to-r ${testimonial.color} relative overflow-hidden`}>
                        <div className="absolute inset-0 bg-black/10"></div>
                        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black/20 to-transparent"></div>
                      </div>

                      {/* Conteúdo */}
                      <div className="p-6 -mt-12 relative">
                        {/* Foto do Empresário */}
                        <div className="flex justify-center mb-4">
                          <motion.div
                            className="w-20 h-20 rounded-full border-4 border-white shadow-lg overflow-hidden"
                            whileHover={{ scale: 1.1 }}
                            transition={{ duration: 0.3 }}
                          >
                            <img

                              src={testimonial.photo}

                              alt={testimonial.name}
                              className="w-full h-full object-cover"
                            />
                          </motion.div>
                        </div>

                        {/* Informações */}
                        <div className="text-center mb-4">
                          <h4 className="text-lg font-bold text-gray-900 mb-1">
                            {testimonial.name}
                          </h4>
                          <p className="text-sm text-blue-600 font-semibold mb-1">
                            {testimonial.position}
                          </p>
                          <p className="text-xs text-gray-600 font-medium">
                            {testimonial.company}
                          </p>
                        </div>

                        {/* Quote */}
                        <blockquote className="text-sm text-gray-700 leading-relaxed italic mb-4 text-center">
                          "{testimonial.quote}"
                        </blockquote>

                        {/* Rating */}
                        <div className="flex justify-center space-x-1">
                          {[...Array(testimonial.rating)].map((_, i) => (
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

                      {/* Efeito de Hover */}
                      <div className={`absolute inset-0 bg-gradient-to-r ${testimonial.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-2xl`}></div>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Seta Esquerda */}
                <motion.button
                  onClick={prevSlide}
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:text-blue-600 hover:shadow-xl transition-all duration-300 z-10"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  ←
                </motion.button>

                {/* Seta Direita */}
                <motion.button
                  onClick={nextSlide}
                  className="absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:shadow-xl transition-all duration-300 z-10"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  →
                </motion.button>
              </div>

              {/* Indicadores */}
              <div className="flex justify-center space-x-2 mt-8">
                {testimonials.map((_, index) => {
                  // Calcular qual card original está sendo exibido
                  const originalIndex = currentLogoIndex % testimonials.length
                  return (
                    <motion.button
                      key={index}
                      onClick={() => setCurrentLogoIndex(index + testimonials.length)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index === originalIndex ? 'bg-blue-600 w-6' : 'bg-gray-300'
                      }`}
                      whileHover={{ scale: 1.2 }}
                    />
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}