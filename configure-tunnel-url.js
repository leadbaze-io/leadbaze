// Script para configurar URL temporária para teste do Mercado Pago
const fs = require('fs');
const path = require('path');

// URL temporária para teste (você pode usar qualquer URL pública)
const TEMP_PUBLIC_URL = 'https://leadbaze-test.vercel.app';

console.log('🔧 Configurando URL temporária para teste do Mercado Pago...');
console.log(`📡 URL configurada: ${TEMP_PUBLIC_URL}`);

// Caminho do arquivo de configuração
const configPath = path.join(__dirname, 'backend', 'ecosystem.config.js');

try {
    // Ler o arquivo de configuração
    let content = fs.readFileSync(configPath, 'utf8');
    
    // Substituir a URL
    content = content.replace(
        /NEXT_PUBLIC_APP_URL: '[^']*'/,
        `NEXT_PUBLIC_APP_URL: '${TEMP_PUBLIC_URL}'`
    );
    
    // Salvar o arquivo
    fs.writeFileSync(configPath, content, 'utf8');
    
    console.log('✅ Configuração atualizada com sucesso!');
    console.log('');
    console.log('📋 URLs configuradas:');
    console.log(`   Frontend Local: http://localhost:5173`);
    console.log(`   Frontend Público: ${TEMP_PUBLIC_URL}`);
    console.log(`   Backend: http://localhost:3001`);
    console.log(`   Mercado Pago: Usará ${TEMP_PUBLIC_URL} para auto_return`);
    console.log('');
    console.log('🔄 Reinicie o backend para aplicar as mudanças:');
    console.log('   cd backend && pm2 restart leadbaze-backend');
    console.log('');
    console.log('🧪 Para testar:');
    console.log(`   1. Acesse: ${TEMP_PUBLIC_URL}/plans`);
    console.log('   2. Clique em "Assinar por R$ 997,00"');
    console.log('   3. Complete o pagamento no Mercado Pago');
    console.log(`   4. Deve redirecionar para ${TEMP_PUBLIC_URL}/payment/success`);
    
} catch (error) {
    console.error('❌ Erro ao atualizar configuração:', error.message);
    process.exit(1);
}



