require('dotenv').config({ path: './config.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const userId = '8a8e49f2-b584-4516-aeea-f342e75686f9';

async function checkWebhookTables() {
  console.log('🔍 ===== VERIFICANDO TABELAS DE WEBHOOK =====\n');

  try {
    // Verificar tabelas relacionadas a webhooks
    const tablesToCheck = [
      'perfect_pay_webhooks',
      'webhooks',
      'payment_webhooks',
      'perfect_pay_transactions',
      'transactions',
      'payment_transactions'
    ];

    console.log('1️⃣ Verificando tabelas de webhook disponíveis...');
    
    for (const tableName of tablesToCheck) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);

        if (error) {
          console.log(`❌ ${tableName}: ${error.message}`);
        } else {
          console.log(`✅ ${tableName}: Tabela existe`);
          if (data && data.length > 0) {
            console.log(`   Colunas: ${Object.keys(data[0]).join(', ')}`);
          }
        }
      } catch (err) {
        console.log(`❌ ${tableName}: ${err.message}`);
      }
    }

    // Verificar webhooks para o usuário específico
    console.log('\n2️⃣ Verificando webhooks para o usuário...');
    
    const webhookTables = ['webhooks', 'payment_webhooks', 'perfect_pay_transactions'];
    
    for (const tableName of webhookTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(5);

        if (error) {
          console.log(`❌ ${tableName}: ${error.message}`);
        } else {
          console.log(`✅ ${tableName}: ${data.length} registros encontrados`);
          data.forEach((webhook, index) => {
            console.log(`   ${index + 1}. ID: ${webhook.id}`);
            console.log(`      Status: ${webhook.status || 'N/A'}`);
            console.log(`      Transaction ID: ${webhook.transaction_id || webhook.external_reference || 'N/A'}`);
            console.log(`      Valor: R$ ${webhook.amount ? (webhook.amount / 100).toFixed(2) : 'N/A'}`);
            console.log(`      Criado: ${webhook.created_at}`);
            console.log(`      Processado: ${webhook.processed_at || 'Não processado'}`);
            console.log(`      ---`);
          });
        }
      } catch (err) {
        console.log(`❌ ${tableName}: ${err.message}`);
      }
    }

    // Verificar se há transações no Perfect Pay
    console.log('\n3️⃣ Verificando transações do Perfect Pay...');
    
    try {
      const { data: transactions, error: transError } = await supabase
        .from('perfect_pay_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (transError) {
        console.log(`❌ Erro ao buscar transações: ${transError.message}`);
      } else {
        console.log(`📊 Transações encontradas: ${transactions.length}`);
        transactions.forEach((trans, index) => {
          console.log(`\n📋 Transação ${index + 1}:`);
          console.log(`   ID: ${trans.id}`);
          console.log(`   Transaction ID: ${trans.transaction_id}`);
          console.log(`   Status: ${trans.status}`);
          console.log(`   Valor: R$ ${(trans.amount / 100).toFixed(2)}`);
          console.log(`   Criado: ${trans.created_at}`);
          console.log(`   Processado: ${trans.processed_at || 'Não processado'}`);
          console.log(`   Dados: ${JSON.stringify(trans.webhook_data, null, 2)}`);
        });
      }
    } catch (err) {
      console.log(`❌ Erro ao verificar transações: ${err.message}`);
    }

  } catch (err) {
    console.error('❌ Erro inesperado:', err.message);
  }
}

checkWebhookTables();


