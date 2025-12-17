import { Zap, TrendingUp, Sparkles } from 'lucide-react'
import { ShimmerButton } from './magicui/shimmer-button'
import { AnimatedCounter } from './magicui/animated-counter'
import { AuroraText } from './magicui/aurora-text'
import { LightRays } from './magicui/light-rays'
import { lazy, Suspense } from 'react'
import { useNavigate } from 'react-router-dom'
import ThreeHeroScene from './hero/ThreeHeroScene'
import './MagicHero.css'

const HeroAnalyticsDashboard = lazy(() => import('./HeroAnalyticsDashboard'))

export default function MagicHero() {
  const navigate = useNavigate();

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

      {/* Three.js 3D Scene */}
      <ThreeHeroScene />

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
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6" style={{ opacity: 1 }}>
            <span style={{ color: '#FFFFFF' }} className="font-extrabold">
              Gere mais de{' '}
            </span>
            <AuroraText className="font-extrabold">
              1000 Leads B2B
            </AuroraText>
            <br />
            <span style={{ color: '#FFFFFF' }}>
              em menos de 7 dias
            </span>
          </h1>

          {/* Subtítulo - SEM animação para melhorar LCP */}
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed" style={{ color: '#FFFFFF', opacity: 1 }}>
            Tudo que você precisa para prospectar, escalar e ter sucesso em vendas.
          </p>

          {/* CTA Centralizado - SEM animação para melhorar LCP */}
          <div>
            <div className="button-illumination">
              <ShimmerButton
                id="id_lead_dm"
                onClick={() => {
                  navigate('/agendar-demo');
                  window.scrollTo(0, 0);
                }}
                className="px-8 py-4 text-lg"
              >
                <span>Agende uma Demonstração</span>
              </ShimmerButton>
            </div>
          </div>

          {/* Analytics Dashboard Preview - Lazy loaded (não crítico para LCP) */}
          {/* Altura fixa no fallback para evitar CLS */}
          <Suspense fallback={<div className="mt-16 min-h-[600px] w-full" style={{ minHeight: '600px', width: '100%' }} aria-hidden="true" />}>
            <HeroAnalyticsDashboard />
          </Suspense>

          {/* Stats - SEM animação para melhorar performance */}
          <div className="hero-stats-container" style={{ marginTop: '6rem', opacity: 1 }}>
            <div className="hero-stat-card">
              <div className="hero-stat-content">
                <div className="hero-stat-icon">
                  <Zap />
                </div>
                <div className="hero-stat-number">
                  <AnimatedCounter value={10} suffix="x" delay={500} />
                </div>
                <div className="hero-stat-title">Mais Rápido</div>
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}