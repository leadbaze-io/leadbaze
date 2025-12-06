import { lazy, Suspense } from 'react'
import MobileHero from '../components/mobile/MobileHero'
import { LazySection } from '../components/LazySection'
import MobileFooter from '../components/mobile/MobileFooter'
import ScrollToTopButton from '../components/ScrollToTopButton'
// import MobilePricingPlans from '../components/mobile/MobilePricingPlans' // Import direto - crítico para botão "Ver Planos" - TEMPORARIAMENTE DESABILITADO

// Lazy load componentes mobile abaixo do fold
const MobileSteps = lazy(() => import('../components/mobile/MobileSteps'))
const MobileBenefits = lazy(() => import('../components/mobile/MobileBenefits'))
const MobileCTA = lazy(() => import('../components/mobile/MobileCTA'))
const MobilePricing = lazy(() => import('../components/mobile/MobilePricing'))
const MobileGuarantee = lazy(() => import('../components/mobile/MobileGuarantee'))
const MobileFAQ = lazy(() => import('../components/mobile/MobileFAQ'))

export default function MobileLandingPage() {
  return (
    <div className="md:hidden min-h-screen">
      {/* Mobile Hero Section - Carregar imediatamente */}
      <MobileHero />

      {/* Componentes abaixo do fold - Lazy load */}
      <LazySection rootMargin="300px">
        <Suspense fallback={<div className="min-h-[400px]" />}>
          <MobileSteps />
        </Suspense>
      </LazySection>

      <LazySection rootMargin="300px">
        <Suspense fallback={<div className="min-h-[600px]" />}>
          <MobileBenefits />
        </Suspense>
      </LazySection>

      <LazySection rootMargin="300px">
        <Suspense fallback={<div className="min-h-[300px]" />}>
          <MobileCTA />
        </Suspense>
      </LazySection>

      <LazySection rootMargin="300px">
        <Suspense fallback={<div className="min-h-[500px]" />}>
          <MobilePricing />
        </Suspense>
      </LazySection>

      <LazySection rootMargin="300px">
        <Suspense fallback={<div className="min-h-[400px]" />}>
          <MobileGuarantee />
        </Suspense>
      </LazySection>

      {/* Seção de Planos - TEMPORARIAMENTE OCULTA */}
      {/* NOTA: Seção comentada para não aparecer para os clientes. Para restaurar, descomente as linhas abaixo. */}
      {/* <MobilePricingPlans /> */}

      <LazySection rootMargin="300px">
        <Suspense fallback={<div className="min-h-[400px]" />}>
          <MobileFAQ />
        </Suspense>
      </LazySection>

      {/* Mobile Footer */}
      <MobileFooter />

      {/* Botão Voltar ao Topo */}
      <ScrollToTopButton />
    </div>
  )
}
