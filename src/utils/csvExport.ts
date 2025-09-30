// Utilitário para exportação CSV compatível com iOS
// leadflow/src/utils/csvExport.ts

export interface CSVExportOptions {
  filename: string
  data: string[][]
  headers?: string[]
}

/**
 * Detecta se o dispositivo é iOS
 */
export const isIOS = (): boolean => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
         (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
}

/**
 * Exporta dados para CSV com compatibilidade iOS
 */
export const exportToCSV = (options: CSVExportOptions): void => {
  const { filename, data, headers } = options
  
  // Preparar dados CSV
  let csvContent = ''
  
  if (headers && headers.length > 0) {
    csvContent += headers.join(',') + '\n'
  }
  
  csvContent += data.map(row => row.join(',')).join('\n')
  
  // Detectar iOS e usar método apropriado
  if (isIOS()) {
    // Para iOS, usar data URL
    const dataUrl = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent)
    const link = document.createElement('a')
    link.href = dataUrl
    link.download = filename
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } else {
    // Para outros dispositivos, usar blob
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', filename)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url) // Limpar URL para liberar memória
    }
  }
}

/**
 * Converte dados de leads para formato CSV
 */
export const formatLeadsForCSV = (leads: any[], includeHours = false) => {
  const headers = ['Nome', 'Endereço', 'Telefone', 'Avaliação', 'Website', 'Tipo de Negócio']
  
  if (includeHours) {
    headers.push('Horários')
  }
  
  const data = leads.map(lead => {
    const row = [
      `"${lead.name}"`,
      `"${lead.address}"`,
      `"${lead.phone || ''}"`,
      lead.rating || '',
      `"${lead.website || ''}"`,
      `"${lead.business_type || ''}"`
    ]
    
    if (includeHours) {
      row.push(`"${lead.opening_hours?.join('; ') || ''}"`)
    }
    
    return row
  })
  
  return { headers, data }
}


