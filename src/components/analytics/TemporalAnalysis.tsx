import { useState } from 'react'
import { motion } from 'framer-motion'
import {

  Clock,

  Calendar,

  TrendingUp,

  TrendingDown,
  Target,
  Lightbulb,
  CheckCircle
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'

interface HourlyPerformance {
  hour: number
  sent: number
  responses: number
  rate: number
}

interface DailyPerformance {
  day: string
  performance: number
  recommendations: string[]
}

interface TemporalAnalysisProps {
  hourlyPerformance: HourlyPerformance[]
  bestSendingHours: Array<{ hour: number; performance: number; recommendations: string[] }>
  bestSendingDays: DailyPerformance[]
}

export default function TemporalAnalysis({

  hourlyPerformance,

  bestSendingDays

}: TemporalAnalysisProps) {
  const [activeTab, setActiveTab] = useState<'hours' | 'days' | 'recommendations'>('hours')

  const formatHour = (hour: number) => {
    return `${hour.toString().padStart(2, '0')}:00`
  }

  const getPerformanceBadge = (rate: number) => {
    if (rate >= 80) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    if (rate >= 60) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    if (rate >= 40) return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  }

  const getBestHours = () => {
    return hourlyPerformance
      .sort((a, b) => b.rate - a.rate)
      .slice(0, 5)
  }

  const getWorstHours = () => {
    return hourlyPerformance
      .sort((a, b) => a.rate - b.rate)
      .slice(0, 5)
  }

  const getOptimalSendingWindow = () => {
    const goodHours = hourlyPerformance.filter(h => h.rate >= 60)
    if (goodHours.length === 0) return null

    const sortedHours = goodHours.sort((a, b) => a.hour - b.hour)
    const start = sortedHours[0].hour
    const end = sortedHours[sortedHours.length - 1].hour

    return { start, end }
  }

  const optimalWindow = getOptimalSendingWindow()

  return (
    <div className="space-y-6">
      {/* Header com Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <span>Análise Temporal</span>
          </CardTitle>
          <CardDescription>
            Descubra os melhores horários e dias para enviar suas campanhas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2 mb-6">
            <Button
              variant={activeTab === 'hours' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('hours')}
            >
              <Clock className="w-4 h-4 mr-2" />
              Por Horário
            </Button>
            <Button
              variant={activeTab === 'days' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('days')}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Por Dia
            </Button>
            <Button
              variant={activeTab === 'recommendations' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('recommendations')}
            >
              <Lightbulb className="w-4 h-4 mr-2" />
              Recomendações
            </Button>
          </div>

          {/* Conteúdo das Tabs */}
          {activeTab === 'hours' && (
            <div className="space-y-6">
              {/* Janela Ótima de Envio */}
              {optimalWindow && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 rounded-lg border border-green-200 dark:border-green-800"
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <Target className="w-5 h-5 text-green-600" />
                    <h3 className="font-semibold text-green-800 dark:text-green-200">
                      Janela Ótima de Envio
                    </h3>
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Seus melhores horários para envio são entre{' '}
                    <span className="font-semibold">
                      {formatHour(optimalWindow.start)} e {formatHour(optimalWindow.end)}
                    </span>
                    . Neste período, você tem maior taxa de resposta.
                  </p>
                </motion.div>
              )}

              {/* Gráfico de Performance por Hora */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Performance por Hora</h3>
                <div className="grid grid-cols-12 gap-2">
                  {hourlyPerformance.map((hour, index) => (
                    <motion.div
                      key={hour.hour}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.02 }}
                      className="text-center"
                    >
                      <div className="text-xs text-muted-foreground mb-1">
                        {formatHour(hour.hour)}
                      </div>
                      <div
                        className={`h-16 rounded-t-sm transition-all duration-300 hover:scale-105 cursor-pointer ${
                          hour.rate >= 80 ? 'bg-green-500' :
                          hour.rate >= 60 ? 'bg-yellow-500' :
                          hour.rate >= 40 ? 'bg-orange-500' : 'bg-red-500'
                        }`}
                        style={{ height: `${Math.max(hour.rate * 0.8, 8)}px` }}
                        title={`${formatHour(hour.hour)}: ${hour.rate}% de resposta`}
                      />
                      <div className="text-xs font-medium mt-1">
                        {hour.rate}%
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Top 5 Melhores e Piores Horários */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-green-600 dark:text-green-400 mb-3 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Melhores Horários
                  </h4>
                  <div className="space-y-2">
                    {getBestHours().map((hour, index) => (
                      <motion.div
                        key={hour.hour}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800"
                      >
                        <div className="flex items-center space-x-3">
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            #{index + 1}
                          </Badge>
                          <span className="font-medium">{formatHour(hour.hour)}</span>
                        </div>
                        <Badge className={getPerformanceBadge(hour.rate)}>
                          {hour.rate}%
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-red-600 dark:text-red-400 mb-3 flex items-center">
                    <TrendingDown className="w-4 h-4 mr-2" />
                    Evitar Estes Horários
                  </h4>
                  <div className="space-y-2">
                    {getWorstHours().map((hour, index) => (
                      <motion.div
                        key={hour.hour}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800"
                      >
                        <div className="flex items-center space-x-3">
                          <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                            #{index + 1}
                          </Badge>
                          <span className="font-medium">{formatHour(hour.hour)}</span>
                        </div>
                        <Badge className={getPerformanceBadge(hour.rate)}>
                          {hour.rate}%
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'days' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Performance por Dia da Semana</h3>

              <div className="space-y-3">
                {bestSendingDays.map((day, index) => (
                  <motion.div
                    key={day.day}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-card rounded-lg border border-border hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {day.day.substring(0, 3).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold">{day.day}</h4>
                        <p className="text-sm text-muted-foreground">
                          {day.recommendations.length > 0 ? day.recommendations[0] : 'Performance padrão'}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <Badge className={getPerformanceBadge(day.performance)}>
                        {day.performance}%
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'recommendations' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Recomendações Inteligentes</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Recomendações de Horário */}
                <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-blue-800 dark:text-blue-200">
                      <Clock className="w-5 h-5" />
                      <span>Horários</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                        <p className="text-sm">
                          Envie campanhas entre 9h e 11h para máxima resposta
                        </p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                        <p className="text-sm">
                          Evite envios após 22h e antes das 8h
                        </p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                        <p className="text-sm">
                          Período da tarde (14h-16h) tem boa performance
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recomendações de Dia */}
                <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-green-800 dark:text-green-200">
                      <Calendar className="w-5 h-5" />
                      <span>Dias da Semana</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                        <p className="text-sm">
                          Segunda a quinta são os melhores dias
                        </p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                        <p className="text-sm">
                          Evite envios aos domingos
                        </p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                        <p className="text-sm">
                          Sexta-feira tem performance moderada
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recomendação Principal */}
              {optimalWindow && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 rounded-xl border border-purple-200 dark:border-purple-800"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-purple-800 dark:text-purple-200">
                        Recomendação Principal
                      </h3>
                      <p className="text-sm text-purple-600 dark:text-purple-300">
                        Baseada na sua performance histórica
                      </p>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <strong>Agende suas campanhas para:</strong><br />
                      • <strong>Dias:</strong> Segunda a quinta-feira<br />
                      • <strong>Horários:</strong> {formatHour(optimalWindow.start)} às {formatHour(optimalWindow.end)}<br />
                      • <strong>Frequência:</strong> Máximo 2 campanhas por dia<br />
                      • <strong>Intervalo:</strong> Pelo menos 4 horas entre envios
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
