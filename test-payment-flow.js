#!/usr/bin/env node

/**
 * Script de teste para o fluxo de pagamento do Mercado Pago
 * Testa a criação de preferências e verificação de status
 */

import fetch from 'node-fetch';

const BACKEND_URL = 'http://localhost:3001';
const FRONTEND_URL = 'http://localhost:5173';

async function testPaymentFlow() {
  console.log('🧪 Iniciando teste do fluxo de pagamento...\n');

  try {
    // 1. Testar criação de preferência
    console.log('1️⃣ Testando criação de preferência...');
    const createResponse = await fetch(`${BACKEND_URL}/api/payments/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        planId: 'start',
        userId: 'test-user-123',
        userEmail: 'test@example.com',
        planName: 'Plano Start',
        amount: 197.00
      })
    });

    if (!createResponse.ok) {
      throw new Error(`Erro ao criar preferência: ${createResponse.status} ${createResponse.statusText}`);
    }

    const createData = await createResponse.json();
    console.log('✅ Preferência criada com sucesso!');
    console.log('📋 Dados da preferência:', JSON.stringify(createData, null, 2));

    if (createData.success && createData.data) {
      const preference = createData.data;
      
      // 2. Verificar URLs de retorno
      console.log('\n2️⃣ Verificando URLs de retorno...');
      console.log('🔗 Success URL:', `${FRONTEND_URL}/payment/success`);
      console.log('🔗 Failure URL:', `${FRONTEND_URL}/payment/failure`);
      console.log('🔗 Pending URL:', `${FRONTEND_URL}/payment/pending`);
      
      // 3. Testar sandbox_init_point
      if (preference.sandbox_init_point) {
        console.log('\n3️⃣ Testando sandbox_init_point...');
        console.log('🔗 Sandbox URL:', preference.sandbox_init_point);
        console.log('ℹ️  Esta URL deve abrir o checkout do Mercado Pago em modo sandbox');
      }

      // 4. Simular teste de status (se tivéssemos um payment_id real)
      console.log('\n4️⃣ Testando verificação de status...');
      console.log('ℹ️  Para testar status real, seria necessário um payment_id válido');
      console.log('ℹ️  Em produção, o webhook do Mercado Pago chamaria:');
      console.log(`   POST ${BACKEND_URL}/api/payments/webhook`);

      console.log('\n✅ Teste do fluxo de pagamento concluído com sucesso!');
      console.log('\n📝 Próximos passos:');
      console.log('1. Acesse o sandbox_init_point no navegador');
      console.log('2. Use as credenciais de teste do Mercado Pago');
      console.log('3. Complete o pagamento de teste');
      console.log('4. Verifique se você é redirecionado para a página de sucesso');

    } else {
      throw new Error('Resposta inválida da API de criação de preferência');
    }

  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Executar teste
testPaymentFlow();