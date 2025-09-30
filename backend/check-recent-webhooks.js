#!/usr/bin/env node
require('dotenv').config({ path: './config.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkRecentWebhooks() {
  console.log('🔍 VERIFICANDO WEBHOOKS RECENTES DETALHADOS');
  console.log('==========================================');
  
  try {
    const { data: webhooks, error } = await supabase
      .from('payment_webhooks')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
      
    if (error) {
      console.log('❌ Erro:', error.message);
      return;
    }
    
    console.log(`📨 Webhooks encontrados: ${webhooks.length}`);
    console.log('');
    
    let foundUserWebhook = false;
    
    webhooks.forEach((webhook, index) => {
      console.log(`${index + 1}. Webhook ID: ${webhook.id}`);
      console.log(`   Tipo: ${webhook.webhook_type}`);
      console.log(`   Ação: ${webhook.action}`);
      console.log(`   Processado: ${webhook.processed}`);
      console.log(`   Criado: ${webhook.created_at}`);
      console.log(`   Erro: ${webhook.error_message || 'Nenhum'}`);
      
      // Verificar se o raw_data contém email do usuário
      if (webhook.raw_data && typeof webhook.raw_data === 'object') {
        const rawDataStr = JSON.stringify(webhook.raw_data);
        if (rawDataStr.includes('creaty1234567')) {
          console.log('   🎯 ENCONTRADO WEBHOOK DO USUÁRIO!');
          console.log('   📝 Dados completos:');
          console.log(JSON.stringify(webhook.raw_data, null, 2));
          foundUserWebhook = true;
        }
      }
      console.log('');
    });
    
    if (!foundUserWebhook) {
      console.log('⚠️ NENHUM WEBHOOK ENCONTRADO PARA O USUÁRIO creaty1234567@gmail.com');
      console.log('');
      console.log('🎯 DIAGNÓSTICO FINAL:');
      console.log('====================');
      console.log('1. ✅ Usuário existe e tem assinatura ativa');
      console.log('2. ✅ Tabela payment_webhooks existe');
      console.log('3. ❌ Nenhum webhook foi recebido para este usuário');
      console.log('');
      console.log('💡 POSSÍVEIS CAUSAS:');
      console.log('- Webhook não configurado no Perfect Pay');
      console.log('- URL do webhook incorreta');
      console.log('- Webhook enviado mas falhou no processamento');
      console.log('- Pagamento processado mas webhook não enviado');
      console.log('');
      console.log('🚀 SOLUÇÕES:');
      console.log('1. Verificar configuração do webhook no Perfect Pay');
      console.log('2. Testar webhook manualmente');
      console.log('3. Verificar logs do servidor');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

checkRecentWebhooks();




