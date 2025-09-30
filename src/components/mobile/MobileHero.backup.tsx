import { useState, useEffect } from 'react'

import { motion } from 'framer-motion'

import { ArrowRight, Sparkles } from 'lucide-react'

import { ShimmerButton } from '../magicui/shimmer-button'

export default function MobileHero() {

  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {

    const timer = setTimeout(() => setIsVisible(true), 100)

    return () => clearTimeout(timer)

  }, [])

  return (

    <section className="md:hidden relative py-12 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 overflow-hidden">

      {/* Background Pattern */}

      <div className="absolute inset-0">

        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20"></div>

        <div

          className="absolute inset-0 opacity-20"

          style={{

            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,

            backgroundSize: '60px 60px'

          }}

        />

      </div>

      <div className="relative max-w-md mx-auto px-4">

        <div className="text-center">

          {/* Badge */}

          <motion.div

            initial={{ opacity: 0, y: 20 }}

            animate={isVisible ? { opacity: 1, y: 0 } : {}}

            transition={{ duration: 0.6 }}

            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold text-xs shadow-lg mb-6"

          >

            <Sparkles className="w-3 h-3" />

            WhatsApp 99% abertura vs 20% e-mail

          </motion.div>

          {/* Main Heading */}

          <motion.div

            initial={{ opacity: 0, y: 20 }}

            animate={isVisible ? { opacity: 1, y: 0 } : {}}

            transition={{ duration: 0.6, delay: 0.1 }}

            className="mb-6"

          >

            <h1 className="text-2xl font-bold text-white mb-4 leading-tight">

              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">

                Leads B2B qualificados

              </span>

              <br />

              <span className="text-white">em 24h via WhatsApp</span>

            </h1>

            <p className="text-sm text-gray-300 leading-relaxed">

              Map→Match→Message™ automatiza sua prospecção: encontra empresas no Google Maps, qualifica pelo seu perfil e agenda reuniões via BDR IA.

            </p>

          </motion.div>

          {/* CTA Button */}

          <motion.div

            initial={{ opacity: 0, y: 20 }}

            animate={isVisible ? { opacity: 1, y: 0 } : {}}

            transition={{ duration: 0.6, delay: 0.2 }}

            className="mb-8"

          >

            <button

              onClick={() => {

                const pricingSection = document.getElementById('mobile-pricing-section');

                if (pricingSection) {

                  pricingSection.scrollIntoView({ behavior: 'smooth' });

                }

              }}

            >

              <ShimmerButton className="px-8 py-3 text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 w-full">

                <ArrowRight className="w-4 h-4 mr-2" />

                Ver Planos Growth R$197/mês

              </ShimmerButton>

            </button>

          </motion.div>

          {/* Quick Stats */}

          <motion.div

            initial={{ opacity: 0, y: 20 }}

            animate={isVisible ? { opacity: 1, y: 0 } : {}}

            transition={{ duration: 0.6, delay: 0.3 }}

            className="grid grid-cols-2 gap-4 text-center"

          >

            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-3">

              <div className="text-lg font-bold text-white">99%</div>

              <div className="text-xs text-gray-400">Abertura WhatsApp</div>

            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-3">

              <div className="text-lg font-bold text-white">24h</div>

              <div className="text-xs text-gray-400">Leads Qualificados</div>

            </div>

          </motion.div>

        </div>

      </div>

    </section>

  )

}
