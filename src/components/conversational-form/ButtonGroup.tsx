import { motion } from 'framer-motion'

interface ButtonOption {
    label: string
    value: string
    emoji?: string
}

interface ButtonGroupProps {
    options: ButtonOption[]
    onSelect: (value: string) => void
    delay?: number
}

export function ButtonGroup({ options, onSelect, delay = 0 }: ButtonGroupProps) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay }}
            className="flex flex-wrap gap-2 mb-6 justify-center"
        >
            {options.map((option, index) => (
                <motion.button
                    key={option.value}
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                    transition={{
                        duration: 0.4,
                        delay: delay + index * 0.06,
                        ease: [0.16, 1, 0.3, 1]
                    }}
                    whileHover={{
                        scale: 1.03,
                        backgroundColor: 'rgba(0, 255, 0, 0.12)',
                        borderColor: 'rgba(0, 255, 0, 0.5)',
                        boxShadow: '0 4px 12px rgba(0, 255, 0, 0.15)',
                        transition: { duration: 0.2 }
                    }}
                    whileTap={{
                        scale: 0.97,
                        transition: { duration: 0.1 }
                    }}
                    onClick={() => onSelect(option.value)}
                    className="px-4 py-2.5 rounded-full font-medium relative overflow-hidden group"
                    style={{
                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.02) 100%)',
                        backdropFilter: 'blur(10px)',
                        border: '1.5px solid rgba(255, 255, 255, 0.1)',
                        color: '#FFFFFF',
                        fontSize: '0.8125rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                        whiteSpace: 'nowrap',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                    }}
                >
                    {/* Ripple effect on hover */}
                    <motion.div
                        className="absolute inset-0 rounded-full"
                        initial={{ scale: 0, opacity: 0.5 }}
                        whileHover={{ scale: 2, opacity: 0 }}
                        transition={{ duration: 0.6 }}
                        style={{
                            background: 'radial-gradient(circle, rgba(0, 255, 0, 0.3) 0%, transparent 70%)'
                        }}
                    />

                    {/* Shine effect */}
                    <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{
                            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
                            transform: 'translateX(-100%)',
                            animation: 'shine 1.5s ease-in-out infinite'
                        }}
                    />

                    <span className="relative z-10">
                        {option.emoji && <span className="mr-2">{option.emoji}</span>}
                        {option.label}
                    </span>
                </motion.button>
            ))}

            <style>{`
                @keyframes shine {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(200%); }
                }
            `}</style>
        </motion.div>
    )
}
