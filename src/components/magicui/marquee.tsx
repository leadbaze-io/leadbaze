import { motion } from "framer-motion"

import { cn } from "../../lib/utils"

interface MarqueeProps {

  className?: string

  reverse?: boolean

  pauseOnHover?: boolean

  children?: React.ReactNode

  vertical?: boolean

  repeat?: number

  duration?: number

}

export function Marquee({

  className,

  reverse,

  pauseOnHover = false,

  children,

  vertical = false,

  repeat = 4,

  duration = 40,

  ...props

}: MarqueeProps) {

  return (

    <div

      {...props}

      className={cn(

        "group flex overflow-hidden p-2 [--duration:40s] [--gap:1rem] [gap:var(--gap)]",

        {

          "flex-row": !vertical,

          "flex-col": vertical,

        },

        className,

      )}

      style={{

        "--duration": `${duration}s`,

      } as React.CSSProperties}

    >

      {Array(repeat)

        .fill(0)

        .map((_, i) => (

          <motion.div

            key={i}

            className={cn("flex shrink-0 justify-around [gap:var(--gap)]", {

              "animate-marquee flex-row": !vertical,

              "animate-marquee-vertical flex-col": vertical,

              "group-hover:[animation-play-state:paused]": pauseOnHover,

              "[animation-direction:reverse]": reverse,

            })}

            animate={{

              x: vertical ? 0 : reverse ? 0 : "-100%",

              y: vertical ? (reverse ? 0 : "-100%") : 0,

            }}

            transition={{

              x: { repeat: Infinity, duration, ease: "linear" },

              y: { repeat: Infinity, duration, ease: "linear" },

            }}

          >

            {children}

          </motion.div>

        ))}

    </div>

  )

}