#!/usr/bin/env node

// Debug do external_reference
const TEST_PACKAGE_ID = 'leads_1000';
const TEST_USER_ID = '66875e05-eace-49ac-bf07-0e794dbab8fd';
const timestamp = Date.now();

console.log('🔍 DEBUG DO EXTERNAL_REFERENCE');
console.log('==============================');
console.log(`TEST_PACKAGE_ID: ${TEST_PACKAGE_ID}`);
console.log(`TEST_USER_ID: ${TEST_USER_ID}`);

// Como está sendo gerado atualmente
const currentExternalRef = `${TEST_PACKAGE_ID}_${TEST_USER_ID}_${timestamp}`;
console.log(`\nExternal Reference atual: ${currentExternalRef}`);

// Como deveria ser
const correctExternalRef = `leads_${TEST_PACKAGE_ID}_${TEST_USER_ID}_${timestamp}`;
console.log(`External Reference correto: ${correctExternalRef}`);

console.log('\n📊 ANÁLISE DA EXTRAÇÃO:');
console.log('=======================');

// Testar extração atual
const currentParts = currentExternalRef.split('_');
console.log(`Partes atuais: [${currentParts.join(', ')}]`);
console.log(`Package ID atual: ${currentParts[0]}`);
console.log(`User ID atual: ${currentParts[1]}`);

// Testar extração correta
const correctParts = correctExternalRef.split('_');
console.log(`\nPartes corretas: [${correctParts.join(', ')}]`);
console.log(`Package ID correto: ${correctParts[1]}`);
console.log(`User ID correto: ${correctParts[2]}`);

console.log('\n🎯 PROBLEMA IDENTIFICADO:');
console.log('=========================');
console.log('O external_reference está sendo gerado sem o prefixo "leads_"');
console.log('Mas o código está procurando por pacotes que começam com "leads_"');
console.log('Solução: Adicionar o prefixo "leads_" na geração do external_reference');