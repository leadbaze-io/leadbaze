import React from 'react'
import logoImage from '../assets/lblogo1.png'

interface LogoImageProps {
  className?: string
  alt?: string
}

export const LogoImage: React.FC<LogoImageProps> = ({ className = '', alt = 'LeadBaze' }) => {
  return (
    <img 
      src={logoImage}
      alt={alt}
      className={className}
      onLoad={() => console.log('✅ Logo carregada com sucesso')}
      onError={(e) => {
        console.error('❌ Erro ao carregar logo:', e)
        // Fallback se a imagem não carregar
        const target = e.target as HTMLImageElement
        target.style.display = 'none'
        
        // Criar um span com texto como fallback
        const fallback = document.createElement('span')
        fallback.textContent = 'LeadBaze'
        fallback.className = 'text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'
        
        if (target.parentNode) {
          target.parentNode.insertBefore(fallback, target)
        }
      }}
    />
  )
}

export default LogoImage