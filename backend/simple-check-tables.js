#!/usr/bin/env node
require('dotenv').config({ path: './config.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkTables() {
  console.log('🔍 VERIFICANDO TABELAS CONHECIDAS');
  console.log('=================================');
  
  const knownTables = [
    'user_payment_subscriptions',
    'payment_plans',
    'perfect_pay_webhooks',
    'webhooks',
    'payment_webhooks',
    'user_subscription_activities'
  ];
  
  for (const tableName of knownTables) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);
        
      if (error) {
        console.log(`❌ ${tableName}: Não existe (${error.message})`);
      } else {
        console.log(`✅ ${tableName}: Existe`);
        
        // Se for user_payment_subscriptions, mostrar colunas
        if (tableName === 'user_payment_subscriptions' && data.length > 0) {
          console.log('   📊 Colunas disponíveis:');
          Object.keys(data[0]).forEach(col => {
            console.log(`      - ${col}`);
          });
        }
      }
    } catch (err) {
      console.log(`❌ ${tableName}: Erro (${err.message})`);
    }
  }
  
  console.log('');
  console.log('🎯 CONCLUSÃO:');
  console.log('=============');
  console.log('Se perfect_pay_webhooks não existe, precisamos criá-la');
  console.log('ou usar outra tabela para armazenar logs de webhook');
}

checkTables().catch(console.error);




