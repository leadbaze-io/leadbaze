const PerfectPayService = require('./services/perfectPayService');

// Webhook real do Perfect Pay
const realWebhook = {
  "token": "5550029d92c8e727464111a087b6d903",
  "code": "PPCPMTB5H3745O",
  "sale_amount": 5,
  "currency_enum": 1,
  "currency_enum_key": "BRL",
  "coupon_code": null,
  "installments": 1,
  "installment_amount": 5,
  "shipping_type_enum": null,
  "shipping_type_enum_key": null,
  "shipping_amount": null,
  "payment_method_enum": 6,
  "payment_method_enum_key": "master",
  "payment_type_enum": 1,
  "payment_type_enum_key": "credit_card",
  "payment_format_enum": 1,
  "payment_format_enum_key": "regular",
  "original_code": null,
  "billet_url": "",
  "billet_number": null,
  "billet_expiration": null,
  "quantity": 1,
  "sale_status_enum": 2,
  "sale_status_enum_key": "approved",
  "sale_status_detail": "approved",
  "date_created": "2025-09-25 00:30:20",
  "date_approved": "2025-09-25 00:30:20",
  "tracking": null,
  "url_tracking": null,
  "checkout_type_enum": "regular",
  "academy_access_url": null,
  "product": {
    "code": "PPPBDC49",
    "name": "LeadBaze",
    "external_reference": null,
    "guarantee": 7
  },
  "plan": {
    "code": "PPLQQNGCL",
    "name": "LeadBaze Teste",
    "quantity": 1,
    "tax_code": null
  },
  "plan_itens": [],
  "customer": {
    "customer_type_enum": 1,
    "customer_type_enum_key": "percent",
    "full_name": "Jean Lopes",
    "email": "creaty123456@gmail.com",
    "identification_type": "CPF",
    "identification_number": "11215289618",
    "birthday": "1991-11-12",
    "date_birth": "1991-11-12",
    "phone_extension": "55",
    "phone_area_code": "31",
    "phone_number": "983323121",
    "phone_formated": "(31) 98332-3121",
    "phone_formated_ddi": "55(31) 98332-3121",
    "ip": "2804:214:c003:ca1:b453:55f1:aad7:c837",
    "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
    "street_name": "",
    "street_number": "",
    "district": "",
    "complement": "",
    "zip_code": "",
    "city": "",
    "state": "",
    "country": "BR"
  },
  "metadata": {
    "src": null,
    "sck": null,
    "utm_source": null,
    "utm_medium": null,
    "utm_campaign": null,
    "utm_content": null,
    "utm_term": null,
    "ttclid": null,
    "ref": "PPA23BQQ"
  },
  "subscription": {
    "code": "PPSUB1O91FP1I",
    "charges_made": 1,
    "next_charge_date": "2025-10-24T03:00:00.000000Z",
    "subscription_status_enum": 2,
    "status": "active",
    "status_event": "subscription_started"
  },
  "webhook_owner": "PPA23BQQ",
  "commission": [
    {
      "affiliation_code": "PPA23BQQ",
      "affiliation_type_enum": 1,
      "affiliation_type_enum_key": "producer",
      "name": "DVE Marketing",
      "email": "dvemarketingadm@gmail.com",
      "identification_number": "",
      "commission_amount": 3.6,
      "currency_enum": 1,
      "currency_enum_key": "BRL"
    },
    {
      "name": "PerfectPay",
      "commission_amount": 1.4,
      "affiliation_type_enum": 0
    }
  ],
  "url_send_webhook_pay": "https://leadbaze.io/api/perfect-pay/webhook"
};

async function testUpdatedWebhook() {
  console.log('🧪 [TESTE] ===== TESTANDO WEBHOOK COM CÓDIGO ATUALIZADO =====');
  
  const perfectPayService = new PerfectPayService();
  
  try {
    const result = await perfectPayService.processWebhook(realWebhook);
    
    console.log('✅ [TESTE] Resultado:', result);
    
    if (result.processed) {
      console.log('🎉 [TESTE] WEBHOOK PROCESSADO COM SUCESSO!');
      console.log('✅ [TESTE] Assinatura criada para o usuário!');
    } else {
      console.log('❌ [TESTE] Erro no processamento:', result.error);
    }
    
  } catch (error) {
    console.log('❌ [TESTE] Erro inesperado:', error.message);
  }
}

testUpdatedWebhook().catch(console.error);








