import { motion } from 'framer-motion'

interface ProgressIndicatorProps {
    currentStep: number
    totalSteps: number
    stepLabels?: string[]
}

export function ProgressIndicator({ currentStep, totalSteps, stepLabels }: ProgressIndicatorProps) {
    const progress = (currentStep / totalSteps) * 100

    return (
        <div className="mb-6">
            {/* Progress bar */}
            <div
                className="w-full h-1.5 rounded-full overflow-hidden"
                style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(10px)'
                }}
            >
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full rounded-full relative overflow-hidden"
                    style={{
                        background: 'linear-gradient(90deg, #00ff00 0%, #00cc00 100%)',
                        boxShadow: '0 0 10px rgba(0, 255, 0, 0.5)'
                    }}
                >
                    {/* Shimmer effect */}
                    <motion.div
                        animate={{
                            x: ['-100%', '200%']
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                        className="absolute inset-0 w-1/3"
                        style={{
                            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)'
                        }}
                    />
                </motion.div>
            </div>

            {/* Step counter */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex justify-between items-center mt-2"
            >
                <span className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                    Passo {currentStep} de {totalSteps}
                </span>
                <span className="text-xs font-medium" style={{ color: 'rgba(0, 255, 0, 0.8)' }}>
                    {Math.round(progress)}%
                </span>
            </motion.div>

            {/* Current step label */}
            {stepLabels && stepLabels[currentStep - 1] && (
                <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-sm mt-2 text-center"
                    style={{ color: 'rgba(255, 255, 255, 0.7)' }}
                >
                    {stepLabels[currentStep - 1]}
                </motion.p>
            )}
        </div>
    )
}
