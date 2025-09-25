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

      <div className="absolute inset-0 -z-10">

        <motion.div

          initial={{ scale: 0, opacity: 0 }}

          animate={{ scale: 1, opacity: 0.1 }}

          transition={{ duration: 1, delay: delay + 0.2 }}

          className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur-xl"

        />

      </div>

      {children}

    </motion.div>

  )

}