// 🔧 Script para Corrigir URLs do Mercado Pago para Auto Return
// Este script atualiza as URLs para usar uma URL pública temporária

const fs = require('fs');
const path = require('path');

console.log('🔧 Corrigindo URLs do Mercado Pago para Auto Return...\n');

// URL pública temporária (você pode usar ngrok, localtunnel, ou seu domínio)
const PUBLIC_URL = 'https://leadbaze.io'; // Substitua pela sua URL pública

// Caminhos dos arquivos para atualizar
const filesToUpdate = [
    'src/lib/mercadoPagoService.ts',
    'backend/ecosystem.config.js'
];

// Função para atualizar arquivo
function updateFile(filePath) {
    try {
        if (!fs.existsSync(filePath)) {
            console.log(`⚠️  Arquivo não encontrado: ${filePath}`);
            return false;
        }

        let content = fs.readFileSync(filePath, 'utf8');
        let updated = false;

        // Padrões para substituir
        const patterns = [
            {
                search: /NEXT_PUBLIC_APP_URL:\s*['"`][^'"`]*['"`]/g,
                replace: `NEXT_PUBLIC_APP_URL: '${PUBLIC_URL}'`
            },
            {
                search: /process\.env\.NEXT_PUBLIC_APP_URL\s*\|\|\s*['"`][^'"`]*['"`]/g,
                replace: `process.env.NEXT_PUBLIC_APP_URL || '${PUBLIC_URL}'`
            },
            {
                search: /http:\/\/localhost:5173/g,
                replace: PUBLIC_URL
            }
        ];

        // Aplicar substituições
        patterns.forEach(pattern => {
            if (pattern.search.test(content)) {
                content = content.replace(pattern.search, pattern.replace);
                updated = true;
            }
        });

        if (updated) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ Atualizado: ${filePath}`);
            return true;
        } else {
            console.log(`ℹ️  Nenhuma alteração necessária: ${filePath}`);
            return false;
        }

    } catch (error) {
        console.log(`❌ Erro ao atualizar ${filePath}: ${error.message}`);
        return false;
    }
}

// Atualizar arquivos
let updatedFiles = 0;
filesToUpdate.forEach(filePath => {
    if (updateFile(filePath)) {
        updatedFiles++;
    }
});

console.log(`\n📊 Resumo:`);
console.log(`   Arquivos atualizados: ${updatedFiles}/${filesToUpdate.length}`);
console.log(`   URL pública configurada: ${PUBLIC_URL}`);

if (updatedFiles > 0) {
    console.log(`\n🔄 Próximos passos:`);
    console.log(`   1. Reinicie o backend: cd backend && pm2 restart leadbaze-backend`);
    console.log(`   2. Teste o pagamento em: ${PUBLIC_URL}/plans`);
    console.log(`   3. Verifique se o auto_return funciona`);
} else {
    console.log(`\n⚠️  Nenhum arquivo foi atualizado. Verifique se os arquivos existem.`);
}

console.log(`\n🎯 URLs configuradas:`);
console.log(`   Success: ${PUBLIC_URL}/payment/success`);
console.log(`   Failure: ${PUBLIC_URL}/payment/failure`);
console.log(`   Pending: ${PUBLIC_URL}/payment/pending`);

console.log(`\n✅ Script concluído!`);



