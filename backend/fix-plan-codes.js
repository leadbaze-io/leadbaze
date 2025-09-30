#!/usr/bin/env node
require('dotenv').config({ path: './config.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function updatePlanCodes() {
  console.log('🔧 CORRIGINDO CÓDIGOS PERFECT PAY');
  console.log('=================================');
  
  try {
    // Atualizar códigos dos planos
    const updates = [
      {
        id: '460a8b88-f828-4b18-9d42-4b8ad5333d61', // Start
        codigo_perfect_pay: 'PPLQQNGCO'
      },
      {
        id: 'e9004fad-85ab-41b8-9416-477e41e8bcc9', // Scale
        codigo_perfect_pay: 'PPLQQNGCM'
      },
      {
        id: 'a961e361-75d0-40cf-9461-62a7802a1948', // Enterprise
        codigo_perfect_pay: 'PPLQQNGCN'
      }
    ];
    
    for (const update of updates) {
      const { error } = await supabase
        .from('payment_plans')
        .update({ codigo_perfect_pay: update.codigo_perfect_pay })
        .eq('id', update.id);
        
      if (error) {
        console.log(`❌ Erro ao atualizar plano ${update.id}:`, error.message);
      } else {
        console.log(`✅ Plano ${update.id} atualizado com código ${update.codigo_perfect_pay}`);
      }
    }
    
    console.log('');
    console.log('🔍 Verificando atualização...');
    
    const { data: plans, error } = await supabase
      .from('payment_plans')
      .select('*')
      .order('price_cents', { ascending: true });
      
    if (error) {
      console.log('❌ Erro ao verificar:', error.message);
      return;
    }
    
    console.log('📦 Planos atualizados:');
    plans.forEach(plan => {
      console.log(`   - ${plan.display_name}: ${plan.codigo_perfect_pay}`);
    });
    
    console.log('');
    console.log('🎯 PRÓXIMO PASSO:');
    console.log('Agora vamos reprocessar o webhook que falhou');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

updatePlanCodes();



