const PerfectPayService = require('./services/perfectPayService');

// Webhook com email inexistente
const webhookWithUnknownEmail = {
  "token": "5550029d92c8e727464111a087b6d903",
  "code": "PPCPMTB5H3745O",
  "sale_amount": 5,
  "currency_enum": 1,
  "currency_enum_key": "BRL",
  "sale_status_enum": 2,
  "sale_status_enum_key": "approved",
  "sale_status_detail": "approved",
  "date_created": "2025-09-25 00:30:20",
  "date_approved": "2025-09-25 00:30:20",
  "product": {
    "code": "PPPBDC49",
    "name": "LeadBaze",
    "external_reference": null, // Simula problema
    "guarantee": 7
  },
  "plan": {
    "code": "PPLQQNGCL",
    "name": "LeadBaze Teste",
    "quantity": 1
  },
  "customer": {
    "customer_type_enum": 1,
    "full_name": "Usuário Teste",
    "email": "emailinexistente@teste.com", // Email que não existe
    "identification_type": "CPF",
    "identification_number": "12345678901"
  },
  "subscription": {
    "code": "PPSUB1O91FP1I",
    "charges_made": 1,
    "next_charge_date": "2025-10-24T03:00:00.000000Z",
    "subscription_status_enum": 2,
    "status": "active",
    "status_event": "subscription_started"
  }
};

async function testEmailNotFound() {
  console.log('🧪 [TESTE] ===== TESTANDO EMAIL INEXISTENTE =====');
  console.log('📧 [TESTE] Email testado:', webhookWithUnknownEmail.customer.email);
  
  const perfectPayService = new PerfectPayService();
  
  try {
    const result = await perfectPayService.processWebhook(webhookWithUnknownEmail);
    
    console.log('📊 [TESTE] Resultado:', result);
    
    if (result.processed) {
      console.log('❌ [TESTE] PROBLEMA: Webhook foi processado mesmo com email inexistente!');
    } else {
      console.log('✅ [TESTE] CORRETO: Webhook rejeitado por email inexistente');
      console.log('🔍 [TESTE] Erro:', result.error);
    }
    
  } catch (error) {
    console.log('❌ [TESTE] Erro inesperado:', error.message);
  }
  
  console.log('\n🎯 [TESTE] ===== CONCLUSÃO =====');
  console.log('✅ [TESTE] Sistema deve rejeitar emails inexistentes');
  console.log('❌ [TESTE] Sistema não deve criar assinaturas para emails inválidos');
}

testEmailNotFound().catch(console.error);








