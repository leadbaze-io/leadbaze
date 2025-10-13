import React, { useEffect, useRef } from 'react';

interface RippleProps {
  mainCircleSize?: number;
  mainCircleOpacity?: number;
  numCircles?: number;
}

export const Ripple: React.FC<RippleProps> = ({
  mainCircleSize = 210,
  mainCircleOpacity = 0.24,
  numCircles = 8
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const drawRipple = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const time = Date.now() * 0.001;

      // Draw main circle
      ctx.beginPath();
      ctx.arc(centerX, centerY, mainCircleSize, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 255, 0, ${mainCircleOpacity})`;
      ctx.fill();

      // Draw ripple circles
      for (let i = 0; i < numCircles; i++) {
        const angle = (i / numCircles) * Math.PI * 2;
        const radius = mainCircleSize + Math.sin(time + angle) * 50;
        const opacity = Math.max(0, 0.1 - Math.abs(Math.sin(time + angle)) * 0.05);
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 255, 0, ${opacity})`;
        ctx.fill();
      }

      animationFrameId.current = requestAnimationFrame(drawRipple);
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    drawRipple();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [mainCircleSize, mainCircleOpacity, numCircles]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ zIndex: 0 }}
    />
  );
};




