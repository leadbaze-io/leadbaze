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
      .from('campaigns')
      .update({
        status: 'sending',
        sent_at: new Date().toISOString(),
        total_leads: totalLeads || 0,
        success_count: 0,
        failed_count: 0,
        updated_at: new Date().toISOString()
      })
      .eq('id', campaignId)
      .select();

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
      .from('campaigns')
      .select('*')
      .eq('id', campaignId);

    if (fetchError) {
      console.error('❌ Erro ao buscar campanha:', fetchError);
      return res.status(404).json({
        success: false,
        error: 'Campanha não encontrada'
      });
    }

    if (!campaign || campaign.length === 0) {
      console.error('❌ Campanha não encontrada:', campaignId);
      return res.status(404).json({
        success: false,
        error: 'Campanha não encontrada'
      });
    }

    const campaignData = campaign[0];

    // Atualizar contadores
    const newSuccessCount = success ? (campaignData.success_count || 0) + 1 : campaignData.success_count || 0;
    const newFailedCount = !success ? (campaignData.failed_count || 0) + 1 : campaignData.failed_count || 0;
    
    // Calcular progresso
    const progress = Math.round(((leadIndex || 0) / (totalLeads || 1)) * 100);
    
    // Atualizar campanha
    const { data: updatedCampaign, error: updateError } = await supabase
      .from('campaigns')
      .update({
        success_count: newSuccessCount,
        failed_count: newFailedCount,
        updated_at: new Date().toISOString()
      })
      .eq('id', campaignId)
      .select();

    if (updateError) {
      console.error('❌ Erro ao atualizar progresso:', updateError);
      return res.status(500).json({
        success: false,
        error: 'Erro ao atualizar progresso'
      });
    }

    // Notificar clientes conectados via SSE
    const progressData = {
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
    };
    
    console.log(`📡 Notificando progresso da campanha ${campaignId}:`, progressData);
    sendSSEData(campaignId, { type: 'progress', data: progressData });

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
    
    console.log('🔍 [COMPLETE] Dados recebidos:', { campaignId, successCount, failedCount, totalProcessed });
    
    if (!campaignId) {
      console.error('❌ [COMPLETE] campaignId não fornecido');
      return res.status(400).json({
        success: false,
        error: 'campaignId é obrigatório'
      });
    }

    console.log(`🏁 [COMPLETE] Finalizando campanha: ${campaignId} - ${successCount} sucessos, ${failedCount} falhas`);

    // Determinar status final
    const finalStatus = failedCount > 0 && successCount === 0 ? 'failed' : 'completed';
    
    // Verificar se a campanha existe primeiro
    const { data: existingCampaigns, error: fetchError } = await supabase
      .from('campaigns')
      .select('id, status')
      .eq('id', campaignId);

    if (fetchError) {
      console.error('❌ [COMPLETE] Erro ao buscar campanha:', fetchError);
      return res.status(500).json({
        success: false,
        error: 'Erro ao buscar campanha',
        details: fetchError.message
      });
    }

    if (!existingCampaigns || existingCampaigns.length === 0) {
      console.error('❌ [COMPLETE] Campanha não encontrada:', campaignId);
      return res.status(404).json({
        success: false,
        error: 'Campanha não encontrada',
        details: `Campanha ${campaignId} não existe`
      });
    }

    const existingCampaign = existingCampaigns[0];
    console.log('✅ [COMPLETE] Campanha encontrada:', existingCampaign);

    // Atualizar campanha
    console.log('🔄 [COMPLETE] Atualizando campanha com dados:', {
      status: finalStatus,
      success_count: successCount || 0,
      failed_count: failedCount || 0
    });

    const { data, error } = await supabase
      .from('campaigns')
      .update({
        status: finalStatus,
        success_count: successCount || 0,
        failed_count: failedCount || 0,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', campaignId);

    if (error) {
      console.error('❌ [COMPLETE] Erro ao atualizar campanha:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro ao finalizar campanha',
        details: error.message
      });
    }

    console.log('✅ [COMPLETE] Campanha atualizada com sucesso');

    // Notificar clientes conectados via SSE
    const completionData = {
      campaignId,
      status: finalStatus,
      successCount: successCount || 0,
      failedCount: failedCount || 0,
      totalProcessed: totalProcessed || 0,
      completedAt: new Date().toISOString()
    };
    
    console.log(`📡 Notificando conclusão da campanha ${campaignId}:`, completionData);
    sendSSEData(campaignId, { type: 'complete', data: completionData });

    console.log(`✅ Campanha ${campaignId} finalizada com status: ${finalStatus}`);
    
    const updatedCampaign = existingCampaign;
    
    console.log('🎉 [COMPLETE] Retornando resposta de sucesso:', {
      success: true,
      campaignId,
      finalStatus,
      successCount,
      failedCount
    });

    res.json({
      success: true,
      message: 'Campanha finalizada',
      campaign: updatedCampaign,
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
      .from('campaigns')
      .select('id, status, success_count, failed_count, total_leads, sent_at, completed_at, updated_at')
      .eq('id', campaignId);

    if (error) {
      console.error('❌ Erro ao buscar campanha:', error);
      return res.status(404).json({
        success: false,
        error: 'Campanha não encontrada',
        details: error.message
      });
    }

    if (!data || data.length === 0) {
      console.error('❌ Campanha não encontrada:', campaignId);
      return res.status(404).json({
        success: false,
        error: 'Campanha não encontrada'
      });
    }

    const campaignData = data[0];

    // Calcular progresso
    const progress = campaignData.total_leads > 0 
      ? Math.round(((campaignData.success_count + campaignData.failed_count) / campaignData.total_leads) * 100)
      : 0;

    console.log(`✅ Status da campanha ${campaignId}: ${campaignData.status} (${progress}%)`);
    
    res.json({
      success: true,
      campaign: {
        ...campaignData,
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

/**
 * GET /api/campaign/status/stream/:campaignId
 * Server-Sent Events para monitoramento em tempo real
 */
router.get('/stream/:campaignId', (req, res) => {
  const { campaignId } = req.params;
  
  console.log(`📡 Iniciando SSE para campanha: ${campaignId}`);
  
  // Configurar headers para SSE
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });

  // Enviar evento de conexão
  res.write(`data: ${JSON.stringify({
    type: 'connected',
    campaignId,
    timestamp: new Date().toISOString()
  })}\n\n`);

  // Armazenar conexão
  const connectionId = `${campaignId}_${Date.now()}`;
  activeConnections.set(connectionId, {
    campaignId,
    res,
    timestamp: Date.now()
  });

  // Enviar heartbeat a cada 30 segundos
  const heartbeat = setInterval(() => {
    if (res.writableEnded) {
      clearInterval(heartbeat);
      activeConnections.delete(connectionId);
      return;
    }
    
    res.write(`data: ${JSON.stringify({
      type: 'heartbeat',
      timestamp: new Date().toISOString()
    })}\n\n`);
  }, 30000);

  // Limpar conexão quando cliente desconectar
  req.on('close', () => {
    console.log(`📡 Cliente desconectado da campanha: ${campaignId}`);
    clearInterval(heartbeat);
    activeConnections.delete(connectionId);
  });

  req.on('error', (error) => {
    console.error(`❌ Erro na conexão SSE para campanha ${campaignId}:`, error);
    clearInterval(heartbeat);
    activeConnections.delete(connectionId);
  });
});

/**
 * Função para enviar dados via SSE para uma campanha específica
 */
function sendSSEData(campaignId, data) {
  console.log(`📡 [sendSSEData] Tentando enviar dados para campanha: ${campaignId}`);
  console.log(`📡 [sendSSEData] Conexões ativas totais: ${activeConnections.size}`);
  
  const connections = Array.from(activeConnections.values())
    .filter(conn => conn.campaignId === campaignId);
  
  console.log(`📡 [sendSSEData] Conexões encontradas para campanha ${campaignId}: ${connections.length}`);
  
  if (connections.length === 0) {
    console.log(`⚠️ [sendSSEData] Nenhuma conexão SSE ativa para campanha ${campaignId}`);
    console.log(`📋 [sendSSEData] Conexões ativas:`, Array.from(activeConnections.keys()));
    return;
  }
  
  connections.forEach((conn, index) => {
    if (!conn.res.writableEnded) {
      console.log(`📤 [sendSSEData] Enviando dados via SSE para conexão ${index + 1}:`, data);
      conn.res.write(`data: ${JSON.stringify(data)}\n\n`);
    } else {
      console.log(`🗑️ [sendSSEData] Removendo conexão ${index + 1} (fechada)`);
      activeConnections.delete(conn);
    }
  });
}

module.exports = router;
