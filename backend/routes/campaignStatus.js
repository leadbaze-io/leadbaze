const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const router = express.Router();

// Configuração do Supabase
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Armazenar conexões WebSocket ativas por campanha
const activeConnections = new Map();

/**
 * POST /api/campaign/status/start
 * Inicia o rastreamento de status de uma campanha
 */
router.post('/start', async (req, res) => {
  try {
    const { campaignId, totalLeads } = req.body;
    
    if (!campaignId) {
      return res.status(400).json({
        success: false,
        error: 'campaignId é obrigatório'
      });
    }

    console.log(`🚀 Iniciando rastreamento da campanha: ${campaignId}`);

    // Atualizar status da campanha para 'sending'
    const { data, error } = await supabase
      .from('bulk_campaigns')
      .update({
        status: 'sending',
        sent_at: new Date().toISOString(),
        total_leads: totalLeads || 0,
        success_count: 0,
        failed_count: 0,
        updated_at: new Date().toISOString()
      })
      .eq('id', campaignId)
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao atualizar campanha:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro ao atualizar campanha',
        details: error.message
      });
    }

    console.log(`✅ Campanha ${campaignId} iniciada com sucesso`);
    
    res.json({
      success: true,
      message: 'Rastreamento de campanha iniciado',
      campaign: data
    });

  } catch (error) {
    console.error('❌ Erro ao iniciar rastreamento:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

/**
 * POST /api/campaign/status/progress
 * Atualiza o progresso de uma campanha (chamado pelo N8N)
 */
router.post('/progress', async (req, res) => {
  try {
    const { 
      campaignId, 
      leadIndex, 
      totalLeads, 
      success, 
      error: errorMessage,
      leadPhone,
      leadName 
    } = req.body;
    
    if (!campaignId) {
      return res.status(400).json({
        success: false,
        error: 'campaignId é obrigatório'
      });
    }

    console.log(`📊 Progresso da campanha ${campaignId}: ${leadIndex}/${totalLeads} - ${success ? 'Sucesso' : 'Falha'}`);

    // Buscar campanha atual
    const { data: campaign, error: fetchError } = await supabase
      .from('bulk_campaigns')
      .select('*')
      .eq('id', campaignId)
      .single();

    if (fetchError) {
      console.error('❌ Erro ao buscar campanha:', fetchError);
      return res.status(404).json({
        success: false,
        error: 'Campanha não encontrada'
      });
    }

    // Atualizar contadores
    const newSuccessCount = success ? (campaign.success_count || 0) + 1 : campaign.success_count || 0;
    const newFailedCount = !success ? (campaign.failed_count || 0) + 1 : campaign.failed_count || 0;
    
    // Calcular progresso
    const progress = Math.round(((leadIndex || 0) / (totalLeads || 1)) * 100);
    
    // Atualizar campanha
    const { data: updatedCampaign, error: updateError } = await supabase
      .from('bulk_campaigns')
      .update({
        success_count: newSuccessCount,
        failed_count: newFailedCount,
        updated_at: new Date().toISOString()
      })
      .eq('id', campaignId)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Erro ao atualizar progresso:', updateError);
      return res.status(500).json({
        success: false,
        error: 'Erro ao atualizar progresso'
      });
    }

    // Notificar clientes conectados via WebSocket (se implementado)
    notifyCampaignProgress(campaignId, {
      campaignId,
      progress,
      leadIndex: leadIndex || 0,
      totalLeads: totalLeads || 0,
      successCount: newSuccessCount,
      failedCount: newFailedCount,
      currentLead: {
        phone: leadPhone,
        name: leadName,
        success
      },
      error: errorMessage
    });

    console.log(`✅ Progresso atualizado: ${progress}% (${newSuccessCount} sucessos, ${newFailedCount} falhas)`);
    
    res.json({
      success: true,
      message: 'Progresso atualizado',
      campaign: updatedCampaign,
      progress: {
        percentage: progress,
        leadIndex: leadIndex || 0,
        totalLeads: totalLeads || 0,
        successCount: newSuccessCount,
        failedCount: newFailedCount
      }
    });

  } catch (error) {
    console.error('❌ Erro ao atualizar progresso:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

/**
 * POST /api/campaign/status/complete
 * Marca uma campanha como concluída (chamado pelo N8N)
 */
router.post('/complete', async (req, res) => {
  try {
    const { campaignId, successCount, failedCount, totalProcessed } = req.body;
    
    if (!campaignId) {
      return res.status(400).json({
        success: false,
        error: 'campaignId é obrigatório'
      });
    }

    console.log(`🏁 Finalizando campanha: ${campaignId} - ${successCount} sucessos, ${failedCount} falhas`);

    // Determinar status final
    const finalStatus = failedCount > 0 && successCount === 0 ? 'failed' : 'completed';
    
    // Atualizar campanha
    const { data, error } = await supabase
      .from('bulk_campaigns')
      .update({
        status: finalStatus,
        success_count: successCount || 0,
        failed_count: failedCount || 0,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', campaignId)
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao finalizar campanha:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro ao finalizar campanha',
        details: error.message
      });
    }

    // Notificar clientes conectados
    notifyCampaignComplete(campaignId, {
      campaignId,
      status: finalStatus,
      successCount: successCount || 0,
      failedCount: failedCount || 0,
      totalProcessed: totalProcessed || 0,
      completedAt: new Date().toISOString()
    });

    console.log(`✅ Campanha ${campaignId} finalizada com status: ${finalStatus}`);
    
    res.json({
      success: true,
      message: 'Campanha finalizada',
      campaign: data,
      finalStatus
    });

  } catch (error) {
    console.error('❌ Erro ao finalizar campanha:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

/**
 * GET /api/campaign/status/:campaignId
 * Obtém o status atual de uma campanha
 */
router.get('/:campaignId', async (req, res) => {
  try {
    const { campaignId } = req.params;
    
    console.log(`🔍 Verificando status da campanha: ${campaignId}`);

    const { data, error } = await supabase
      .from('bulk_campaigns')
      .select('id, status, success_count, failed_count, total_leads, sent_at, completed_at, updated_at')
      .eq('id', campaignId)
      .single();

    if (error) {
      console.error('❌ Erro ao buscar campanha:', error);
      return res.status(404).json({
        success: false,
        error: 'Campanha não encontrada',
        details: error.message
      });
    }

    // Calcular progresso
    const progress = data.total_leads > 0 
      ? Math.round(((data.success_count + data.failed_count) / data.total_leads) * 100)
      : 0;

    console.log(`✅ Status da campanha ${campaignId}: ${data.status} (${progress}%)`);
    
    res.json({
      success: true,
      campaign: {
        ...data,
        progress
      }
    });

  } catch (error) {
    console.error('❌ Erro ao verificar status:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

/**
 * Função para notificar progresso (placeholder para WebSocket)
 */
function notifyCampaignProgress(campaignId, progressData) {
  // TODO: Implementar WebSocket ou Server-Sent Events
  console.log(`📡 Notificando progresso da campanha ${campaignId}:`, progressData);
  
  // Por enquanto, apenas log
  // Em implementação futura, enviar via WebSocket para clientes conectados
}

/**
 * Função para notificar conclusão (placeholder para WebSocket)
 */
function notifyCampaignComplete(campaignId, completionData) {
  // TODO: Implementar WebSocket ou Server-Sent Events
  console.log(`📡 Notificando conclusão da campanha ${campaignId}:`, completionData);
  
  // Por enquanto, apenas log
  // Em implementação futura, enviar via WebSocket para clientes conectados
}

module.exports = router;
