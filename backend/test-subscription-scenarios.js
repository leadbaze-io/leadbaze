const PerfectPayService = require('./services/perfectPayService');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

const perfectPayService = new PerfectPayService(supabase);

async function testSubscriptionScenarios() {
  console.log('🧪 [TESTE] ===== TESTANDO CENÁRIOS DE ASSINATURA =====\n');

  try {
    // Buscar usuário real
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    if (usersError || !users.users || users.users.length === 0) {
      console.error('❌ [TESTE] Erro ao buscar usuários:', usersError?.message);
      return;
    }
    const realUser = users.users[0];
    console.log('✅ [TESTE] Usuário real encontrado:', realUser.email);

    // TESTE 1: Renovação de Assinatura
    console.log('\n📋 [TESTE 1] Testando renovação de assinatura...');
    const renewalWebhook = {
      "token": "5550029d92c8e727464111a087b6d903",
      "code": "PPCPMTB5H3745O",
      "sale_amount": 5,
      "sale_status_enum": 2, // approved
      "sale_status_detail": "approved",
      "date_created": new Date().toISOString(),
      "date_approved": new Date().toISOString(),
      "product": {
        "name": "LeadBaze",
        "external_reference": null
      },
      "plan": {
        "name": "LeadBaze Start",
        "quantity": 1
      },
      "customer": {
        "email": realUser.email,
        "full_name": "Usuário Teste"
      },
      "subscription": {
        "code": "PPSUB1O91FP1I",
        "charges_made": 2, // Segunda cobrança (renovação)
        "next_charge_date": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        "subscription_status_enum": 2,
        "status": "active",
        "status_event": "subscription_renewed" // Evento de renovação
      }
    };

    const renewalResult = await perfectPayService.processWebhook(renewalWebhook);
    console.log('📊 [TESTE 1] Resultado da renovação:', renewalResult.processed ? '✅ Sucesso' : '❌ Falhou');
    if (renewalResult.processed) {
      console.log('  - Leads restantes:', renewalResult.leads_remaining);
      console.log('  - Acesso até:', renewalResult.access_until);
    }

    // TESTE 2: Cancelamento pelo Perfect Pay
    console.log('\n📋 [TESTE 2] Testando cancelamento pelo Perfect Pay...');
    const cancellationWebhook = {
      "token": "5550029d92c8e727464111a087b6d903",
      "code": "PPCPMTB5H3745O",
      "sale_amount": 5,
      "sale_status_enum": 6, // cancelled
      "sale_status_detail": "cancelled",
      "date_created": new Date().toISOString(),
      "product": {
        "name": "LeadBaze",
        "external_reference": null
      },
      "plan": {
        "name": "LeadBaze Start",
        "quantity": 1
      },
      "customer": {
        "email": realUser.email,
        "full_name": "Usuário Teste"
      },
      "subscription": {
        "code": "PPSUB1O91FP1I",
        "charges_made": 1,
        "subscription_status_enum": 6,
        "status": "cancelled",
        "status_event": "subscription_cancelled" // Evento de cancelamento
      }
    };

    const cancellationResult = await perfectPayService.processWebhook(cancellationWebhook);
    console.log('📊 [TESTE 2] Resultado do cancelamento:', cancellationResult.processed ? '✅ Sucesso' : '❌ Falhou');
    if (cancellationResult.processed) {
      console.log('  - Acesso até:', cancellationResult.access_until);
      console.log('  - Leads restantes:', cancellationResult.leads_remaining);
    }

    // TESTE 3: Pagamento Recusado
    console.log('\n📋 [TESTE 3] Testando pagamento recusado...');
    const rejectedWebhook = {
      "token": "5550029d92c8e727464111a087b6d903",
      "code": "PPCPMTB5H3745O",
      "sale_amount": 5,
      "sale_status_enum": 5, // rejected
      "sale_status_detail": "rejected",
      "date_created": new Date().toISOString(),
      "product": {
        "name": "LeadBaze",
        "external_reference": null
      },
      "plan": {
        "name": "LeadBaze Start",
        "quantity": 1
      },
      "customer": {
        "email": realUser.email,
        "full_name": "Usuário Teste"
      },
      "subscription": {
        "code": "PPSUB1O91FP1I",
        "charges_made": 1,
        "subscription_status_enum": 5,
        "status": "suspended",
        "status_event": "subscription_failed" // Evento de falha
      }
    };

    const rejectedResult = await perfectPayService.processWebhook(rejectedWebhook);
    console.log('📊 [TESTE 3] Resultado do pagamento recusado:', rejectedResult.processed ? '✅ Sucesso' : '❌ Falhou');
    if (rejectedResult.processed) {
      console.log('  - Status:', rejectedResult.subscription?.status);
    }

    console.log('\n🎯 [TESTE] ===== RESUMO DOS CENÁRIOS =====');
    console.log('✅ [TESTE] Renovação de assinatura:', renewalResult.processed ? 'Funcionando' : 'Com problemas');
    console.log('✅ [TESTE] Cancelamento pelo Perfect Pay:', cancellationResult.processed ? 'Funcionando' : 'Com problemas');
    console.log('✅ [TESTE] Pagamento recusado:', rejectedResult.processed ? 'Funcionando' : 'Com problemas');

  } catch (error) {
    console.error('❌ [TESTE] Erro inesperado:', error.message);
  }
}

testSubscriptionScenarios().catch(console.error);










