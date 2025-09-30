"use client"

import { useEffect, useState } from "react"
import { cn } from "../../lib/utils"

interface AnimatedCircularProgressBarProps {
  className?: string
  max?: number
  min?: number
  value?: number
  gaugePrimaryColor?: string
  gaugeSecondaryColor?: string
}

export function AnimatedCircularProgressBar({
  className,
  max = 100,
  min = 0,
  value = 0,
  gaugePrimaryColor = "#3b82f6",
  gaugeSecondaryColor = "#e5e7eb",
}: AnimatedCircularProgressBarProps) {
  const [animatedValue, setAnimatedValue] = useState(min)

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValue(value)
    }, 100)

    return () => clearTimeout(timer)
  }, [value])

  const percentage = ((animatedValue - min) / (max - min)) * 100
  const circumference = 2 * Math.PI * 45 // radius = 45
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div className={cn("relative w-20 h-20", className)}>
      <svg
        className="w-full h-full transform -rotate-90"
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke={gaugeSecondaryColor}
          strokeWidth="8"
          fill="none"
          className="opacity-20"
        />
        {/* Progress circle */}
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke={gaugePrimaryColor}
          strokeWidth="8"
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      {/* Percentage text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          {Math.round(percentage)}%
        </span>
      </div>
    </div>
  )
}
