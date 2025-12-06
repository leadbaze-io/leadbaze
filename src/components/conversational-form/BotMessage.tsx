import { useState, useEffect, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TypingIndicator, TypewriterText } from './TypingIndicator'

interface BotMessageProps {
    content: string | ReactNode
    delay?: number
    enableTyping?: boolean
    onTypingComplete?: () => void
    hideAvatar?: boolean
}

export function BotMessage({ content, delay = 0, enableTyping = true, onTypingComplete, hideAvatar = false }: BotMessageProps) {
    const [showTyping, setShowTyping] = useState(enableTyping && typeof content === 'string')
    const [showMessage, setShowMessage] = useState(!enableTyping || typeof content !== 'string')

    useEffect(() => {
        if (enableTyping && typeof content === 'string') {
            // Show typing indicator for 800ms
            const typingTimeout = setTimeout(() => {
                setShowTyping(false)
                setShowMessage(true)
            }, 800)

            return () => clearTimeout(typingTimeout)
        } else if (!enableTyping && onTypingComplete) {
            // If typing is disabled, call onComplete immediately
            onTypingComplete()
        }
    }, [content, enableTyping, onTypingComplete])

    return (
        <motion.div
            initial={{ opacity: 0, x: -20, y: 10 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{
                duration: 0.5,
                delay,
                ease: [0.16, 1, 0.3, 1]
            }}
            className="flex gap-3 sm:gap-4 mb-6 items-start"
        >
            {/* Bot Avatar with pulse */}
            {!hideAvatar && (
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                        duration: 0.4,
                        delay: delay + 0.1,
                        type: "spring",
                        stiffness: 200
                    }}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex-shrink-0 flex items-center justify-center relative overflow-hidden"
                    style={{
                        background: 'linear-gradient(135deg, #00ff00 0%, #00cc00 100%)',
                        boxShadow: '0 4px 12px rgba(0, 255, 0, 0.3)',
                        border: '2px solid rgba(0, 255, 0, 0.4)'
                    }}
                >
                    {/* Pulse ring */}
                    <motion.div
                        animate={{
                            scale: [1, 1.3, 1],
                            opacity: [0.5, 0, 0.5]
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="absolute inset-0 rounded-full"
                        style={{
                            border: '2px solid rgba(0, 255, 0, 0.5)'
                        }}
                    />

                    {/* Attendant photo */}
                    <img
                        src="/attendant-avatar.jpg"
                        alt="Atendente LeadBaze"
                        className="w-full h-full object-cover rounded-full relative z-10"
                    />
                </motion.div>
            )}

            {/* Message Content */}
            <AnimatePresence mode="wait">
                {showTyping && (
                    <TypingIndicator key="typing" delay={0.2} />
                )}

                {showMessage && (
                    <motion.div
                        key="message"
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{
                            duration: 0.4,
                            ease: [0.16, 1, 0.3, 1]
                        }}
                        className="flex-1 p-3.5 sm:p-4 rounded-2xl rounded-tl-sm"
                        style={{
                            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.03) 100%)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            color: '#FFFFFF',
                            fontSize: '0.9375rem',
                            lineHeight: '1.6',
                            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                        }}
                    >
                        {typeof content === 'string' ? (
                            <p className="whitespace-pre-wrap">
                                {enableTyping ? (
                                    <TypewriterText text={content} speed={20} onComplete={onTypingComplete} />
                                ) : (
                                    content
                                )}
                            </p>
                        ) : (
                            content
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}
