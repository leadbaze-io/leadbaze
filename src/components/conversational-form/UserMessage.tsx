import { motion } from 'framer-motion'

interface UserMessageProps {
    content: string
    delay?: number
}

export function UserMessage({ content, delay = 0 }: UserMessageProps) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20, y: 10 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{
                duration: 0.4,
                delay,
                ease: [0.16, 1, 0.3, 1]
            }}
            className="flex justify-end mb-6"
        >
            <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{
                    duration: 0.3,
                    delay: delay + 0.2,
                    type: "spring",
                    stiffness: 300
                }}
                className="max-w-[85%] sm:max-w-[75%] p-3.5 sm:p-4 rounded-2xl rounded-tr-sm"
                style={{
                    background: 'linear-gradient(135deg, #00ff00 0%, #00cc00 100%)',
                    color: '#082721',
                    fontSize: '0.9375rem',
                    fontWeight: '500',
                    boxShadow: '0 4px 16px rgba(0, 255, 0, 0.25), inset 0 1px 2px rgba(255, 255, 255, 0.3)'
                }}
            >
                <p className="whitespace-pre-wrap">{content}</p>
            </motion.div>
        </motion.div>
    )
}
