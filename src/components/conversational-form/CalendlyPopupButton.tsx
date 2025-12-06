import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, ArrowRight } from 'lucide-react'

interface CalendlyPopupButtonProps {
    url?: string
    buttonText?: string
    prefillData?: {
        name?: string
        email?: string
        phone?: string
        customAnswers?: Record<string, string>
    }
    isMobile?: boolean
}

export function CalendlyPopupButton({
    url = 'https://calendly.com/orafamachadoc/demonstracao-leadbaze',
    buttonText = 'Agendar Demonstração',
    prefillData,
    isMobile = false
}: CalendlyPopupButtonProps) {
    useEffect(() => {
        // Load Calendly widget script
        const script = document.createElement('script')
        script.src = 'https://assets.calendly.com/assets/external/widget.js'
        script.async = true
        document.body.appendChild(script)

        // Load Calendly CSS
        const link = document.createElement('link')
        link.href = 'https://assets.calendly.com/assets/external/widget.css'
        link.rel = 'stylesheet'
        document.head.appendChild(link)

        return () => {
            // Cleanup
            if (script.parentNode) {
                document.body.removeChild(script)
            }
            if (link.parentNode) {
                document.head.removeChild(link)
            }
        }
    }, [])

    const openCalendly = () => {
        // @ts-ignore - Calendly is loaded via external script
        if (window.Calendly) {
            // Preparar dados de prefill
            const prefill: any = {}

            if (prefillData?.name) {
                prefill.name = prefillData.name
            }
            if (prefillData?.email) {
                prefill.email = prefillData.email
            }

            // Custom answers
            const customAnswers: any = {}

            if (prefillData?.customAnswers) {
                // Empresa (a1)
                if (prefillData.customAnswers.a1) {
                    customAnswers.a1 = prefillData.customAnswers.a1
                }
                // Segmento (a2)
                if (prefillData.customAnswers.a2) {
                    customAnswers.a2 = prefillData.customAnswers.a2
                }
                // Desafio (a3)
                if (prefillData.customAnswers.a3) {
                    customAnswers.a3 = prefillData.customAnswers.a3
                }
                // Volume desejado (a4)
                if (prefillData.customAnswers.a4) {
                    customAnswers.a4 = prefillData.customAnswers.a4
                }
            }

            // WhatsApp como quinta pergunta (a5) com código do país
            if (prefillData?.phone) {
                // Limpar telefone removendo caracteres especiais
                const cleanPhone = prefillData.phone.replace(/\D/g, '')
                // Adicionar +55 se não tiver
                const phoneWithCountry = cleanPhone.startsWith('55') ? `+${cleanPhone}` : `+55${cleanPhone}`
                customAnswers.a5 = phoneWithCountry
            }

            if (Object.keys(customAnswers).length > 0) {
                prefill.customAnswers = customAnswers
            }

            // @ts-ignore
            window.Calendly.initPopupWidget({
                url: url,
                prefill: prefill
            })
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1]
            }}
            className="w-full max-w-md mx-auto"
        >
            <motion.button
                onClick={openCalendly}
                whileHover={{
                    scale: isMobile ? 1.01 : 1.02,
                    boxShadow: '0 8px 32px rgba(0, 255, 0, 0.3)'
                }}
                whileTap={{ scale: 0.98 }}
                className="w-full rounded-xl font-semibold relative overflow-hidden group"
                style={{
                    // Mobile-optimized sizing
                    padding: isMobile ? '1.25rem 1.5rem' : '1rem 1.5rem',
                    fontSize: isMobile ? '1.125rem' : '1rem',
                    minHeight: isMobile ? '64px' : '56px',
                    background: 'linear-gradient(135deg, #00ff00 0%, #00cc00 100%)',
                    color: '#082721',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 20px rgba(0, 255, 0, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.3)',
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    // Better touch target on mobile
                    touchAction: isMobile ? 'manipulation' : 'auto'
                }}
            >
                {/* Animated gradient overlay */}
                <motion.div
                    className="absolute inset-0"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    style={{
                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, transparent 100%)'
                    }}
                />

                {/* Shine effect */}
                <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                        background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
                        transform: 'translateX(-100%)',
                        animation: 'shine 2s ease-in-out infinite'
                    }}
                />

                <span className="relative z-10 flex items-center justify-center gap-3">
                    <Calendar className="w-5 h-5" />
                    <span>{buttonText}</span>
                    <motion.div
                        animate={{ x: [0, 4, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <ArrowRight className="w-5 h-5" />
                    </motion.div>
                </span>
            </motion.button>


            <style>{`
        @keyframes shine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
        </motion.div>
    )
}
