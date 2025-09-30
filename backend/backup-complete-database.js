const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// Lista de tabelas conhecidas para backup
const TABLES_TO_BACKUP = [
  'profiles',
  'subscriptions', 
  'payment_plans',
  'subscription_plans',
  'plans',
  'user_payment_subscriptions',
  'payment_transactions',
  'blog_posts',
  'blog_categories',
  'blog_tags',
  'blog_post_categories',
  'blog_post_tags',
  'campaigns',
  'leads',
  'lead_lists',
  'active_campaigns',
  'whatsapp_instances',
  'webhook_logs',
  'user_sessions',
  'audit_logs'
];

async function backupTable(tableName) {
  try {
    console.log(`📋 Fazendo backup da tabela: ${tableName}`);
    
    const { data, error } = await supabase
      .from(tableName)
      .select('*');
    
    if (error) {
      console.log(`❌ Erro na tabela ${tableName}:`, error.message);
      return null;
    }
    
    console.log(`✅ ${tableName}: ${data.length} registros`);
    return {
      table: tableName,
      data: data,
      count: data.length,
      timestamp: new Date().toISOString()
    };
  } catch (err) {
    console.log(`❌ Erro geral na tabela ${tableName}:`, err.message);
    return null;
  }
}

async function createCompleteBackup() {
  console.log('🗄️ ===== BACKUP COMPLETO DO BANCO SUPABASE =====\n');
  
  const backup = {
    timestamp: new Date().toISOString(),
    database_url: process.env.SUPABASE_URL,
    tables: {}
  };
  
  let totalRecords = 0;
  
  for (const tableName of TABLES_TO_BACKUP) {
    const tableBackup = await backupTable(tableName);
    if (tableBackup) {
      backup.tables[tableName] = tableBackup;
      totalRecords += tableBackup.count;
    }
  }
  
  // Salvar backup em arquivo
  const filename = `backup-supabase-${new Date().toISOString().split('T')[0]}.json`;
  fs.writeFileSync(filename, JSON.stringify(backup, null, 2));
  
  console.log('\n🎉 ===== BACKUP CONCLUÍDO =====');
  console.log(`📁 Arquivo: ${filename}`);
  console.log(`📊 Total de registros: ${totalRecords}`);
  console.log(`📋 Tabelas processadas: ${Object.keys(backup.tables).length}`);
  
  // Resumo por tabela
  console.log('\n📋 RESUMO POR TABELA:');
  Object.entries(backup.tables).forEach(([table, data]) => {
    console.log(`  - ${table}: ${data.count} registros`);
  });
  
  return backup;
}

createCompleteBackup().catch(console.error);











