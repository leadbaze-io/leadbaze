import { lazy, Suspense } from "react"
import { cn } from "../../lib/utils"

// Lazy load framer-motion apenas quando necessário
const MotionDiv = lazy(() => 
  import("framer-motion").then(m => ({ default: m.motion.div }))
)

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

  // Lazy load framer-motion apenas quando necessário (delay > 0.1)
  return (
    <Suspense fallback={<div className={cn("relative", className)}>{children}</div>}>
      <MotionDiv
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay, ease: 'easeOut' }}
        className={cn("relative", className)}
      >
        {children}
      </MotionDiv>
    </Suspense>
  )
}