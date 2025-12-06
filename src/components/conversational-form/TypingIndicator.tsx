import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface TypingIndicatorProps {
    delay?: number
}

export function TypingIndicator({ delay = 0 }: TypingIndicatorProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3, delay }}
            className="flex items-center gap-1.5 px-4 py-3 rounded-2xl rounded-tl-sm max-w-fit"
            style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.03) 100%)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
            }}
        >
            {[0, 1, 2].map((index) => (
                <motion.div
                    key={index}
                    animate={{
                        y: [0, -8, 0],
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 1, 0.5]
                    }}
                    transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: index * 0.15,
                        ease: "easeInOut"
                    }}
                    className="w-2 h-2 rounded-full"
                    style={{
                        background: 'linear-gradient(135deg, rgba(0, 255, 0, 0.6), rgba(0, 255, 0, 0.3))',
                        boxShadow: '0 2px 4px rgba(0, 255, 0, 0.2)'
                    }}
                />
            ))}
        </motion.div>
    )
}

interface TypewriterTextProps {
    text: string
    speed?: number
    onComplete?: () => void
}

export function TypewriterText({ text, speed = 30, onComplete }: TypewriterTextProps) {
    const [displayedText, setDisplayedText] = useState('')
    const [currentIndex, setCurrentIndex] = useState(0)

    useEffect(() => {
        if (currentIndex < text.length) {
            const timeout = setTimeout(() => {
                setDisplayedText(prev => prev + text[currentIndex])
                setCurrentIndex(prev => prev + 1)
            }, speed)

            return () => clearTimeout(timeout)
        } else if (onComplete) {
            onComplete()
        }
    }, [currentIndex, text, speed, onComplete])

    return (
        <>
            {displayedText}
            {currentIndex < text.length && (
                <motion.span
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    style={{ color: 'rgba(0, 255, 0, 0.6)' }}
                >
                    |
                </motion.span>
            )}
        </>
    )
}
