#!/usr/bin/env node
require('dotenv').config({ path: './config.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkPaymentWebhooks() {
  console.log('🔍 VERIFICANDO TABELA payment_webhooks');
  console.log('=====================================');
  
  try {
    // Verificar estrutura da tabela
    const { data: webhooks, error } = await supabase
      .from('payment_webhooks')
      .select('*')
      .limit(1);
      
    if (error) {
      console.log('❌ Erro ao acessar payment_webhooks:', error.message);
      return;
    }
    
    console.log('✅ Tabela payment_webhooks existe!');
    console.log('');
    
    if (webhooks.length > 0) {
      console.log('📊 Colunas disponíveis:');
      Object.keys(webhooks[0]).forEach(col => {
        console.log(`   - ${col}`);
      });
      
      console.log('');
      console.log('📝 Exemplo de dados:');
      console.log(JSON.stringify(webhooks[0], null, 2));
    } else {
      console.log('📝 Tabela vazia - sem dados de exemplo');
    }
    
    // Verificar se há webhooks recentes
    console.log('');
    console.log('🔍 Verificando webhooks recentes...');
    const { data: recentWebhooks, error: recentError } = await supabase
      .from('payment_webhooks')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
      
    if (recentError) {
      console.log('❌ Erro ao buscar webhooks recentes:', recentError.message);
    } else {
      console.log(`📨 Webhooks recentes encontrados: ${recentWebhooks.length}`);
      recentWebhooks.forEach((webhook, index) => {
        console.log(`   ${index + 1}. Criado: ${webhook.created_at}`);
        console.log(`      Status: ${webhook.status || 'N/A'}`);
        console.log(`      Processado: ${webhook.processed || 'N/A'}`);
        console.log('');
      });
    }
    
    // Verificar se há webhooks para o usuário específico
    console.log('🔍 Verificando webhooks para o usuário creaty1234567@gmail.com...');
    const { data: userWebhooks, error: userWebhookError } = await supabase
      .from('payment_webhooks')
      .select('*')
      .ilike('customer_email', '%creaty1234567%')
      .order('created_at', { ascending: false });
      
    if (userWebhookError) {
      console.log('❌ Erro ao buscar webhooks do usuário:', userWebhookError.message);
    } else {
      console.log(`📨 Webhooks para o usuário: ${userWebhooks.length}`);
      if (userWebhooks.length === 0) {
        console.log('⚠️ NENHUM WEBHOOK ENCONTRADO PARA ESTE USUÁRIO!');
        console.log('💡 Isso confirma que o webhook não foi processado');
      } else {
        userWebhooks.forEach((webhook, index) => {
          console.log(`   ${index + 1}. Criado: ${webhook.created_at}`);
          console.log(`      Status: ${webhook.status || 'N/A'}`);
          console.log(`      Processado: ${webhook.processed || 'N/A'}`);
          console.log(`      Amount: ${webhook.amount || 'N/A'}`);
          console.log('');
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error.message);
  }
}

checkPaymentWebhooks();



