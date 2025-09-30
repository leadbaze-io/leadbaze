#!/usr/bin/env node
require('dotenv').config({ path: './config.env' });

async function testApiWithLogs() {
    console.log('🧪 TESTANDO API COM LOGS DETALHADOS');
    console.log('===================================');

    try {
        console.log('\n1️⃣ Fazendo requisição para a API...');
        const response = await fetch('http://localhost:3001/api/lead-packages');
        
        console.log(`Status: ${response.status}`);
        console.log(`Headers:`, Object.fromEntries(response.headers.entries()));
        
        const data = await response.json();
        
        console.log('\n2️⃣ Resposta da API:');
        console.log(JSON.stringify(data, null, 2));
        
        if (data.success && data.packages) {
            console.log(`\n3️⃣ Análise dos pacotes:`);
            data.packages.forEach((pkg, index) => {
                console.log(`   ${index + 1}. ${pkg.name}`);
                console.log(`      price_cents: ${pkg.price_cents}`);
                console.log(`      price_formatted: ${pkg.price_formatted}`);
                console.log(`      leads: ${pkg.leads}`);
                console.log('');
            });
        }
        
    } catch (error) {
        console.log('⚠️ Erro na requisição:', error.message);
        console.log('   Isso pode indicar que o servidor não está rodando');
    }
}

testApiWithLogs();




