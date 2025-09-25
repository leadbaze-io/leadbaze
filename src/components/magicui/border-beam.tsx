import { motion } from "framer-motion"

import { cn } from "../../lib/utils"

interface BorderBeamProps {

  children: React.ReactNode

  className?: string

  size?: number

  duration?: number

  borderWidth?: number

  colorFrom?: string

  colorTo?: string

  delay?: number

}

export function BorderBeam({

  children,

  className,

  duration = 15,

  borderWidth = 1.5,

  colorFrom = "#3b82f6",

  colorTo = "#8b5cf6",

  delay = 0,

}: BorderBeamProps) {

  return (

    <div

      className={cn(

        "relative flex h-full w-full items-center justify-center overflow-hidden rounded-lg border bg-background p-20",

        className,

      )}

    >

      <motion.div

        initial={{ opacity: 0, scale: 0.8 }}

        animate={{ opacity: 1, scale: 1 }}

        transition={{ duration: 0.5, delay }}

        className="absolute inset-[0px] rounded-lg"

        style={{

          background: `conic-gradient(from 0deg, transparent, ${colorFrom}, ${colorTo}, transparent)`,

          animation: `rotate ${duration}s linear infinite`,

        }}

      />

      <div

        className="absolute inset-[1px] rounded-lg bg-white"

        style={{

          borderWidth: `${borderWidth}px`,

        }}

      />

      <div className="relative z-10">{children}</div>

      <style>{`

        @keyframes rotate {

          to {

            transform: rotate(360deg);

          }

        }

      `}</style>

    </div>

  )

}