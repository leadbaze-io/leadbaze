import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {

  Star,

  Users,

  Globe,

  Phone,

  Target,
  Award,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Filter,
  Search
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Input } from '../ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { calculateLeadQualityScore, type LeadQualityScore } from '../../lib/advancedAnalyticsService'

interface LeadQualityAnalysisProps {
  leads: any[]
  onQualityCalculated?: (scores: LeadQualityScore[]) => void
}

interface QualityDistribution {
  range: string
  count: number
  percentage: number
  color: string
}

export default function LeadQualityAnalysis({ leads, onQualityCalculated }: LeadQualityAnalysisProps) {
  const [qualityScores, setQualityScores] = useState<LeadQualityScore[]>([])
  const [isCalculating, setIsCalculating] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [qualityFilter, setQualityFilter] = useState('all')
  const [sortBy, setSortBy] = useState<'score' | 'probability' | 'name'>('score')

  useEffect(() => {
    if (leads.length > 0) {
      calculateAllQualityScores()
    }
  }, [leads])

  const calculateAllQualityScores = async () => {
    setIsCalculating(true)
    try {
      const scores: LeadQualityScore[] = []

      for (const lead of leads) {
        try {
          const score = await calculateLeadQualityScore(lead)
          scores.push(score)
        } catch (error) {

        }
      }

      setQualityScores(scores)
      onQualityCalculated?.(scores)
    } catch (error) {

    } finally {
      setIsCalculating(false)
    }
  }
  const getQualityBadge = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    if (score >= 60) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    if (score >= 40) return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  }

  const getQualityLabel = (score: number) => {
    if (score >= 80) return 'Excelente'
    if (score >= 60) return 'Bom'
    if (score >= 40) return 'Regular'
    return 'Baixo'
  }

  const getQualityIcon = (score: number) => {
    if (score >= 80) return <Award className="w-4 h-4 text-green-500" />
    if (score >= 60) return <CheckCircle className="w-4 h-4 text-yellow-500" />
    if (score >= 40) return <AlertTriangle className="w-4 h-4 text-orange-500" />
    return <AlertTriangle className="w-4 h-4 text-red-500" />
  }

  const getQualityDistribution = (): QualityDistribution[] => {
    const distribution = [
      { range: '0-20', count: 0, percentage: 0, color: 'bg-red-500' },
      { range: '21-40', count: 0, percentage: 0, color: 'bg-orange-500' },
      { range: '41-60', count: 0, percentage: 0, color: 'bg-yellow-500' },
      { range: '61-80', count: 0, percentage: 0, color: 'bg-blue-500' },
      { range: '81-100', count: 0, percentage: 0, color: 'bg-green-500' }
    ]

    qualityScores.forEach(score => {
      if (score.qualityScore <= 20) distribution[0].count++
      else if (score.qualityScore <= 40) distribution[1].count++
      else if (score.qualityScore <= 60) distribution[2].count++
      else if (score.qualityScore <= 80) distribution[3].count++
      else distribution[4].count++
    })

    const total = qualityScores.length
    distribution.forEach(item => {
      item.percentage = total > 0 ? Math.round((item.count / total) * 100) : 0
    })

    return distribution
  }

  const filteredScores = qualityScores.filter(score => {
    const matchesSearch = searchTerm === '' ||

      leads.find(lead => lead.id === score.leadId)?.name?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesQuality = qualityFilter === 'all' ||

      (qualityFilter === 'high' && score.qualityScore >= 70) ||
      (qualityFilter === 'medium' && score.qualityScore >= 40 && score.qualityScore < 70) ||
      (qualityFilter === 'low' && score.qualityScore < 40)

    return matchesSearch && matchesQuality
  })

  const sortedScores = [...filteredScores].sort((a, b) => {
    switch (sortBy) {
      case 'score':
        return b.qualityScore - a.qualityScore
      case 'probability':
        return b.conversionProbability - a.conversionProbability
      case 'name':
        const leadA = leads.find(lead => lead.id === a.leadId)
        const leadB = leads.find(lead => lead.id === b.leadId)
        return (leadA?.name || '').localeCompare(leadB?.name || '')
      default:
        return 0
    }
  })

  const averageQuality = qualityScores.length > 0

    ? Math.round(qualityScores.reduce((sum, score) => sum + score.qualityScore, 0) / qualityScores.length * 10) / 10
    : 0

  const highQualityLeads = qualityScores.filter(score => score.qualityScore >= 70).length
  const averageConversionProbability = qualityScores.length > 0
    ? Math.round(qualityScores.reduce((sum, score) => sum + score.conversionProbability, 0) / qualityScores.length * 10) / 10
    : 0

  const distribution = getQualityDistribution()

  return (
    <div className="space-y-6">
      {/* Header com Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Qualidade Média</p>
                <p className="text-2xl font-bold text-foreground">{averageQuality}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <Award className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Alta Qualidade</p>
                <p className="text-2xl font-bold text-foreground">{highQualityLeads}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Prob. Conversão</p>
                <p className="text-2xl font-bold text-foreground">{averageConversionProbability}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Analisados</p>
                <p className="text-2xl font-bold text-foreground">{qualityScores.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Distribuição de Qualidade */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <span>Distribuição de Qualidade</span>
          </CardTitle>
          <CardDescription>
            Como seus leads estão distribuídos por faixa de qualidade
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {distribution.map((item, index) => (
              <motion.div
                key={item.range}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center space-x-4"
              >
                <div className="w-16 text-sm font-medium">{item.range}</div>
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-4 relative overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.percentage}%` }}
                    transition={{ delay: index * 0.1 + 0.5, duration: 0.8 }}
                    className={`h-full ${item.color} rounded-full`}
                  />
                </div>
                <div className="w-12 text-sm text-right font-medium">
                  {item.count} ({item.percentage}%)
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filtros e Busca */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-green-600" />
            <span>Análise Detalhada</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar por nome do lead..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={qualityFilter} onValueChange={setQualityFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrar por qualidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Qualidades</SelectItem>
                <SelectItem value="high">Alta (70+)</SelectItem>
                <SelectItem value="medium">Média (40-69)</SelectItem>
                <SelectItem value="low">Baixa (0-39)</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="score">Score de Qualidade</SelectItem>
                <SelectItem value="probability">Prob. Conversão</SelectItem>
                <SelectItem value="name">Nome</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Lista de Leads com Scores */}
          <div className="space-y-3">
            {isCalculating ? (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-muted-foreground">Calculando scores de qualidade...</p>
              </div>
            ) : sortedScores.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhum lead encontrado com os filtros aplicados.</p>
              </div>
            ) : (
              sortedScores.map((score, index) => {
                const lead = leads.find(l => l.id === score.leadId)
                if (!lead) return null

                return (
                  <motion.div
                    key={score.leadId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 bg-card rounded-lg border border-border hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {getQualityIcon(score.qualityScore)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-foreground truncate">
                          {lead.name}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {lead.business_type} • {lead.address}
                        </p>

                        <div className="flex items-center space-x-4 mt-2">
                          <div className="flex items-center space-x-1">
                            <Star className="w-3 h-3 text-yellow-500" />
                            <span className="text-xs">{lead.rating || 'N/A'}</span>
                          </div>

                          {lead.website && (
                            <div className="flex items-center space-x-1">
                              <Globe className="w-3 h-3 text-blue-500" />
                              <span className="text-xs">Website</span>
                            </div>
                          )}

                          {lead.phone && (
                            <div className="flex items-center space-x-1">
                              <Phone className="w-3 h-3 text-green-500" />
                              <span className="text-xs">Telefone</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="flex items-center space-x-2">
                          <Badge className={getQualityBadge(score.qualityScore)}>
                            {score.qualityScore}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {getQualityLabel(score.qualityScore)}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {score.conversionProbability}% conversão
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
