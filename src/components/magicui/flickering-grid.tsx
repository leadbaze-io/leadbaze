"use client"

import { useEffect, useRef } from "react"
import { cn } from "../../lib/utils"

interface FlickeringGridProps {
  className?: string
  gridSize?: number
  flickerDuration?: number
  flickerDelay?: number
  opacity?: number
}

export function FlickeringGrid({
  className,
  gridSize = 20,
  flickerDuration = 2000,
  flickerDelay = 100,
  opacity = 0.1,
}: FlickeringGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    const grid: Array<{ x: number; y: number; opacity: number; flickerTime: number }> = []
    
    // Initialize grid
    for (let x = 0; x < canvas.width; x += gridSize) {
      for (let y = 0; y < canvas.height; y += gridSize) {
        grid.push({
          x,
          y,
          opacity: Math.random() * opacity,
          flickerTime: Math.random() * flickerDuration,
        })
      }
    }

    let animationId: number
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      grid.forEach((point) => {
        point.flickerTime += 16
        
        if (point.flickerTime >= flickerDuration) {
          point.flickerTime = 0
          point.opacity = Math.random() * opacity
        }
        
        const alpha = Math.sin((point.flickerTime / flickerDuration) * Math.PI) * point.opacity
        
        ctx.fillStyle = `rgba(0, 255, 0, ${alpha})`
        ctx.fillRect(point.x, point.y, gridSize - 1, gridSize - 1)
      })
      
      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      cancelAnimationFrame(animationId)
    }
  }, [gridSize, flickerDuration, flickerDelay, opacity])

  return (
    <canvas
      ref={canvasRef}
      className={cn("absolute inset-0 w-full h-full", className)}
      style={{ pointerEvents: "none" }}
    />
  )
}


