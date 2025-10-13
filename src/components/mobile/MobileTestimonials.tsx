import { useState, useEffect } from 'react'

import { Star, ChevronLeft, ChevronRight } from 'lucide-react'

import { motion } from 'framer-motion'

export default function MobileTestimonials() {

  const [currentTestimonial, setCurrentTestimonial] = useState(0)

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

        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}

      />

    ))

  }

  return (

    <section className="md:hidden py-16 bg-white">

      <div className="max-w-md mx-auto px-4">

        {/* Header */}

        <div className="text-center mb-12">

          <div className="inline-flex items-center space-x-2 bg-yellow-100 text-yellow-700 px-3 py-2 rounded-full text-xs font-medium mb-4">

            <Star className="w-3 h-3" />

            <span>Depoimentos Reais</span>

          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">

            O que nossos

            <span className="bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent"> Clientes</span>

            <br />

            estão dizendo

          </h2>

          <p className="text-base text-gray-600">

            Histórias reais de empresas que transformaram sua prospecção com o LeadBaze

          </p>

        </div>

        {/* Testimonial Card */}

        <div className="relative">

          <motion.div

            key={currentTestimonial}

            initial={{ opacity: 0, y: 20 }}

            animate={{ opacity: 1, y: 0 }}

            exit={{ opacity: 0, y: -20 }}

            transition={{ duration: 0.5 }}

            className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6"

          >

            {/* Highlight Badge */}

            <div className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-semibold rounded-full mb-4">

              {testimonials[currentTestimonial].highlight}

            </div>

            {/* Content */}

            <blockquote className="text-sm text-gray-700 leading-relaxed mb-6 italic">

              "{testimonials[currentTestimonial].content}"

            </blockquote>

            {/* Author Info */}

            <div className="flex items-center space-x-3">

              <img

                src={testimonials[currentTestimonial].avatar}

                alt={testimonials[currentTestimonial].name}

                className="w-12 h-12 rounded-full object-cover"

              />

              <div className="flex-1">

                <div className="font-semibold text-gray-900 text-sm">

                  {testimonials[currentTestimonial].name}

                </div>

                <div className="text-xs text-gray-600">

                  {testimonials[currentTestimonial].role} • {testimonials[currentTestimonial].company}

                </div>

              </div>

              <div className="flex space-x-1">

                {renderStars(testimonials[currentTestimonial].rating)}

              </div>

            </div>

          </motion.div>

          {/* Navigation */}

          <div className="flex justify-between items-center mt-6">

            <button

              onClick={prevTestimonial}

              className="w-10 h-10 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:text-blue-600 hover:shadow-xl transition-all duration-300"

            >

              <ChevronLeft className="w-5 h-5" />

            </button>

            {/* Indicators */}

            <div className="flex space-x-2">

              {testimonials.map((_, index) => (

                <button

                  key={index}

                  onClick={() => setCurrentTestimonial(index)}

                  className={`w-2 h-2 rounded-full transition-all duration-300 ${

                    index === currentTestimonial ? 'bg-blue-600 w-4' : 'bg-gray-300'

                  }`}

                />

              ))}

            </div>

            <button

              onClick={nextTestimonial}

              className="w-10 h-10 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:text-blue-600 hover:shadow-xl transition-all duration-300"

            >

              <ChevronRight className="w-5 h-5" />

            </button>

          </div>

        </div>

      </div>

    </section>

  )

}
