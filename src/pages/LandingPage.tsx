import MagicHero from '../components/MagicHero'
import MagicSteps from '../components/MagicSteps'
import MagicBenefits from '../components/MagicBenefits'
import MagicPricing from '../components/MagicPricing'
import MagicCTA from '../components/MagicCTA'

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <MagicHero />
      
      {/* Como Funciona */}
      <MagicSteps />
      
      {/* Benefícios */}
      <MagicBenefits />
      
      {/* Preços e Benefícios */}
      <MagicPricing />
      
      {/* CTA Final */}
      <MagicCTA />
    </div>
  )
}