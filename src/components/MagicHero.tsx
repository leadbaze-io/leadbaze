import { TrendingUp, Zap, Sparkles, Users, Send, Eye, MousePointerClick, Activity, Target, Clock, CheckCircle2, Rocket } from 'lucide-react'
import { AnimatedBeam } from './magicui/animated-beam'
import { ShimmerButton } from './magicui/shimmer-button'
import { AnimatedCounter } from './magicui/animated-counter'
import { Meteors } from './magicui/meteors'
import { StarrySky } from './magicui/starry-sky'
import { AuroraText } from './magicui/aurora-text'
import { motion } from 'framer-motion'
import './MagicHero.css'

export default function MagicHero() {
  return (
    <section className="relative py-20 md:py-32 overflow-hidden min-h-screen" style={{
      background: 'linear-gradient(135deg, #082721 0%, #1A3A3A 50%, #082721 100%)'
    }}>
      {/* Background with Meteors and Starry Sky - Extended */}
      <div className="absolute inset-0" style={{height: '100%', minHeight: '100vh'}}>
        <Meteors 
          number={40}
          minDelay={0.2}
          maxDelay={1.2}
          minDuration={2}
          maxDuration={10}
          angle={215}
        />
        <StarrySky starCount={50} twinkleSpeed={2000} />
      </div>

      {/* Subtle overlay for better text readability */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(circle at center, transparent 0%, rgba(8, 39, 33, 0.3) 100%)',
        minHeight: '100vh'
      }}></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">

          {/* Título Principal */}
          <AnimatedBeam delay={0.4}>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
              <span style={{color: '#FFFFFF'}} className="font-extrabold">
                Gere mais de{' '}
              </span>
              <AuroraText className="font-extrabold">
                1000 Leads B2B
              </AuroraText>
              <br />
              <span style={{color: '#FFFFFF'}}>
                em menos de 7 dias
              </span>
            </h1>
          </AnimatedBeam>

          {/* Subtítulo */}
          <AnimatedBeam delay={0.6}>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed" style={{color: '#FFFFFF'}}>
              Tudo que você precisa para prospectar, escalar e ter sucesso em vendas.
            </p>
          </AnimatedBeam>

          {/* CTA Centralizado */}
          <AnimatedBeam delay={0.8}>
            <div className="button-illumination">
              <ShimmerButton

                onClick={() => {

                  // Tentar múltiplos métodos para encontrar a seção
                  let pricingSection = document.getElementById('pricing-plans-section')

                  // Verificar se é a seção correta (não mobile)
                  if (pricingSection && pricingSection.classList.contains('md:hidden')) {

                    pricingSection = null
                  }

                  // Se não encontrar, tentar por classe (desktop)
                  if (!pricingSection) {
                    pricingSection = document.querySelector('section[id*="pricing"]:not(.md\\:hidden)')

                  }

                  // Se ainda não encontrar, tentar por texto (desktop)
                  if (!pricingSection) {
                    const sections = document.querySelectorAll('section:not(.md\\:hidden)')
                    for (const section of sections) {
                      if (section.textContent?.includes('Plano') || section.textContent?.includes('Preço')) {
                        pricingSection = section as HTMLElement

                        break
                      }
                    }
                  }

                  // Fallback: usar qualquer seção com pricing
                  if (!pricingSection) {
                    pricingSection = document.querySelector('[id*="pricing"]')

                  }
                  if (pricingSection) {
                    // Scroll com offset para compensar navbar fixa
                    const elementPosition = pricingSection.getBoundingClientRect().top
                    const offsetPosition = elementPosition + window.pageYOffset - 80

                    window.scrollTo({
                      top: offsetPosition,
                      behavior: 'smooth'
                    })

                  } else {

                    // Método alternativo: scroll para o final da página
                    window.scrollTo({
                      top: document.body.scrollHeight,
                      behavior: 'smooth'
                    })
                  }
                }}
                className="px-8 py-4 text-lg"
              >
                <span>Ver Planos</span>
              </ShimmerButton>
            </div>
          </AnimatedBeam>

          {/* Analytics Dashboard Preview */}
          <AnimatedBeam delay={1.0}>
            <div className="mt-16 max-w-6xl mx-auto relative">
              <div className="bg-white rounded-3xl shadow-2xl border-2 overflow-hidden p-8 md:p-12 relative" style={{borderColor: 'rgba(0, 255, 0, 0.2)'}}>
                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
                  {[
                    { icon: Users, label: 'Leads Gerados', value: 1247, change: '+23%', color: '#00ff00' },
                    { icon: Send, label: 'Mensagens Enviadas', value: 3842, change: '+18%', color: '#00ff00' },
                    { icon: Eye, label: 'Taxa de Abertura', value: 68, suffix: '%', change: '+12%', color: '#00ff00' },
                    { icon: MousePointerClick, label: 'Taxa de Resposta', value: 24, suffix: '%', change: '+8%', color: '#00ff00' }
                  ].map((stat, index) => (
              <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.1 + index * 0.1 }}
                      className="p-6 rounded-2xl border-2 relative overflow-hidden group"
                      style={{
                        borderColor: '#b7c7c1',
                        backgroundColor: '#ffffff'
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-3">
                          <stat.icon className="w-6 h-6" style={{color: stat.color}} />
                          <span className="text-xs font-bold px-2 py-1 rounded-full" style={{backgroundColor: 'rgba(0, 255, 0, 0.1)', color: '#000000'}}>
                            {stat.change}
                          </span>
                        </div>
                        <div className="text-3xl font-bold mb-1" style={{color: '#082721'}}>
                          <AnimatedCounter value={stat.value} delay={1100 + index * 100} duration={1000} />
                          {stat.suffix}
                        </div>
                        <div className="text-sm font-medium" style={{color: '#2e4842'}}>
                          {stat.label}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Charts Area */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Lead Generation Chart */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.5 }}
                    className="p-6 rounded-2xl border-2"
                    style={{borderColor: '#b7c7c1', backgroundColor: '#ffffff'}}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h4 className="text-lg font-bold" style={{color: '#082721'}}>
                        Leads por Dia
                      </h4>
                      <Activity className="w-5 h-5" style={{color: '#00ff00'}} />
                    </div>
                    
                    {/* Chart Bars */}
                    <div className="flex items-end justify-between gap-2 h-48">
                      {[45, 68, 52, 78, 85, 92, 88].map((height, index) => (
                        <motion.div
                          key={index}
                          initial={{ height: 0 }}
                          animate={{ height: `${height}%` }}
                          transition={{ delay: 1.6 + index * 0.1, type: "spring", stiffness: 100 }}
                          className="flex-1 rounded-t-lg relative group cursor-pointer"
                          style={{
                            background: 'linear-gradient(to top, #10b981, #059669)',
                            minHeight: '20px'
                          }}
                        >
                          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="px-2 py-1 rounded bg-gray-900 text-white text-xs font-bold whitespace-nowrap">
                              {Math.round(height * 2)} leads
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    
                    {/* Days Labels */}
                    <div className="flex justify-between mt-3">
                      {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((day, index) => (
                        <div key={index} className="text-xs font-medium flex-1 text-center" style={{color: '#2e4842'}}>
                          {day}
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Performance Metrics */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.5 }}
                    className="p-6 rounded-2xl border-2"
                    style={{borderColor: '#b7c7c1', backgroundColor: '#ffffff'}}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h4 className="text-lg font-bold" style={{color: '#082721'}}>
                        Métricas em Tempo Real
                      </h4>
                      <TrendingUp className="w-5 h-5" style={{color: '#10b981'}} />
                    </div>

                    <div className="space-y-5">
                      {[
                        { label: 'Leads Qualificados', value: 87, color: '#10b981' },
                        { label: 'Taxa de Resposta', value: 68, color: '#10b981' },
                        { label: 'Custo por Lead', value: 45, color: '#10b981', inverse: true },
                        { label: 'Listas Ativas', value: 94, color: '#10b981' }
                      ].map((metric, index) => (
                        <div key={index}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold" style={{color: '#082721'}}>
                              {metric.label}
                            </span>
                            <span className="text-lg font-bold" style={{color: '#000000'}}>
                              {metric.inverse && '-'}
                              <AnimatedCounter value={metric.value} delay={1600 + index * 100} duration={800} />%
                            </span>
                          </div>
                          <div className="relative h-3 rounded-full overflow-hidden" style={{backgroundColor: '#e5e7eb'}}>
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${metric.value}%` }}
                              transition={{ delay: 1.7 + index * 0.1, duration: 1, type: "spring", stiffness: 50 }}
                              className="absolute inset-y-0 left-0 rounded-full"
                              style={{
                                background: `linear-gradient(to right, ${metric.color}, #059669)`
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </div>

                {/* Additional Metrics Row */}
                <div className="grid md:grid-cols-3 gap-6 mt-6">
                  {[
                    { icon: Target, label: 'Campanhas Ativas', value: 12, color: '#00ff00' },
                    { icon: Clock, label: 'Tempo Médio de Resposta', value: '2.4h', color: '#00ff00' },
                    { icon: Rocket, label: 'Crescimento Mensal', value: '+145%', color: '#00ff00' }
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.8 + index * 0.1 }}
                      className="p-5 rounded-2xl border-2 flex items-center gap-4 hover:shadow-lg transition-shadow"
                      style={{borderColor: '#b7c7c1', backgroundColor: '#ffffff'}}
                    >
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{backgroundColor: 'rgba(0, 255, 0, 0.1)'}}>
                        <item.icon className="w-6 h-6" style={{color: item.color}} />
                      </div>
                      <div>
                        <div className="text-2xl font-bold" style={{color: '#082721'}}>
                          {typeof item.value === 'number' ? (
                            <AnimatedCounter value={item.value} delay={1800 + index * 100} duration={800} />
                          ) : (
                            item.value
                          )}
                        </div>
                        <div className="text-sm font-medium" style={{color: '#2e4842'}}>
                          {item.label}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Recent Activity Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 2.1 }}
                  className="mt-6 p-6 rounded-2xl border-2"
                  style={{borderColor: '#b7c7c1', backgroundColor: '#ffffff'}}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-bold" style={{color: '#082721'}}>
                      Atividades Recentes
                    </h4>
                    <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{backgroundColor: 'rgba(0, 255, 0, 0.1)', color: '#082721'}}>
                      Última atualização: agora
                    </span>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    {[
                      { action: '47 novos leads capturados', time: 'Há 3 minutos', icon: Users, color: '#00ff00' },
                      { action: '124 mensagens disparadas', time: 'Há 8 minutos', icon: Send, color: '#00ff00' },
                      { action: 'Campanha "Diretores TI" iniciada', time: 'Há 15 minutos', icon: Sparkles, color: '#00ff00' },
                      { action: '18 leads responderam', time: 'Há 22 minutos', icon: CheckCircle2, color: '#00ff00' }
                    ].map((activity, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 2.2 + index * 0.1 }}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors border"
                        style={{borderColor: '#e5e7eb'}}
                      >
                        <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{backgroundColor: 'rgba(0, 255, 0, 0.1)'}}>
                          <activity.icon className="w-5 h-5" style={{color: activity.color}} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate" style={{color: '#082721'}}>
                            {activity.action}
                          </p>
                          <p className="text-xs" style={{color: '#2e4842'}}>
                            {activity.time}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          </AnimatedBeam>

          {/* Stats */}
          <AnimatedBeam delay={2.0}>
            <div className="hero-stats-container" style={{marginTop: '6rem'}}>
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