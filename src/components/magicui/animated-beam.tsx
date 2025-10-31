import { motion } from "framer-motion"
import { cn } from "../../lib/utils"

interface AnimatedBeamProps {
  children: React.ReactNode
  className?: string
  delay?: number
}

export function AnimatedBeam({ children, className, delay = 0 }: AnimatedBeamProps) {
  // Se delay for 0 ou muito pequeno, renderizar sem animação para melhorar LCP
  const shouldAnimate = delay > 0.1

  if (!shouldAnimate) {
    return <div className={cn("relative", className)}>{children}</div>
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
      className={cn("relative", className)}
    >
      {children}
    </motion.div>
  )
}