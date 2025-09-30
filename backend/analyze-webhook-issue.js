require('dotenv').config({ path: './config.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function analyzeWebhookProcessingIssue() {
  console.log('🔍 ===== ANALISANDO PROBLEMA DE PROCESSAMENTO DE WEBHOOK =====\n');

  try {
    // 1. Buscar webhook não processado
    console.log('1️⃣ Buscando webhook não processado...');
    const { data: unprocessedWebhooks, error: unprocessedError } = await supabase
      .from('payment_webhooks')
      .select('*')
      .eq('processed', false)
      .order('created_at', { ascending: false });

    if (unprocessedError) {
      console.error('❌ Erro ao buscar webhooks não processados:', unprocessedError.message);
      return;
    }

    console.log(`📊 Webhooks não processados encontrados: ${unprocessedWebhooks.length}`);

    unprocessedWebhooks.forEach((webhook, index) => {
      console.log(`\n📋 Webhook Não Processado ${index + 1}:`);
      console.log(`   ID: ${webhook.id}`);
      console.log(`   Webhook Type: ${webhook.webhook_type}`);
      console.log(`   Action: ${webhook.action}`);
      console.log(`   Criado: ${webhook.created_at}`);
      console.log(`   Error Message: ${webhook.error_message || 'Nenhum'}`);
      
      if (webhook.raw_data) {
        const rawData = webhook.raw_data;
        console.log(`   Customer Email: ${rawData.customer?.email || 'N/A'}`);
        console.log(`   Transaction Code: ${rawData.code || 'N/A'}`);
        console.log(`   Sale Status: ${rawData.sale_status_detail || 'N/A'}`);
        console.log(`   Sale Amount: R$ ${rawData.sale_amount || 'N/A'}`);
        
        if (rawData.subscription) {
          console.log(`   Subscription Status: ${rawData.subscription.status || 'N/A'}`);
          console.log(`   Subscription Code: ${rawData.subscription.code || 'N/A'}`);
        }
      }
    });

    // 2. Verificar webhooks processados recentemente com erro
    console.log('\n2️⃣ Verificando webhooks processados com erro...');
    const { data: errorWebhooks, error: errorError } = await supabase
      .from('payment_webhooks')
      .select('*')
      .not('error_message', 'is', null)
      .order('created_at', { ascending: false })
      .limit(5);

    if (errorError) {
      console.error('❌ Erro ao buscar webhooks com erro:', errorError.message);
    } else {
      console.log(`📊 Webhooks com erro encontrados: ${errorWebhooks.length}`);
      errorWebhooks.forEach((webhook, index) => {
        console.log(`\n📋 Webhook com Erro ${index + 1}:`);
        console.log(`   ID: ${webhook.id}`);
        console.log(`   Criado: ${webhook.created_at}`);
        console.log(`   Processado: ${webhook.processed_at}`);
        console.log(`   Error: ${webhook.error_message}`);
        
        if (webhook.raw_data) {
          const rawData = webhook.raw_data;
          console.log(`   Customer Email: ${rawData.customer?.email || 'N/A'}`);
          console.log(`   Transaction Code: ${rawData.code || 'N/A'}`);
        }
      });
    }

    // 3. Verificar se há problemas com o processamento automático
    console.log('\n3️⃣ Verificando configuração do sistema...');
    
    // Verificar se há webhooks muito antigos não processados
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const { data: oldUnprocessed, error: oldError } = await supabase
      .from('payment_webhooks')
      .select('*')
      .eq('processed', false)
      .lt('created_at', oneWeekAgo.toISOString());

    if (oldError) {
      console.error('❌ Erro ao buscar webhooks antigos:', oldError.message);
    } else {
      console.log(`📊 Webhooks não processados há mais de 1 semana: ${oldUnprocessed.length}`);
      if (oldUnprocessed.length > 0) {
        console.log('⚠️ Há webhooks muito antigos não processados. Isso pode indicar:');
        console.log('   - Sistema de processamento automático não está funcionando');
        console.log('   - Erro no código de processamento');
        console.log('   - Problema de conectividade com Perfect Pay');
      }
    }

    // 4. Verificar webhooks do usuário específico
    console.log('\n4️⃣ Verificando webhooks do usuário específico...');
    const userEmail = 'mathewshq20@hotmail.com';
    
    const { data: userWebhooks, error: userError } = await supabase
      .from('payment_webhooks')
      .select('*')
      .contains('raw_data', { customer: { email: userEmail } })
      .order('created_at', { ascending: false });

    if (userError) {
      console.error('❌ Erro ao buscar webhooks do usuário:', userError.message);
    } else {
      console.log(`📊 Webhooks do usuário ${userEmail}: ${userWebhooks.length}`);
      userWebhooks.forEach((webhook, index) => {
        console.log(`\n📋 Webhook do Usuário ${index + 1}:`);
        console.log(`   ID: ${webhook.id}`);
        console.log(`   Processed: ${webhook.processed}`);
        console.log(`   Processed At: ${webhook.processed_at || 'Não processado'}`);
        console.log(`   Error: ${webhook.error_message || 'Nenhum'}`);
        console.log(`   Criado: ${webhook.created_at}`);
        
        if (webhook.raw_data) {
          const rawData = webhook.raw_data;
          console.log(`   Transaction Code: ${rawData.code}`);
          console.log(`   Sale Status: ${rawData.sale_status_detail}`);
          console.log(`   Sale Amount: R$ ${rawData.sale_amount}`);
        }
      });
    }

    // 5. Análise das possíveis causas
    console.log('\n5️⃣ Análise das possíveis causas:');
    console.log('🔍 Possíveis motivos para webhooks não processados:');
    console.log('   1. Sistema de processamento automático não está rodando');
    console.log('   2. Erro no código de processamento de webhooks');
    console.log('   3. Problema de mapeamento de planos (código Perfect Pay não encontrado)');
    console.log('   4. Problema de validação de dados do webhook');
    console.log('   5. Erro de conectividade com banco de dados durante processamento');
    console.log('   6. Webhook recebido antes do usuário estar cadastrado');
    console.log('   7. Problema de permissões ou autenticação');

    // 6. Verificar se há logs de erro no sistema
    console.log('\n6️⃣ Verificando padrões de erro...');
    const { data: allWebhooks, error: allError } = await supabase
      .from('payment_webhooks')
      .select('error_message, processed, created_at')
      .not('error_message', 'is', null)
      .order('created_at', { ascending: false })
      .limit(10);

    if (allError) {
      console.error('❌ Erro ao buscar padrões de erro:', allError.message);
    } else {
      console.log('📊 Padrões de erro encontrados:');
      const errorPatterns = {};
      allWebhooks.forEach(webhook => {
        const error = webhook.error_message;
        errorPatterns[error] = (errorPatterns[error] || 0) + 1;
      });
      
      Object.entries(errorPatterns).forEach(([error, count]) => {
        console.log(`   - "${error}": ${count} ocorrência(s)`);
      });
    }

  } catch (err) {
    console.error('❌ Erro inesperado durante a análise:', err.message);
  }
}

analyzeWebhookProcessingIssue();

