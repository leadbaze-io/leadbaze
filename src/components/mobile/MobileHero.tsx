import { TrendingUp, Zap, Sparkles, Users, Send, Activity, Target, Rocket, CheckCircle2 } from 'lucide-react'
import { AnimatedBeam } from '../magicui/animated-beam'
import { ShimmerButton } from '../magicui/shimmer-button'
import { AnimatedCounter } from '../magicui/animated-counter'
import { LightRays } from '../magicui/light-rays'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { AuroraText } from '../magicui/aurora-text' // Import direto - é o LCP element!
import '../MagicHero.css'

export default function MobileHero() {
  const navigate = useNavigate();

  return (
    <section className="md:hidden relative py-16 min-h-screen" style={{
      background: 'linear-gradient(135deg, #082721 0%, #1A3A3A 50%, #082721 100%)',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Background gradient */}

      {/* Subtle overlay for better text readability */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(circle at center, transparent 0%, rgba(8, 39, 33, 0.3) 100%)',
        minHeight: '100vh',
        zIndex: 1,
        pointerEvents: 'none'
      }}></div>

      {/* Light Rays Animation */}
      <LightRays
        count={5}
        color="rgba(34, 197, 94, 0.15)"
        blur={35}
        opacity={0.6}
        speed={14}
        length="70vh"
        style={{ zIndex: 2 }}
      />

      {/* Conteúdo principal - acima de tudo */}
      <div className="relative max-w-md mx-auto px-4" style={{ zIndex: 10 }}>
        <div className="text-center">

          {/* Título Principal - Renderizado sem delay para LCP */}
          <h1 className="text-3xl font-bold mb-6" style={{ opacity: 1 }}>
            <span style={{ color: '#FFFFFF' }} className="font-extrabold">
              Gere mais de{' '}
            </span>
            <AuroraText className="font-extrabold">
              1000 Leads B2B
            </AuroraText>
            <br />
            <span style={{ color: '#FFFFFF' }}>
              em menos de 7 dias
            </span>
          </h1>

          {/* Subtítulo */}
          <AnimatedBeam delay={0.6}>
            <p className="text-base mb-8 max-w-sm mx-auto leading-relaxed" style={{ color: '#FFFFFF' }}>
              Tudo que você precisa para prospectar, escalar e ter sucesso em vendas.
            </p>
          </AnimatedBeam>

          {/* CTA Centralizado */}
          <AnimatedBeam delay={0.8}>
            <div className="button-illumination">
              <ShimmerButton
                id="id_lead_dm"
                onClick={() => {
                  navigate('/agendar-demo');
                  // Scroll para o topo após navegação
                  setTimeout(() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }, 100);
                }}
                className="px-6 py-3 text-base"
              >
                <span>Agende uma Demonstração</span>
              </ShimmerButton>
            </div>
          </AnimatedBeam>

          {/* Analytics Dashboard Preview - Mobile */}
          <AnimatedBeam delay={1.0}>
            <div className="mt-12 relative">
              <div className="bg-white rounded-2xl shadow-2xl border-2 overflow-hidden p-6 relative" style={{ borderColor: 'rgba(0, 255, 0, 0.2)' }}>
                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {[
                    { icon: Users, label: 'Leads Gerados', value: 1247, change: '+23%', color: '#00ff00' },
                    { icon: Send, label: 'Mensagens', value: 3842, change: '+18%', color: '#00ff00' },
                    { icon: Target, label: 'Campanhas', value: 12, change: '+5%', color: '#00ff00' },
                    { icon: Activity, label: 'Listas', value: 24, change: '+8%', color: '#00ff00' }
                  ].map((stat, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.1 + index * 0.1 }}
                      className="p-4 rounded-xl border-2 relative overflow-hidden"
                      style={{
                        borderColor: '#b7c7c1',
                        backgroundColor: '#ffffff'
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                        <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ backgroundColor: 'rgba(0, 255, 0, 0.1)', color: '#000000' }}>
                          {stat.change}
                        </span>
                      </div>
                      <div className="text-2xl font-bold mb-1" style={{ color: '#082721' }}>
                        <AnimatedCounter value={stat.value} delay={1100 + index * 100} duration={1000} />
                      </div>
                      <div className="text-xs font-medium" style={{ color: '#2e4842' }}>
                        {stat.label}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Chart */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.5 }}
                  className="p-4 rounded-xl border-2"
                  style={{ borderColor: '#b7c7c1', backgroundColor: '#ffffff' }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-bold" style={{ color: '#082721' }}>
                      Leads por Dia
                    </h4>
                    <Activity className="w-4 h-4" style={{ color: '#00ff00' }} />
                  </div>

                  <div className="flex items-end justify-between gap-1 h-32">
                    {[45, 68, 52, 78, 85, 92, 88].map((height, index) => (
                      <motion.div
                        key={index}
                        initial={{ height: 0 }}
                        animate={{ height: `${height}%` }}
                        transition={{ delay: 1.6 + index * 0.1, type: "spring", stiffness: 100 }}
                        className="flex-1 rounded-t-lg"
                        style={{
                          background: 'linear-gradient(to top, #10b981, #059669)',
                          minHeight: '10px'
                        }}
                      />
                    ))}
                  </div>

                  <div className="flex justify-between mt-2">
                    {['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map((day, index) => (
                      <div key={index} className="text-xs font-medium flex-1 text-center" style={{ color: '#2e4842' }}>
                        {day}
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Additional Metrics - Mobile */}
                <div className="grid grid-cols-1 gap-3 mt-4">
                  {[
                    { icon: Rocket, label: 'Crescimento', value: '+145%', color: '#00ff00' },
                    { icon: CheckCircle2, label: 'Taxa de Sucesso', value: '87%', color: '#00ff00' }
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.7 + index * 0.1 }}
                      className="p-4 rounded-xl border-2 flex items-center gap-3"
                      style={{ borderColor: '#b7c7c1', backgroundColor: '#ffffff' }}
                    >
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(0, 255, 0, 0.1)' }}>
                        <item.icon className="w-5 h-5" style={{ color: item.color }} />
                      </div>
                      <div>
                        <div className="text-xl font-bold" style={{ color: '#082721' }}>
                          {typeof item.value === 'number' ? (
                            <AnimatedCounter value={item.value} delay={1700 + index * 100} duration={800} />
                          ) : (
                            item.value
                          )}
                        </div>
                        <div className="text-xs font-medium" style={{ color: '#2e4842' }}>
                          {item.label}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </AnimatedBeam>

          {/* Stats */}
          <AnimatedBeam delay={2.0}>
            <div className="hero-stats-container" style={{ marginTop: '4rem' }}>
              <div className="hero-stat-card">
                <div className="hero-stat-content">
                  <div className="hero-stat-icon">
                    <Zap />
                  </div>
                  <div className="hero-stat-number">
                    <AnimatedCounter value={10} suffix="x" delay={500} />
                  </div>
                  <div className="hero-stat-title">Mais Rápido</div>
                  <div className="hero-stat-description">que métodos tradicionais</div>
                </div>
              </div>

              <div className="hero-stat-card">
                <div className="hero-stat-content">
                  <div className="hero-stat-icon">
                    <TrendingUp />
                  </div>
                  <div className="hero-stat-number">
                    <AnimatedCounter value={95} suffix="%" delay={700} />
                  </div>
                  <div className="hero-stat-title">Precisão</div>
                  <div className="hero-stat-description">nos dados extraídos</div>
                </div>
              </div>

              <div className="hero-stat-card">
                <div className="hero-stat-content">
                  <div className="hero-stat-icon">
                    <Sparkles />
                  </div>
                  <div className="hero-stat-number">
                    <AnimatedCounter value={1000} suffix="+" delay={900} />
                  </div>
                  <div className="hero-stat-title">Leads/semana</div>
                  <div className="hero-stat-description">plano Start</div>
                </div>
              </div>
            </div>
          </AnimatedBeam>
        </div>
      </div>
    </section>
  )
}