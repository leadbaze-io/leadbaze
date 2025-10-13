import { AnimatedCounter } from './magicui/animated-counter'
import { AnimatedBeam } from './magicui/animated-beam'
import { FlickeringGrid } from './magicui/flickering-grid'
import { ShimmerButton } from './magicui/shimmer-button'

export default function MagicCTA() {
  const stats = [
    { value: 1000, suffix: '+', label: 'Empresas Confiam' },
    { value: 99.9, suffix: '%', label: 'Uptime Garantido' },
    { value: 24, suffix: '/7', label: 'Suporte Ativo' }
  ]

  return (
    <section className="relative py-20 md:py-32 overflow-hidden" style={{
      background: 'linear-gradient(135deg, #082721 0%, #1A3A3A 50%, #082721 100%)'
    }}>
      {/* Background with Flickering Grid */}
      <div className="absolute inset-0">
        <FlickeringGrid
          gridSize={20}
          flickerDuration={2000}
          flickerDelay={100}
          opacity={0.05}
        />
      </div>

      {/* Subtle overlay for better text readability */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(circle at center, transparent 0%, rgba(8, 39, 33, 0.3) 100%)'
      }}></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Main Heading */}
          <AnimatedBeam delay={0.2}>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-[#00ff00] to-[#00cc00] bg-clip-text text-transparent font-extrabold" style={{WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
                Comece a gerar leads
              </span>
              <br />
              <span style={{color: '#FFFFFF'}}>
                hoje mesmo!
              </span>
            </h2>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed mb-8" style={{color: '#FFFFFF', opacity: 0.9}}>
              Junte-se a mais de 1532 empresas que impulsionam sua prospecção com o LeadBaze
            </p>
          </AnimatedBeam>

          {/* CTA Button */}
          <AnimatedBeam delay={0.4}>
            <div className="flex justify-center mb-16">
              <ShimmerButton
                onClick={() => {
                  const pricingSection = document.getElementById('pricing-plans-section');
                  if (pricingSection) {
                    pricingSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="px-12 py-4 text-lg font-semibold"
              >
                <span>Começar Agora</span>
              </ShimmerButton>
            </div>
          </AnimatedBeam>

          {/* Features */}
          <AnimatedBeam delay={0.6}>
            <div className="flex flex-wrap items-center justify-center gap-8 mb-16" style={{color: '#FFFFFF'}}>
              <div className="flex items-center gap-2">
                <span>✨ 30 leads gratuitos</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🔒 Seus dados seguros</span>
              </div>
              <div className="flex items-center gap-2">
                <span>⭐ Satisfação garantida</span>
              </div>
            </div>
          </AnimatedBeam>

          {/* Stats */}
          <AnimatedBeam delay={0.8}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="backdrop-blur-sm border rounded-2xl p-8 text-center hover:bg-gray-800/70 transition-all duration-300 flex flex-col items-center justify-center" style={{backgroundColor: 'rgba(8, 39, 33, 0.5)', borderColor: '#00ff00'}}
                >
                  <div className="text-3xl md:text-4xl font-bold mb-2" style={{color: '#FFFFFF'}}>
                    <AnimatedCounter
                      value={stat.value}
                      suffix={stat.suffix}
                      delay={500 + index * 200}
                    />
                  </div>
                  <div className="font-medium" style={{color: '#FFFFFF', opacity: 0.8}}>{stat.label}</div>
                </div>
              ))}
            </div>
          </AnimatedBeam>
        </div>
      </div>
    </section>
  )
}