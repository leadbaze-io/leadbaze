import { Zap, TrendingUp, Sparkles } from 'lucide-react'
import { ShimmerButton } from './magicui/shimmer-button'
import { AnimatedCounter } from './magicui/animated-counter'
import { AuroraText } from './magicui/aurora-text'
import { LightRays } from './magicui/light-rays'
import { lazy, Suspense } from 'react'
import './MagicHero.css'

const HeroAnalyticsDashboard = lazy(() => import('./HeroAnalyticsDashboard'))

export default function MagicHero() {
  return (
    <section className="relative py-20 md:py-32 min-h-screen" style={{
      background: 'linear-gradient(135deg, #082721 0%, #1A3A3A 50%, #082721 100%)',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Background gradient */}
      
      {/* Subtle overlay for better text readability */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(circle at center, transparent 0%, rgba(8, 39, 33, 0.3) 100%)',
        minHeight: '100vh',
        zIndex: 1,
        pointerEvents: 'none'
      }}></div>

      {/* Light Rays Animation */}
      <LightRays 
        count={7}
        color="rgba(34, 197, 94, 0.15)"
        blur={40}
        opacity={0.6}
        speed={14}
        length="70vh"
        style={{ zIndex: 2 }}
      />

      {/* Conteúdo principal - acima de tudo */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ zIndex: 10 }}>
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

          {/* Subtítulo - SEM animação para melhorar LCP */}
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed" style={{color: '#FFFFFF', opacity: 1}}>
              Tudo que você precisa para prospectar, escalar e ter sucesso em vendas.
            </p>

          {/* CTA Centralizado - SEM animação para melhorar LCP */}
          <div>
            <div className="button-illumination">
              <ShimmerButton
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  
                  // Buscar seção de planos
                  const findAllSections = () => {
                    const desktopContainer = document.querySelector('div.hidden.md\\:block')
                    if (!desktopContainer) return null
                    
                    const allSections = desktopContainer.querySelectorAll('section')
                    
                    for (const s of allSections) {
                      const section = s as HTMLElement
                      
                      // Pular seções mobile ou testimonials
                      if (section.id === 'testimonials-section' || section.classList.contains('md:hidden')) {
                        continue
                      }
                      
                      const h2 = section.querySelector('h2')
                      if (!h2) continue
                      
                      const text = h2.textContent || ''
                      
                      // DEVE ter "Escolha o Plano" E "Perfeito para Você"
                      // E NÃO pode ter "Líderes de Vendas"
                      if (text.includes('Escolha o Plano') && 
                          text.includes('Perfeito para Você') &&
                          !text.includes('Líderes de Vendas')) {
                        return section
                      }
                    }
                    return null
                  }
                  
                  // Tentar encontrar a seção pelo ID
                  let section = document.getElementById('pricing-plans-section-desktop')
                  
                  if (section) {
                    const h2 = section.querySelector('h2')
                    const text = h2?.textContent || ''
                    
                    // Validar que é a seção correta
                    if (text.includes('Líderes de Vendas') || text.includes('confiam')) {
                      section = null
                    } else if (!text.includes('Escolha o Plano')) {
                      section = null
                    }
                  }
                  
                  // Se não encontrou ou não validou, buscar em todas as seções
                  if (!section) {
                    section = findAllSections()
                  }
                  
                  // Fazer scroll se encontrou
                  if (section) {
                    // Forçar layout recalculation para garantir que offsetTop está correto
                    section.offsetHeight
                    document.body.offsetHeight
                    
                    // Calcular offsetTop usando getBoundingClientRect + scrollY (mais confiável)
                    const rect = section.getBoundingClientRect()
                    const actualOffsetTop = rect.top + window.scrollY
                    const navbarHeight = 65
                    const targetScroll = actualOffsetTop - navbarHeight
                    
                    // Scroll direto e suave para a posição correta
                    window.scrollTo({
                      top: targetScroll,
                      behavior: 'smooth'
                    })
                  } else {
                    // Tentar novamente após delay
                    setTimeout(() => {
                      let section = findAllSections() || document.getElementById('pricing-plans-section-desktop')
                      if (section) {
                        const h2 = section.querySelector('h2')
                        const text = h2?.textContent || ''
                        if (!text.includes('Líderes de Vendas') && text.includes('Escolha o Plano')) {
                          section.scrollIntoView({ behavior: 'smooth', block: 'start' })
                        }
                      }
                    }, 100)
                  }
                }}
                className="px-8 py-4 text-lg"
              >
                <span>Ver Planos</span>
              </ShimmerButton>
            </div>
                    </div>
                    
          {/* Analytics Dashboard Preview - Lazy loaded (não crítico para LCP) */}
          {/* Altura fixa no fallback para evitar CLS */}
          <Suspense fallback={<div className="mt-16 min-h-[600px] w-full" style={{ minHeight: '600px', width: '100%' }} aria-hidden="true" />}>
            <HeroAnalyticsDashboard />
          </Suspense>

          {/* Stats - SEM animação para melhorar performance */}
          <div className="hero-stats-container" style={{marginTop: '6rem', opacity: 1}}>
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
        </div>
      </div>
    </section>
  )
}