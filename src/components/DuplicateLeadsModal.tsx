import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Phone, MapPin, Calendar, Users, AlertTriangle, CheckCircle } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { CampaignLeadsService } from '../lib/campaignLeadsService'
import type { Lead } from '../types'

interface DuplicateLeadsModalProps {
  isOpen: boolean
  onClose: () => void
  duplicateLeads: Lead[]
  onLeadsProcessed?: (newLeads: Lead[], duplicateLeads: Lead[]) => void
}

interface DuplicateDetails {
  lead: Lead
  exists: boolean
  totalOccurrences: number
  campaigns: Array<{
    campaign_id: string
    campaign_name: string
    list_name: string
    lead_name: string
    lead_phone: string
    lead_address: string
    added_at: string
  }>
}

export default function DuplicateLeadsModal({ 
  isOpen, 
  onClose, 
  duplicateLeads,
  onLeadsProcessed 
}: DuplicateLeadsModalProps) {
  const [duplicateDetails, setDuplicateDetails] = useState<DuplicateDetails[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (isOpen && duplicateLeads.length > 0) {
      loadDuplicateDetails()
    }
  }, [isOpen, duplicateLeads])

  const loadDuplicateDetails = async () => {
    setLoading(true)
    try {
      const details = await Promise.all(
        duplicateLeads.map(async (lead) => {
          if (!lead.phone) {
            return {
              lead,
              exists: false,
              totalOccurrences: 0,
              campaigns: []
            }
          }

          const result = await CampaignLeadsService.checkPhoneExists(lead.phone)
          return {
            lead,
            ...result
          }
        })
      )
      setDuplicateDetails(details)
    } catch (error) {
      console.error('Erro ao carregar detalhes de duplicatas:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectLead = (leadId: string) => {
    const newSelected = new Set(selectedLeads)
    if (newSelected.has(leadId)) {
      newSelected.delete(leadId)
    } else {
      newSelected.add(leadId)
    }
    setSelectedLeads(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedLeads.size === duplicateLeads.length) {
      setSelectedLeads(new Set())
    } else {
      setSelectedLeads(new Set(duplicateLeads.map(lead => lead.id || lead.phone || '')))
    }
  }

  const handleForceAdd = () => {
    const selectedLeadsData = duplicateLeads.filter(lead => 
      selectedLeads.has(lead.id || lead.phone || '')
    )
    const remainingDuplicates = duplicateLeads.filter(lead => 
      !selectedLeads.has(lead.id || lead.phone || '')
    )
    
    onLeadsProcessed?.(selectedLeadsData, remainingDuplicates)
    onClose()
  }

  const handleIgnoreAll = () => {
    // Limpar todos os leads duplicados sem adicionar nenhum
    onLeadsProcessed?.([], [])
    onClose()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length === 13 && cleaned.startsWith('55')) {
      return `+${cleaned.slice(0, 2)} (${cleaned.slice(2, 4)}) ${cleaned.slice(4, 9)}-${cleaned.slice(9)}`
    }
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`
    }
    return phone
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[98vh] sm:max-h-[95vh] overflow-hidden border border-gray-200 dark:border-gray-700"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900 dark:to-red-900 rounded-full flex items-center justify-center shadow-lg">
                <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">
                  Leads Duplicados Detectados
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                  {duplicateLeads.length} lead(s) já existem em outras campanhas
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleIgnoreAll}
                className="text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 text-xs sm:text-sm"
              >
                <X className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Ignorar</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(98vh-200px)] sm:max-h-[calc(95vh-160px)]">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600 dark:border-orange-400"></div>
                <span className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                  Carregando detalhes dos leads duplicados...
                </span>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Action Bar */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-600">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSelectAll}
                      className="text-sm border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      {selectedLeads.size === duplicateLeads.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
                    </Button>
                    <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                      {selectedLeads.size} de {duplicateLeads.length} selecionados
                    </span>
                  </div>
                  {selectedLeads.size > 0 && (
                    <Button
                      onClick={handleForceAdd}
                      className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">Adicionar Selecionados</span>
                      <span className="sm:hidden">Adicionar</span>
                      <span className="ml-1 bg-white/20 px-2 py-0.5 rounded-full text-xs">
                        {selectedLeads.size}
                      </span>
                    </Button>
                  )}
                </div>

                {/* Duplicate Leads List */}
                <div className="space-y-3">
                  {duplicateDetails.map((detail, index) => (
                    <motion.div
                      key={detail.lead.id || detail.lead.phone || index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className={`border-l-4 transition-all duration-300 ${
                        selectedLeads.has(detail.lead.id || detail.lead.phone || '')
                          ? 'border-l-orange-500 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 shadow-lg'
                          : 'border-l-red-500 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750'
                      }`}>
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3 flex-1">
                              <input
                                type="checkbox"
                                checked={selectedLeads.has(detail.lead.id || detail.lead.phone || '')}
                                onChange={() => handleSelectLead(detail.lead.id || detail.lead.phone || '')}
                                className="mt-1 w-4 h-4 text-orange-600 border-gray-300 dark:border-gray-600 rounded focus:ring-orange-500 dark:focus:ring-orange-400 bg-white dark:bg-gray-700"
                              />
                              <div className="flex-1 min-w-0">
                                <CardTitle className="text-base sm:text-lg text-gray-900 dark:text-white truncate font-semibold">
                                  {detail.lead.name || 'Lead sem nome'}
                                </CardTitle>
                                <div className="flex flex-wrap items-center gap-2 mt-2">
                                  <Badge variant="destructive" className="text-xs">
                                    {detail.totalOccurrences} ocorrência(s)
                                  </Badge>
                                  {detail.lead.phone && (
                                    <Badge variant="outline" className="text-xs">
                                      <Phone className="w-3 h-3 mr-1" />
                                      {formatPhone(detail.lead.phone)}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent className="pt-0">
                          {/* Lead Info */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                            <div className="space-y-2">
                              {detail.lead.address && (
                                <div className="flex items-start space-x-2 text-sm">
                                  <MapPin className="w-4 h-4 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                                  <span className="text-gray-700 dark:text-gray-300 truncate">
                                    {detail.lead.address}
                                  </span>
                                </div>
                              )}
                              {detail.lead.business_type && (
                                <div className="flex items-center space-x-2 text-sm">
                                  <Users className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                  <span className="text-gray-700 dark:text-gray-300">
                                    {detail.lead.business_type}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Existing Occurrences */}
                          <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                              <AlertTriangle className="w-4 h-4 mr-2 text-orange-500" />
                              Já existe em:
                            </h4>
                            <div className="space-y-2">
                              {detail.campaigns.map((campaign, campaignIndex) => (
                                <div
                                  key={campaignIndex}
                                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                                >
                                  <div className="flex-1 min-w-0">
                                    <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 mb-2">
                                      <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                        {campaign.campaign_name}
                                      </span>
                                      <Badge variant="secondary" className="text-xs">
                                        {campaign.list_name}
                                      </Badge>
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-xs text-gray-600 dark:text-gray-400">
                                      <span className="flex items-center space-x-1">
                                        <Calendar className="w-3 h-3" />
                                        <span>{formatDate(campaign.added_at)}</span>
                                      </span>
                                      <span className="truncate">
                                        {campaign.lead_name}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <div className="text-sm text-gray-600 dark:text-gray-400 flex items-start space-x-2">
              <span className="text-lg">💡</span>
              <div>
                <strong className="text-gray-800 dark:text-gray-200">Dica:</strong> Você pode selecionar leads para adicioná-los mesmo sendo duplicados
              </div>
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
              <Button 
                variant="outline" 
                onClick={onClose}
                className="w-full sm:w-auto border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Cancelar
              </Button>
              {selectedLeads.size > 0 && (
                <Button
                  onClick={handleForceAdd}
                  className="w-full sm:w-auto bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Adicionar Selecionados</span>
                  <span className="sm:hidden">Adicionar</span>
                  <span className="ml-1 bg-white/20 px-2 py-0.5 rounded-full text-xs">
                    {selectedLeads.size}
                  </span>
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
