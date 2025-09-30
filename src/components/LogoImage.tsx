import React from 'react'
import logoImage from '../assets/lblogo5.png'

interface LogoImageProps {
  className?: string
}

export const LogoImage: React.FC<LogoImageProps> = ({ className = '' }) => {
  return (
    <img
      src={logoImage}
      alt="LeadBaze"
      className={className}
      onLoad={() => {
        // Apenas log em desenvolvimento
        if (import.meta.env.VITE_DEBUG_MODE === 'true' || import.meta.env.VITE_APP_ENV !== 'production') {
          console.log('✅ Logo LeadBaze carregada com sucesso')
        }
      }}
      onError={(e) => {
        // Fallback se a imagem não carregar
        const target = e.target as HTMLImageElement
        target.style.display = 'none'

        // Criar um span com texto como fallback
        const fallback = document.createElement('span')
        fallback.textContent = 'LeadBaze'
        fallback.className = 'text-2xl font-bold'
        fallback.innerHTML = '<span class="text-blue-600">Lead</span><span class="text-pink-600">Baze</span>'

        if (target.parentNode) {
          target.parentNode.insertBefore(fallback, target)
        }
      }}
    />
  )
}

export default LogoImage