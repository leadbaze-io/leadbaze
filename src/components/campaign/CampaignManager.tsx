/**
 * =====================================================
 * COMPONENTE CAMPAIGN MANAGER - GERENCIADOR DE CAMPANHAS
 * =====================================================
 */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit, Trash2, Calendar, Megaphone, Users } from 'lucide-react'

import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { EmptyState } from '../ui/EmptyState'
import { CreateCampaignModal } from './CreateCampaignModal'
import { CampaignService } from '../../lib/campaignService'
import type { BulkCampaign } from '../../types'

interface CampaignManagerProps {
  onEditCampaign: (campaign: BulkCampaign) => void
  onConfigClick?: () => void
  connectedInstance: string | null
  lists?: any[]
}

export const CampaignManager: React.FC<CampaignManagerProps> = ({
  onEditCampaign,
  onConfigClick,
  connectedInstance,
  lists = []
}) => {
  const [campaigns, setCampaigns] = useState<BulkCampaign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)

  // Carregar campanhas
  useEffect(() => {
    loadCampaigns()
  }, [])

  const loadCampaigns = async () => {
    try {
      // Apenas log em desenvolvimento
      if (import.meta.env.VITE_DEBUG_MODE === 'true' || import.meta.env.VITE_APP_ENV !== 'production') {
        console.log('🚀 CampaignManager.loadCampaigns() - Iniciando...')
        console.log('📞 Chamando CampaignService.getUserCampaigns()...')
      }
      
      setLoading(true)
      setError(null)

      const data = await CampaignService.getUserCampaigns()
      setCampaigns(data)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar campanhas')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCampaign = async (campaignId: string) => {
    if (!confirm('Tem certeza que deseja deletar esta campanha?')) return

    try {
      await CampaignService.deleteCampaign(campaignId)
      setCampaigns(prev => prev.filter(c => c.id !== campaignId))
    } catch (err) {
      alert('Erro ao deletar campanha: ' + (err instanceof Error ? err.message : 'Erro desconhecido'))
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100'
      case 'paused': return 'text-yellow-600 bg-yellow-100'
      case 'completed': return 'text-blue-600 bg-blue-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Ativa'
      case 'paused': return 'Pausada'
      case 'completed': return 'Concluída'
      default: return 'Rascunho'
    }
  }

  const handleCreateCampaign = () => {
    setShowCreateModal(true)
  }

  const handleCampaignCreated = (newCampaign: BulkCampaign) => {
    setCampaigns(prev => [newCampaign, ...prev])
    onEditCampaign(newCampaign)
  }

  const handleCloseModal = () => {
    setShowCreateModal(false)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400 campaign-manager-title-claro campaign-manager-title-escuro">Minhas Campanhas</h1>
          <Button onClick={handleCreateCampaign} disabled>
            <Plus className="w-4 h-4 mr-2" />
            Nova Campanha
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse campaign-manager-card-claro campaign-manager-card-escuro">
              <CardHeader>
                <div className="h-4 bg-bg-tertiary rounded w-3/4"></div>
                <div className="h-3 bg-bg-tertiary rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-bg-tertiary rounded"></div>
                  <div className="h-3 bg-bg-tertiary rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-accent-error mb-4">
          <Users className="w-12 h-12 mx-auto mb-2" />
          <p className="text-lg font-medium">Erro ao carregar campanhas</p>
          <p className="text-sm text-text-secondary">{error}</p>
        </div>
        <Button onClick={loadCampaigns}>
          Tentar Novamente
        </Button>
      </div>
    )
  }

  // Log removido para limpeza

  return (
    <div className="space-y-6">
      {/* Header */}
          {/* Botão Configurações/Conectar WhatsApp - Mobile acima do título */}
          <div className="flex justify-start mb-2 sm:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={onConfigClick}
              className={`group border-0 shadow-md hover:shadow-lg transition-all duration-300 rounded-lg px-3 py-2 h-8 text-sm w-auto ${
                connectedInstance

                  ? 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white'

                  : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white'
              }`}
            >
              {connectedInstance ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-1 transition-transform duration-300 group-hover:rotate-90">
                    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                  <span className="font-medium text-sm">⚙</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-1">
                    <path d="M21.791 8.469a.5.5 0 0 0-.405-.288L16.1 7.2l-2.3-4.589a.5.5 0 0 0-.894 0L10.5 7.2l-5.286.981a.5.5 0 0 0-.3.853l3.8 3.707-.9 5.236a.5.5 0 0 0 .73.527L12 15.5l4.7 2.471a.5.5 0 0 0 .73-.527l-.9-5.236 3.8-3.707a.5.5 0 0 0-.105-.565z"></path>
                    <path d="M8 12h8"></path>
                    <path d="M12 8v8"></path>
                  </svg>
                  <span className="font-medium text-sm">Conectar WhatsApp!</span>
                </>
              )}
            </Button>
          </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Botão Configurações/Conectar WhatsApp - Desktop acima do título */}
          <div className="flex justify-start mb-2 hidden sm:flex">
            <Button
              variant="outline"
              size="sm"
              onClick={onConfigClick}
              className={`group border-0 shadow-md hover:shadow-lg transition-all duration-300 rounded-lg px-3 py-2 h-8 text-sm w-auto ${
                connectedInstance

                  ? 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white'

                  : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white'
              }`}
            >
              {connectedInstance ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:rotate-90">
                    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                  <span className="font-medium text-sm">Configurações</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-2">
                    <path d="M21.791 8.469a.5.5 0 0 0-.405-.288L16.1 7.2l-2.3-4.589a.5.5 0 0 0-.894 0L10.5 7.2l-5.286.981a.5.5 0 0 0-.3.853l3.8 3.707-.9 5.236a.5.5 0 0 0 .73.527L12 15.5l4.7 2.471a.5.5 0 0 0 .73-.527l-.9-5.236 3.8-3.707a.5.5 0 0 0-.105-.565z"></path>
                    <path d="M8 12h8"></path>
                    <path d="M12 8v8"></path>
                  </svg>
                  <span className="font-medium text-sm">Conectar WhatsApp!</span>
                </>
              )}
            </Button>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 mb-1">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-blue-400 campaign-manager-title-claro campaign-manager-title-escuro truncate">Minhas Campanhas</h1>
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold shadow-lg flex-shrink-0">
              {campaigns.length}
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs sm:text-sm text-blue-600 dark:text-blue-400 font-medium">
            <span>•</span>
            <span>{lists.length} Listas de Leads</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            {!connectedInstance && (
              <div className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs sm:text-sm w-fit">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-yellow-500 rounded-full"></div>
                <span className="hidden sm:inline">WhatsApp não conectado</span>
                <span className="sm:hidden">WhatsApp offline</span>
              </div>
            )}

            <Button
              onClick={handleCreateCampaign}
              className="group relative overflow-hidden bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm w-full sm:w-auto"
            >
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent" style={{transform: 'translateX(-100%)'}}></div>
            <div className="relative flex items-center gap-2">
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
              <span className="font-semibold">Nova Campanha</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right w-4 h-4 group-hover:translate-x-1 transition-transform duration-300">
                <path d="M5 12h14"></path>
                <path d="m12 5 7 7-7 7"></path>
              </svg>
            </div>
          </Button>
        </div>
      </div>

      {/* Lista de Campanhas */}
      {campaigns.length === 0 ? (
        <EmptyState
          title="Nenhuma campanha encontrada"
          description="Crie sua primeira campanha para começar a disparar mensagens em massa"
          buttonText="Criar Primeira Campanha"
          onButtonClick={handleCreateCampaign}
          icon={Megaphone}
          showWhatsAppHint={!connectedInstance}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {campaigns.map((campaign, index) => (
              <motion.div
                key={campaign.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-all duration-200 group campaign-manager-card-claro campaign-manager-card-escuro h-full flex flex-col">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-1 group-hover:text-accent-primary transition-colors campaign-manager-title-claro campaign-manager-title-escuro line-clamp-2 break-words">
                          {campaign.name}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium campaign-manager-status-claro campaign-manager-status-escuro ${getStatusColor(campaign.status)}`}>
                            {getStatusText(campaign.status)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditCampaign(campaign)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-950/20"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCampaign(campaign.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0 flex-1 flex flex-col">
                    <div className="space-y-3 flex-1">
                      {/* Estatísticas */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="text-center p-2 bg-bg-secondary rounded-lg campaign-manager-stats-claro campaign-manager-stats-escuro">
                          <div className="text-lg font-bold text-primary campaign-manager-stats-number-claro campaign-manager-stats-number-escuro">
                            {campaign.unique_leads}
                          </div>
                          <div className="text-xs text-text-secondary campaign-manager-stats-label-claro campaign-manager-stats-label-escuro">
                            Leads Únicos
                          </div>
                        </div>
                        <div className="text-center p-2 bg-bg-secondary rounded-lg campaign-manager-stats-claro campaign-manager-stats-escuro">
                          <div className="text-lg font-bold text-primary campaign-manager-stats-number-claro campaign-manager-stats-number-escuro">
                            {campaign.selected_lists_count}
                          </div>
                          <div className="text-xs text-text-secondary campaign-manager-stats-label-claro campaign-manager-stats-label-escuro">
                            Listas
                          </div>
                        </div>
                      </div>

                      {/* Data de criação */}
                      <div className="flex items-center gap-2 text-xs text-text-tertiary campaign-manager-date-claro campaign-manager-date-escuro">
                        <Calendar className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                        Criada em {new Date(campaign.created_at).toLocaleDateString('pt-BR')}
                      </div>
                    </div>

                    {/* Ações - sempre no final */}
                    <div className="flex items-center gap-2 pt-2 mt-auto">
                      <Button
                        variant="primary"
                        size="sm"
                        className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                        onClick={() => onEditCampaign(campaign)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Modal de Criação de Campanha */}
      <CreateCampaignModal
        isOpen={showCreateModal}
        onClose={handleCloseModal}
        onCampaignCreated={handleCampaignCreated}
      />
    </div>
  )
}