// TESTE DIRETO - Cole este código no console do navegador (F12)

// 1. Abra o console do navegador (F12)
// 2. Cole este código e pressione Enter
// 3. Verifique os resultados

console.log('🧪 TESTE DOS CAMPOS DA CAMPANHA')
console.log('================================')

// Função para testar
async function testarCampos() {
  try {
    // Importar supabase
    const { createClient } = await import('https://cdn.skypack.dev/@supabase/supabase-js@2')
    
    // Configurar cliente (substitua pelas suas credenciais)
    const supabaseUrl = 'https://lsvwjyhnnzeewuuuykmb.supabase.co'
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzdndqeWhubnplZXd1dXV5a21iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY0NzQ4NzEsImV4cCI6MjA1MjA1MDg3MX0.8QZqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJq'
    
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Buscar campanhas
    const { data: campaigns, error } = await supabase
      .from('bulk_campaigns')
      .select('*')
      .limit(1)
    
    if (error) {
      console.error('❌ Erro:', error)
      return
    }
    
    if (campaigns.length === 0) {
      console.log('⚠️ Nenhuma campanha encontrada')
      return
    }
    
    const campaign = campaigns[0]
    console.log('📊 Campanha:', campaign.name)
    console.log('🔍 Campos:')
    console.log('  - unique_leads_count:', campaign.unique_leads_count)
    console.log('  - selected_lists_count:', campaign.selected_lists_count)
    console.log('  - ignored_lists_count:', campaign.ignored_lists_count)
    console.log('  - total_leads:', campaign.total_leads)
    
    // Verificar se campos existem
    const camposExistem = {
      unique_leads_count: campaign.unique_leads_count !== undefined,
      selected_lists_count: campaign.selected_lists_count !== undefined,
      ignored_lists_count: campaign.ignored_lists_count !== undefined
    }
    
    console.log('\n✅ Status dos campos:')
    Object.entries(camposExistem).forEach(([campo, existe]) => {
      console.log(`  - ${campo}: ${existe ? '✅ EXISTE' : '❌ NÃO EXISTE'}`)
    })
    
    // Testar função SQL
    console.log('\n🧪 Testando função SQL...')
    const { data: result, error: funcError } = await supabase
      .rpc('update_campaign_unique_leads_count', { 
        campaign_uuid: campaign.id 
      })
    
    if (funcError) {
      console.error('❌ Erro na função:', funcError)
    } else {
      console.log('✅ Função executada! Leads únicos:', result)
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

// Executar teste
testarCampos()



















