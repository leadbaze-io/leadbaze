import { useEffect } from 'react'

export const FaviconImage = () => {

  useEffect(() => {

    // Remover favicons existentes para evitar duplicação

    const existingFavicons = document.querySelectorAll('link[rel*="icon"]')

    existingFavicons.forEach(favicon => favicon.remove())

    // Favicon padrão (16x16) - usado na aba do navegador

    const favicon16 = document.createElement('link')

    favicon16.rel = 'icon'

    favicon16.type = 'image/png'

    favicon16.sizes = '16x16'

    favicon16.href = '/faviconlf.png'

    document.head.appendChild(favicon16)

    // Favicon 32x32 - usado em bookmarks e alta resolução

    const favicon32 = document.createElement('link')

    favicon32.rel = 'icon'

    favicon32.type = 'image/png'

    favicon32.sizes = '32x32'

    favicon32.href = '/faviconlf.png'

    document.head.appendChild(favicon32)

    // Favicon 192x192 - usado em dispositivos Android e PWA

    const favicon192 = document.createElement('link')

    favicon192.rel = 'icon'

    favicon192.type = 'image/png'

    favicon192.sizes = '192x192'

    favicon192.href = '/faviconlf.png'

    document.head.appendChild(favicon192)

    // Apple Touch Icon - usado em dispositivos iOS

    const appleTouchIcon = document.createElement('link')

    appleTouchIcon.rel = 'apple-touch-icon'

    appleTouchIcon.sizes = '180x180'

    appleTouchIcon.href = '/faviconlf.png'

    document.head.appendChild(appleTouchIcon)

  }, [])

  return null // Este componente não renderiza nada

}

export default FaviconImage