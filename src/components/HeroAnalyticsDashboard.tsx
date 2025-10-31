import { TrendingUp, Users, Send, Eye, MousePointerClick, Activity, Target, Clock, CheckCircle2, Rocket, Sparkles } from 'lucide-react'
import { AnimatedCounter } from './magicui/animated-counter'
import { AnimatedBeam } from './magicui/animated-beam'

export default function HeroAnalyticsDashboard() {
  return (
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
              <div
                key={index}
                className="p-6 rounded-2xl border-2 relative overflow-hidden group"
                style={{
                  opacity: 1,
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
              </div>
            ))}
          </div>

          {/* Charts Area */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Lead Generation Chart */}
            <div
              className="p-6 rounded-2xl border-2"
              style={{
                opacity: 1,
                borderColor: '#b7c7c1',
                backgroundColor: '#ffffff'
              }}
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
                  <div
                    key={index}
                    className="flex-1 rounded-t-lg relative group cursor-pointer"
                    style={{
                      background: 'linear-gradient(to top, #10b981, #059669)',
                      minHeight: '20px',
                      height: `${height}%`
                    }}
                  >
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="px-2 py-1 rounded bg-gray-900 text-white text-xs font-bold whitespace-nowrap">
                        {Math.round(height * 2)} leads
                      </div>
                    </div>
                  </div>
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
            </div>

            {/* Performance Metrics */}
            <div
              className="p-6 rounded-2xl border-2"
              style={{
                opacity: 1,
                borderColor: '#b7c7c1',
                backgroundColor: '#ffffff'
              }}
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
                      <div
                        className="absolute inset-y-0 left-0 rounded-full"
                        style={{
                          background: `linear-gradient(to right, ${metric.color}, #059669)`,
                          width: `${metric.value}%`
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Additional Metrics Row */}
          <div className="grid md:grid-cols-3 gap-6 mt-6">
            {[
              { icon: Target, label: 'Campanhas Ativas', value: 12, color: '#00ff00' },
              { icon: Clock, label: 'Tempo Médio de Resposta', value: '2.4h', color: '#00ff00' },
              { icon: Rocket, label: 'Crescimento Mensal', value: '+145%', color: '#00ff00' }
            ].map((item, index) => (
              <div
                key={index}
                className="p-5 rounded-2xl border-2 flex items-center gap-4 hover:shadow-lg transition-shadow"
                style={{
                  opacity: 1,
                  borderColor: '#b7c7c1',
                  backgroundColor: '#ffffff'
                }}
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
              </div>
            ))}
          </div>

          {/* Recent Activity Section */}
          <div
            className="mt-6 p-6 rounded-2xl border-2"
            style={{
              opacity: 1,
              borderColor: '#b7c7c1',
              backgroundColor: '#ffffff'
            }}
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
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors border"
                  style={{
                    opacity: 1,
                    borderColor: '#e5e7eb'
                  }}
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
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AnimatedBeam>
  )
}

