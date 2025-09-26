require('dotenv').config({ path: './config.env' });
const PerfectPayService = require('./services/perfectPayService');

async function testCompletePlansLogic() {
    console.log('🧪 TESTANDO LÓGICA COMPLETA DOS PLANOS\n');

    const perfectPayService = new PerfectPayService();

    try {
        // Dados de teste
        const testUserId = '12345678-1234-1234-1234-123456789012';
        const startPlanId = '11111111-1111-1111-1111-111111111111';
        const scalePlanId = '22222222-2222-2222-2222-222222222222';

        // Simular dados de webhook
        const mockWebhookData = {
            transaction_id: 'test_transaction_123',
            status: 'approved',
            external_reference: '',
            amount: 49.90
        };

        console.log('📋 1. TESTANDO NOVA ASSINATURA:');
        console.log('=====================================');

        // Teste 1: Nova assinatura
        mockWebhookData.external_reference = `new_${testUserId}_${startPlanId}_${Date.now()}`;
        const result1 = await perfectPayService.processApprovedPayment(
            testUserId, startPlanId, 'new', mockWebhookData
        );
        console.log('✅ Resultado Nova Assinatura:', JSON.stringify(result1, null, 2));

        console.log('\n📋 2. TESTANDO RENOVAÇÃO:');
        console.log('=====================================');

        // Teste 2: Renovação
        mockWebhookData.external_reference = `renewal_${testUserId}_${startPlanId}_${Date.now()}`;
        const result2 = await perfectPayService.processApprovedPayment(
            testUserId, startPlanId, 'renewal', mockWebhookData
        );
        console.log('✅ Resultado Renovação:', JSON.stringify(result2, null, 2));

        console.log('\n📋 3. TESTANDO UPGRADE:');
        console.log('=====================================');

        // Teste 3: Upgrade
        mockWebhookData.external_reference = `upgrade_${testUserId}_${scalePlanId}_${Date.now()}`;
        const result3 = await perfectPayService.processApprovedPayment(
            testUserId, scalePlanId, 'upgrade', mockWebhookData
        );
        console.log('✅ Resultado Upgrade:', JSON.stringify(result3, null, 2));

        console.log('\n📋 4. TESTANDO DOWNGRADE:');
        console.log('=====================================');

        // Teste 4: Downgrade
        mockWebhookData.external_reference = `downgrade_${testUserId}_${startPlanId}_${Date.now()}`;
        const result4 = await perfectPayService.processApprovedPayment(
            testUserId, startPlanId, 'downgrade', mockWebhookData
        );
        console.log('✅ Resultado Downgrade:', JSON.stringify(result4, null, 2));

        console.log('\n📋 5. TESTANDO CANCELAMENTO:');
        console.log('=====================================');

        // Teste 5: Cancelamento
        const result5 = await perfectPayService.cancelSubscription(testUserId, 'test_cancellation');
        console.log('✅ Resultado Cancelamento:', JSON.stringify(result5, null, 2));

        console.log('\n📋 6. TESTANDO ELEGIBILIDADE REEMBOLSO:');
        console.log('=====================================');

        // Teste 6: Elegibilidade para reembolso
        const result6 = await perfectPayService.checkRefundEligibility(testUserId);
        console.log('✅ Resultado Elegibilidade:', JSON.stringify(result6, null, 2));

        console.log('\n🎉 TODOS OS TESTES CONCLUÍDOS!');
        console.log('=====================================');

        console.log('\n📊 RESUMO DOS TESTES:');
        console.log(`1. Nova Assinatura: ${result1.processed ? '✅' : '❌'}`);
        console.log(`2. Renovação: ${result2.processed ? '✅' : '❌'}`);
        console.log(`3. Upgrade: ${result3.processed ? '✅' : '❌'}`);
        console.log(`4. Downgrade: ${result4.processed ? '✅' : '❌'}`);
        console.log(`5. Cancelamento: ${result5.success ? '✅' : '❌'}`);
        console.log(`6. Elegibilidade: ${result6.eligible !== undefined ? '✅' : '❌'}`);

    } catch (error) {
        console.error('❌ Erro durante os testes:', error.message);
        console.error('Stack:', error.stack);
    }
}

// Executar testes
testCompletePlansLogic();





