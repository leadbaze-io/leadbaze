import React from 'react'
import { cn } from '../../lib/utils'

interface AuroraTextProps {
  children: React.ReactNode
  className?: string
  colors?: string[]
  speed?: number
}

export function AuroraText({ 
  children, 
  className = '',
  colors = ['#00ff00', '#00ff88', '#00ffff', '#00ff00'],
  speed = 1
}: AuroraTextProps) {
  const animationDuration = `${5 / speed}s`
  
  return (
    <span className={cn('relative inline-block', className)}>
      <span 
        className="relative z-10 bg-clip-text text-transparent"
        style={{
          backgroundImage: `linear-gradient(90deg, ${colors.join(', ')}, ${colors[0]})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          backgroundSize: '200% auto',
          animation: `aurora-text ${animationDuration} ease-in-out infinite alternate`
        }}
      >
        {children}
      </span>

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes aurora-text {
            0% {
              background-position: 0% 50%;
            }
            100% {
              background-position: 100% 50%;
            }
          }
        `
      }} />
    </span>
  )
}

