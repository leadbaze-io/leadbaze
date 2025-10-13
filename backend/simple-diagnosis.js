const axios = require('axios');

console.log('🔍 DIAGNÓSTICO SIMPLES - LEADBAZE.IO');
console.log('=====================================\n');

async function testConnection() {
    const tests = [
        { name: 'HTTP', url: 'http://leadbaze.io' },
        { name: 'HTTPS', url: 'https://leadbaze.io' },
        { name: 'Health Check', url: 'http://leadbaze.io/health' },
        { name: 'API Health', url: 'http://leadbaze.io/api/health' }
    ];

    for (const test of tests) {
        try {
            console.log(`🧪 Testando ${test.name}...`);
            const response = await axios.get(test.url, { 
                timeout: 10000,
                validateStatus: () => true 
            });
            console.log(`✅ ${test.name}: Status ${response.status}`);
        } catch (error) {
            console.log(`❌ ${test.name}: ${error.message}`);
        }
    }
}

testConnection().catch(console.error);








