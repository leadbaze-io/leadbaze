// Script para testar a conexão WhatsApp e monitorar os logs
// Execute este script no console do navegador

console.log('🔍 [TESTE] Iniciando teste de conexão WhatsApp...')

// Função para monitorar logs do WhatsApp
function monitorWhatsAppLogs() {
    console.log('📊 [TESTE] Monitorando logs do WhatsApp...')
    console.log('📊 [TESTE] Procure por logs com [WHATSAPP] no console')
    console.log('📊 [TESTE] Logs importantes a observar:')
    console.log('   - 🔍 [WHATSAPP] Verificando instância existente no banco...')
    console.log('   - ✅ [WHATSAPP] Conexão ativa confirmada - mantendo estado')
    console.log('   - 💾 [WHATSAPP] Salvando status conectado no banco...')
    console.log('   - ✅ [WHATSAPP] Status salvo com sucesso - CONEXÃO PERSISTENTE!')
    console.log('   - 🔍 [WHATSAPP] Verificando persistência da conexão...')
    console.log('   - ✅ [WHATSAPP] Conexão ainda ativa - mantendo estado')
}

// Função para testar a Evolution API
async function testEvolutionAPI() {
    console.log('🔍 [TESTE] Testando Evolution API...')
    
    try {
        const response = await fetch('http://localhost:8080/health')
        if (response.ok) {
            console.log('✅ [TESTE] Evolution API está respondendo')
        } else {
            console.log('❌ [TESTE] Evolution API não está respondendo:', response.status)
        }
    } catch (error) {
        console.log('❌ [TESTE] Erro ao conectar com Evolution API:', error)
    }
}

// Função para verificar instâncias no banco
async function checkDatabaseInstances() {
    console.log('🔍 [TESTE] Verificando instâncias no banco...')
    
    try {
        // Esta função seria chamada pelo sistema, mas podemos simular
        console.log('📊 [TESTE] Para verificar instâncias no banco, execute:')
        console.log('   SELECT * FROM whatsapp_instances WHERE user_id = \'seu-user-id\';')
    } catch (error) {
        console.log('❌ [TESTE] Erro ao verificar banco:', error)
    }
}

// Executar testes
monitorWhatsAppLogs()
testEvolutionAPI()
checkDatabaseInstances()

console.log('🎯 [TESTE] Instruções para o teste:')
console.log('1. Abra o console do navegador (F12)')
console.log('2. Vá para a página do disparador')
console.log('3. Clique em "Conectar WhatsApp"')
console.log('4. Observe os logs com [WHATSAPP]')
console.log('5. Verifique se a conexão persiste após recarregar a página')
console.log('6. Execute o script SQL para verificar o banco de dados')


















