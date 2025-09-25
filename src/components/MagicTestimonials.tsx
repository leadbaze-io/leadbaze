import { useState, useEffect, useRef } from 'react'
import { Star, ChevronLeft, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { AnimatedBeam } from './magicui/animated-beam'
import { BorderBeam } from './magicui/border-beam'
import { Marquee } from './magicui/marquee'

export default function MagicTestimonials() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const sectionRef = useRef<HTMLDivElement>(null)

  const testimonials = [
    {
      name: "Carlos Silva",
      role: "Diretor Comercial",
      company: "TechSolutions Ltda",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
              content: "O LeadBaze revolucionou nossa prospecção. Em 2 meses, aumentamos nossa base de leads em 400% e a qualidade dos contatos melhorou significativamente.",
      rating: 5,
      highlight: "400% mais leads"
    },
    {
      name: "Maria Fernandes",
      role: "Gerente de Marketing",
      company: "Crescer Negócios",
      avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop&crop=face",
      content: "Antes gastávamos 8 horas por semana pesquisando leads manualmente. Agora fazemos o mesmo trabalho em 30 minutos. O ROI foi impressionante!",
      rating: 5,
      highlight: "15x mais rápido"
    },
    {
      name: "Roberto Santos",
      role: "CEO",
      company: "Digital Partners",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      content: "A precisão dos dados é excepcional. Conseguimos reduzir em 60% o tempo perdido com leads inválidos e focar apenas em prospects qualificados.",
      rating: 5,
      highlight: "60% menos tempo perdido"
    },
    {
      name: "Ana Costa",
      role: "Head de Vendas",
      company: "Inovva Consultoria",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
      content: "Interface intuitiva e resultados instantâneos. Nossa equipe de vendas adotou a ferramenta imediatamente. Excelente custo-benefício!",
      rating: 5,
      highlight: "Adoção instantânea"
    }
  ]

  // Observer para animações removido para simplificar

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [testimonials.length])

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ))
  }

  return (
    <section className="py-20 bg-white" ref={sectionRef}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <AnimatedBeam delay={0.2}>
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Star className="w-4 h-4" />
              <span>Depoimentos Reais</span>
            </div>

            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              O que nossos

              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Clientes</span>
              <br />
              estão dizendo
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Histórias reais de empresas que transformaram sua prospecção com o LeadBaze
            </p>
          </div>
        </AnimatedBeam>

        {/* Main Testimonial */}
        <AnimatedBeam delay={0.4}>
          <div className="max-w-4xl mx-auto">
            <BorderBeam className="relative bg-gradient-to-br from-blue-50 to-purple-50 p-8 md:p-12 border-0">
              {/* Navigation Buttons */}
              <div className="absolute top-6 right-6 flex space-x-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={prevTestimonial}
                  className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={nextTestimonial}
                  className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </motion.button>
              </div>

              {/* Content */}
              <div className="pt-8">
                {/* Rating */}
                <motion.div

                  key={currentTestimonial}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="flex items-center space-x-1 mb-6"
                >
                  {renderStars(testimonials[currentTestimonial].rating)}
                </motion.div>

                {/* Testimonial Text */}
                <motion.blockquote

                  key={`quote-${currentTestimonial}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="text-xl md:text-2xl text-gray-800 leading-relaxed mb-8 font-medium"
                >
                  "{testimonials[currentTestimonial].content}"
                </motion.blockquote>

                {/* Highlight */}
                <motion.div

                  key={`highlight-${currentTestimonial}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold mb-8"
                >
                  {testimonials[currentTestimonial].highlight}
                </motion.div>

                {/* Author */}
                <motion.div

                  key={`author-${currentTestimonial}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="flex items-center space-x-4"
                >
                  <img
                    src={testimonials[currentTestimonial].avatar}
                    alt={testimonials[currentTestimonial].name}
                    className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                  <div>
                    <div className="font-semibold text-gray-900 text-lg">
                      {testimonials[currentTestimonial].name}
                    </div>
                    <div className="text-gray-600">
                      {testimonials[currentTestimonial].role}
                    </div>
                    <div className="text-blue-600 font-medium">
                      {testimonials[currentTestimonial].company}
                    </div>
                  </div>
                </motion.div>
              </div>
            </BorderBeam>
          </div>
        </AnimatedBeam>

        {/* Testimonial Indicators */}
        <div className="flex justify-center mt-8 space-x-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentTestimonial(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentTestimonial

                  ? 'bg-blue-600 w-8'

                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>

        {/* Secondary Testimonials using Marquee */}
        <div className="mt-16">
          <Marquee className="py-4" pauseOnHover={true} duration={30}>
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className={`bg-white p-6 w-80 mx-3 cursor-pointer transition-all duration-300 rounded-lg border ${
                  index === currentTestimonial ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
                }`}
                onClick={() => setCurrentTestimonial(index)}
              >
                <div className="flex items-center space-x-1 mb-3">
                  {renderStars(testimonial.rating)}
                </div>
                <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                  "{testimonial.content.substring(0, 100)}..."
                </p>
                <div className="flex items-center space-x-3">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-medium text-gray-900 text-sm">
                      {testimonial.name}
                    </div>
                    <div className="text-gray-500 text-xs">
                      {testimonial.company}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Marquee>
        </div>
      </div>
    </section>
  )
}