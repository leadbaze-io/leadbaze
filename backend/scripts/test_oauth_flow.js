const axios = require('axios');
require('dotenv').config({ path: 'backend/config.env' });

async function testClientCredentials() {
    console.log('🧪 Testando credenciais do App Kommo...');
    console.log('Client ID:', process.env.KOMMO_CLIENT_ID);
    console.log('Redirect URI:', process.env.KOMMO_REDIRECT_URI);
    console.log('Subdomain:', process.env.KOMMO_SUBDOMAIN);

    // Tentar obter informações da conta (endpoint público ou teste simples)
    // Na verdade, sem token não dá pra fazer muita coisa além de iniciar o flow
    // Vamos apenas verificar se as variáveis estão carregadas

    if (!process.env.KOMMO_CLIENT_ID || !process.env.KOMMO_CLIENT_SECRET) {
        console.error('❌ Falta Client ID ou Secret');
        return;
    }

    const authUrl = `https://www.kommo.com/oauth?client_id=${process.env.KOMMO_CLIENT_ID}&mode=popup`;
    console.log('\n🔗 URL de Autorização (para teste manual):');
    console.log(authUrl);
}

testClientCredentials();
