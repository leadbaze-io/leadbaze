// Script para verificar se a instância ainda está ativa na Evolution API
// Execute este script no console do navegador

const instanceName = 'creaty12345gmailcom_1757520131352_4wf836'
const EVOLUTION_API_URL = 'https://n8n-evolution.kof6cn.easypanel.host'
const EVOLUTION_API_KEY = 'qwSYwLlijZOh+FaBHrK0tfGzxG6W/J4O'

async function checkEvolutionInstanceStatus() {
    console.log('🔍 [TESTE] Verificando status da instância na Evolution API...')
    console.log('📱 [TESTE] Instância:', instanceName)
    
    try {
        // 1. Verificar se a instância existe
        console.log('1. Verificando se a instância existe...')
        const instancesResponse = await fetch(`${EVOLUTION_API_URL}/instance/fetchInstances`, {
            headers: {
                'apikey': EVOLUTION_API_KEY
            }
        })
        
        if (instancesResponse.ok) {
            const instancesData = await instancesResponse.json()
            console.log('✅ [TESTE] Instâncias encontradas:', instancesData)
            
            // Procurar pela nossa instância
            const ourInstance = instancesData.find(inst => inst.instanceName === instanceName)
            if (ourInstance) {
                console.log('✅ [TESTE] Nossa instância encontrada:', ourInstance)
            } else {
                console.log('❌ [TESTE] Nossa instância não foi encontrada na Evolution API')
            }
        } else {
            console.log('❌ [TESTE] Erro ao listar instâncias:', instancesResponse.status)
        }
        
        // 2. Verificar estado da conexão
        console.log('2. Verificando estado da conexão...')
        const stateResponse = await fetch(`${EVOLUTION_API_URL}/instance/connectionState/${instanceName}`, {
            headers: {
                'apikey': EVOLUTION_API_KEY
            }
        })
        
        if (stateResponse.ok) {
            const stateData = await stateResponse.json()
            console.log('✅ [TESTE] Estado da conexão:', stateData)
        } else {
            console.log('❌ [TESTE] Erro ao verificar estado:', stateResponse.status)
        }
        
        // 3. Verificar QR Code
        console.log('3. Verificando QR Code...')
        const qrResponse = await fetch(`${EVOLUTION_API_URL}/instance/connect/${instanceName}`, {
            headers: {
                'apikey': EVOLUTION_API_KEY
            }
        })
        
        if (qrResponse.ok) {
            const qrData = await qrResponse.json()
            console.log('✅ [TESTE] QR Code:', qrData)
        } else {
            console.log('❌ [TESTE] Erro ao verificar QR Code:', qrResponse.status)
        }
        
    } catch (error) {
        console.error('❌ [TESTE] Erro durante verificação:', error)
    }
}

// Executar verificação
checkEvolutionInstanceStatus()
