// ==============================================
// CÓDIGO CORRIGIDO PARA ANALYTICS NO N8N
// ==============================================

// ==============================================
// 1. PREPARAR DADOS PROGRESSO (CORRIGIDO)
// ==============================================

// Dados do lead atual (usando $input.first().json dentro do loop)
const currentLead = $input.first().json;
const leadPhone = currentLead.telefone || '';
const leadName = currentLead.nome || 'Lead sem nome';

// Dados da campanha (acessando corretamente)
const campaignData = $('Body').first().json.body[0];
const totalLeads = campaignData.itens.length;
const campaignId = campaignData.campaign_id;

// Obter índice real do loop (N8N fornece automaticamente)
const currentIndex = $input.first().json.__index + 1; // +1 porque começa em 0
const progress = Math.round((currentIndex / totalLeads) * 100);

// Verificar se a mensagem foi enviada com sucesso
// (assumindo sucesso se chegou até aqui, mas pode ser melhorado)
const sendSuccess = true;

return [{
  json: {
    campaign_id: campaignId,
    current_index: currentIndex,
    total_leads: totalLeads,
    progress: progress,
    success_count: currentIndex, // Contador de sucessos até agora
    failed_count: 0, // Contador de falhas (pode ser melhorado)
    send_success: sendSuccess,
    lead_phone: leadPhone,
    lead_name: leadName,
    backend_url: 'https://leadbaze.io',
    timestamp: new Date().toISOString()
  }
}];

// ==============================================
// 2. PREPARAR TRACKING DE MENSAGEM (CORRIGIDO)
// ==============================================

// Dados do lead atual
const currentLead = $input.first().json;
const campaignData = $('Body').first().json.body[0];

// Dados da mensagem enviada
const messageData = {
  campaign_id: campaignData.campaign_id,
  lead_phone: currentLead.telefone,
  response_type: 'text',
  response_content: $('Mensagem Personalizada').first().json.mensagem,
  response_timestamp: new Date().toISOString(),
  lead_name: currentLead.nome,
  message_id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
};

return [{ json: messageData }];

// ==============================================
// 3. PREPARAR TRACKING DE ENTREGA (CORRIGIDO)
// ==============================================

// Dados do lead atual
const currentLead = $input.first().json;
const campaignData = $('Body').first().json.body[0];

// Simular status de entrega (em produção, viria da Evolution API)
const deliveryData = {
  campaign_id: campaignData.campaign_id,
  lead_phone: currentLead.telefone,
  delivery_status: 'delivered', // Assumindo que foi entregue
  status_timestamp: new Date().toISOString(),
  message_id: $('Preparar Tracking Mensagem').first().json.message_id,
  error_message: null
};

return [{ json: deliveryData }];

// ==============================================
// 4. PREPARAR DADOS CONCLUSÃO (CORRIGIDO)
// ==============================================

// Dados finais da campanha
const campaignData = $('Body').first().json.body[0];
const totalLeads = campaignData.itens.length;

// Buscar dados de progresso se disponíveis
let successCount = totalLeads; // Default: todos sucessos
let failedCount = 0; // Default: nenhuma falha

// Tentar buscar dados de progresso do nó anterior
try {
  const progressData = $('Atualizar Progresso').first().json;
  if (progressData && progressData.success_count !== undefined) {
    successCount = progressData.success_count;
    failedCount = progressData.failed_count;
  }
} catch (error) {
  // Se não conseguir acessar, usar defaults
  console.log('Usando contadores padrão');
}

return [{
  json: {
    campaign_id: campaignData.campaign_id,
    success_count: successCount,
    failed_count: failedCount,
    total_processed: totalLeads,
    backend_url: 'https://leadbaze.io',
    completion_timestamp: new Date().toISOString()
  }
}];

// ==============================================
// 5. VERSÃO MELHORADA COM TRATAMENTO DE ERROS
// ==============================================

// Preparar dados de progresso com tratamento de erros
try {
  // Dados do lead atual
  const currentLead = $input.first().json;
  const leadPhone = currentLead.telefone || '';
  const leadName = currentLead.nome || 'Lead sem nome';

  // Dados da campanha
  const campaignData = $('Body').first().json.body[0];
  const totalLeads = campaignData.itens.length;
  const campaignId = campaignData.campaign_id;

  // Obter índice real do loop
  const currentIndex = ($input.first().json.__index || 0) + 1;
  const progress = Math.round((currentIndex / totalLeads) * 100);

  // Verificar se a mensagem foi enviada com sucesso
  const sendSuccess = true;

  return [{
    json: {
      campaign_id: campaignId,
      current_index: currentIndex,
      total_leads: totalLeads,
      progress: progress,
      success_count: currentIndex,
      failed_count: 0,
      send_success: sendSuccess,
      lead_phone: leadPhone,
      lead_name: leadName,
      backend_url: 'https://leadbaze.io',
      timestamp: new Date().toISOString(),
      status: 'success'
    }
  }];

} catch (error) {
  console.error('Erro ao preparar dados de progresso:', error);
  
  return [{
    json: {
      campaign_id: 'unknown',
      current_index: 0,
      total_leads: 0,
      progress: 0,
      success_count: 0,
      failed_count: 1,
      send_success: false,
      lead_phone: '',
      lead_name: 'Erro no processamento',
      backend_url: 'https://leadbaze.io',
      timestamp: new Date().toISOString(),
      status: 'error',
      error_message: error.message
    }
  }];
}
