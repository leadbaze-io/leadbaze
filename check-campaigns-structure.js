const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://lsvwjyhnnzeewuuuykmb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzdndqeWhuemVld3d1dXlrbWIiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTczNjU5NzQ0MCwiZXhwIjoyMDUyMTczNDQwfQ.lsvwjyhnnzeewuuuykmb'
);

async function checkCampaignsStructure() {
  console.log('🔍 Verificando estrutura da tabela campaigns...');
  
  try {
    // Verificar colunas da tabela campaigns
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_name', 'campaigns')
      .eq('table_schema', 'public');
    
    if (columnsError) {
      console.error('❌ Erro ao buscar colunas:', columnsError);
      return;
    }
    
    console.log('📋 Colunas da tabela campaigns:');
    columns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });
    
    // Verificar se as colunas necessárias existem
    const requiredColumns = ['success_count', 'failed_count', 'completed_at', 'total_leads'];
    const existingColumns = columns.map(col => col.column_name);
    
    console.log('\n🔍 Verificando colunas necessárias:');
    requiredColumns.forEach(col => {
      const exists = existingColumns.includes(col);
      console.log(`  - ${col}: ${exists ? '✅' : '❌'}`);
    });
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

checkCampaignsStructure();


















