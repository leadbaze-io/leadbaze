#!/usr/bin/env node
require('dotenv').config({ path: './config.env' });

async function testApiLeadPackages() {
    console.log('🧪 TESTANDO API DE PACOTES DE LEADS');
    console.log('===================================');

    try {
        const response = await fetch('http://localhost:3001/api/lead-packages');
        const data = await response.json();

        if (data.success) {
            console.log(`✅ API retornou ${data.packages.length} pacotes:`);
            data.packages.forEach((pkg, index) => {
                console.log(`   ${index + 1}. ${pkg.name}: ${pkg.price_formatted} (${pkg.leads} leads)`);
            });
        } else {
            console.error('❌ Erro na API:', data.message);
        }
    } catch (error) {
        console.log('⚠️ Servidor não está rodando ou API não disponível');
        console.log('   Erro:', error.message);
    }
}

testApiLeadPackages();







