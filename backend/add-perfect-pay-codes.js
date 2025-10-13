#!/usr/bin/env node
require('dotenv').config({ path: './config.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function addPerfectPayCodes() {
  console.log('🔧 ADICIONANDO CÓDIGOS PERFECT PAY');
  console.log('=================================');
  
  try {
    // Adicionar coluna se não existir
    console.log('1️⃣ Adicionando coluna codigo_perfect_pay...');
    const { error: alterError } = await supabase.rpc('exec_sql', {
      query: 'ALTER TABLE payment_plans ADD COLUMN IF NOT EXISTS codigo_perfect_pay VARCHAR(50);'
    });
    
    if (alterError) {
      console.log('⚠️ Erro ao adicionar coluna (pode já existir):', alterError.message);
    } else {
      console.log('✅ Coluna adicionada com sucesso');
    }
    
    // Atualizar códigos dos planos
    console.log('');
    console.log('2️⃣ Atualizando códigos dos planos...');
    
    const updates = [
      { name: 'start', codigo: 'PPLQQNGCO' },
      { name: 'scale', codigo: 'PPLQQNGCM' },
      { name: 'enterprise', codigo: 'PPLQQNGCN' }
    ];
    
    for (const update of updates) {
      const { error } = await supabase
        .from('payment_plans')
        .update({ codigo_perfect_pay: update.codigo })
        .eq('name', update.name);
        
      if (error) {
        console.log(`❌ Erro ao atualizar ${update.name}:`, error.message);
      } else {
        console.log(`✅ ${update.name} atualizado com código ${update.codigo}`);
      }
    }
    
    // Verificar atualização
    console.log('');
    console.log('3️⃣ Verificando atualização...');
    
    const { data: plans, error } = await supabase
      .from('payment_plans')
      .select('name, display_name, codigo_perfect_pay, price_cents, leads_included')
      .order('price_cents', { ascending: true });
      
    if (error) {
      console.log('❌ Erro ao verificar:', error.message);
      return;
    }
    
    console.log('📦 Planos atualizados:');
    plans.forEach(plan => {
      console.log(`   - ${plan.display_name}: ${plan.codigo_perfect_pay} (R$ ${(plan.price_cents / 100).toFixed(2)})`);
    });
    
    console.log('');
    console.log('🎯 PRÓXIMO PASSO:');
    console.log('Agora vamos reprocessar o webhook que falhou');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

addPerfectPayCodes();







