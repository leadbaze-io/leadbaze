// Script para testar a persistência da conexão WhatsApp
// Execute este script no console do navegador

console.log('🧪 [TESTE] Testando persistência da conexão WhatsApp...')

// Função para monitorar logs específicos de persistência
function monitorPersistenceLogs() {
    console.log('📊 [TESTE] Logs importantes para monitorar:')
    console.log('   ✅ [WHATSAPP] Status salvo com sucesso - CONEXÃO PERSISTENTE!')
    console.log('   ✅ [WHATSAPP] Instância conectada recentemente, mantendo status connected')
    console.log('   🔍 [WHATSAPP] Verificando persistência da conexão...')
    console.log('   ✅ [WHATSAPP] Conexão ainda ativa - mantendo estado')
    console.log('')
    console.log('❌ Logs que indicam problemas:')
    console.log('   ⚠️ [WHATSAPP] Instância marcada como connected mas sem dados de conexão há mais de 5 minutos')
    console.log('   ⚠️ [WHATSAPP] Conexão perdida - instância não está mais ativa na Evolution')
}

// Função para verificar o banco de dados
function checkDatabaseStatus() {
    console.log('🔍 [TESTE] Para verificar o status no banco, execute:')
    console.log('   SELECT instance_name, status, whatsapp_number, last_connection_at, updated_at')
    console.log('   FROM whatsapp_instances')
    console.log('   WHERE user_id = \'seu-user-id\';')
    console.log('')
    console.log('📊 [TESTE] Status esperado após conexão:')
    console.log('   - status: "connected"')
    console.log('   - last_connection_at: timestamp recente')
    console.log('   - updated_at: timestamp recente')
}

// Função para testar recarregamento da página
function testPageReload() {
    console.log('🔄 [TESTE] Para testar persistência:')
    console.log('1. Conecte o WhatsApp')
    console.log('2. Aguarde aparecer "CONEXÃO PERSISTENTE!"')
    console.log('3. Recarregue a página (F5)')
    console.log('4. Verifique se a conexão ainda está ativa')
    console.log('5. Observe os logs de verificação de instância existente')
}

// Executar todas as funções
monitorPersistenceLogs()
checkDatabaseStatus()
testPageReload()

console.log('🎯 [TESTE] Instruções:')
console.log('1. Conecte o WhatsApp e observe os logs')
console.log('2. Recarregue a página para testar persistência')
console.log('3. Verifique o banco de dados se necessário')
console.log('4. A conexão deve permanecer ativa após recarregar')


















