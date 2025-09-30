#!/usr/bin/env node
require('dotenv').config({ path: './config.env' });

// Teste simples para debug do external_reference
const TEST_PACKAGE_ID = 'leads_1000';
const TEST_USER_ID = '66875e05-eace-49ac-bf07-0e794dbab8fd';
const timestamp = Date.now();

const externalReference = `leads_${TEST_PACKAGE_ID}_${TEST_USER_ID}_${timestamp}`;

console.log('🔍 DEBUG DO EXTERNAL_REFERENCE');
console.log('==============================');
console.log(`Package ID: ${TEST_PACKAGE_ID}`);
console.log(`User ID: ${TEST_USER_ID}`);
console.log(`Timestamp: ${timestamp}`);
console.log(`External Reference: ${externalReference}`);

console.log('\n📊 ANÁLISE DA EXTRAÇÃO:');
console.log('=======================');

const refParts = externalReference.split('_');
console.log(`Partes: [${refParts.join(', ')}]`);
console.log(`Total de partes: ${refParts.length}`);

if (refParts.length >= 4) {
    console.log(`Parte 0 (leads): ${refParts[0]}`);
    console.log(`Parte 1 (packageId): ${refParts[1]}`);
    console.log(`Parte 2 (userId): ${refParts[2]}`);
    console.log(`Parte 3 (timestamp): ${refParts[3]}`);
    
    const packageId = refParts[1];
    const userId = refParts[2];
    
    console.log('\n✅ EXTRAÇÃO CORRETA:');
    console.log(`Package ID extraído: ${packageId}`);
    console.log(`User ID extraído: ${userId}`);
    
    // Verificar se o packageId está correto
    if (packageId === TEST_PACKAGE_ID) {
        console.log('✅ Package ID correto!');
    } else {
        console.log('❌ Package ID incorreto!');
    }
    
    if (userId === TEST_USER_ID) {
        console.log('✅ User ID correto!');
    } else {
        console.log('❌ User ID incorreto!');
    }
} else {
    console.log('❌ Formato inválido - menos de 4 partes');
}

console.log('\n🎯 CONCLUSÃO:');
console.log('=============');
console.log('O problema está na extração do external_reference no webhook.');
console.log('O formato está correto, mas a lógica de extração precisa ser ajustada.');


