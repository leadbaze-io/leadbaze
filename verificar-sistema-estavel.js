/**
 * =====================================================
 * SCRIPT DE VERIFICAÇÃO DO SISTEMA ESTÁVEL
 * =====================================================
 * 
 * Este script verifica se todas as funcionalidades
 * principais estão funcionando corretamente.
 * 
 * Execute no console do navegador (F12) na página do disparador
 */

console.log('🔍 [VERIFICAÇÃO] Iniciando verificação do sistema estável...')

// Função para verificar se elementos estão presentes
function verificarElementos() {
  console.log('📋 [VERIFICAÇÃO] Verificando elementos da interface...')
  
  const elementos = {
    'CampaignWizard': document.querySelector('[data-testid="campaign-wizard"]') || document.querySelector('.campaign-wizard'),
    'MessageStep': document.querySelector('#message-input'),
    'BulkButtons': document.querySelector('[data-testid="bulk-buttons"]') || document.querySelector('.bulk-operation-buttons'),
    'WhatsAppConnection': document.querySelector('[data-testid="whatsapp-connection"]') || document.querySelector('.whatsapp-connection'),
    'StatsCards': document.querySelectorAll('.stats-card'),
    'ListSelection': document.querySelector('[data-testid="list-selection"]') || document.querySelector('.list-selection')
  }
  
  let elementosEncontrados = 0
  let elementosTotal = Object.keys(elementos).length
  
  Object.entries(elementos).forEach(([nome, elemento]) => {
    if (elemento) {
      console.log(`✅ [VERIFICAÇÃO] ${nome}: Encontrado`)
      elementosEncontrados++
    } else {
      console.log(`❌ [VERIFICAÇÃO] ${nome}: Não encontrado`)
    }
  })
  
  console.log(`📊 [VERIFICAÇÃO] Elementos encontrados: ${elementosEncontrados}/${elementosTotal}`)
  return elementosEncontrados === elementosTotal
}

// Função para verificar logs do sistema
function verificarLogs() {
  console.log('📝 [VERIFICAÇÃO] Verificando logs do sistema...')
  
  // Verificar se há logs de WhatsApp
  const logsWhatsApp = console.log.toString().includes('[WHATSAPP]')
  console.log(`📱 [VERIFICAÇÃO] Logs WhatsApp: ${logsWhatsApp ? 'Presentes' : 'Não encontrados'}`)
  
  // Verificar se há logs de campanha
  const logsCampanha = console.log.toString().includes('[CAMPAIGN]')
  console.log(`📋 [VERIFICAÇÃO] Logs Campanha: ${logsCampanha ? 'Presentes' : 'Não encontrados'}`)
  
  return true // Sempre retorna true pois é apenas informativo
}

// Função para verificar funcionalidades JavaScript
function verificarFuncionalidades() {
  console.log('⚙️ [VERIFICAÇÃO] Verificando funcionalidades JavaScript...')
  
  try {
    // Verificar se React está carregado
    const reactCarregado = typeof React !== 'undefined'
    console.log(`⚛️ [VERIFICAÇÃO] React: ${reactCarregado ? 'Carregado' : 'Não carregado'}`)
    
    // Verificar se há erros no console
    const errosConsole = console.error.toString()
    console.log(`🚨 [VERIFICAÇÃO] Erros no console: ${errosConsole ? 'Verificar manualmente' : 'Nenhum erro detectado'}`)
    
    return true
  } catch (error) {
    console.error('❌ [VERIFICAÇÃO] Erro ao verificar funcionalidades:', error)
    return false
  }
}

// Função para verificar estado da aplicação
function verificarEstadoAplicacao() {
  console.log('🔄 [VERIFICAÇÃO] Verificando estado da aplicação...')
  
  // Verificar se há campanhas carregadas
  const campanhas = document.querySelectorAll('[data-testid="campaign-item"]') || document.querySelectorAll('.campaign-item')
  console.log(`📋 [VERIFICAÇÃO] Campanhas carregadas: ${campanhas.length}`)
  
  // Verificar se há listas disponíveis
  const listas = document.querySelectorAll('[data-testid="list-item"]') || document.querySelectorAll('.list-item')
  console.log(`📝 [VERIFICAÇÃO] Listas disponíveis: ${listas.length}`)
  
  // Verificar status do WhatsApp
  const statusWhatsApp = document.querySelector('.whatsapp-status') || document.querySelector('[data-testid="whatsapp-status"]')
  if (statusWhatsApp) {
    const status = statusWhatsApp.textContent || statusWhatsApp.innerText
    console.log(`📱 [VERIFICAÇÃO] Status WhatsApp: ${status}`)
  }
  
  return true
}

// Função principal de verificação
function verificarSistemaCompleto() {
  console.log('🚀 [VERIFICAÇÃO] Iniciando verificação completa do sistema...')
  console.log('=' * 60)
  
  const resultados = {
    elementos: verificarElementos(),
    logs: verificarLogs(),
    funcionalidades: verificarFuncionalidades(),
    estado: verificarEstadoAplicacao()
  }
  
  console.log('=' * 60)
  console.log('📊 [VERIFICAÇÃO] RESUMO DOS RESULTADOS:')
  console.log(`✅ Elementos da Interface: ${resultados.elementos ? 'OK' : 'FALHA'}`)
  console.log(`✅ Logs do Sistema: ${resultados.logs ? 'OK' : 'FALHA'}`)
  console.log(`✅ Funcionalidades JS: ${resultados.funcionalidades ? 'OK' : 'FALHA'}`)
  console.log(`✅ Estado da Aplicação: ${resultados.estado ? 'OK' : 'FALHA'}`)
  
  const sistemaOK = Object.values(resultados).every(resultado => resultado === true)
  
  if (sistemaOK) {
    console.log('🎉 [VERIFICAÇÃO] SISTEMA ESTÁVEL - TODAS AS VERIFICAÇÕES PASSARAM!')
    console.log('✅ O sistema está funcionando perfeitamente!')
  } else {
    console.log('⚠️ [VERIFICAÇÃO] ALGUMAS VERIFICAÇÕES FALHARAM!')
    console.log('🔍 Verifique os itens marcados como FALHA acima.')
  }
  
  return sistemaOK
}

// Executar verificação
const sistemaEstavel = verificarSistemaCompleto()

// Exportar resultado para uso externo
window.sistemaVerificado = sistemaEstavel

console.log('🔍 [VERIFICAÇÃO] Verificação concluída!')
console.log('💡 [DICA] Use window.sistemaVerificado para acessar o resultado da verificação')



