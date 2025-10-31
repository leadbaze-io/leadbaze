import { Zap, TrendingUp, Sparkles } from 'lucide-react'
import { AnimatedBeam } from './magicui/animated-beam'
import { ShimmerButton } from './magicui/shimmer-button'
import { AnimatedCounter } from './magicui/animated-counter'
import { AuroraText } from './magicui/aurora-text'
import { lazy, Suspense } from 'react'
import './MagicHero.css'

// Lazy load componentes não críticos para LCP
const Meteors = lazy(() => import('./magicui/meteors').then(m => ({ default: m.Meteors })))
const StarrySky = lazy(() => import('./magicui/starry-sky').then(m => ({ default: m.StarrySky })))
const HeroAnalyticsDashboard = lazy(() => import('./HeroAnalyticsDashboard'))

export default function MagicHero() {
  return (
    <section className="relative py-20 md:py-32 overflow-hidden min-h-screen" style={{
      background: 'linear-gradient(135deg, #082721 0%, #1A3A3A 50%, #082721 100%)'
    }}>
      {/* Background with Meteors and Starry Sky - Lazy loaded (não críticos para LCP) */}
      <div className="absolute inset-0" style={{height: '100%', minHeight: '100vh'}}>
        <Suspense fallback={null}>
          <Meteors 
            number={40}
            minDelay={0.2}
            maxDelay={1.2}
            minDuration={2}
            maxDuration={10}
            angle={215}
          />
          <StarrySky starCount={50} twinkleSpeed={2000} />
        </Suspense>
      </div>

      {/* Subtle overlay for better text readability */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(circle at center, transparent 0%, rgba(8, 39, 33, 0.3) 100%)',
        minHeight: '100vh'
      }}></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">

          {/* Título Principal - SEM delay para melhorar LCP (é o LCP element) */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6" style={{opacity: 1}}>
            <span style={{color: '#FFFFFF'}} className="font-extrabold">
              Gere mais de{' '}
            </span>
            <AuroraText className="font-extrabold">
              1000 Leads B2B
            </AuroraText>
            <br />
            <span style={{color: '#FFFFFF'}}>
              em menos de 7 dias
            </span>
          </h1>

          {/* Subtítulo */}
          <AnimatedBeam delay={0.6}>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed" style={{color: '#FFFFFF'}}>
              Tudo que você precisa para prospectar, escalar e ter sucesso em vendas.
            </p>
          </AnimatedBeam>

          {/* CTA Centralizado */}
          <AnimatedBeam delay={0.8}>
            <div className="button-illumination">
              <ShimmerButton

                onClick={() => {

                  // Tentar múltiplos métodos para encontrar a seção
                  let pricingSection = document.getElementById('pricing-plans-section')

                  // Verificar se é a seção correta (não mobile)
                  if (pricingSection && pricingSection.classList.contains('md:hidden')) {

                    pricingSection = null
                  }

                  // Se não encontrar, tentar por classe (desktop)
                  if (!pricingSection) {
                    pricingSection = document.querySelector('section[id*="pricing"]:not(.md\\:hidden)')

                  }

                  // Se ainda não encontrar, tentar por texto (desktop)
                  if (!pricingSection) {
                    const sections = document.querySelectorAll('section:not(.md\\:hidden)')
                    for (const section of sections) {
                      if (section.textContent?.includes('Plano') || section.textContent?.includes('Preço')) {
                        pricingSection = section as HTMLElement

                        break
                      }
                    }
                  }

                  // Fallback: usar qualquer seção com pricing
                  if (!pricingSection) {
                    pricingSection = document.querySelector('[id*="pricing"]')

                  }
                  if (pricingSection) {
                    // Scroll com offset para compensar navbar fixa
                    const elementPosition = pricingSection.getBoundingClientRect().top
                    const offsetPosition = elementPosition + window.pageYOffset - 80

                    window.scrollTo({
                      top: offsetPosition,
                      behavior: 'smooth'
                    })

                  } else {

                    // Método alternativo: scroll para o final da página
                    window.scrollTo({
                      top: document.body.scrollHeight,
                      behavior: 'smooth'
                    })
                  }
                }}
                className="px-8 py-4 text-lg"
              >
                <span>Ver Planos</span>
              </ShimmerButton>
            </div>
          </AnimatedBeam>

          {/* Analytics Dashboard Preview - Lazy loaded (não crítico para LCP) */}
          <Suspense fallback={<div className="mt-16 min-h-[600px]" />}>
            <HeroAnalyticsDashboard />
          </Suspense>

          {/* Stats */}
          <AnimatedBeam delay={2.0}>
            <div className="hero-stats-container" style={{marginTop: '6rem'}}>
              <div className="hero-stat-card">
                <div className="hero-stat-content">
                  <div className="hero-stat-icon">
                    <Zap />
                  </div>
                  <div className="hero-stat-number">
                    <AnimatedCounter value={10} suffix="x" delay={500} />
                  </div>
                  <div className="hero-stat-title">Mais Rápido</div>
                  <div className="hero-stat-description">que métodos tradicionais</div>
                </div>
              </div>

              <div className="hero-stat-card">
                <div className="hero-stat-content">
                  <div className="hero-stat-icon">
                    <TrendingUp />
                  </div>
                  <div className="hero-stat-number">
                    <AnimatedCounter value={95} suffix="%" delay={700} />
                  </div>
                  <div className="hero-stat-title">Precisão</div>
                  <div className="hero-stat-description">nos dados extraídos</div>
                </div>
              </div>

              <div className="hero-stat-card">
                <div className="hero-stat-content">
                  <div className="hero-stat-icon">
                    <Sparkles />
                  </div>
                  <div className="hero-stat-number">
                    <AnimatedCounter value={1000} suffix="+" delay={900} />
                  </div>
                  <div className="hero-stat-title">Leads/semana</div>
                  <div className="hero-stat-description">plano Start</div>
                </div>
              </div>
            </div>
          </AnimatedBeam>
        </div>
      </div>
    </section>
  )
}