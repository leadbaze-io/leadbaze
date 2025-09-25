import { useState, useCallback } from 'react'
import type { LeadList, CampaignLead } from '../../../types'

interface UseCampaignStepsProps {
  initialSelectedLists?: string[]
  initialMessage?: string
  initialCampaignLeads?: CampaignLead[]
}

export function useCampaignSteps({
  initialSelectedLists = [],
  initialMessage = '',
  initialCampaignLeads = []
}: UseCampaignStepsProps = {}) {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedLists, setSelectedLists] = useState<string[]>(initialSelectedLists)
  const [message, setMessage] = useState(initialMessage)
  const [campaignLeads, setCampaignLeads] = useState<CampaignLead[]>(initialCampaignLeads)

  // Função para navegar entre etapas
  const goToStep = useCallback((step: number) => {
    if (step >= 1 && step <= 3) {
      setCurrentStep(step)
    }
  }, [])

  // Função para avançar para próxima etapa
  const nextStep = useCallback(() => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }, [currentStep])

  // Função para voltar para etapa anterior
  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }, [currentStep])

  // Função para resetar o wizard
  const resetWizard = useCallback(() => {
    setCurrentStep(1)
    setSelectedLists([])
    setMessage('')
    setCampaignLeads([])
  }, [])

  // Função para toggle de lista
  const toggleList = useCallback((listId: string) => {
    setSelectedLists(prev =>

      prev.includes(listId)
        ? prev.filter(id => id !== listId)
        : [...prev, listId]
    )
  }, [])

  // Função para processar leads quando lista é selecionada
  const processListLeads = useCallback((lists: LeadList[], listId: string, isAdding: boolean) => {
    if (isAdding) {
      const list = lists.find(l => l.id === listId)
      if (list && list.leads) {
        // Adicionar leads da lista (verificar duplicatas por telefone)
        const existingPhones = new Set(campaignLeads.map(lead => lead.lead_data.phone))
        const newLeads = list.leads
          .filter(lead => !existingPhones.has(lead.phone))
          .map(lead => ({
            id: `${listId}-${lead.phone}`,
            campaign_id: '', // Será definido quando salvar
            list_id: listId,
            lead_data: lead,
            lead_hash: `${listId}-${lead.phone}`,
            added_at: new Date().toISOString()
          }))

        setCampaignLeads(prev => [...prev, ...newLeads])
      }
    } else {
      // Remover leads da lista
      setCampaignLeads(prev => prev.filter(lead => lead.list_id !== listId))
    }
  }, [campaignLeads])

  // Função para remover lead individual
  const removeLead = useCallback((leadId: string) => {
    setCampaignLeads(prev => prev.filter(lead => lead.id !== leadId))
  }, [])

  // Função para remover todos os leads de uma lista
  const removeListLeads = useCallback((listId: string) => {
    setCampaignLeads(prev => prev.filter(lead => lead.list_id !== listId))
  }, [])

  // Validações das etapas
  const isStep1Valid = selectedLists.length > 0 && campaignLeads.length > 0
  const isStep2Valid = message.trim().length > 0
  const isStep3Valid = isStep1Valid && isStep2Valid

  // Status das etapas
  const stepStatus = {
    1: {
      completed: isStep1Valid,
      disabled: false
    },
    2: {
      completed: isStep2Valid,
      disabled: !isStep1Valid
    },
    3: {
      completed: false,
      disabled: !isStep3Valid
    }
  }

  return {
    // Estados
    currentStep,
    selectedLists,
    message,
    campaignLeads,

    // Funções de navegação
    goToStep,
    nextStep,
    prevStep,
    resetWizard,

    // Funções de dados
    setMessage,
    toggleList,
    processListLeads,
    removeLead,
    removeListLeads,
    setCampaignLeads,

    // Validações
    isStep1Valid,
    isStep2Valid,
    isStep3Valid,
    stepStatus
  }
}
