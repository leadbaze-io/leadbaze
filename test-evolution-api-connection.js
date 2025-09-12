// Script para testar a conectividade com a Evolution API
// Execute este script no console do navegador

const EVOLUTION_API_URL = 'http://localhost:8080'

async function testEvolutionApiConnection() {
    console.log('🔍 Testando conectividade com Evolution API...')
    
    try {
        // 1. Testar health check
        console.log('1. Testando health check...')
        const healthResponse = await fetch(`${EVOLUTION_API_URL}/health`)
        
        if (healthResponse.ok) {
            const healthData = await healthResponse.json()
            console.log('✅ Health check OK:', healthData)
        } else {
            console.log('❌ Health check falhou:', healthResponse.status)
            return
        }
        
        // 2. Testar listagem de instâncias
        console.log('2. Testando listagem de instâncias...')
        const instancesResponse = await fetch(`${EVOLUTION_API_URL}/instance/fetchInstances`)
        
        if (instancesResponse.ok) {
            const instancesData = await instancesResponse.json()
            console.log('✅ Instâncias encontradas:', instancesData)
        } else {
            console.log('❌ Erro ao listar instâncias:', instancesResponse.status)
        }
        
        // 3. Testar criação de instância de teste
        console.log('3. Testando criação de instância...')
        const testInstanceName = `test-${Date.now()}`
        
        const createResponse = await fetch(`${EVOLUTION_API_URL}/instance/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': 'test-api-key'
            },
            body: JSON.stringify({
                instanceName: testInstanceName,
                qrcode: true,
                integration: 'WHATSAPP-BAILEYS'
            })
        })
        
        if (createResponse.ok) {
            const createData = await createResponse.json()
            console.log('✅ Instância criada:', createData)
            
            // 4. Testar QR Code
            console.log('4. Testando QR Code...')
            const qrResponse = await fetch(`${EVOLUTION_API_URL}/instance/connect/${testInstanceName}`)
            
            if (qrResponse.ok) {
                const qrData = await qrResponse.json()
                console.log('✅ QR Code obtido:', qrData)
            } else {
                console.log('❌ Erro ao obter QR Code:', qrResponse.status)
            }
            
            // 5. Limpar instância de teste
            console.log('5. Limpando instância de teste...')
            const deleteResponse = await fetch(`${EVOLUTION_API_URL}/instance/delete/${testInstanceName}`, {
                method: 'DELETE',
                headers: {
                    'apikey': 'test-api-key'
                }
            })
            
            if (deleteResponse.ok) {
                console.log('✅ Instância de teste removida')
            } else {
                console.log('❌ Erro ao remover instância de teste:', deleteResponse.status)
            }
            
        } else {
            console.log('❌ Erro ao criar instância:', createResponse.status)
        }
        
        console.log('🎉 Teste de conectividade concluído!')
        
    } catch (error) {
        console.error('❌ Erro durante o teste:', error)
        console.log('💡 Verifique se:')
        console.log('   - A Evolution API está rodando em http://localhost:8080')
        console.log('   - Não há problemas de CORS')
        console.log('   - A API key está configurada corretamente')
    }
}

// Executar teste
testEvolutionApiConnection()



