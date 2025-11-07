import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Link2, Zap, TrendingUp } from 'lucide-react'
import { AnimatedBeam } from '../magicui/animated-beam'
import { ShimmerButton } from '../magicui/shimmer-button'
import { getCurrentUser } from '../../lib/supabaseClient'

export default function MobileSteps() {
  const navigate = useNavigate()
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
      title: "1º) Mapeamento",
      description: "Digite o tipo de estabelecimento e localização desejada. Nossa IA encontrará automaticamente os melhores leads para você.",
      color: "blue"
    },
    {
      icon: Zap,
      title: "2º) Qualificação",
      description: "Nossa IA processa automaticamente os dados e extrai informações relevantes para o seu time comercial. Filtre pelo seu perfil de cliente ideal (ICP).",
      color: "purple"
    },
    {
      icon: TrendingUp,
      title: "3º) Comece a Vender",
      description: "Receba uma lista completa com nome, endereço, telefone, avaliações, sites e redes sociais. Dispare mensagem de forma automática e personalizada para os leads gerados.",
      color: "green"
    }
  ]

  return (
    <section className="md:hidden relative py-16 bg-white overflow-hidden" ref={stepsRef}>

      <div className="relative max-w-md mx-auto px-4">
        {/* Header */}
        <AnimatedBeam delay={0.2}>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              <span className="bg-gradient-to-r from-green-500 via-green-400 to-green-600 bg-clip-text text-transparent font-extrabold" style={{WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>LeadBaze</span>: Simplificando a geração de Leads
            </h2>
            <p className="text-base text-gray-600 leading-relaxed">
              São apenas 3 passos:
            </p>
          </div>
        </AnimatedBeam>

        {/* Steps */}
        <AnimatedBeam delay={0.4}>
          <div className="relative">
            <div className="space-y-6">
              {steps.map((step, index) => (
                <div
                  key={index}
                  data-step={index}
                  className={`relative bg-white p-6 rounded-3xl border shadow-xl transition-all duration-700 transform hover:shadow-2xl hover:-translate-y-2 ${
                    visibleSteps.has(index)
                      ? 'translate-y-0 opacity-100 scale-100'
                      : 'translate-y-8 opacity-0 scale-95'
                  }`}
                  style={{ 
                    borderColor: '#00ff00',
                    borderWidth: '2px',
                    transitionDelay: `${index * 200}ms` 
                  }}
                >
                  {/* Número do Step */}
                  <div className="absolute -top-3 left-6 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs z-10 shadow-lg" style={{backgroundColor: '#00ff00', color: '#082721'}}>
                    {index + 1}
                  </div>

                  {/* Ícone */}
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4" style={{backgroundColor: '#00ff00'}}>
                    <step.icon className="w-6 h-6" style={{color: '#082721'}} />
                  </div>

                  {/* Conteúdo */}
                  <h3 className="text-lg font-semibold text-black mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-800 leading-relaxed">
                    {step.description}
                  </p>

                  {/* Efeito de hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-green-50 to-green-100 rounded-3xl opacity-0 hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                </div>
              ))}
            </div>
          </div>
        </AnimatedBeam>

        {/* CTA Bottom */}
        <AnimatedBeam delay={0.8}>
          <div className="text-center mt-12">
            <ShimmerButton
              onClick={async () => {
                try {
                  const user = await getCurrentUser()
                  if (user) {
                    navigate('/dashboard')
                    // Scroll para o topo após navegação
                    setTimeout(() => {
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }, 100)
                  } else {
                    navigate('/login')
                    // Scroll para o topo após navegação
                    setTimeout(() => {
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }, 100)
                  }
                } catch (error) {
                  navigate('/login')
                  // Scroll para o topo após navegação
                  setTimeout(() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }, 100)
                }
              }}
              className="px-6 py-3 text-base"
            >
              <span>Comece a Gerar Leads</span>
            </ShimmerButton>
          </div>
        </AnimatedBeam>
      </div>
    </section>
  )
}