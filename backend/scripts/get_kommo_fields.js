/**
 * Script to fetch Kommo custom field IDs
 * Usage: node backend/scripts/get_kommo_fields.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../config.env') });
const axios = require('axios');

async function getKommoFields() {
    try {
        const token = process.env.KOMMO_LONG_LIVED_TOKEN;
        const subdomain = process.env.KOMMO_SUBDOMAIN || 'dvemarketingadm';

        if (!token) {
            console.error('❌ KOMMO_LONG_LIVED_TOKEN not found in config.env');
            process.exit(1);
        }

        console.log('🔍 Buscando informações da conta Kommo...\n');

        const response = await axios.get(`https://${subdomain}.kommo.com/api/v4/account`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const account = response.data;

        console.log('✅ Conta Kommo:');
        console.log(`   Nome: ${account.name}`);
        console.log(`   ID: ${account.id}`);
        console.log(`   Subdomain: ${subdomain}\n`);

        // Buscar custom fields de contatos
        console.log('📋 Custom Fields de Contatos:\n');

        if (account._embedded && account._embedded.custom_fields) {
            const contactFields = account._embedded.custom_fields.contacts || [];

            console.log('Campos encontrados:');
            contactFields.forEach(field => {
                console.log(`   - ${field.name} (ID: ${field.id}, Type: ${field.field_type})`);
            });

            // Encontrar campos importantes
            const phoneField = contactFields.find(f =>
                f.field_type === 9 || f.name.toLowerCase().includes('phone') || f.name.toLowerCase().includes('telefone')
            );
            const emailField = contactFields.find(f =>
                f.field_type === 8 || f.name.toLowerCase().includes('email')
            );
            const cityField = contactFields.find(f =>
                f.name.toLowerCase().includes('cidade') || f.name.toLowerCase().includes('city')
            );

            console.log('\n📌 Mapeamento sugerido para config:');
            console.log(JSON.stringify({
                subdomain: subdomain,
                field_mapping: {
                    phone: phoneField ? phoneField.id : null,
                    email: emailField ? emailField.id : null,
                    city: cityField ? cityField.id : null
                }
            }, null, 2));

        } else {
            console.log('⚠️ Nenhum custom field encontrado');
        }

    } catch (error) {
        console.error('❌ Erro ao buscar fields do Kommo:', error.response?.data || error.message);
        if (error.response?.status === 401) {
            console.error('\n⚠️ Token inválido ou expirado. Verifique KOMMO_LONG_LIVED_TOKEN no config.env');
        }
        process.exit(1);
    }
}

getKommoFields();
