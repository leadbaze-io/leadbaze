import { motion } from 'framer-motion'

interface LoadingSkeletonProps {
    type?: 'message' | 'button' | 'input'
    count?: number
}

export function LoadingSkeleton({ type = 'message', count = 1 }: LoadingSkeletonProps) {
    const renderSkeleton = () => {
        switch (type) {
            case 'message':
                return (
                    <div className="flex gap-3 sm:gap-4 mb-6 items-start">
                        {/* Avatar skeleton */}
                        <motion.div
                            animate={{
                                opacity: [0.3, 0.6, 0.3]
                            }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex-shrink-0"
                            style={{
                                background: 'rgba(255, 255, 255, 0.05)'
                            }}
                        />

                        {/* Message skeleton */}
                        <div className="flex-1 space-y-2">
                            <motion.div
                                animate={{
                                    opacity: [0.3, 0.6, 0.3]
                                }}
                                transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                    delay: 0.1
                                }}
                                className="h-4 rounded"
                                style={{
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    width: '80%'
                                }}
                            />
                            <motion.div
                                animate={{
                                    opacity: [0.3, 0.6, 0.3]
                                }}
                                transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                    delay: 0.2
                                }}
                                className="h-4 rounded"
                                style={{
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    width: '60%'
                                }}
                            />
                        </div>
                    </div>
                )

            case 'button':
                return (
                    <motion.div
                        animate={{
                            opacity: [0.3, 0.6, 0.3]
                        }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="h-10 rounded-full"
                        style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            width: '120px'
                        }}
                    />
                )

            case 'input':
                return (
                    <motion.div
                        animate={{
                            opacity: [0.3, 0.6, 0.3]
                        }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="h-12 rounded-xl"
                        style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            width: '100%'
                        }}
                    />
                )

            default:
                return null
        }
    }

    return (
        <>
            {Array.from({ length: count }).map((_, index) => (
                <div key={index}>
                    {renderSkeleton()}
                </div>
            ))}
        </>
    )
}
