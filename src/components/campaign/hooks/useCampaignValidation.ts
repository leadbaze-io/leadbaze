import { useMemo } from 'react'

import type { CampaignLead, LeadList } from '../../../types'

interface UseCampaignValidationProps {

  selectedLists: string[]

  campaignLeads: CampaignLead[]

  message: string

  lists: LeadList[]

  isWhatsAppConnected: boolean

}

export function useCampaignValidation({

  selectedLists,

  campaignLeads,

  message,

  lists,

  isWhatsAppConnected

}: UseCampaignValidationProps) {

  // Validação da Etapa 1: Seleção de Listas

  const step1Validation = useMemo(() => {

    const hasSelectedLists = selectedLists.length > 0

    const hasLeads = campaignLeads.length > 0

    const hasAvailableLists = lists.length > 0

    return {

      isValid: hasSelectedLists && hasLeads,

      errors: [

        !hasAvailableLists && 'Nenhuma lista disponível',

        !hasSelectedLists && 'Selecione pelo menos uma lista',

        !hasLeads && 'Nenhum lead selecionado'

      ].filter(Boolean) as string[],

      warnings: []

    }

  }, [selectedLists, campaignLeads, lists])

  // Validação da Etapa 2: Mensagem

  const step2Validation = useMemo(() => {

    const hasMessage = message.trim().length > 0

    const messageLength = message.length

    const isMessageTooLong = messageLength > 1000

    const isMessageTooShort = messageLength < 10

    return {

      isValid: hasMessage && !isMessageTooLong && !isMessageTooShort,

      errors: [

        !hasMessage && 'Mensagem é obrigatória',

        isMessageTooLong && 'Mensagem muito longa (máximo 1000 caracteres)',

        isMessageTooShort && 'Mensagem muito curta (mínimo 10 caracteres)'

      ].filter(Boolean) as string[],

      warnings: [

        messageLength > 800 && 'Mensagem está ficando longa',

        !message.includes('{nome}') && 'Considere usar {nome} para personalizar'

      ].filter(Boolean) as string[]

    }

  }, [message])

  // Validação da Etapa 3: Revisão e Envio

  const step3Validation = useMemo(() => {

    const isStep1Valid = step1Validation.isValid

    const isStep2Valid = step2Validation.isValid

    const isWhatsAppReady = isWhatsAppConnected

    return {

      isValid: isStep1Valid && isStep2Valid && isWhatsAppReady,

      errors: [

        !isStep1Valid && 'Etapa 1 não está completa',

        !isStep2Valid && 'Etapa 2 não está completa',

        !isWhatsAppReady && 'WhatsApp não está conectado'

      ].filter(Boolean) as string[],

      warnings: []

    }

  }, [step1Validation.isValid, step2Validation.isValid, isWhatsAppConnected])

  // Validação geral da campanha

  const campaignValidation = useMemo(() => {

    const allStepsValid = step1Validation.isValid && step2Validation.isValid && step3Validation.isValid

    const hasLeads = campaignLeads.length > 0

    const hasMessage = message.trim().length > 0

    return {

      canSend: allStepsValid && hasLeads && hasMessage && isWhatsAppConnected,

      canSave: hasMessage,

      summary: {

        totalLeads: campaignLeads.length,

        totalLists: selectedLists.length,

        messageLength: message.length,

        whatsAppConnected: isWhatsAppConnected

      }

    }

  }, [

    step1Validation.isValid,

    step2Validation.isValid,

    step3Validation.isValid,

    campaignLeads.length,

    message,

    selectedLists.length,

    isWhatsAppConnected

  ])

  // Estatísticas da campanha

  const campaignStats = useMemo(() => {

    const leadsByList = campaignLeads.reduce((acc, lead) => {

      acc[lead.list_id] = (acc[lead.list_id] || 0) + 1

      return acc

    }, {} as Record<string, number>)

    const uniquePhones = new Set(campaignLeads.map(lead => lead.lead_data.phone)).size

    const duplicateCount = campaignLeads.length - uniquePhones

    return {

      totalLeads: campaignLeads.length,

      uniqueLeads: uniquePhones,

      duplicateLeads: duplicateCount,

      leadsByList,

      selectedListsCount: selectedLists.length,

      messageLength: message.length,

      estimatedSendTime: Math.ceil(campaignLeads.length / 10) // Estimativa: 10 mensagens por minuto

    }

  }, [campaignLeads, selectedLists, message])

  return {

    step1Validation,

    step2Validation,

    step3Validation,

    campaignValidation,

    campaignStats

  }

}
