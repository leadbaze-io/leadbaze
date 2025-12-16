import { useState, useCallback } from 'react'
import { saveOrUpdatePartialLead } from '../services/conversationalLeadService'

export type ConversationalStep =
    | 'welcome'
    | 'name'
    | 'phone'
    | 'email'
    | 'investment'
    | 'summary'
    | 'calendar'
    | 'complete'

export interface FormData {
    name: string
    phone: string
    email: string
    investment: string
}

export interface Message {
    id: string
    type: 'bot' | 'user'
    content: string | React.ReactNode
    timestamp: Date
    onTypingComplete?: () => void
    hideAvatar?: boolean
}

// Gerar ID único de sessão para rastrear leads parciais
const getSessionId = () => {
    if (typeof window === 'undefined') return ''

    let sessionId = sessionStorage.getItem('lead_session_id')
    if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        sessionStorage.setItem('lead_session_id', sessionId)
    }
    return sessionId
}

export function useConversationalForm() {
    const [currentStep, setCurrentStep] = useState<ConversationalStep>('welcome')
    const [formData, setFormData] = useState<Partial<FormData>>({})
    const [messages, setMessages] = useState<Message[]>([])
    const [sessionId] = useState(getSessionId())

    const addMessage = useCallback((
        type: 'bot' | 'user',
        content: string | React.ReactNode,
        onTypingComplete?: () => void,
        hideAvatar?: boolean
    ) => {
        const newMessage: Message = {
            id: Date.now().toString(),
            type,
            content,
            timestamp: new Date(),
            onTypingComplete,
            hideAvatar
        }
        setMessages(prev => [...prev, newMessage])
    }, [])

    const updateFormData = useCallback((field: keyof FormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }, [])

    // 🆕 Salvar progressivamente após cada campo
    const saveProgress = useCallback(async (field: keyof FormData, value: string) => {
        if (!sessionId) return

        try {
            const statusMap: Record<keyof FormData, string> = {
                'name': 'partial_name',
                'phone': 'partial_phone',
                'email': 'partial_email',
                'investment': 'form_completed'
            }

            const updatedData = { ...formData, [field]: value }

            await saveOrUpdatePartialLead(
                sessionId,
                updatedData,
                statusMap[field]
            )

            console.log(`✅ Lead parcial salvo: ${field} = ${value}`)
        } catch (error) {
            console.error('Erro ao salvar progresso:', error)
            // Não bloquear UX por erro de salvamento
        }
    }, [sessionId, formData])

    const nextStep = useCallback(() => {
        const stepOrder: ConversationalStep[] = [
            'welcome',
            'name',
            'phone',
            'email',
            'investment',
            'summary',
            'calendar',
            'complete'
        ]

        const currentIndex = stepOrder.indexOf(currentStep)
        if (currentIndex < stepOrder.length - 1) {
            setCurrentStep(stepOrder[currentIndex + 1])
        }
    }, [currentStep])

    const reset = useCallback(() => {
        setCurrentStep('welcome')
        setFormData({})
        setMessages([])
        // Limpar sessão para novo preenchimento
        if (typeof window !== 'undefined') {
            sessionStorage.removeItem('lead_session_id')
        }
    }, [])

    return {
        currentStep,
        setCurrentStep,
        formData,
        updateFormData,
        messages,
        addMessage,
        nextStep,
        reset,
        saveProgress, // 🆕 Nova função exportada
        sessionId     // 🆕 Exportar sessionId para debug
    }
}
