// Teste simples - execute no console do navegador (F12)
// Cole este código no console e pressione Enter

(async () => {
  console.log('🧪 Teste simples dos campos da campanha...')
  
  try {
    // Buscar campanhas
    const response = await fetch('/api/campaigns', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error('Erro ao buscar campanhas')
    }
    
    const campaigns = await response.json()
    console.log('📊 Campanhas encontradas:', campaigns.length)
    
    if (campaigns.length > 0) {
      const campaign = campaigns[0]
      console.log('🔍 Primeira campanha:')
      console.log('- Nome:', campaign.name)
      console.log('- unique_leads_count:', campaign.unique_leads_count)
      console.log('- selected_lists_count:', campaign.selected_lists_count)
      console.log('- ignored_lists_count:', campaign.ignored_lists_count)
      console.log('- total_leads:', campaign.total_leads)
      
      // Verificar se os novos campos existem
      if (campaign.unique_leads_count !== undefined) {
        console.log('✅ Campo unique_leads_count existe!')
      } else {
        console.log('❌ Campo unique_leads_count NÃO existe!')
      }
      
      if (campaign.selected_lists_count !== undefined) {
        console.log('✅ Campo selected_lists_count existe!')
      } else {
        console.log('❌ Campo selected_lists_count NÃO existe!')
      }
    }
    
  } catch (error) {
    console.error('❌ Erro:', error)
    console.log('💡 Dica: Execute este código no console do navegador (F12)')
  }
})()



















