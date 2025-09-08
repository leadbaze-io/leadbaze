// ==============================================
// VERSÃO SIMPLES PARA TESTE
// ==============================================

// Dados do lead atual
const currentLead = $input.first().json;
const leadPhone = currentLead.telefone || '';
const leadName = currentLead.nome || 'Lead sem nome';

// Dados da campanha
const campaignData = $('Body').first().json.body[0];
const totalLeads = campaignData.itens.length;
const campaignId = campaignData.campaign_id;

// Índice do loop (N8N fornece automaticamente)
const currentIndex = ($input.first().json.__index || 0) + 1;
const progress = Math.round((currentIndex / totalLeads) * 100);

// Assumir sucesso se chegou até aqui
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
    timestamp: new Date().toISOString()
  }
}];

