import MobileHero from '../components/mobile/MobileHero'
import MobileProcess from '../components/mobile/MobileProcess'
import MobilePricing from '../components/mobile/MobilePricing'
import MobileBonus from '../components/mobile/MobileBonus'
import MobileGuarantee from '../components/mobile/MobileGuarantee'
import MobileComparison from '../components/mobile/MobileComparison'
import MobileLGPD from '../components/mobile/MobileLGPD'

export default function MobileLandingPage() {
  return (
    <div className="md:hidden min-h-screen">
      {/* Mobile Hero - Leads B2B qualificados em 24h */}
      <MobileHero />
      
      {/* Mobile Process - Map→Match→Message™ */}
      <MobileProcess />
      
      {/* Mobile Pricing - Planos START/GROWTH/SCALE */}
      <MobilePricing />
      
      {/* Mobile Bonus - Bônus inclusos */}
      <MobileBonus />
      
      {/* Mobile Guarantee - 30 dias sem risco */}
      <MobileGuarantee />
      
      {/* Mobile Comparison - SDR vs Agência vs LeadBaze */}
      <MobileComparison />
      
      {/* Mobile LGPD - Conformidade legal */}
      <MobileLGPD />
    </div>
  )
}


