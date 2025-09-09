const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuração do Supabase
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function checkSupabaseTables() {
  console.log('🔍 Verificando tabelas e colunas do Supabase...\n');

  // Lista de tabelas que o Analytics precisa
  const requiredTables = [
    'lead_lists',
    'bulk_campaigns',
    'whatsapp_responses',
    'whatsapp_delivery_status'
  ];

  for (const tableName of requiredTables) {
    console.log(`📋 Verificando tabela: ${tableName}`);
    
    try {
      // Tentar fazer uma consulta simples para verificar se a tabela existe
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);

      if (error) {
        console.log(`❌ Tabela ${tableName}: ${error.message}`);
        
        // Se a tabela não existe, mostrar sugestão de criação
        if (error.message.includes('relation') && error.message.includes('does not exist')) {
          console.log(`💡 Sugestão: Criar tabela ${tableName}`);
          showTableCreationSQL(tableName);
        }
      } else {
        console.log(`✅ Tabela ${tableName}: Existe (${data.length} registros encontrados)`);
        
        // Se a tabela existe, verificar as colunas
        if (data.length > 0) {
          console.log(`📊 Colunas disponíveis: ${Object.keys(data[0]).join(', ')}`);
        }
      }
    } catch (err) {
      console.log(`❌ Erro ao verificar ${tableName}: ${err.message}`);
    }
    
    console.log(''); // Linha em branco
  }

  // Verificar se há dados de exemplo
  console.log('📊 Verificando dados de exemplo...\n');
  
  try {
    const { data: leadLists, error: listsError } = await supabase
      .from('lead_lists')
      .select('id, total_leads, created_at, user_id')
      .limit(5);

    if (!listsError && leadLists) {
      console.log(`✅ lead_lists: ${leadLists.length} registros encontrados`);
      if (leadLists.length > 0) {
        console.log('📋 Exemplo de registro:', JSON.stringify(leadLists[0], null, 2));
      }
    } else {
      console.log(`❌ lead_lists: ${listsError?.message || 'Nenhum registro encontrado'}`);
    }
  } catch (err) {
    console.log(`❌ Erro ao verificar lead_lists: ${err.message}`);
  }

  try {
    const { data: campaigns, error: campaignsError } = await supabase
      .from('bulk_campaigns')
      .select('id, status, success_count, failed_count, total_leads, created_at, user_id')
      .limit(5);

    if (!campaignsError && campaigns) {
      console.log(`✅ bulk_campaigns: ${campaigns.length} registros encontrados`);
      if (campaigns.length > 0) {
        console.log('📋 Exemplo de registro:', JSON.stringify(campaigns[0], null, 2));
      }
    } else {
      console.log(`❌ bulk_campaigns: ${campaignsError?.message || 'Nenhum registro encontrado'}`);
    }
  } catch (err) {
    console.log(`❌ Erro ao verificar bulk_campaigns: ${err.message}`);
  }
}

function showTableCreationSQL(tableName) {
  console.log(`\n💡 SQL para criar tabela ${tableName}:`);
  
  switch (tableName) {
    case 'lead_lists':
      console.log(`
CREATE TABLE lead_lists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  total_leads INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`);
      break;
      
    case 'bulk_campaigns':
      console.log(`
CREATE TABLE bulk_campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'draft',
  total_leads INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`);
      break;
      
    case 'whatsapp_responses':
      console.log(`
CREATE TABLE whatsapp_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL,
  lead_phone TEXT NOT NULL,
  response_type TEXT NOT NULL,
  response_content TEXT,
  response_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  lead_name TEXT,
  message_id TEXT,
  instance_name TEXT,
  message_length INTEGER
);`);
      break;
      
    case 'whatsapp_delivery_status':
      console.log(`
CREATE TABLE whatsapp_delivery_status (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL,
  lead_phone TEXT NOT NULL,
  delivery_status TEXT NOT NULL,
  status_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  message_id TEXT,
  error_message TEXT,
  instance_name TEXT
);`);
      break;
  }
  
  console.log('');
}

// Executar verificação
checkSupabaseTables()
  .then(() => {
    console.log('✅ Verificação concluída!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro na verificação:', error);
    process.exit(1);
  });
