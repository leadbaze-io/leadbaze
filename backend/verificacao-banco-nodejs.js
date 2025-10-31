// =====================================================
// VERIFICAÇÃO COMPLETA PERFECT PAY - NODE.JS
// =====================================================
// Este script verifica o banco de dados usando Node.js
// sem precisar do psql
// =====================================================

const { createClient } = require('@supabase/supabase-js');

// Configurações
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const TEST_USER_ID = '66875e05-eace-49ac-bf07-0e794dbab8fd';

async function verificarBancoCompleto() {
  console.log('🚀 VERIFICAÇÃO COMPLETA PERFECT PAY - BANCO DE DADOS');
  console.log('=====================================================');
  console.log(`Usuário de teste: ${TEST_USER_ID}`);
  console.log('');

  try {
    // =====================================================
    // 1. VERIFICAR TABELAS ESSENCIAIS
    // =====================================================
    console.log('1️⃣ VERIFICANDO TABELAS ESSENCIAIS');
    console.log('================================');
    
    const tables = [
      'user_payment_subscriptions',
      'lead_packages', 
      'payment_transactions',
      'subscription_plans'
    ];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
          
        if (error) {
          console.log(`❌ Tabela ${table}: ${error.message}`);
        } else {
          console.log(`✅ Tabela ${table}: EXISTE`);
        }
      } catch (err) {
        console.log(`❌ Tabela ${table}: ${err.message}`);
      }
    }
    
    // =====================================================
    // 2. VERIFICAR PLANOS DE ASSINATURA
    // =====================================================
    console.log('');
    console.log('2️⃣ VERIFICANDO PLANOS DE ASSINATURA');
    console.log('===================================');
    
    try {
      // Tentar buscar planos sem filtro de 'active'
      const { data: plans, error } = await supabase
        .from('subscription_plans')
        .select('*');
        
      if (error) {
        console.log(`❌ Erro ao buscar planos: ${error.message}`);
      } else {
        console.log(`✅ Planos encontrados: ${plans.length}`);
        plans.forEach(plan => {
          console.log(`   📋 ${plan.name}: R$ ${(plan.price_cents / 100).toFixed(2)} (${plan.leads} leads)`);
          console.log(`      Código Perfect Pay: ${plan.perfect_pay_code || 'N/A'}`);
        });
      }
    } catch (err) {
      console.log(`❌ Erro nos planos: ${err.message}`);
    }
    
    // =====================================================
    // 3. VERIFICAR PACOTES DE LEADS
    // =====================================================
    console.log('');
    console.log('3️⃣ VERIFICANDO PACOTES DE LEADS');
    console.log('===============================');
    
    try {
      const { data: packages, error } = await supabase
        .from('lead_packages')
        .select('*');
        
      if (error) {
        console.log(`❌ Erro ao buscar pacotes: ${error.message}`);
      } else {
        console.log(`✅ Pacotes encontrados: ${packages.length}`);
        packages.forEach(pkg => {
          console.log(`   📦 ${pkg.name}: R$ ${(pkg.price_cents / 100).toFixed(2)} (${pkg.leads} leads)`);
          console.log(`      Código Perfect Pay: ${pkg.perfect_pay_code || 'N/A'}`);
        });
      }
    } catch (err) {
      console.log(`❌ Erro nos pacotes: ${err.message}`);
    }
    
    // =====================================================
    // 4. VERIFICAR ASSINATURAS ATIVAS
    // =====================================================
    console.log('');
    console.log('4️⃣ VERIFICANDO ASSINATURAS ATIVAS');
    console.log('==================================');
    
    try {
      const { data: subscriptions, error } = await supabase
        .from('user_payment_subscriptions')
        .select('*')
        .eq('status', 'active');
        
      if (error) {
        console.log(`❌ Erro ao buscar assinaturas: ${error.message}`);
      } else {
        console.log(`✅ Assinaturas ativas encontradas: ${subscriptions.length}`);
        subscriptions.forEach(sub => {
          console.log(`   👤 Usuário: ${sub.user_id}`);
          console.log(`      Plano: ${sub.plan_name || 'N/A'}`);
          console.log(`      Status: ${sub.status}`);
          console.log(`      Leads disponíveis: ${sub.leads_balance}`);
          console.log(`      Próxima cobrança: ${sub.next_billing_date || 'N/A'}`);
          console.log('');
        });
      }
    } catch (err) {
      console.log(`❌ Erro nas assinaturas: ${err.message}`);
    }
    
    // =====================================================
    // 5. VERIFICAR TRANSAÇÕES RECENTES
    // =====================================================
    console.log('');
    console.log('5️⃣ VERIFICANDO TRANSAÇÕES RECENTES');
    console.log('===================================');
    
    try {
      const { data: transactions, error } = await supabase
        .from('payment_transactions')
        .select('*')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(5);
        
      if (error) {
        console.log(`❌ Erro ao buscar transações: ${error.message}`);
      } else {
        console.log(`✅ Transações encontradas (últimos 7 dias): ${transactions.length}`);
        transactions.forEach(tx => {
          console.log(`   💰 ID: ${tx.transaction_id}`);
          console.log(`      Usuário: ${tx.user_id}`);
          console.log(`      Valor: R$ ${(tx.amount_cents / 100).toFixed(2)}`);
          console.log(`      Status: ${tx.status}`);
          console.log(`      Tipo: ${tx.transaction_type}`);
          console.log(`      Data: ${tx.created_at}`);
          console.log('');
        });
      }
    } catch (err) {
      console.log(`❌ Erro nas transações: ${err.message}`);
    }
    
    // =====================================================
    // 6. VERIFICAR USUÁRIO DE TESTE ESPECÍFICO
    // =====================================================
    console.log('');
    console.log('6️⃣ VERIFICANDO USUÁRIO DE TESTE');
    console.log('===============================');
    
    try {
      // Verificar se usuário existe
      const { data: user, error: userError } = await supabase.auth.admin.getUserById(TEST_USER_ID);
      
      if (userError) {
        console.log(`❌ Usuário de teste não encontrado: ${userError.message}`);
      } else {
        console.log(`✅ Usuário de teste encontrado: ${user.user.email}`);
        
        // Verificar assinatura específica
        const { data: userSubscription, error: subError } = await supabase
          .from('user_payment_subscriptions')
          .select('*')
          .eq('user_id', TEST_USER_ID)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
          
        if (subError && subError.code !== 'PGRST116') {
          console.log(`❌ Erro ao buscar assinatura: ${subError.message}`);
        } else if (userSubscription) {
          console.log('📋 Assinatura do usuário de teste:');
          console.log(`   Plano: ${userSubscription.plan_name || 'N/A'}`);
          console.log(`   Status: ${userSubscription.status}`);
          console.log(`   Leads disponíveis: ${userSubscription.leads_balance}`);
          console.log(`   Próxima cobrança: ${userSubscription.next_billing_date || 'N/A'}`);
          console.log(`   Criada em: ${userSubscription.created_at}`);
        } else {
          console.log('ℹ️ Usuário de teste não possui assinatura');
        }
      }
    } catch (err) {
      console.log(`❌ Erro no usuário de teste: ${err.message}`);
    }
    
    // =====================================================
    // 7. RESUMO FINAL
    // =====================================================
    console.log('');
    console.log('7️⃣ RESUMO FINAL');
    console.log('===============');
    console.log('✅ VERIFICAÇÃO COMPLETA FINALIZADA');
    console.log('=====================================================');
    console.log('');
    console.log('📊 PRÓXIMOS PASSOS:');
    console.log('1. Se algum teste falhou, verifique os logs acima');
    console.log('2. Teste manualmente a compra de pacotes');
    console.log('3. Verifique se os webhooks estão funcionando');
    console.log('4. Documente qualquer problema encontrado');
    
  } catch (error) {
    console.log(`❌ ERRO GERAL: ${error.message}`);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  verificarBancoCompleto().catch(console.error);
}

module.exports = { verificarBancoCompleto };
















