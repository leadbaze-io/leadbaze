import { cn } from "../../lib/utils"

interface AnimatedBeamProps {
  children: React.ReactNode
  className?: string
  delay?: number // Mantido para compatibilidade, mas não usado
}

// Versão simplificada SEM framer-motion para evitar CLS e melhorar performance
// Animações podem ser feitas com CSS puro se necessário
export function AnimatedBeam({ children, className }: AnimatedBeamProps) {
  // Renderizar sem animação para evitar layout shifts e melhorar performance
  // Se animação for necessária no futuro, usar CSS transitions ao invés de framer-motion
  return <div className={cn("relative", className)} style={{ opacity: 1 }}>{children}</div>
}