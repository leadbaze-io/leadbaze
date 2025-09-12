// Teste para verificar se os novos campos da campanha estão funcionando
// Execute este código no console do navegador (F12)

async function testCampaignFields() {
  console.log('🧪 Testando novos campos da campanha...')
  
  try {
    // Importar o supabase client
    const { supabase } = await import('./src/lib/supabaseClient.js')
    
    // Buscar uma campanha para testar
    const { data: campaigns, error } = await supabase
      .from('bulk_campaigns')
      .select('*')
      .limit(1)
    
    if (error) {
      console.error('❌ Erro ao buscar campanhas:', error)
      return
    }
    
    if (campaigns.length === 0) {
      console.log('⚠️ Nenhuma campanha encontrada')
      return
    }
    
    const campaign = campaigns[0]
    console.log('📊 Campanha encontrada:', campaign.name)
    console.log('🔍 Campos da campanha:')
    console.log('- selected_lists_count:', campaign.selected_lists_count)
    console.log('- ignored_lists_count:', campaign.ignored_lists_count)
    console.log('- unique_leads_count:', campaign.unique_leads_count)
    console.log('- selected_lists:', campaign.selected_lists)
    console.log('- ignored_lists:', campaign.ignored_lists)
    console.log('- total_leads:', campaign.total_leads)
    
    // Testar a função SQL
    console.log('\n🧪 Testando função SQL...')
    const { data: functionResult, error: functionError } = await supabase
      .rpc('update_campaign_unique_leads_count', { 
        campaign_uuid: campaign.id 
      })
    
    if (functionError) {
      console.error('❌ Erro na função SQL:', functionError)
    } else {
      console.log('✅ Função SQL executada com sucesso!')
      console.log('📊 Leads únicos encontrados:', functionResult)
    }
    
    // Buscar a campanha novamente para ver se foi atualizada
    const { data: updatedCampaign, error: updateError } = await supabase
      .from('bulk_campaigns')
      .select('*')
      .eq('id', campaign.id)
      .single()
    
    if (updateError) {
      console.error('❌ Erro ao buscar campanha atualizada:', updateError)
    } else {
      console.log('\n📈 Campanha após atualização:')
      console.log('- unique_leads_count:', updatedCampaign.unique_leads_count)
      console.log('- selected_lists_count:', updatedCampaign.selected_lists_count)
      console.log('- ignored_lists_count:', updatedCampaign.ignored_lists_count)
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

// Executar o teste
testCampaignFields()




