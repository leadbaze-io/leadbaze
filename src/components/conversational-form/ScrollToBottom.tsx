import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowDown } from 'lucide-react'

interface ScrollToBottomProps {
    containerRef: React.RefObject<HTMLDivElement>
    threshold?: number
}

export function ScrollToBottom({ containerRef, threshold = 100 }: ScrollToBottomProps) {
    const [showButton, setShowButton] = useState(false)

    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        const handleScroll = () => {
            const { scrollTop, scrollHeight, clientHeight } = container
            const distanceFromBottom = scrollHeight - scrollTop - clientHeight
            setShowButton(distanceFromBottom > threshold)
        }

        container.addEventListener('scroll', handleScroll)
        handleScroll() // Check initial state

        return () => container.removeEventListener('scroll', handleScroll)
    }, [containerRef, threshold])

    const scrollToBottom = () => {
        containerRef.current?.scrollTo({
            top: containerRef.current.scrollHeight,
            behavior: 'smooth'
        })
    }

    return (
        <AnimatePresence>
            {showButton && (
                <motion.button
                    initial={{ opacity: 0, y: 20, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.8 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={scrollToBottom}
                    className="fixed bottom-6 right-6 p-3 rounded-full z-50"
                    style={{
                        background: 'linear-gradient(135deg, #00ff00 0%, #00cc00 100%)',
                        boxShadow: '0 4px 20px rgba(0, 255, 0, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.3)',
                        border: 'none',
                        cursor: 'pointer'
                    }}
                >
                    <motion.div
                        animate={{ y: [0, 4, 0] }}
                        transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <ArrowDown className="w-5 h-5" style={{ color: '#082721' }} />
                    </motion.div>
                </motion.button>
            )}
        </AnimatePresence>
    )
}
