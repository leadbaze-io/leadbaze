import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle } from 'lucide-react'

interface ErrorMessageProps {
    message: string
    show: boolean
}

export function ErrorMessage({ message, show }: ErrorMessageProps) {
    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0, y: -10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -10, height: 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="flex items-center gap-2 mt-2 px-3 py-2 rounded-lg"
                    style={{
                        background: 'rgba(255, 0, 0, 0.1)',
                        border: '1px solid rgba(255, 0, 0, 0.3)'
                    }}
                >
                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                    >
                        <AlertCircle className="w-4 h-4" style={{ color: '#ff4444' }} />
                    </motion.div>
                    <span className="text-sm" style={{ color: '#ff6666' }}>
                        {message}
                    </span>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

interface SuccessMessageProps {
    message: string
    show: boolean
}

export function SuccessMessage({ message, show }: SuccessMessageProps) {
    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="flex items-center gap-2 mt-2 px-3 py-2 rounded-lg"
                    style={{
                        background: 'rgba(0, 255, 0, 0.1)',
                        border: '1px solid rgba(0, 255, 0, 0.3)'
                    }}
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: [0, 1.2, 1] }}
                        transition={{ delay: 0.1, duration: 0.4 }}
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                            <motion.path
                                d="M5 13l4 4L19 7"
                                stroke="#00ff00"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ delay: 0.2, duration: 0.4 }}
                            />
                        </svg>
                    </motion.div>
                    <span className="text-sm" style={{ color: '#00ff00' }}>
                        {message}
                    </span>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
