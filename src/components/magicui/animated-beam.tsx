// import { useRef } from "react" // Removido pois não está sendo usado

import { motion } from "framer-motion"

import { cn } from "../../lib/utils"

interface AnimatedBeamProps {

  children: React.ReactNode

  className?: string

  delay?: number

}

export function AnimatedBeam({ children, className, delay = 0 }: AnimatedBeamProps) {

  return (

    <motion.div

      initial={{ opacity: 0, y: 20 }}

      animate={{ opacity: 1, y: 0 }}

      transition={{ duration: 0.6, delay }}

      className={cn("relative", className)}

    >

      {children}

    </motion.div>

  )

}