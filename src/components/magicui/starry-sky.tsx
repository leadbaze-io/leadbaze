import React, { useEffect, useRef } from 'react';

interface StarrySkyProps {
  starCount?: number;
  twinkleSpeed?: number;
  starColors?: string[];
  className?: string;
}

export const StarrySky: React.FC<StarrySkyProps> = ({
  starCount = 50,
  twinkleSpeed = 2000,
  starColors = ['#ffffff', '#f8f8ff', '#e6e6fa', '#d3d3d3', '#c0c0c0'],
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Generate stars
    const stars: Array<{
      x: number;
      y: number;
      radius: number;
      opacity: number;
      twinklePhase: number;
      twinkleSpeed: number;
      color: string;
      brightness: number;
      type: 'normal' | 'bright' | 'dim';
      sparklePhase: number;
    }> = [];

    for (let i = 0; i < starCount; i++) {
      const starType = Math.random() < 0.1 ? 'bright' : Math.random() < 0.2 ? 'dim' : 'normal';
      const baseRadius = starType === 'bright' ? Math.random() * 2 + 1 : starType === 'dim' ? Math.random() * 0.8 + 0.2 : Math.random() * 1.2 + 0.4;
      
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: baseRadius,
        opacity: starType === 'bright' ? Math.random() * 0.4 + 0.6 : starType === 'dim' ? Math.random() * 0.3 + 0.2 : Math.random() * 0.5 + 0.3,
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: Math.random() * 0.01 + 0.005,
        color: starType === 'bright' ? '#ffffff' : starColors[Math.floor(Math.random() * starColors.length)],
        brightness: starType === 'bright' ? Math.random() * 0.3 + 0.7 : Math.random() * 0.4 + 0.6,
        type: starType,
        sparklePhase: Math.random() * Math.PI * 2
      });
    }

    // Animation loop
    let animationId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      stars.forEach(star => {
        // Update phases
        star.twinklePhase += star.twinkleSpeed;
        star.sparklePhase += star.twinkleSpeed * 0.5;
        
        // Calculate current opacity with twinkle effect
        const twinkleOpacity = Math.sin(star.twinklePhase) * 0.15 + 0.85;
        const currentOpacity = star.opacity * twinkleOpacity * star.brightness;

        // Draw star based on type
        ctx.save();
        ctx.globalAlpha = currentOpacity;
        
        if (star.type === 'bright') {
          // Bright stars with sparkle effect
          const sparkleIntensity = Math.sin(star.sparklePhase) * 0.3 + 0.7;
          
          // Outer glow
          const outerGradient = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.radius * 4);
          outerGradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
          outerGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.05)');
          outerGradient.addColorStop(1, 'transparent');
          
          ctx.fillStyle = outerGradient;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.radius * 4, 0, Math.PI * 2);
          ctx.fill();
          
          // Main star with sparkle
          const mainGradient = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.radius * 2);
          mainGradient.addColorStop(0, '#ffffff');
          mainGradient.addColorStop(0.7, star.color);
          mainGradient.addColorStop(1, 'transparent');
          
          ctx.fillStyle = mainGradient;
          ctx.shadowColor = '#ffffff';
          ctx.shadowBlur = star.radius * 2 * sparkleIntensity;
          
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
          ctx.fill();
          
          // Bright core
          ctx.globalAlpha = currentOpacity * 1.8;
          ctx.fillStyle = '#ffffff';
          ctx.shadowBlur = 0;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.radius * 0.4, 0, Math.PI * 2);
          ctx.fill();
          
          // Sparkle rays (4-pointed star effect)
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
          ctx.lineWidth = 1;
          ctx.shadowBlur = 2;
          ctx.shadowColor = '#ffffff';
          
          for (let i = 0; i < 4; i++) {
            const angle = (i * Math.PI) / 2;
            const x1 = star.x + Math.cos(angle) * star.radius * 0.3;
            const y1 = star.y + Math.sin(angle) * star.radius * 0.3;
            const x2 = star.x + Math.cos(angle) * star.radius * 1.5;
            const y2 = star.y + Math.sin(angle) * star.radius * 1.5;
            
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
          }
          
        } else {
          // Normal and dim stars
          const gradient = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.radius * 2);
          gradient.addColorStop(0, star.color);
          gradient.addColorStop(0.7, star.color);
          gradient.addColorStop(1, 'transparent');
          
          ctx.fillStyle = gradient;
          ctx.shadowColor = star.color;
          ctx.shadowBlur = star.radius * 1.2;
          
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
          ctx.fill();
          
          // Small bright core
          ctx.globalAlpha = currentOpacity * 1.3;
          ctx.fillStyle = '#ffffff';
          ctx.shadowBlur = 0;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.radius * 0.25, 0, Math.PI * 2);
          ctx.fill();
        }
        
        ctx.restore();
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, [starCount, twinkleSpeed, starColors]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      style={{ zIndex: 1 }}
    />
  );
};
