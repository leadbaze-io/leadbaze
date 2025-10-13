import MobileHero from '../components/mobile/MobileHero'
import MobilePlatformPreview from '../components/mobile/MobilePlatformPreview'
import MobileSteps from '../components/mobile/MobileSteps'
import MobileBenefits from '../components/mobile/MobileBenefits'
import MobilePricing from '../components/mobile/MobilePricing'
import MobileCTA from '../components/mobile/MobileCTA'
import MobileGuarantee from '../components/mobile/MobileGuarantee'
import MobilePricingPlans from '../components/mobile/MobilePricingPlans'
import MobileFAQ from '../components/mobile/MobileFAQ'
import MobileFooter from '../components/mobile/MobileFooter'
import ScrollToTopButton from '../components/ScrollToTopButton'

export default function MobileLandingPage() {
  return (
    <div className="md:hidden min-h-screen">
      {/* Mobile Hero Section */}
      <MobileHero />

      {/* Mobile Platform Preview - Interactive Demo */}
      <MobilePlatformPreview />

      {/* Mobile Como Funciona */}
      <MobileSteps />

      {/* Mobile Benefícios */}
      <MobileBenefits />

      {/* Mobile CTA Final */}
      <MobileCTA />

      {/* Mobile Desejo vs Dor */}
      <MobilePricing />

      {/* Mobile 6º Dobra - GARANTIA */}
      <MobileGuarantee />

      {/* Mobile 7º Dobra - OFERTA */}
      <MobilePricingPlans />

      {/* Mobile 8º Dobra - FAQ: Quebra de Objeções */}
      <MobileFAQ />

      {/* Mobile Footer */}
      <MobileFooter />

      {/* Botão Voltar ao Topo */}
      <ScrollToTopButton />
    </div>
  )
}
