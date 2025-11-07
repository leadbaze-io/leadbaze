import { useEffect, useRef, useState } from "react"
import { cn } from "../../lib/utils"

interface AnimatedCounterProps {
  value: number
  suffix?: string
  prefix?: string
  duration?: number
  className?: string
  delay?: number
}

export function AnimatedCounter({
  value,
  suffix = "",
  prefix = "",
  duration = 2000,
  className,
  delay = 0,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const [count, setCount] = useState(0)
  const [isInView, setIsInView] = useState(false)

  // Use native Intersection Observer instead of framer-motion
  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true)
            observer.disconnect() // Only trigger once
          }
        })
      },
      { threshold: 0, rootMargin: '0px' }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isInView) return

    const timeout = setTimeout(() => {
      let startTime: number | null = null
      const animateCount = (timestamp: number) => {
        if (!startTime) startTime = timestamp
        const progress = Math.min((timestamp - startTime) / duration, 1)

        // Easing function for smooth animation
        const easeOutCubic = 1 - Math.pow(1 - progress, 3)
        const currentValue = easeOutCubic * value

        // Handle decimal values properly
        if (value % 1 !== 0) {
          // For decimal values, use toFixed(2) to maintain precision
          setCount(parseFloat(currentValue.toFixed(2)))
        } else {
          // For integer values, use Math.floor
          setCount(Math.floor(currentValue))
        }

        if (progress < 1) {
          requestAnimationFrame(animateCount)
        } else {
          setCount(value)
        }
      }

      requestAnimationFrame(animateCount)
    }, delay)

    return () => clearTimeout(timeout)
  }, [isInView, value, duration, delay])

  return (
    <span
      ref={ref}
      className={cn(
        "tabular-nums font-bold tracking-tight",
        className
      )}
    >
      {prefix}{value % 1 !== 0 ? count.toFixed(2) : count.toLocaleString('pt-BR')}{suffix}
    </span>
  )
}