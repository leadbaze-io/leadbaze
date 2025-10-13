import React from 'react';

interface GridPatternProps {
  width?: number;
  height?: number;
  className?: string;
  maxOpacity?: number;
  x?: number;
  y?: number;
  strokeDasharray?: string;
  color?: string;
}

export const GridPattern: React.FC<GridPatternProps> = ({
  width = 60,
  height = 60,
  className = '',
  maxOpacity = 0.15,
  x = 0,
  y = 0,
  strokeDasharray = "0",
  color = "#00ff00"
}) => {
  const minOpacity = maxOpacity * 0.4; // 40% do maxOpacity para o mínimo
  
  return (
    <div 
      className={`absolute inset-0 w-full h-full ${className}`}
      style={{ 
        zIndex: 0,
        backgroundImage: `
          linear-gradient(${color} 1px, transparent 1px),
          linear-gradient(90deg, ${color} 1px, transparent 1px)
        `,
        backgroundSize: `${width}px ${height}px`,
        backgroundPosition: `${x}px ${y}px`,
        backgroundRepeat: 'repeat',
        strokeDasharray: strokeDasharray,
        animation: 'gridPulse 3s ease-in-out infinite'
      }}
    >
      <div dangerouslySetInnerHTML={{
        __html: `
          <style>
            @keyframes gridPulse {
              0%, 100% {
                opacity: ${minOpacity};
                transform: scale(1);
              }
              50% {
                opacity: ${maxOpacity};
                transform: scale(1.02);
              }
            }
          </style>
        `
      }} />
    </div>
  );
};
