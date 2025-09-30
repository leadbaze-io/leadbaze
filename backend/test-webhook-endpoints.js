/**
 * TESTE DE WEBHOOKS PERFECT PAY VIA HTTP
 * Testa todos os cenários via endpoint HTTP
 */

const https = require('http');

class WebhookEndpointTester {
  constructor() {
    this.baseUrl = 'http://localhost:3001';
  }

  /**
   * Enviar webhook para o endpoint
   */
  async sendWebhook(webhookData, testName) {
    return new Promise((resolve, reject) => {
      const postData = JSON.stringify(webhookData);
      
      const options = {
        hostname: 'localhost',
        port: 3001,
        path: '/api/perfect-pay/webhook',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            resolve({ testName, response, statusCode: res.statusCode });
          } catch (error) {
            resolve({ testName, response: data, statusCode: res.statusCode, parseError: error.message });
          }
        });
      });

      req.on('error', (error) => {
        reject({ testName, error: error.message });
      });

      req.write(postData);
      req.end();
    });
  }

  /**
   * Teste 1: Nova Assinatura Aprovada
   */
  async testNewSubscriptionApproved() {
    console.log('🧪 [TESTE] ===== NOVA ASSINATURA APROVADA =====');
    
    const webhookData = {
      token: "7378fa24f96b38a3b1805d7a6887bc82",
      code: "PPCPMTB58MNF4E",
      sale_amount: 97.00,
      currency_enum: 1,
      sale_status_enum: 2, // approved
      sale_status_detail: "payment_approved",
      date_created: "2025-09-24 18:10:00",
      date_approved: "2025-09-24 18:10:30",
      product: {
        code: "PPPB3A07",
        name: "LeadBaze Subscription",
        external_reference: "new-subscription-c7f5c454-36fb-4a39-8460-620a09169f50-1",
        guarantee: 30
      },
      plan: {
        code: "PPLQQ9Q9R",
        name: "Plano Start - 1000 leads",
        quantity: 1
      },
      customer: {
        customer_type_enum: 1,
        full_name: "João Silva Teste",
        email: "joao.teste@email.com",
        identification_type: "CPF",
        identification_number: "12345678901"
      }
    };

    return await this.sendWebhook(webhookData, 'Nova Assinatura Aprovada');
  }

  /**
   * Teste 2: Renovação de Assinatura
   */
  async testSubscriptionRenewal() {
    console.log('🧪 [TESTE] ===== RENOVAÇÃO DE ASSINATURA =====');
    
    const webhookData = {
      token: "7378fa24f96b38a3b1805d7a6887bc83",
      code: "PPCPMTB58MNF5E",
      sale_amount: 97.00,
      currency_enum: 1,
      sale_status_enum: 2, // approved
      sale_status_detail: "renewal_payment_approved",
      date_created: "2025-09-24 18:11:00",
      date_approved: "2025-09-24 18:11:30",
      product: {
        code: "PPPB3A07",
        name: "LeadBaze Subscription",
        external_reference: "renewal-c7f5c454-36fb-4a39-8460-620a09169f50-1",
        guarantee: 30
      },
      plan: {
        code: "PPLQQ9Q9R",
        name: "Plano Start - 1000 leads",
        quantity: 1
      },
      customer: {
        customer_type_enum: 1,
        full_name: "João Silva Teste",
        email: "joao.teste@email.com",
        identification_type: "CPF",
        identification_number: "12345678901"
      }
    };

    return await this.sendWebhook(webhookData, 'Renovação de Assinatura');
  }

  /**
   * Teste 3: Assinatura Pendente (Boleto)
   */
  async testSubscriptionPending() {
    console.log('🧪 [TESTE] ===== ASSINATURA PENDENTE (BOLETO) =====');
    
    const webhookData = {
      token: "7378fa24f96b38a3b1805d7a6887bc84",
      code: "PPCPMTB58MNF6E",
      sale_amount: 97.00,
      currency_enum: 1,
      sale_status_enum: 1, // pending
      sale_status_detail: "boleto_pending",
      date_created: "2025-09-24 18:12:00",
      date_approved: null,
      billet_url: "https://perfectpay.com.br/boleto/123456",
      billet_number: "12345678901234567890123456789012345678901234",
      billet_expiration: "2025-09-27 18:12:00",
      product: {
        code: "PPPB3A07",
        name: "LeadBaze Subscription",
        external_reference: "new-subscription-c7f5c454-36fb-4a39-8460-620a09169f50-1",
        guarantee: 30
      },
      plan: {
        code: "PPLQQ9Q9R",
        name: "Plano Start - 1000 leads",
        quantity: 1
      },
      customer: {
        customer_type_enum: 1,
        full_name: "João Silva Teste",
        email: "joao.teste@email.com",
        identification_type: "CPF",
        identification_number: "12345678901"
      }
    };

    return await this.sendWebhook(webhookData, 'Assinatura Pendente');
  }

  /**
   * Teste 4: Assinatura Rejeitada
   */
  async testSubscriptionRejected() {
    console.log('🧪 [TESTE] ===== ASSINATURA REJEITADA =====');
    
    const webhookData = {
      token: "7378fa24f96b38a3b1805d7a6887bc85",
      code: "PPCPMTB58MNF7E",
      sale_amount: 97.00,
      currency_enum: 1,
      sale_status_enum: 5, // rejected
      sale_status_detail: "payment_rejected",
      date_created: "2025-09-24 18:13:00",
      date_approved: null,
      product: {
        code: "PPPB3A07",
        name: "LeadBaze Subscription",
        external_reference: "new-subscription-c7f5c454-36fb-4a39-8460-620a09169f50-1",
        guarantee: 30
      },
      plan: {
        code: "PPLQQ9Q9R",
        name: "Plano Start - 1000 leads",
        quantity: 1
      },
      customer: {
        customer_type_enum: 1,
        full_name: "João Silva Teste",
        email: "joao.teste@email.com",
        identification_type: "CPF",
        identification_number: "12345678901"
      }
    };

    return await this.sendWebhook(webhookData, 'Assinatura Rejeitada');
  }

  /**
   * Teste 5: Assinatura Cancelada
   */
  async testSubscriptionCancelled() {
    console.log('🧪 [TESTE] ===== ASSINATURA CANCELADA =====');
    
    const webhookData = {
      token: "7378fa24f96b38a3b1805d7a6887bc86",
      code: "PPCPMTB58MNF8E",
      sale_amount: 97.00,
      currency_enum: 1,
      sale_status_enum: 6, // cancelled
      sale_status_detail: "subscription_cancelled",
      date_created: "2025-09-24 18:14:00",
      date_approved: null,
      product: {
        code: "PPPB3A07",
        name: "LeadBaze Subscription",
        external_reference: "cancellation-c7f5c454-36fb-4a39-8460-620a09169f50-1",
        guarantee: 30
      },
      plan: {
        code: "PPLQQ9Q9R",
        name: "Plano Start - 1000 leads",
        quantity: 1
      },
      customer: {
        customer_type_enum: 1,
        full_name: "João Silva Teste",
        email: "joao.teste@email.com",
        identification_type: "CPF",
        identification_number: "12345678901"
      }
    };

    return await this.sendWebhook(webhookData, 'Assinatura Cancelada');
  }

  /**
   * Executar todos os testes
   */
  async runAllTests() {
    console.log('🚀 [TESTE] ===== INICIANDO TESTES COMPLETOS PERFECT PAY =====');
    console.log('🚀 [TESTE] Data:', new Date().toISOString());
    console.log('🚀 [TESTE] =================================================');

    const results = [];

    // Teste 1: Nova Assinatura
    results.push(await this.testNewSubscriptionApproved());
    console.log('');

    // Teste 2: Renovação
    results.push(await this.testSubscriptionRenewal());
    console.log('');

    // Teste 3: Pendente
    results.push(await this.testSubscriptionPending());
    console.log('');

    // Teste 4: Rejeitada
    results.push(await this.testSubscriptionRejected());
    console.log('');

    // Teste 5: Cancelada
    results.push(await this.testSubscriptionCancelled());
    console.log('');

    // Resumo dos resultados
    console.log('📊 [TESTE] ===== RESUMO DOS TESTES =====');
    results.forEach((result) => {
      if (result.error) {
        console.log(`❌ [TESTE] ${result.testName}: ERRO - ${result.error}`);
      } else if (result.response.success) {
        console.log(`✅ [TESTE] ${result.testName}: SUCESSO - ${result.response.message}`);
        if (result.response.result) {
          console.log(`   📝 Resultado: ${JSON.stringify(result.response.result)}`);
        }
      } else {
        console.log(`⚠️ [TESTE] ${result.testName}: FALHA - ${result.response.message || 'Resposta inválida'}`);
      }
    });

    console.log('📊 [TESTE] ==============================');
    return results;
  }
}

// Executar testes se chamado diretamente
if (require.main === module) {
  const tester = new WebhookEndpointTester();
  tester.runAllTests()
    .then(() => {
      console.log('🎉 [TESTE] Testes concluídos!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 [TESTE] Erro fatal:', error);
      process.exit(1);
    });
}

module.exports = WebhookEndpointTester;










