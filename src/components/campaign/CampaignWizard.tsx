/**
 * =====================================================
 * COMPONENTE CAMPAIGN WIZARD - ASSISTENTE DE CAMPANHA
 * =====================================================
 */

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, Check, Edit3, Zap } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
import '../../styles/disparador.css'

import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { CampaignStats } from './StatsCard'
import { ListSelectionStep } from './steps/ListSelectionStep'
import { MessageStep } from './steps/MessageStep'
import { ReviewStep } from './steps/ReviewStep'

import { useCampaign } from '../../hooks/useCampaign'
import { LeadDeduplicationService } from '../../services/LeadDeduplicationService'
import type { BulkCampaign, LeadList } from '../../types'
import type { CampaignLead } from '../../types/campaign'
import { supabase } from '../../lib/supabaseClient'

interface CampaignWizardProps {
  campaign: BulkCampaign | null
  lists: LeadList[]
  whatsappConfig: any
  connectedInstance: string | null
  onBack: () => void
  onSendCampaign: (message: string, leads: CampaignLead[]) => void
  onStepChange?: (step: WizardStep) => void
  onCampaignCreated?: (campaign: BulkCampaign) => void
}

type WizardStep = 'lists' | 'message' | 'review'

export const CampaignWizard: React.FC<CampaignWizardProps> = ({
  campaign,
  lists,
  whatsappConfig,
  connectedInstance,
  onSendCampaign,
  onStepChange,
  onCampaignCreated
}) => {
  const { isDark } = useTheme()
  // Estado do wizard
  const [currentStep, setCurrentStep] = useState<WizardStep>('lists')
  const [campaignName, setCampaignName] = useState('')
  const [campaignMessage, setCampaignMessage] = useState('')
  const [isEditingName, setIsEditingName] = useState(false)

  const [selectedLists, setSelectedLists] = useState<string[]>([])
  const [ignoredLists, setIgnoredLists] = useState<string[]>([])
  const [campaignLeads, setCampaignLeads] = useState<CampaignLead[]>([])
  const [loading, setLoading] = useState(false)
  const [messageEditedByUser, setMessageEditedByUser] = useState(false)

  // Hook da campanha
  const campaignHook = useCampaign({ campaignId: campaign?.id })

  // Inicializar dados se editando campanha existente (apenas uma vez)
  useEffect(() => {
    if (campaign && !campaignHook.loading) {
      // Carregando dados da campanha

      setCampaignName(campaign.name)

      // SOLUÇÃO: Só atualizar mensagem se não foi editada pelo usuário
      if (!messageEditedByUser) {
        setCampaignMessage(campaign.message || '')
      }

      setSelectedLists(campaignHook.selectedLists)
      setIgnoredLists(campaignHook.ignoredLists)
      // Não definir campaignLeads aqui - será calculado pelo próximo useEffect
    }
  }, [campaign?.id, campaignHook.loading, messageEditedByUser]) // Apenas quando a campanha muda ou loading muda

  // Reset flag quando campanha muda
  useEffect(() => {
    setMessageEditedByUser(false)
  }, [campaign?.id])

  // Comunicar mudanças de step para o componente pai
  useEffect(() => {
    if (onStepChange) {
      onStepChange(currentStep)
    }
  }, [currentStep, onStepChange])

  // Recalcular leads únicos quando as listas selecionadas mudarem
  useEffect(() => {
    if (selectedLists.length > 0) {
      // Recalcular leads únicos baseado nas listas selecionadas
      const allLeads: any[] = []
      selectedLists.forEach(listId => {
        const list = lists.find(l => l.id === listId)
        if (list) {
          allLeads.push(...list.leads.map(lead => ({ ...lead, listId })))
        }
      })

      // Deduplicar leads usando o serviço
      const phoneMap = new Map<string, any>()
      const uniqueLeads: any[] = []

      for (const lead of allLeads) {
        const normalizedPhone = LeadDeduplicationService.normalizePhone(lead.phone)
        if (!normalizedPhone) continue

        const phoneHash = LeadDeduplicationService.generatePhoneHash(lead.phone || '')

        if (!phoneMap.has(phoneHash)) {
          phoneMap.set(phoneHash, lead)
          uniqueLeads.push(lead)
        }
      }

      // Recalculando leads únicos

      setCampaignLeads(uniqueLeads)
    } else {
      setCampaignLeads([])
    }
  }, [selectedLists, lists])

  // Removido salvamento automático para evitar loop infinito
  // O salvamento agora é feito apenas quando o usuário executa ações específicas

  // Calcular total de leads brutos (antes da deduplicação)
  const calculateTotalRawLeads = useCallback(() => {
    let total = 0
    selectedLists.forEach(listId => {
      const list = lists.find(l => l.id === listId)
      if (list) {
        total += list.leads.length
      }
    })
    return total
  }, [selectedLists, lists])

  // Calcular duplicados em tempo real (diferença entre total e únicos)
  const calculateDuplicatesInRealTime = useCallback(() => {
    const totalLeads = calculateTotalRawLeads()
    const uniqueLeads = campaignLeads.length
    return Math.max(0, totalLeads - uniqueLeads)
  }, [calculateTotalRawLeads, campaignLeads.length])
  // Calcular estatísticas
  const stats = {
    totalLeads: calculateTotalRawLeads(), // Total bruto (246)
    uniqueLeads: campaignLeads.length, // Leads únicos após deduplicação (194)
    selectedLists: selectedLists.length,
    ignoredLists: ignoredLists.length,
    duplicates: calculateDuplicatesInRealTime(), // Total de duplicados (52)
    duplicatePercentage: 0
  }

  // Handlers
  const handleListToggle = async (listId: string) => {
    const list = lists.find(l => l.id === listId)
    if (!list) return

    setLoading(true)
    try {
      if (selectedLists.includes(listId)) {
        // Remover lista usando o hook
        await campaignHook.removeList(listId)
        // Atualizar estado local
        const newSelectedLists = selectedLists.filter(id => id !== listId)
        const newLeads = LeadDeduplicationService.removeLeadsByList(campaignLeads, listId)
        setSelectedLists(newSelectedLists)
        setCampaignLeads(newLeads)
      } else {
        // Adicionar lista usando o hook
        await campaignHook.addList(listId, list.leads)
        // Atualizar estado local
        const uniqueLeads = LeadDeduplicationService.deduplicateLeads(list.leads, listId)
        const newLeads = LeadDeduplicationService.addLeadsWithDeduplication(campaignLeads, uniqueLeads)
        const newSelectedLists = [...selectedLists, listId]
        setSelectedLists(newSelectedLists)
        setCampaignLeads(newLeads)
      }

      // Atualizar contador de duplicados no banco
      if (campaign?.id) {
        const currentDuplicates = calculateDuplicatesInRealTime()
        try {
          const { error } = await supabase
            .from('campaigns')
            .update({ duplicates_count: currentDuplicates })
            .eq('id', campaign.id)

          if (error) {

          }
        } catch (error) {

        }
      }
    } catch (error) {

    } finally {
      setLoading(false)
    }
  }

  const handleAddAllLists = async () => {
    // Iniciando adição de todas as listas
    setLoading(true)
    try {
      // Filtrar listas disponíveis (não selecionadas e não ignoradas)
      const availableLists = lists.filter(list =>

        !selectedLists.includes(list.id) && !ignoredLists.includes(list.id)
      )

      if (availableLists.length === 0) return

      // Adicionar cada lista usando o hook
      for (const list of availableLists) {
        await campaignHook.addList(list.id, list.leads)
      }

      // Atualizar estado local (remover duplicatas)
      const newListIds = availableLists.map(list => list.id)
      const newSelectedLists = [...new Set([...selectedLists, ...newListIds])] // Remove duplicatas
      let newLeads = [...campaignLeads]
      for (const list of availableLists) {
        const uniqueLeads = LeadDeduplicationService.deduplicateLeads(list.leads, list.id)
        newLeads = LeadDeduplicationService.addLeadsWithDeduplication(newLeads, uniqueLeads)
      }

      setSelectedLists(newSelectedLists)
      setCampaignLeads(newLeads)
    } catch (error) {

    } finally {
      setLoading(false)
    }
  }

  const handleRemoveAllLists = async () => {
    setLoading(true)
    try {
      if (selectedLists.length === 0) return

      // Remover cada lista usando o hook
      for (const listId of selectedLists) {
        await campaignHook.removeList(listId)
      }

      // Atualizar estado local
      setSelectedLists([])
      setCampaignLeads([])
    } catch (error) {

    } finally {
      setLoading(false)
    }
  }

  const handleIgnoreList = async (listId: string) => {
    try {
      await campaignHook.ignoreList(listId)
      // Atualizar estado local
      const newSelectedLists = selectedLists.filter(id => id !== listId)
      const newIgnoredLists = [...ignoredLists, listId]
      setSelectedLists(newSelectedLists)
      setIgnoredLists(newIgnoredLists)
    } catch (error) {

    }
  }

  const handleUnignoreList = async (listId: string) => {
    try {
      await campaignHook.unignoreList(listId)
      // Atualizar estado local
      const newIgnoredLists = ignoredLists.filter(id => id !== listId)
      setIgnoredLists(newIgnoredLists)
    } catch (error) {

    }
  }

  // Função para lidar com o resultado das operações em massa
  const handleBulkOperationComplete = async (result: { selectedLists: string[], leads: any[] }): Promise<void> => {
    // Atualizando estado após operação em massa
    setSelectedLists(result.selectedLists)
    // Não definir campaignLeads aqui - será calculado pelo useEffect

    // Atualizar contador de duplicados no banco se necessário
    if (campaign?.id) {
      const currentDuplicates = calculateDuplicatesInRealTime()
      try {
        const { error } = await supabase
          .from('campaigns')
          .update({ duplicates_count: currentDuplicates })
          .eq('id', campaign.id)

        if (error) {

        }
      } catch (error) {

      }
    }

    // Forçar recarregamento do useCampaign para sincronizar
    if (campaign?.id) {
      await campaignHook.refreshCampaign()
    }
  }

  const handleNextStep = () => {
    switch (currentStep) {
      case 'lists':
        setCurrentStep('message')
        break
      case 'message':
        setCurrentStep('review')
        break
    }
    // Scroll suave ao topo da página
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  const handlePrevStep = () => {
    switch (currentStep) {
      case 'message':
        setCurrentStep('lists')
        break
      case 'review':
        setCurrentStep('message')
        break
    }
    // Scroll suave ao topo da página
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  const handleSaveCampaign = async () => {
    if (!campaignName.trim()) {
      alert('Nome da campanha é obrigatório')
      return
    }

    // Prevenir múltiplas execuções simultâneas
    if (loading) {

      return
    }

    setLoading(true)
    try {
      if (campaign) {
        // Atualizar campanha existente com estatísticas atuais
        const totalLeadsBrutos = calculateTotalRawLeads()
        const uniqueLeadsAtual = campaignLeads.length
        const currentStats = {
          totalLeads: totalLeadsBrutos,
          uniqueLeads: uniqueLeadsAtual,
          duplicates: Math.max(0, totalLeadsBrutos - uniqueLeadsAtual)
        }

        await campaignHook.updateCampaign({
          name: campaignName,
          message: campaignMessage
        })

        // Atualizar contador de duplicados no banco
        const { error: updateError } = await supabase
          .from('campaigns')
          .update({

            duplicates_count: currentStats.duplicates,
            total_leads: currentStats.totalLeads,
            unique_leads: currentStats.uniqueLeads
          })
          .eq('id', campaign.id)

        if (updateError) {

        } else {

        }
      } else {
        // Criar nova campanha
        const newCampaign = await campaignHook.createCampaign(campaignName, campaignMessage)

        // Notificar o componente pai sobre a campanha criada
        if (onCampaignCreated && newCampaign) {
          onCampaignCreated(newCampaign)
        }

        // Nota: Leads e listas serão salvos automaticamente via useEffect
        // quando o usuário selecionar listas na próxima etapa
      }

      alert('Campanha salva com sucesso!')
    } catch (error) {

      alert('Erro ao salvar campanha: ' + (error instanceof Error ? error.message : 'Erro desconhecido'))
    } finally {
      setLoading(false)
    }
  }

  const handleSaveCampaignName = async () => {

    if (!campaignName.trim()) {
      alert('Nome da campanha é obrigatório')
      return
    }

    if (!campaign) {
      alert('Erro: Nenhuma campanha encontrada')
      return
    }

    setLoading(true)
    try {

      // Atualizar apenas o nome da campanha
      await campaignHook.updateCampaign({
        name: campaignName,
        message: campaignMessage
      })
      // Atualizar estatísticas no banco também
      const totalLeadsBrutos = calculateTotalRawLeads()
      const uniqueLeadsAtual = campaignLeads.length
      const currentStats = {
        totalLeads: totalLeadsBrutos,
        uniqueLeads: uniqueLeadsAtual,
        duplicates: Math.max(0, totalLeadsBrutos - uniqueLeadsAtual)
      }

      const { error: updateError } = await supabase
        .from('campaigns')
        .update({

          duplicates_count: currentStats.duplicates,
          total_leads: currentStats.totalLeads,
          unique_leads: currentStats.uniqueLeads
        })
        .eq('id', campaign.id)

      if (updateError) {

      } else {

      }

      // Forçar atualização do estado local da campanha
      if (campaign) {
        campaign.name = campaignName
        campaign.message = campaignMessage
      }

      // Fechar o campo de edição
      setIsEditingName(false)

      // Mostrar feedback de sucesso
      alert('Nome da campanha atualizado com sucesso!')
    } catch (error) {

      alert('Erro ao atualizar nome da campanha: ' + (error instanceof Error ? error.message : 'Erro desconhecido'))
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveLead = async (leadId: string) => {
    try {
      // Remover lead da lista local
      const updatedLeads = campaignLeads.filter(lead => lead.id !== leadId)
      setCampaignLeads(updatedLeads)

      // Recalcular estatísticas após remoção
      // IMPORTANTE: Quando removemos um lead, o total bruto permanece o mesmo,
      // mas o número de duplicados pode diminuir se o lead removido era um duplicado
      const totalLeadsBrutos = calculateTotalRawLeads()
      const uniqueLeadsAtual = updatedLeads.length

      // O número de duplicados deve ser: total bruto - leads únicos atuais
      // Mas se o lead removido era um duplicado, os duplicados diminuem
      const newStats = {
        totalLeads: totalLeadsBrutos,
        uniqueLeads: uniqueLeadsAtual,
        selectedLists: selectedLists.length,
        ignoredLists: ignoredLists.length,
        duplicates: Math.max(0, totalLeadsBrutos - uniqueLeadsAtual),
        duplicatePercentage: 0
      }

      // Atualizar contador de duplicados no banco se necessário
      if (campaign?.id) {
        const currentDuplicates = newStats.duplicates
        try {
          const { error } = await supabase
            .from('campaigns')
            .update({

              duplicates_count: currentDuplicates,
              unique_leads: uniqueLeadsAtual,
              total_leads: totalLeadsBrutos
            })
            .eq('id', campaign.id)

          if (error) {

          } else {

          }
        } catch (error) {

        }
      }
    } catch (error) {

    }
  }

  const handleSendCampaign = () => {
    if (!campaignMessage.trim()) {
      alert('Mensagem é obrigatória')
      return
    }

    if (campaignLeads.length === 0) {
      alert('Selecione pelo menos uma lista com leads')
      return
    }

    onSendCampaign(campaignMessage, campaignLeads)
  }

  // Renderizar step atual
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'lists':
        return (
          <ListSelectionStep
            lists={lists}
            selectedLists={selectedLists}
            ignoredLists={ignoredLists}
            campaignLeads={campaignLeads}
            uniqueLeadsCount={stats.uniqueLeads}
            onListToggle={handleListToggle}
            onIgnoreList={handleIgnoreList}
            onUnignoreList={handleUnignoreList}
            onAddAllLists={handleAddAllLists}
            onRemoveAllLists={handleRemoveAllLists}
            onBulkOperationComplete={handleBulkOperationComplete}
            campaignId={campaign?.id || ''}
            loading={loading}
            disabled={!campaign?.id}
          />
        )

      case 'message':
        return (
          <MessageStep
            message={campaignMessage}
            onMessageChange={(newMessage) => {
              setCampaignMessage(newMessage)
              setMessageEditedByUser(true) // Marcar que mensagem foi editada pelo usuário
            }}
            whatsappConfig={whatsappConfig}
            connectedInstance={connectedInstance}
          />
        )

      case 'review':
        return (
          <ReviewStep
            campaignName={campaignName}
            campaignMessage={campaignMessage}
            stats={stats}
            campaignLeads={campaignLeads}
            onSendCampaign={handleSendCampaign}
            onRemoveLead={handleRemoveLead}
            onStatsUpdate={(_newStats) => {
              // Atualizar estatísticas se necessário

            }}
            loading={loading}
          />
        )

      default:
        return null
    }
  }

  // Verificar se pode avançar
  const canProceed = () => {
    switch (currentStep) {
      case 'lists':
        return selectedLists.length > 0 && campaignLeads.length > 0
      case 'message':
        return campaignMessage.trim().length > 0
      case 'review':
        return true
      default:
        return false
    }
  }

  return (
    <div className="space-y-6">
      {/* Header - Apenas no step 'lists' */}
      {currentStep === 'lists' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={`rounded-xl p-6 shadow-lg ${isDark ? 'disparador-card-escuro' : 'disparador-card-claro'}`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1
                className={`text-3xl font-bold mb-2 ${isDark ? 'disparador-titulo-escuro' : 'disparador-titulo-claro'}`}
              >
                {campaign ? 'Adicione Leads a Sua Campanha!' : 'Nova Campanha'}
              </h1>
              {campaign ? (
                <div className="flex items-center gap-3">
                  <div className="group relative overflow-hidden bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 shadow-lg px-3 py-1.5 rounded-lg">
                    <div className="relative flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      <span className="font-semibold">{campaign.name}</span>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsEditingName(!isEditingName)}
                    className="p-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                    style={{background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'}}
                    title="Editar nome da campanha"
                  >
                    <Edit3 className="w-4 h-4" style={{color: '#ffffff'}} />
                  </motion.button>
                </div>
              ) : (
                <p className={`text-lg ${isDark ? 'disparador-texto-secundario-escuro' : 'disparador-texto-secundario-claro'}`}>
                  Crie uma nova campanha de disparo
                </p>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Editar Nome da Campanha - Campo compacto - Apenas no step 'lists' */}
      {currentStep === 'lists' && campaign && isEditingName && (
        <motion.div
          initial={{ opacity: 0, height: 0, y: -10 }}
          animate={{ opacity: 1, height: 'auto', y: 0 }}
          exit={{ opacity: 0, height: 0, y: -10 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={`rounded-xl p-4 shadow-lg backdrop-blur-sm ${isDark ? 'disparador-card-escuro' : 'disparador-card-claro'}`}
        >
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center" style={{background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'}}>
                <Edit3 className="w-3 h-3 sm:w-4 sm:h-4" style={{color: '#ffffff'}} />
              </div>
              <label className={`text-xs sm:text-sm font-semibold whitespace-nowrap ${isDark ? 'disparador-texto-escuro' : 'disparador-texto-claro'}`}>
                Editar Nome:
              </label>
            </div>
            <input
              type="text"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              placeholder="Digite o nome da sua campanha..."
              className={`flex-1 px-3 sm:px-4 py-2 sm:py-3 text-sm rounded-lg transition-all duration-200 ${isDark ? 'disparador-input-escuro' : 'disparador-input-claro'}`}
              autoFocus
            />
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-shrink-0"
            >
              <Button
                size="sm"
                onClick={handleSaveCampaignName}
                disabled={loading}
                className="w-full sm:w-auto px-3 sm:px-4 py-2 text-xs sm:text-sm bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white disabled:opacity-50 shadow-md hover:shadow-lg transition-all duration-200 font-semibold"
              >
                {loading ? (
                  <div className="flex items-center gap-1 sm:gap-2">
                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span className="text-xs sm:text-sm">Salvando...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="text-xs sm:text-sm">Salvar</span>
                  </div>
                )}
              </Button>
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* Nome da Campanha */}
      {!campaign && (
        <Card className="campaign-input-container-claro campaign-input-container-escuro">
          <CardHeader>
            <CardTitle className="campaign-input-label-claro campaign-input-label-escuro">Nome da Campanha</CardTitle>
          </CardHeader>
          <CardContent>
            <input
              type="text"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              placeholder="Digite o nome da sua campanha..."
              className="w-full px-3 py-2 rounded-lg focus:outline-none campaign-input-claro campaign-input-escuro"
            />
          </CardContent>
        </Card>
      )}

      {/* Estatísticas */}
      {currentStep === 'lists' && (
        <CampaignStats stats={stats} />
      )}

      {/* Conteúdo do Step */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderCurrentStep()}
        </motion.div>
      </AnimatePresence>

      {/* Navegação */}
      <motion.div

        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="pt-6 border-t border-gray-200 dark:border-gray-700"
      >
        {/* Layout Desktop */}
        <div className="hidden sm:flex items-center justify-between">
          <div className="flex items-center gap-3">
            {currentStep !== 'lists' && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Button

                  variant="outline"

                  onClick={handlePrevStep}
                  className="campaign-nav-prev-claro campaign-nav-prev-escuro px-6 py-3 font-semibold text-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <ArrowLeft className="w-4 h-4 mr-2 campaign-nav-prev-texto-claro campaign-nav-prev-texto-escuro" />
                  <span className="campaign-nav-prev-texto-claro campaign-nav-prev-texto-escuro">Anterior</span>
                </Button>
              </motion.div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Button
                variant="outline"
                onClick={handleSaveCampaign}
                disabled={loading}
                className="campaign-nav-save-claro campaign-nav-save-escuro px-6 py-3 font-semibold text-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    <span className="campaign-nav-save-texto-claro campaign-nav-save-texto-escuro">Salvando...</span>
                  </div>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2 campaign-nav-save-texto-claro campaign-nav-save-texto-escuro" />
                    <span className="campaign-nav-save-texto-claro campaign-nav-save-texto-escuro">Salvar Campanha</span>
                  </>
                )}
              </Button>
            </motion.div>

            {currentStep !== 'review' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <Button
                  onClick={handleNextStep}
                  disabled={!canProceed()}
                  className="campaign-nav-next-claro campaign-nav-next-escuro px-6 py-3 font-semibold text-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="campaign-nav-next-texto-claro campaign-nav-next-texto-escuro">Próximo</span>
                  <ArrowRight className="w-4 h-4 ml-2 campaign-nav-next-texto-claro campaign-nav-next-texto-escuro" />
                </Button>
              </motion.div>
            )}
          </div>
        </div>

        {/* Layout Mobile - Centralizado */}
        <div className="sm:hidden flex flex-col items-center gap-4">
          {/* Botão Anterior - Mobile */}
          {currentStep !== 'lists' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-xs"
            >
              <Button

                variant="outline"

                onClick={handlePrevStep}
                className="campaign-nav-prev-claro campaign-nav-prev-escuro w-full px-6 py-3 font-semibold text-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <ArrowLeft className="w-4 h-4 mr-2 campaign-nav-prev-texto-claro campaign-nav-prev-texto-escuro" />
                <span className="campaign-nav-prev-texto-claro campaign-nav-prev-texto-escuro">Anterior</span>
              </Button>
            </motion.div>
          )}

          {/* Botões Salvar e Próximo - Mobile */}
          <div className="flex items-center gap-3 w-full max-w-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="flex-1"
            >
              <Button
                variant="outline"
                onClick={handleSaveCampaign}
                disabled={loading}
                className="campaign-nav-save-claro campaign-nav-save-escuro w-full px-4 py-3 font-semibold text-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    <span className="campaign-nav-save-texto-claro campaign-nav-save-texto-escuro">Salvando...</span>
                  </div>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2 campaign-nav-save-texto-claro campaign-nav-save-texto-escuro" />
                    <span className="campaign-nav-save-texto-claro campaign-nav-save-texto-escuro">Salvar</span>
                  </>
                )}
              </Button>
            </motion.div>

            {currentStep !== 'review' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="flex-1"
              >
                <Button
                  onClick={handleNextStep}
                  disabled={!canProceed()}
                  className="campaign-nav-next-claro campaign-nav-next-escuro w-full px-4 py-3 font-semibold text-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="campaign-nav-next-texto-claro campaign-nav-next-texto-escuro">Próximo</span>
                  <ArrowRight className="w-4 h-4 ml-2 campaign-nav-next-texto-claro campaign-nav-next-texto-escuro" />
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
