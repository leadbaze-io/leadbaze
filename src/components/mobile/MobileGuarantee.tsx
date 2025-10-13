import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Shield, CheckCircle, Star, TrendingUp } from 'lucide-react'
import LGPDImage from '../../assets/LGPD2.png'
import { AnimatedBeam } from '../magicui/animated-beam'

export default function MobileGuarantee() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <section className="md:hidden relative py-16 bg-white overflow-hidden">
      <div className="relative max-w-md mx-auto px-4">
        {/* Header Section */}
        <AnimatedBeam delay={0.2}>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Teste <span className="bg-gradient-to-r from-green-500 via-green-400 to-green-600 bg-clip-text text-transparent font-extrabold" style={{WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>7 Dias</span>
              <br />
              <span className="bg-gradient-to-r from-green-500 via-green-400 to-green-600 bg-clip-text text-transparent font-extrabold" style={{WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
                Sem Risco
              </span>
            </h2>
            <p className="text-base text-gray-600 leading-relaxed">
              Sem letra miúda. Sem burocracia. Apenas resultados comprovados.
            </p>
          </div>
        </AnimatedBeam>

        {/* Main Content Grid */}
        <AnimatedBeam delay={0.4}>
          <div className="space-y-6 mb-12">
            {/* Success Rate Card */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={isVisible ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
              whileHover={{
                y: -8,
                scale: 1.02,
                transition: { duration: 0.4, ease: "easeOut" }
              }}
              className="group relative h-full flex flex-col"
            >
              <div className="bg-white rounded-3xl border shadow-xl hover:shadow-2xl transition-all duration-500 p-6 flex-1" style={{borderColor: '#00ff00', borderWidth: '2px'}}>
                <div className="flex items-center justify-center w-12 h-12 rounded-xl mb-4" style={{backgroundColor: '#00ff00'}}>
                  <Star className="w-6 h-6" style={{color: '#082721'}} />
                </div>
                <h3 className="text-lg font-bold text-black mb-2">
                  98% de Satisfação
                </h3>
                <p className="text-sm text-gray-800 leading-relaxed mb-4">
                  Mais de 10.000 empresas já confiam na LeadBaze para gerar leads de qualidade.
                </p>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4" style={{color: '#00ff00'}} />
                  <span className="text-sm text-gray-800">Garantia de qualidade</span>
                </div>
              </div>
            </motion.div>

            {/* Money Back Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.4 }}
              whileHover={{
                y: -8,
                scale: 1.02,
                transition: { duration: 0.4, ease: "easeOut" }
              }}
              className="group relative h-full flex flex-col"
            >
              <div className="bg-white rounded-3xl border shadow-xl hover:shadow-2xl transition-all duration-500 p-6 flex-1" style={{borderColor: '#00ff00', borderWidth: '2px'}}>
                <div className="flex items-center justify-center w-12 h-12 rounded-xl mb-4" style={{backgroundColor: '#00ff00'}}>
                  <Shield className="w-6 h-6" style={{color: '#082721'}} />
                </div>
                <h3 className="text-lg font-bold text-black mb-2">
                  Reembolso Total
                </h3>
                <p className="text-sm text-gray-800 leading-relaxed mb-4">
                  Se não ficar satisfeito nos primeiros 7 dias, devolvemos 100% do seu investimento.
                </p>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4" style={{color: '#00ff00'}} />
                  <span className="text-sm text-gray-800">Sem perguntas</span>
                </div>
              </div>
            </motion.div>

            {/* Support Card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={isVisible ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.6 }}
              whileHover={{
                y: -8,
                scale: 1.02,
                transition: { duration: 0.4, ease: "easeOut" }
              }}
              className="group relative h-full flex flex-col"
            >
              <div className="bg-white rounded-3xl border shadow-xl hover:shadow-2xl transition-all duration-500 p-6 flex-1" style={{borderColor: '#00ff00', borderWidth: '2px'}}>
                <div className="flex items-center justify-center w-12 h-12 rounded-xl mb-4" style={{backgroundColor: '#00ff00'}}>
                  <TrendingUp className="w-6 h-6" style={{color: '#082721'}} />
                </div>
                <h3 className="text-lg font-bold text-black mb-2">
                  Suporte Especializado
                </h3>
                <p className="text-sm text-gray-800 leading-relaxed mb-4">
                  Nossa equipe está sempre disponível para ajudar você a maximizar seus resultados.
                </p>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4" style={{color: '#00ff00'}} />
                  <span className="text-sm text-gray-800">Suporte 24/7</span>
                </div>
              </div>
            </motion.div>
          </div>
        </AnimatedBeam>

        {/* LGPD Badge */}
        <AnimatedBeam delay={0.8}>
          <div className="flex justify-center">
            <motion.div
              initial={{ scale: 0, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{
                duration: 1.2,
                delay: 0.8,
                type: "spring",
                stiffness: 100,
                damping: 20
              }}
              whileHover={{
                scale: 1.05,
                y: -5,
                transition: { duration: 0.4, ease: "easeOut" }
              }}
              className="relative group cursor-pointer"
            >
              <motion.div
                animate={{
                  boxShadow: [
                    "0 10px 25px -3px rgba(0, 0, 0, 0.1)",
                    "0 20px 40px -3px rgba(0, 0, 0, 0.15)",
                    "0 10px 25px -3px rgba(0, 0, 0, 0.1)"
                  ]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="p-2 rounded-full bg-gradient-to-br from-white via-gray-50 to-white"
              >
                <img
                  src={LGPDImage}
                  alt="LGPD Compliant"
                  className="w-16 h-16 object-contain drop-shadow-2xl group-hover:drop-shadow-3xl transition-all duration-500"
                />
              </motion.div>
            </motion.div>
          </div>
        </AnimatedBeam>
      </div>
    </section>
  )
}