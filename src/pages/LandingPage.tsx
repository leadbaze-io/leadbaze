import { lazy, Suspense } from 'react'
import MagicHero from '../components/MagicHero'
import { LazySection } from '../components/LazySection'
import Footer from '../components/Footer'
import MobileLandingPage from './MobileLandingPage'
import ScrollToTopButton from '../components/ScrollToTopButton'
import MagicPricingPlans from '../components/MagicPricingPlans' // Import direto - crítico para botão "Ver Planos"

// Lazy load componentes abaixo do fold para reduzir JavaScript execution time
const MagicSteps = lazy(() => import('../components/MagicSteps'))
const MagicBenefits = lazy(() => import('../components/MagicBenefits'))
const MagicCTA = lazy(() => import('../components/MagicCTA'))
const MagicPricing = lazy(() => import('../components/MagicPricing'))
const MagicGuarantee = lazy(() => import('../components/MagicGuarantee'))
const MagicFAQ = lazy(() => import('../components/MagicFAQ'))

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Mobile Version - Only visible on mobile devices */}
      <MobileLandingPage />

      {/* Desktop Version - Hidden on mobile devices */}
      <div className="hidden md:block">
        {/* Hero Section - Carregar imediatamente (LCP element) */}
        <MagicHero />

        {/* Componentes acima da seção de planos - CARREGAR IMEDIATAMENTE para offsetTop estável */}
        {/* Renderizar diretamente sem lazy loading para manter layout estável */}
        <Suspense fallback={null}>
          <MagicSteps />
        </Suspense>

        <Suspense fallback={null}>
          <MagicBenefits />
        </Suspense>

        <Suspense fallback={null}>
          <MagicCTA />
        </Suspense>

        <Suspense fallback={null}>
          <MagicPricing />
        </Suspense>

        <Suspense fallback={null}>
          <MagicGuarantee />
        </Suspense>

        {/* Seção de Planos - SEM lazy loading, renderizada IMEDIATAMENTE */}
        <MagicPricingPlans />

        <LazySection rootMargin="500px">
          <Suspense fallback={<div className="min-h-[400px] animate-pulse" />}>
            <MagicFAQ />
          </Suspense>
        </LazySection>

        {/* Footer */}
        <Footer />
      </div>

      {/* Botão Voltar ao Topo */}
      <ScrollToTopButton />
    </div>
  )
}