import { type ReactNode } from 'react'
import { motion } from 'framer-motion'

interface ChatContainerProps {
    children: ReactNode
}

export function ChatContainer({ children }: ChatContainerProps) {
    return (
        <div
            className="min-h-screen flex flex-col overflow-x-hidden w-full relative"
            style={{
                background: 'linear-gradient(135deg, #0a1f1a 0%, #0d2b24 50%, #0a1f1a 100%)',
                maxWidth: '100vw'
            }}
        >
            {/* Animated background gradient */}
            <div
                className="absolute inset-0"
                style={{
                    background: 'radial-gradient(circle at 20% 50%, rgba(0, 255, 0, 0.03) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(0, 255, 0, 0.02) 0%, transparent 50%)',
                    pointerEvents: 'none',
                    zIndex: 1
                }}
            />

            {/* Noise texture for depth */}
            <div
                className="absolute inset-0 opacity-[0.015]"
                style={{
                    backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' /%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' /%3E%3C/svg%3E")',
                    pointerEvents: 'none',
                    zIndex: 2
                }}
            />

            {/* Chat content with glassmorphism container */}
            <div className="relative flex-1 flex flex-col overflow-x-hidden w-full" style={{ zIndex: 10, maxWidth: '100%' }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 flex-1 flex flex-col"
                    style={{ maxWidth: 'min(56rem, 100%)' }}
                >
                    {/* Glassmorphism card */}
                    <div
                        className="flex-1 flex flex-col rounded-2xl p-6 sm:p-8"
                        style={{
                            background: 'rgba(255, 255, 255, 0.02)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                        }}
                    >
                        {children}
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
