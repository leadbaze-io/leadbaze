import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ChatContainer } from '../components/conversational-form/ChatContainer'
import { BotMessage } from '../components/conversational-form/BotMessage'
import { UserMessage } from '../components/conversational-form/UserMessage'
import { ButtonGroup } from '../components/conversational-form/ButtonGroup'
import { TextInput } from '../components/conversational-form/TextInput'
import { useConversationalForm } from '../hooks/useConversationalForm'
import { CalendlyPopupButton } from '../components/conversational-form/CalendlyPopupButton'
import logoImage from '../assets/leadbazelogonew1.png'

export default function DemoBooking() {
    const {
        currentStep,
        formData,
        updateFormData,
        messages,
        addMessage,
        nextStep
    } = useConversationalForm()

    const messagesEndRef = useRef<HTMLDivElement>(null)
    const hasInitialized = useRef(false)
    const [showInput, setShowInput] = useState(false)
    const [isMobile, setIsMobile] = useState(false)
    const calendlyButtonRef = useRef<HTMLDivElement>(null)

    // Detect mobile viewport
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768)
        }

        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    // Auto-scroll to latest message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    // Auto-scroll to Calendly button on mobile when it appears
    useEffect(() => {
        if (currentStep === 'summary' && isMobile && calendlyButtonRef.current) {
            setTimeout(() => {
                calendlyButtonRef.current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                })
            }, 600) // Wait for animation to complete
        }
    }, [currentStep, isMobile])

    // Initialize with welcome message ONCE (using ref to prevent StrictMode double execution)
    useEffect(() => {
        if (!hasInitialized.current) {
            hasInitialized.current = true


            // Welcome message with typing effect and callback
            addMessage('bot', 'Olá! 👋 Bem-vindo à LeadBaze.\n\nA plataforma que multiplica seus leads qualificados do Google Maps de forma automática e inteligente. 🚀\n\nEm apenas 2 minutos, vamos criar um diagnóstico personalizado para sua empresa. 📊\n\nVamos começar? 😊', () => {
                // This callback fires AFTER typing completes
                addMessage('bot', 'Qual é o seu nome?', () => {
                    // Show input only after second message finishes typing
                    setShowInput(true)
                })
                nextStep()
            })
        }
    }, [addMessage, nextStep])

    const handleNameSubmit = (value: string) => {
        setShowInput(false)
        updateFormData('name', value)
        addMessage('user', value)

        setTimeout(() => {
            addMessage('bot', `Prazer, ${value}! 😊 Qual é o seu WhatsApp?`, () => setShowInput(true))
            nextStep()
        }, 800)
    }

    const handlePhoneSubmit = (value: string) => {
        setShowInput(false)
        updateFormData('phone', value)
        addMessage('user', value)

        setTimeout(() => {
            addMessage('bot', 'Qual é o seu email profissional?', () => setShowInput(true))
            nextStep()
        }, 800)
    }

    const handleEmailSubmit = (value: string) => {
        setShowInput(false)
        updateFormData('email', value)
        addMessage('user', value)

        setTimeout(() => {
            addMessage('bot', 'Qual é o nome da sua empresa?', () => setShowInput(true))
            nextStep()
        }, 800)
    }

    const handleCompanySubmit = (value: string) => {
        setShowInput(false)
        updateFormData('company', value)
        addMessage('user', value)

        setTimeout(() => {
            addMessage('bot', (
                <>
                    Em qual segmento a <strong style={{ color: '#00ff00' }}>{value}</strong> atua?
                </>
            ), () => setShowInput(true))
            nextStep()
        }, 800)
    }

    const handleSegmentSelect = (value: string) => {
        setShowInput(false)
        updateFormData('segment', value)
        addMessage('user', value)

        setTimeout(() => {
            addMessage('bot', 'Quantas pessoas trabalham na área comercial?', () => setShowInput(true))
            nextStep()
        }, 800)
    }

    const handleTeamSizeSelect = (value: string) => {
        updateFormData('teamSize', value)
        addMessage('user', value)

        setTimeout(() => {
            addMessage('bot', `Qual é o seu cargo na ${formData.company}?`)
            nextStep()
        }, 800)
    }

    const handlePositionSelect = (value: string) => {
        updateFormData('position', value)
        addMessage('user', value)

        setTimeout(() => {
            addMessage('bot', `Qual é o maior desafio comercial da ${formData.company}?`)
            nextStep()
        }, 800)
    }

    const handleChallengeSelect = (value: string) => {
        updateFormData('challenge', value)
        addMessage('user', value)

        setTimeout(() => {
            addMessage('bot', 'Quantos leads qualificados por mês seria ideal?')
            nextStep()
        }, 800)
    }

    const handleVolumeSelect = async (value: string) => {
        updateFormData('desiredVolume', value)
        addMessage('user', value)

        // Salvar lead no Supabase antes de mostrar o Calendly
        try {
            const { saveConversationalLead } = await import('../services/conversationalLeadService')

            const leadData = {
                name: formData.name || '',
                phone: formData.phone,
                email: formData.email || '',
                company: formData.company,
                segment: formData.segment,
                team_size: formData.teamSize,
                position: formData.position,
                challenge: formData.challenge,
                desired_volume: value
            }

            const savedLead = await saveConversationalLead(leadData)
            console.log('Lead salvo no Supabase:', savedLead)

            // Armazenar ID do lead para vincular com agendamento depois
            if (savedLead) {
                sessionStorage.setItem('conversational_lead_id', savedLead.id)
            }
        } catch (error) {
            console.error('Erro ao salvar lead:', error)
            // Continua o fluxo mesmo se falhar o salvamento
        }

        setTimeout(() => {
            addMessage('bot', (
                <>
                    <div className="mb-6">
                        <p className="text-2xl font-bold mb-4" style={{ color: '#00ff00' }}>
                            🎉 Parabéns, {formData.name}!
                        </p>
                        <p className="text-lg mb-6">
                            Seu diagnóstico está pronto e temos uma <strong>excelente notícia</strong> para você!
                        </p>
                    </div>


                    {/* Resumo do Diagnóstico - Animated */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            duration: 0.6,
                            delay: 0.3,
                            ease: [0.16, 1, 0.3, 1]
                        }}
                        className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 p-6 rounded-xl border-2 border-green-500/30 mb-6"
                    >
                        <h3 className="text-xl font-bold mb-4" style={{ color: '#00ff00' }}>
                            📊 Resumo do Diagnóstico
                        </h3>
                        <div className="space-y-3">
                            {[
                                { icon: '🏢', label: 'Empresa', value: formData.company },
                                { icon: '🎯', label: 'Segmento', value: formData.segment },
                                { icon: '👥', label: 'Equipe Comercial', value: formData.teamSize },
                                { icon: '⚠️', label: 'Principal Desafio', value: formData.challenge },
                                { icon: '🚀', label: 'Meta de Leads', value: value }
                            ].map((item, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{
                                        duration: 0.4,
                                        delay: 0.5 + (index * 0.1),
                                        ease: [0.16, 1, 0.3, 1]
                                    }}
                                    className="flex items-start gap-3"
                                >
                                    <span className="text-green-400 text-xl">{item.icon}</span>
                                    <div>
                                        <p className="text-sm text-gray-400">{item.label}</p>
                                        <p className="font-semibold text-white">{item.value}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>


                    {/* Demonstração EXCLUSIVA - Animated */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            duration: 0.6,
                            delay: 1.2,
                            ease: [0.16, 1, 0.3, 1]
                        }}
                        className="bg-green-500/10 p-6 rounded-xl border-2 border-green-500/50 mb-6"
                    >
                        <h3 className="text-xl font-bold mb-4" style={{ color: '#00ff00' }}>
                            🎁 Você Ganhou uma Demonstração EXCLUSIVA!
                        </h3>
                        <p className="mb-4 text-white">
                            Preparamos uma <strong>demonstração personalizada</strong> de 30 minutos onde você vai descobrir:
                        </p>
                        <ul className="space-y-3 mb-4">
                            {[
                                `Como resolver "${formData.challenge}" usando nossa tecnologia de ponta`,
                                `Estratégia exata para alcançar ${value} de forma consistente`,
                                `Como empresas do segmento ${formData.segment} estão multiplicando resultados`,
                                `Plano de ação personalizado para ${formData.company} começar hoje mesmo`
                            ].map((text, index) => (
                                <motion.li
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{
                                        duration: 0.4,
                                        delay: 1.5 + (index * 0.15),
                                        ease: [0.16, 1, 0.3, 1]
                                    }}
                                    className="flex items-start gap-3"
                                >
                                    <span className="text-green-400 text-xl flex-shrink-0">✅</span>
                                    <span dangerouslySetInnerHTML={{
                                        __html: text.replace(/\"([^\"]+)\"/g, '<strong>$1</strong>')
                                            .replace(/(\d+-\d+\s*leads\/mês)/gi, '<strong>$1</strong>')
                                            .replace(/([\w\s]+(?=\s+estão))/gi, '<strong>$1</strong>')
                                            .replace(/([\w\s]+(?=\s+começar))/gi, '<strong>$1</strong>')
                                    }} />
                                </motion.li>
                            ))}
                        </ul>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.4, delay: 2.1 }}
                            className="text-sm text-gray-300 italic"
                        >
                            💡 Demonstração 100% gratuita, sem compromisso. Apenas conhecimento de alto valor!
                        </motion.p>
                    </motion.div>
                </>
            ), undefined, true) // hideAvatar = true to prevent scroll

            // Auto-scroll suavemente para os resultados
            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
            }, 2500)

            nextStep()
        }, 1000)
    }

    return (
        <ChatContainer>
            {/* Header with Logo */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="text-center mb-10 max-w-full"
            >
                {/* Logo - Simple & Clean */}
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                        duration: 0.6,
                        delay: 0.2,
                        ease: [0.16, 1, 0.3, 1]
                    }}
                    className="mx-auto mb-6"
                    style={{
                        width: '150px',
                        height: '40px'
                    }}
                >
                    <img
                        src={logoImage}
                        alt="LeadBaze"
                        className="w-full h-full object-contain"
                    />
                </motion.div>

                {/* Title - Clean & Readable */}
                <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="text-4xl md:text-5xl font-bold mb-4 px-4"
                    style={{
                        color: '#FFFFFF',
                        textShadow: '0 2px 20px rgba(0, 255, 0, 0.2)'
                    }}
                >
                    Agende sua Demonstração
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="text-lg md:text-xl max-w-2xl mx-auto px-4"
                    style={{
                        color: 'rgba(255, 255, 255, 0.8)',
                        lineHeight: '1.6'
                    }}
                >
                    Responda <span style={{ color: '#00ff00', fontWeight: '600' }}>3 perguntas rápidas</span> e descubra como <span style={{ color: '#00ff00', fontWeight: '600' }}>10x seus leads</span>
                </motion.p>

                {/* Decorative line */}
                <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.8, delay: 0.7 }}
                    className="mx-auto mt-6"
                    style={{
                        width: '100px',
                        height: '4px',
                        background: 'linear-gradient(90deg, transparent, #00ff00, transparent)',
                        borderRadius: '2px',
                        boxShadow: '0 0 20px rgba(0, 255, 0, 0.5)'
                    }}
                />
            </motion.div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden mb-6 max-w-full">
                {messages.map((message) => (
                    message.type === 'bot' ? (
                        <BotMessage
                            key={message.id}
                            content={message.content}
                            delay={0}
                            onTypingComplete={message.onTypingComplete}
                            hideAvatar={message.hideAvatar}
                        />
                    ) : (
                        <UserMessage
                            key={message.id}
                            content={message.content as string}
                            delay={0}
                        />
                    )
                ))}

                {/* Input based on current step */}
                {currentStep === 'name' && showInput && (
                    <TextInput
                        placeholder="Digite seu nome"
                        onSubmit={handleNameSubmit}
                        delay={0.3}
                    />
                )}

                {currentStep === 'phone' && showInput && (
                    <TextInput
                        type="tel"
                        placeholder="(00) 00000-0000"
                        onSubmit={handlePhoneSubmit}
                        showCountryCode
                        delay={0.3}
                    />
                )}

                {currentStep === 'email' && showInput && (
                    <TextInput
                        type="email"
                        placeholder="seu@email.com"
                        onSubmit={handleEmailSubmit}
                        delay={0.3}
                    />
                )}

                {currentStep === 'company' && showInput && (
                    <TextInput
                        placeholder="Nome da empresa"
                        onSubmit={handleCompanySubmit}
                        delay={0.3}
                    />
                )}

                {currentStep === 'segment' && (
                    <ButtonGroup
                        options={[
                            { label: 'Imobiliário', value: 'Imobiliário', emoji: '🏢' },
                            { label: 'Arquitetura', value: 'Arquitetura', emoji: '🏛️' },
                            { label: 'Engenharia', value: 'Engenharia', emoji: '🛠️' },
                            { label: 'Construção', value: 'Construção', emoji: '🏗️' },
                            { label: 'Automotivo', value: 'Automotivo', emoji: '🚗' },
                            { label: 'Estética e Beleza', value: 'Estética e Beleza', emoji: '💅' },
                            { label: 'Saúde e Bem-estar', value: 'Saúde e Bem-estar', emoji: '🏋️' },
                            { label: 'Tecnologia', value: 'Tecnologia', emoji: '💻' },
                            { label: 'Educação', value: 'Educação', emoji: '🎓' },
                            { label: 'Varejo', value: 'Varejo', emoji: '🛒' },
                            { label: 'Alimentação', value: 'Alimentação', emoji: '🍽️' },
                            { label: 'Serviços', value: 'Serviços', emoji: '🔧' },
                            { label: 'Outro', value: 'Outro', emoji: '➕' }
                        ]}
                        onSelect={handleSegmentSelect}
                        delay={0.3}
                    />
                )}

                {currentStep === 'teamSize' && (
                    <ButtonGroup
                        options={[
                            { label: 'Só eu', value: 'Só eu', emoji: '👤' },
                            { label: '2-5 pessoas', value: '2-5 pessoas', emoji: '👥' },
                            { label: '6-10 pessoas', value: '6-10 pessoas', emoji: '👨‍👩‍👧' },
                            { label: '11-20 pessoas', value: '11-20 pessoas', emoji: '👨‍👩‍👧‍👦' },
                            { label: '20-30 pessoas', value: '20-30 pessoas', emoji: '👥' },
                            { label: '30-40 pessoas', value: '30-40 pessoas', emoji: '👥' },
                            { label: '40-50 pessoas', value: '40-50 pessoas', emoji: '🏢' },
                            { label: '50+ pessoas', value: '50+ pessoas', emoji: '🏭' }
                        ]}
                        onSelect={handleTeamSizeSelect}
                        delay={0.3}
                    />
                )}

                {currentStep === 'position' && (
                    <ButtonGroup
                        options={[
                            { label: 'Sócio ou Fundador', value: 'Sócio ou Fundador' },
                            { label: 'Diretor Comercial', value: 'Diretor Comercial' },
                            { label: 'Gerente de Vendas', value: 'Gerente de Vendas' },
                            { label: 'Coordenador', value: 'Coordenador' },
                            { label: 'Vendedor', value: 'Vendedor' },
                            { label: 'Outro', value: 'Outro' }
                        ]}
                        onSelect={handlePositionSelect}
                        delay={0.3}
                    />
                )}

                {currentStep === 'challenge' && (
                    <ButtonGroup
                        options={[
                            { label: 'Falta de leads qualificados', value: 'Falta de leads qualificados', emoji: '😓' },
                            { label: 'Leads muito caros', value: 'Leads muito caros', emoji: '💸' },
                            { label: 'Dificuldade em encontrar contatos', value: 'Dificuldade em encontrar contatos', emoji: '🔍' },
                            { label: 'Prospecção manual e demorada', value: 'Prospecção manual e demorada', emoji: '⏰' },
                            { label: 'Baixa taxa de conversão', value: 'Baixa taxa de conversão', emoji: '📉' },
                            { label: 'Outro', value: 'Outro', emoji: '❓' }
                        ]}
                        onSelect={handleChallengeSelect}
                        delay={0.3}
                    />
                )}

                {currentStep === 'desiredVolume' && (
                    <ButtonGroup
                        options={[
                            { label: '50-100 leads/mês', value: '50-100 leads/mês', emoji: '📈' },
                            { label: '100-300 leads/mês', value: '100-300 leads/mês', emoji: '🚀' },
                            { label: '300-500 leads/mês', value: '300-500 leads/mês', emoji: '💎' },
                            { label: '500-1000 leads/mês', value: '500-1000 leads/mês', emoji: '🏆' },
                            { label: 'Mais de 1000/mês', value: 'Mais de 1000/mês', emoji: '🌟' }
                        ]}
                        onSelect={handleVolumeSelect}
                        delay={0.3}
                    />
                )}

                {currentStep === 'summary' && (
                    <motion.div
                        ref={calendlyButtonRef}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.6 }}
                        className="mt-8 w-full max-w-full"
                        style={{
                            // Mobile-optimized padding and spacing
                            padding: isMobile ? '0 1rem' : '0',
                            marginTop: isMobile ? '2rem' : '2rem'
                        }}
                    >
                        <CalendlyPopupButton
                            url="https://calendly.com/orafamachadoc/demonstracao-leadbaze"
                            buttonText="🎯 Agendar Minha Demonstração Gratuita"
                            prefillData={{
                                name: formData.name,
                                email: formData.email,
                                phone: formData.phone,
                                customAnswers: {
                                    a1: formData.company || '',
                                    a2: formData.segment || '',
                                    a3: formData.challenge || '',
                                    a4: formData.desiredVolume || ''
                                }
                            }}
                            isMobile={isMobile}
                        />
                    </motion.div>
                )}

                <div ref={messagesEndRef} />
            </div>
        </ChatContainer>
    )
}
