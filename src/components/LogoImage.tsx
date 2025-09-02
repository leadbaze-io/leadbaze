import React from 'react'

interface LogoImageProps {
  className?: string
  alt?: string
}

export const LogoImage: React.FC<LogoImageProps> = ({ className = '', alt = 'LeadBaze' }) => {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Ícone de localização estilizado */}
      <div className="relative">
        <div className="w-8 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
          <div className="w-3 h-3 bg-white rounded-full"></div>
        </div>
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
      </div>
      
      {/* Texto LeadBaze */}
      <span className="text-2xl font-bold">
        <span className="text-blue-600">Lead</span>
        <span className="text-pink-600">Baze</span>
      </span>
    </div>
  )
}

export default LogoImage