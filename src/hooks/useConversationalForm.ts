import { useState, useCallback } from 'react'

export type ConversationalStep =
    | 'welcome'
    | 'name'
    | 'phone'
    | 'email'
    | 'company'
    | 'segment'
    | 'teamSize'
    | 'position'
    | 'challenge'
    | 'desiredVolume'
    | 'summary'
    | 'calendar'
    | 'complete'

export interface FormData {
    name: string
    phone: string
    email: string
    company: string
    segment: string
    teamSize: string
    position: string
    challenge: string
    desiredVolume: string
}

export interface Message {
    id: string
    type: 'bot' | 'user'
    content: string | React.ReactNode
    timestamp: Date
    onTypingComplete?: () => void
    hideAvatar?: boolean
}

export function useConversationalForm() {
    const [currentStep, setCurrentStep] = useState<ConversationalStep>('welcome')
    const [formData, setFormData] = useState<Partial<FormData>>({})
    const [messages, setMessages] = useState<Message[]>([])

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

    const nextStep = useCallback(() => {
        const stepOrder: ConversationalStep[] = [
            'welcome',
            'name',
            'phone',
            'email',
            'company',
            'segment',
            'teamSize',
            'position',
            'challenge',
            'desiredVolume',
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
    }, [])

    return {
        currentStep,
        setCurrentStep,
        formData,
        updateFormData,
        messages,
        addMessage,
        nextStep,
        reset
    }
}
