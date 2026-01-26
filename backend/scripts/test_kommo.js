/**
 * Test script for Kommo CRM integration
 * Tests connection and lead creation with DVE Marketing account
 */

require('dotenv').config({ path: require('path').join(__dirname, '../config.env') });
const axios = require('axios');

const KOMMO_TOKEN = process.env.KOMMO_LONG_LIVED_TOKEN;
const KOMMO_SUBDOMAIN = process.env.KOMMO_SUBDOMAIN || 'dvemarketingadm';
const BASE_URL = `https://${KOMMO_SUBDOMAIN}.kommo.com/api/v4`;

async function testKommoIntegration() {
    try {
        console.log('🧪 Testando integração Kommo CRM...\n');

        // Test 1: Connection
        console.log('1️⃣ Testando conexão...');
        const accountResponse = await axios.get(`${BASE_URL}/account`, {
            headers: { 'Authorization': `Bearer ${KOMMO_TOKEN}` }
        });
        console.log(`✅ Conectado à conta: ${accountResponse.data.name} (ID: ${accountResponse.data.id})\n`);

        // Test 2: Create test contact
        console.log('2️⃣ Criando contato de teste...');
        const testContact = {
            name: `Teste LeadBaze ${new Date().toISOString()}`,
        };

        const contactResponse = await axios.post(
            `${BASE_URL}/contacts`,
            [testContact],
            {
                headers: {
                    'Authorization': `Bearer ${KOMMO_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const createdContact = contactResponse.data._embedded.contacts[0];
        console.log(`✅ Contato criado: ${createdContact.name} (ID: ${createdContact.id})\n`);

        // Test 3: Add phone to contact
        console.log('3️⃣ Adicionando telefone ao contato...');

        // Get phone field ID
        const phoneField = accountResponse.data._embedded?.custom_fields?.contacts?.find(f => f.field_type === 9);

        if (phoneField) {
            await axios.patch(
                `${BASE_URL}/contacts/${createdContact.id}`,
                {
                    custom_fields_values: [{
                        field_id: phoneField.id,
                        values: [{ value: '+5531999887766', enum_code: 'WORK' }]
                    }]
                },
                {
                    headers: {
                        'Authorization': `Bearer ${KOMMO_TOKEN}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            console.log(`✅ Telefone adicionado ao contato\n`);
        } else {
            console.log('⚠️ Campo de telefone não encontrado - pulando\n');
        }

        // Test 4: Delete test contact
        console.log('4️⃣ Limpando contato de teste...');
        await axios.delete(`${BASE_URL}/contacts/${createdContact.id}`, {
            headers: { 'Authorization': `Bearer ${KOMMO_TOKEN}` }
        });
        console.log(`✅ Contato de teste removido\n`);

        console.log('🎉 Todos os testes passaram! Integração Kommo está funcionando corretamente.');
        console.log('\n📋 Resumo:');
        console.log(`   - Conta: ${accountResponse.data.name}`);
        console.log(`   - Subdomain: ${KOMMO_SUBDOMAIN}`);
        console.log(`   - Token válido: ✅`);
        console.log(`   - Criação de contatos: ✅`);
        console.log(`   - Campos personalizados: ${phoneField ? '✅' : '⚠️ Nenhum configurado'}`);

    } catch (error) {
        console.error('❌ Erro no teste:', error.response?.data || error.message);
        if (error.response?.status === 401) {
            console.error('\n⚠️ Token inválido ou expirado. Verifique KOMMO_LONG_LIVED_TOKEN no config.env');
        }
        process.exit(1);
    }
}

testKommoIntegration();
