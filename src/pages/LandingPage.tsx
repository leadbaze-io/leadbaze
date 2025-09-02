import MagicHero from '../components/MagicHero'
import MagicSteps from '../components/MagicSteps'
import MagicBenefits from '../components/MagicBenefits'
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
      
      {/* CTA Final */}
      <MagicCTA />
    </div>
  )
}