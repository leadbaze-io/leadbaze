/**
 * =====================================================
 * HOOK PARA GERENCIAR CAMPANHA ATIVA GLOBALMENTE
 * =====================================================
 */

import { useState, useEffect, useCallback } from 'react'

interface ActiveCampaign {
  campaignId: string
  campaignName: string
  status: 'sending' | 'completed' | 'failed'
  progress: number
  successCount: number
  failedCount: number
  totalLeads: number
  startTime: Date | null
  currentLead: { name: string; phone: string } | null
  timestamp: number
  duration?: number // duração em segundos
}

export function useActiveCampaign() {
  const [activeCampaign, setActiveCampaign] = useState<ActiveCampaign | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isModalMinimized, setIsModalMinimized] = useState(false)
  const [showCompletionNotification, setShowCompletionNotification] = useState(false)

  // Carregar campanha ativa do localStorage ao inicializar
  useEffect(() => {
    const savedCampaign = localStorage.getItem('activeCampaign')

    if (savedCampaign) {
      try {
        const campaign = JSON.parse(savedCampaign)

        // Verificar se a campanha ainda está ativa (menos de 1 hora)
        const isRecent = Date.now() - campaign.timestamp < 60 * 60 * 1000

        if (isRecent && campaign.status === 'sending') {
          setActiveCampaign({
            ...campaign,
            startTime: campaign.startTime ? new Date(campaign.startTime) : null,
            currentLead: campaign.currentLead || null
          })
          // NÃO abrir modal automaticamente - deixar o usuário decidir
          setIsModalOpen(false)
        } else {
          // Limpar campanha expirada
          localStorage.removeItem('activeCampaign')
        }
      } catch (error) {

        localStorage.removeItem('activeCampaign')
      }
    }
  }, [])

  // Salvar campanha ativa no localStorage
  const saveActiveCampaign = useCallback((campaign: ActiveCampaign) => {
    const campaignToSave = {
      ...campaign,
      timestamp: Date.now()
    }
    try {
      localStorage.setItem('activeCampaign', JSON.stringify(campaignToSave))
      setActiveCampaign(campaign)
    } catch (error) {

    }
  }, [])

  // Iniciar nova campanha
  const startCampaign = useCallback((campaign: Omit<ActiveCampaign, 'timestamp'>) => {

    const newCampaign: ActiveCampaign = {
      ...campaign,
      timestamp: Date.now()
    }
    saveActiveCampaign(newCampaign)

    // Não abrir modal automaticamente - deixar o usuário decidir
    setIsModalOpen(false)

  }, [saveActiveCampaign])

  // Atualizar progresso da campanha
  const updateCampaign = useCallback((updates: Partial<ActiveCampaign>) => {
    if (activeCampaign) {
      const updatedCampaign = { ...activeCampaign, ...updates }
      saveActiveCampaign(updatedCampaign)
    }
  }, [activeCampaign, saveActiveCampaign])

  // Finalizar campanha
  const finishCampaign = useCallback((status: 'completed' | 'failed') => {
    if (activeCampaign) {
      // Calcular duração da campanha
      const duration = activeCampaign.startTime

        ? Math.floor((Date.now() - activeCampaign.startTime.getTime()) / 1000)
        : 0

      const finishedCampaign = {

        ...activeCampaign,

        status,
        duration
      }

      saveActiveCampaign(finishedCampaign)

      // Mostrar notificação de conclusão
      setShowCompletionNotification(true)

      // Fechar modal após 2 segundos
      setTimeout(() => {
        setIsModalOpen(false)
      }, 2000)

      // Limpar campanha após 25 segundos (tempo para ver a notificação)
      setTimeout(() => {
        localStorage.removeItem('activeCampaign')
        setActiveCampaign(null)
        setShowCompletionNotification(false)
      }, 25000)
    }
  }, [activeCampaign, saveActiveCampaign])

  // Abrir modal
  const openModal = useCallback(() => {

    setIsModalOpen(true)

  }, [])

  // Fechar modal (minimizar)
  const closeModal = useCallback(() => {

    setIsModalOpen(false)

  }, [])

  // Minimizar modal
  const minimizeModal = useCallback(() => {

    setIsModalMinimized(true)
    setIsModalOpen(false)

  }, [])

  // Expandir modal
  const expandModal = useCallback(() => {

    setIsModalMinimized(false)
    setIsModalOpen(true)

  }, [])

  // Limpar campanha ativa
  const clearActiveCampaign = useCallback(() => {
    localStorage.removeItem('activeCampaign')
    setActiveCampaign(null)
    setIsModalOpen(false)
    setShowCompletionNotification(false)
  }, [])

  // Fechar notificação de conclusão
  const closeCompletionNotification = useCallback(() => {
    setShowCompletionNotification(false)
    if (activeCampaign?.status === 'completed' || activeCampaign?.status === 'failed') {
      // Limpar campanha quando fechar a notificação
      setTimeout(() => {
        setActiveCampaign(null)
        localStorage.removeItem('activeCampaign')
      }, 500)
    }
  }, [activeCampaign])

  return {
    activeCampaign,
    isModalOpen,
    isModalMinimized,
    showCompletionNotification,
    startCampaign,
    updateCampaign,
    finishCampaign,
    openModal,
    closeModal,
    minimizeModal,
    expandModal,
    clearActiveCampaign,
    closeCompletionNotification
  }
}
