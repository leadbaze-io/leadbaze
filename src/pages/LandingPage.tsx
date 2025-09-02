import MagicHero from '../components/MagicHero'
import MagicSteps from '../components/MagicSteps'
import MagicBenefits from '../components/MagicBenefits'
import MagicPricing from '../components/MagicPricing'
import MagicCTA from '../components/MagicCTA'
import MagicGuarantee from '../components/MagicGuarantee'

export default function LandingPage() {
  return (
    <div className="min-h-screen">
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
    </div>
  )
}