"use client"

import React, { useEffect, useState } from "react"

interface MeteorsProps {
  number?: number
  minDelay?: number
  maxDelay?: number
  minDuration?: number
  maxDuration?: number
  angle?: number
  className?: string
}

export const Meteors = ({
  number = 20,
  minDelay = 0.2,
  maxDelay = 1.2,
  minDuration = 2,
  maxDuration = 10,
  angle = 215,
  className,
}: MeteorsProps) => {
  const [meteorStyles, setMeteorStyles] = useState<Array<React.CSSProperties>>([])

  useEffect(() => {
    const styles = [...new Array(number)].map(() => ({
      "--angle": -angle + "deg",
      top: "-5%",
      left: `calc(0% + ${Math.floor(Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200))}px)`,
      animationDelay: Math.random() * (maxDelay - minDelay) + minDelay + "s",
      animationDuration:
        Math.floor(Math.random() * (maxDuration - minDuration) + minDuration) +
        "s",
    }))
    setMeteorStyles(styles)
  }, [number, minDelay, maxDelay, minDuration, maxDuration, angle])

  return (
    <>
      <style>{`
        @keyframes meteor {
          0% {
            transform: rotate(var(--angle)) translateX(0);
            opacity: 1;
          }
          70% {
            opacity: 1;
          }
          100% {
            transform: rotate(var(--angle)) translateX(-500px);
            opacity: 0;
          }
        }
      `}</style>
      {meteorStyles.map((style, idx) => (
        <span
          key={idx}
          style={style}
          className={`absolute rotate-[var(--angle)] pointer-events-none ${className || ''}`}
        >
          {/* Meteor Tail com cabeça integrada */}
          <div 
            className="absolute h-px w-[50px] pointer-events-none"
            style={{
              background: 'linear-gradient(to right, #00ff00, rgba(0, 255, 0, 0.6), rgba(0, 255, 0, 0.3), transparent)',
              boxShadow: '0 0 8px rgba(0, 255, 0, 0.5)',
              animation: `meteor ${style.animationDuration} linear infinite`,
              animationDelay: style.animationDelay,
            }}
          />
        </span>
      ))}
    </>
  )
}
