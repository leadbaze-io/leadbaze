import MagicHero from '../components/MagicHero'
import MagicSteps from '../components/MagicSteps'
import MagicBenefits from '../components/MagicBenefits'
import MagicPricing from '../components/MagicPricing'
import MagicCTA from '../components/MagicCTA'
import MagicGuarantee from '../components/MagicGuarantee'
import MagicPricingPlans from '../components/MagicPricingPlans'
import MagicFAQ from '../components/MagicFAQ'
import Footer from '../components/Footer'
import MobileLandingPage from './MobileLandingPage'
import ScrollToTopButton from '../components/ScrollToTopButton'

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Mobile Version - Only visible on mobile devices */}
      <MobileLandingPage />

      {/* Desktop Version - Hidden on mobile devices */}
      <div className="hidden md:block">
        {/* Hero Section */}
        <MagicHero />


        {/* Como Funciona */}
        <MagicSteps />

        {/* Benefícios */}
        <MagicBenefits />

        {/* CTA Final */}
        <MagicCTA />

        {/* Desejo vs Dor */}
        <MagicPricing />

        {/* 6º Dobra - GARANTIA */}
        <MagicGuarantee />

        {/* 7º Dobra - OFERTA */}
        <MagicPricingPlans />

        {/* 8º Dobra - FAQ: Quebra de Objeções */}
        <MagicFAQ />

        {/* Footer */}
        <Footer />
      </div>

      {/* Botão Voltar ao Topo */}
      <ScrollToTopButton />
    </div>
  )
}