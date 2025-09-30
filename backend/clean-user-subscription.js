#!/usr/bin/env node
require('dotenv').config({ path: './config.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const userId = '66875e05-eace-49ac-bf07-0e794dbab8fd';

async function cleanUserSubscription() {
  console.log('🧹 ===== LIMPANDO ASSINATURA DO USUÁRIO =====\n');
  console.log(`👤 Usuário ID: ${userId}\n`);
  
  try {
    // 1. Verificar assinaturas existentes
    console.log('1️⃣ Verificando assinaturas existentes...');
    const { data: subscriptions, error: subError } = await supabase
      .from('user_payment_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (subError) {
      console.log('❌ Erro ao buscar assinaturas:', subError.message);
      return;
    }
    
    console.log(`📊 Assinaturas encontradas: ${subscriptions.length}`);
    
    if (subscriptions.length === 0) {
      console.log('✅ Nenhuma assinatura encontrada para este usuário');
      return;
    }
    
    // Mostrar detalhes das assinaturas
    subscriptions.forEach((sub, index) => {
      console.log(`   ${index + 1}. Status: ${sub.status}`);
      console.log(`      Plano: ${sub.plan_name || 'N/A'}`);
      console.log(`      Leads: ${sub.leads_balance || 0}`);
      console.log(`      Criado: ${sub.created_at}`);
      console.log(`      Transaction ID: ${sub.perfect_pay_transaction_id || 'N/A'}`);
      console.log('');
    });
    
    // 2. Confirmar limpeza
    console.log('2️⃣ Iniciando limpeza das assinaturas...');
    
    // Deletar todas as assinaturas do usuário
    const { error: deleteError } = await supabase
      .from('user_payment_subscriptions')
      .delete()
      .eq('user_id', userId);
    
    if (deleteError) {
      console.log('❌ Erro ao deletar assinaturas:', deleteError.message);
      return;
    }
    
    console.log('✅ Assinaturas deletadas com sucesso!');
    
    // 3. Verificar resultado final
    console.log('\n3️⃣ Verificando resultado final...');
    const { data: remainingSubs, error: checkError } = await supabase
      .from('user_payment_subscriptions')
      .select('id')
      .eq('user_id', userId);
    
    if (checkError) {
      console.log('❌ Erro ao verificar:', checkError.message);
      return;
    }
    
    console.log(`📊 Assinaturas restantes: ${remainingSubs.length}`);
    
    if (remainingSubs.length === 0) {
      console.log('🎉 LIMPEZA CONCLUÍDA COM SUCESSO!');
      console.log('✅ Nenhuma assinatura restante para este usuário');
    } else {
      console.log('⚠️ Ainda existem assinaturas para este usuário');
    }
    
  } catch (err) {
    console.error('❌ Erro geral:', err.message);
  }
}

// Executar a função
cleanUserSubscription();


