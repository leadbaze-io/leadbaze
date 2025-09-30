#!/usr/bin/env node

/**
 * 🔍 Script de Diagnóstico - LeadBaze.io na Servla
 * 
 * Este script verifica:
 * 1. Conectividade com o servidor
 * 2. Status dos serviços (nginx, pm2)
 * 3. Configuração DNS
 * 4. Logs de erro
 * 5. Configuração do domínio
 */

const axios = require('axios');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configurações
const DOMAIN = 'leadbaze.io';
const SERVER_IP = '151.242.25.56';
const BACKEND_PORT = 3001;

console.log('🔍 DIAGNÓSTICO LEADBAZE.IO - SERVER CONNECTION');
console.log('================================================\n');

// Função para executar comandos
function runCommand(command) {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(error);
            } else {
                resolve({ stdout, stderr });
            }
        });
    });
}

// Função para testar conectividade HTTP
async function testHttpConnection(url, timeout = 10000) {
    try {
        const response = await axios.get(url, { 
            timeout,
            validateStatus: () => true // Aceita qualquer status
        });
        return {
            success: true,
            status: response.status,
            headers: response.headers,
            data: response.data
        };
    } catch (error) {
        return {
            success: false,
            error: error.message,
            code: error.code
        };
    }
}

// Função principal de diagnóstico
async function diagnoseConnection() {
    console.log('1️⃣ TESTANDO CONECTIVIDADE BÁSICA...');
    console.log('-----------------------------------');
    
    // Teste 1: Ping do domínio
    try {
        console.log(`📡 Ping para ${DOMAIN}...`);
        const pingResult = await runCommand(`ping -n 4 ${DOMAIN}`);
        console.log('✅ Ping executado:', pingResult.stdout);
    } catch (error) {
        console.log('❌ Ping falhou:', error.message);
    }
    
    // Teste 2: Resolução DNS
    try {
        console.log(`\n🔍 Resolução DNS para ${DOMAIN}...`);
        const nslookupResult = await runCommand(`nslookup ${DOMAIN}`);
        console.log('✅ DNS:', nslookupResult.stdout);
    } catch (error) {
        console.log('❌ DNS falhou:', error.message);
    }
    
    // Teste 3: Teste de porta
    try {
        console.log(`\n🔌 Teste de porta 80...`);
        const portTest = await runCommand(`Test-NetConnection -ComputerName ${DOMAIN} -Port 80`);
        console.log('✅ Porta 80:', portTest.stdout);
    } catch (error) {
        console.log('❌ Porta 80 falhou:', error.message);
    }
    
    try {
        console.log(`\n🔌 Teste de porta 443...`);
        const portTest443 = await runCommand(`Test-NetConnection -ComputerName ${DOMAIN} -Port 443`);
        console.log('✅ Porta 443:', portTest443.stdout);
    } catch (error) {
        console.log('❌ Porta 443 falhou:', error.message);
    }
    
    console.log('\n2️⃣ TESTANDO CONECTIVIDADE HTTP...');
    console.log('----------------------------------');
    
    // Teste 4: HTTP
    console.log(`\n🌐 Testando HTTP (http://${DOMAIN})...`);
    const httpTest = await testHttpConnection(`http://${DOMAIN}`);
    if (httpTest.success) {
        console.log(`✅ HTTP OK - Status: ${httpTest.status}`);
        console.log(`📋 Headers:`, JSON.stringify(httpTest.headers, null, 2));
    } else {
        console.log(`❌ HTTP FALHOU:`, httpTest.error);
    }
    
    // Teste 5: HTTPS
    console.log(`\n🔒 Testando HTTPS (https://${DOMAIN})...`);
    const httpsTest = await testHttpConnection(`https://${DOMAIN}`);
    if (httpsTest.success) {
        console.log(`✅ HTTPS OK - Status: ${httpsTest.status}`);
    } else {
        console.log(`❌ HTTPS FALHOU:`, httpsTest.error);
    }
    
    // Teste 6: Health Check
    console.log(`\n🏥 Testando Health Check...`);
    const healthTest = await testHttpConnection(`http://${DOMAIN}/health`);
    if (healthTest.success) {
        console.log(`✅ Health Check OK - Status: ${healthTest.status}`);
        console.log(`📋 Response:`, healthTest.data);
    } else {
        console.log(`❌ Health Check FALHOU:`, healthTest.error);
    }
    
    // Teste 7: API Backend
    console.log(`\n🔌 Testando API Backend...`);
    const apiTest = await testHttpConnection(`http://${DOMAIN}/api/health`);
    if (apiTest.success) {
        console.log(`✅ API Backend OK - Status: ${apiTest.status}`);
    } else {
        console.log(`❌ API Backend FALHOU:`, apiTest.error);
    }
    
    console.log('\n3️⃣ VERIFICANDO CONFIGURAÇÕES LOCAIS...');
    console.log('-------------------------------------');
    
    // Verificar arquivos de configuração
    const configFiles = [
        'nginx-servla.conf',
        'ecosystem.config.js',
        '.env',
        'package.json'
    ];
    
    configFiles.forEach(file => {
        const filePath = path.join(__dirname, '..', file);
        if (fs.existsSync(filePath)) {
            console.log(`✅ ${file} existe`);
        } else {
            console.log(`❌ ${file} não encontrado`);
        }
    });
    
    console.log('\n4️⃣ RESUMO DO DIAGNÓSTICO...');
    console.log('----------------------------');
    
    const issues = [];
    
    if (!httpTest.success) {
        issues.push('❌ Site HTTP não está respondendo');
    }
    
    if (!httpsTest.success) {
        issues.push('❌ Site HTTPS não está respondendo');
    }
    
    if (!healthTest.success) {
        issues.push('❌ Health check não está funcionando');
    }
    
    if (!apiTest.success) {
        issues.push('❌ API backend não está respondendo');
    }
    
    if (issues.length === 0) {
        console.log('✅ TUDO FUNCIONANDO CORRETAMENTE!');
    } else {
        console.log('🚨 PROBLEMAS IDENTIFICADOS:');
        issues.forEach(issue => console.log(`   ${issue}`));
        
        console.log('\n🛠️ AÇÕES RECOMENDADAS:');
        console.log('1. Verificar se o servidor na Servla está online');
        console.log('2. Verificar se o nginx está rodando: sudo systemctl status nginx');
        console.log('3. Verificar se o PM2 está rodando: pm2 status');
        console.log('4. Verificar logs do nginx: sudo tail -f /var/log/nginx/error.log');
        console.log('5. Verificar logs do PM2: pm2 logs');
        console.log('6. Verificar configuração DNS do domínio');
        console.log('7. Contatar suporte da Servla se necessário');
    }
    
    console.log('\n📞 CONTATOS DE SUPORTE SERVA:');
    console.log('WhatsApp: Resposta em minutos');
    console.log('Telefone: +55 31 4042-7655 (24/7)');
    console.log('E-mail: Suporte técnico');
}

// Executar diagnóstico
diagnoseConnection().catch(error => {
    console.error('❌ Erro durante diagnóstico:', error);
    process.exit(1);
});



