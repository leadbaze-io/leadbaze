import { lazy, Suspense } from 'react'
import MagicHero from '../components/MagicHero'
import { LazySection } from '../components/LazySection'
import Footer from '../components/Footer'
import MobileLandingPage from './MobileLandingPage'
import ScrollToTopButton from '../components/ScrollToTopButton'

// Lazy load componentes abaixo do fold para reduzir JavaScript execution time
const MagicSteps = lazy(() => import('../components/MagicSteps'))
const MagicBenefits = lazy(() => import('../components/MagicBenefits'))
const MagicCTA = lazy(() => import('../components/MagicCTA'))
const MagicPricing = lazy(() => import('../components/MagicPricing'))
const MagicGuarantee = lazy(() => import('../components/MagicGuarantee'))
const MagicPricingPlans = lazy(() => import('../components/MagicPricingPlans'))
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

        {/* Componentes abaixo do fold - Lazy load com Intersection Observer */}
        <LazySection rootMargin="300px">
          <Suspense fallback={<div className="min-h-[400px]" />}>
            <MagicSteps />
          </Suspense>
        </LazySection>

        <LazySection rootMargin="300px">
          <Suspense fallback={<div className="min-h-[600px]" />}>
            <MagicBenefits />
          </Suspense>
        </LazySection>

        <LazySection rootMargin="300px">
          <Suspense fallback={<div className="min-h-[300px]" />}>
            <MagicCTA />
          </Suspense>
        </LazySection>

        <LazySection rootMargin="300px">
          <Suspense fallback={<div className="min-h-[500px]" />}>
            <MagicPricing />
          </Suspense>
        </LazySection>

        <LazySection rootMargin="300px">
          <Suspense fallback={<div className="min-h-[400px]" />}>
            <MagicGuarantee />
          </Suspense>
        </LazySection>

        <LazySection rootMargin="300px">
          <Suspense fallback={<div className="min-h-[600px]" />}>
            <MagicPricingPlans />
          </Suspense>
        </LazySection>

        <LazySection rootMargin="300px">
          <Suspense fallback={<div className="min-h-[400px]" />}>
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