// ==============================================
// CÓDIGO SIMPLES PARA TESTE
// ==============================================

// Dados do lead atual
const currentLead = $input.first().json;
const leadPhone = currentLead.telefone || '';
const leadName = currentLead.nome || 'Lead sem nome';

// Dados da campanha (com fallback)
let campaignId = 'test-campaign';
let totalLeads = 1;

try {
  const campaignData = $('Body').first().json.body[0];
  campaignId = campaignData.campaign_id;
  totalLeads = campaignData.itens.length;
} catch (error) {
  console.log('Usando dados padrão para teste');
}

// Índice simplificado para teste
const currentIndex = 1;
const progress = Math.round((currentIndex / totalLeads) * 100);

return [{
  json: {
    campaign_id: campaignId,
    current_index: currentIndex,
    total_leads: totalLeads,
    progress: progress,
    success_count: currentIndex,
    failed_count: 0,
    send_success: true,
    lead_phone: leadPhone,
    lead_name: leadName,
    backend_url: 'https://leadbaze.io',
    timestamp: new Date().toISOString(),
    status: 'test'
  }
}];

