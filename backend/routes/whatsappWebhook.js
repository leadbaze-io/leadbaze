const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const router = express.Router();

// Configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware para verificar autenticação do webhook
const verifyWebhookAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const expectedToken = process.env.WHATSAPP_WEBHOOK_TOKEN;

  if (!authHeader || !expectedToken) {
    return res.status(401).json({ error: 'Token de autenticação não configurado' });
  }

  const token = authHeader.replace('Bearer ', '');
  if (token !== expectedToken) {
    return res.status(401).json({ error: 'Token inválido' });
  }

  next();
};

// Endpoint para receber respostas do WhatsApp
router.post('/response', verifyWebhookAuth, async (req, res) => {
  try {
    const {
      campaign_id,
      lead_phone,
      lead_name,
      response_text,
      response_type,
      response_time,
      message_id,
      user_id
    } = req.body;

    // Validar dados obrigatórios
    if (!campaign_id || !lead_phone || !response_text || !user_id) {
      return res.status(400).json({
        error: 'Dados obrigatórios não fornecidos',
        required: ['campaign_id', 'lead_phone', 'response_text', 'user_id']
      });
    }

    // Classificar automaticamente o tipo de resposta se não fornecido
    let classifiedResponseType = response_type;
    if (!classifiedResponseType) {
      classifiedResponseType = classifyResponse(response_text);
    }

    // Inserir resposta no banco de dados
    const { data, error } = await supabase
      .from('whatsapp_responses')
      .insert({
        campaign_id,
        lead_phone,
        lead_name,
        response_type: classifiedResponseType,
        response_text,
        response_time,
        message_id,
        user_id
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao inserir resposta:', error);
      return res.status(500).json({ error: 'Erro ao salvar resposta' });
    }

    // Atualizar métricas da campanha
    await updateCampaignMetrics(campaign_id, user_id);

    // Gerar insights se necessário
    await generateResponseInsights(user_id, campaign_id, classifiedResponseType);

    res.status(200).json({
      success: true,
      response_id: data.id,
      message: 'Resposta salva com sucesso'
    });

  } catch (error) {
    console.error('Erro no webhook de resposta:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Endpoint para receber status de entrega das mensagens
router.post('/delivery-status', verifyWebhookAuth, async (req, res) => {
  try {
    console.log('📨 [Webhook] Recebido delivery-status:', JSON.stringify(req.body, null, 2));

    const {
      campaign_id,
      lead_phone,
      status, // sent, delivered, read, failed
      message_id,
      user_id,
      error_message
    } = req.body;

    // Validar dados obrigatórios
    if (!campaign_id || !lead_phone || !status || !user_id) {
      console.error('❌ [Webhook] Dados incompletos:', req.body);
      return res.status(400).json({
        error: 'Dados obrigatórios não fornecidos',
        required: ['campaign_id', 'lead_phone', 'status', 'user_id'],
        received: req.body
      });
    }

    // Atualizar status na tabela de campanhas
    const updateField = status === 'delivered' || status === 'read' ? 'success_count' : 'failed_count';

    const { error, count } = await supabase
      .from('bulk_campaigns')
      .update({
        [updateField]: supabase.raw(`${updateField} + 1`),
        updated_at: new Date().toISOString()
      })
      .eq('id', campaign_id)
      .eq('user_id', user_id)
      .select('id', { count: 'exact' });

    if (error) {
      console.error('❌ [Webhook] Erro ao atualizar status da campanha:', error);
      return res.status(500).json({ error: 'Erro ao atualizar campanha' });
    }

    if (count === 0) {
      console.warn(`⚠️ [Webhook] Nenhuma campanha encontrada/atualizada para ID: ${campaign_id} e User: ${user_id}`);
    } else {
      console.log(`✅ [Webhook] Status atualizado para ${lead_phone}: ${status} (Campanha: ${campaign_id})`);
    }

    res.status(200).json({
      success: true,
      message: 'Status atualizado com sucesso'
    });

  } catch (error) {
    console.error('Erro no webhook de status:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Endpoint para receber vendas/conversões
router.post('/conversion', verifyWebhookAuth, async (req, res) => {
  try {
    const {
      campaign_id,
      lead_phone,
      lead_name,
      sale_value,
      sale_currency = 'BRL',
      product_service,
      conversion_source = 'whatsapp',
      user_id
    } = req.body;

    // Validar dados obrigatórios
    if (!campaign_id || !lead_phone || !sale_value || !user_id) {
      return res.status(400).json({
        error: 'Dados obrigatórios não fornecidos',
        required: ['campaign_id', 'lead_phone', 'sale_value', 'user_id']
      });
    }

    // Inserir conversão no banco de dados
    const { data, error } = await supabase
      .from('sales_conversions')
      .insert({
        campaign_id,
        lead_phone,
        lead_name,
        sale_value: parseFloat(sale_value),
        sale_currency,
        product_service,
        conversion_source,
        user_id,
        sale_date: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao inserir conversão:', error);
      return res.status(500).json({ error: 'Erro ao salvar conversão' });
    }

    // Gerar insights de conversão
    await generateConversionInsights(user_id, campaign_id, sale_value);

    res.status(200).json({
      success: true,
      conversion_id: data.id,
      message: 'Conversão salva com sucesso'
    });

  } catch (error) {
    console.error('Erro no webhook de conversão:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Endpoint genérico para eventos da Evolution API (Connection, etc)
router.post('/events', verifyWebhookAuth, async (req, res) => {
  try {
    const eventData = req.body;
    const { instance, event, data } = eventData;

    console.log(`📡 [Webhook Event] Recebido evento ${event} para instância ${instance}`);

    // Tratamento de CONNECTION_UPDATE
    if (event === 'connection.update' || (eventData.type === 'connection' && eventData.state)) {
      // Normalizar dados dependendo da versão da Evolution
      const state = data?.state || eventData.state;
      const instanceName = instance || eventData.instance;

      if (instanceName && state) {
        console.log(`🔄 [Connection Update] Instância: ${instanceName}, Novo Estado: ${state}`);

        // Mapear status da Evolution para status do nosso banco
        let dbStatus = 'disconnected';
        if (state === 'open') dbStatus = 'connected';
        else if (state === 'connecting') dbStatus = 'connecting';
        else if (state === 'close' || state === 'closed') dbStatus = 'disconnected';

        // Atualizar no Supabase
        const { error } = await supabase
          .from('whatsapp_instances')
          .update({
            status: dbStatus,
            updated_at: new Date().toISOString()
          })
          .eq('instance_name', instanceName);

        if (error) {
          console.error('❌ Erro ao atualizar status da instância no banco:', error);
        } else {
          console.log(`✅ Status da instância ${instanceName} atualizado para ${dbStatus}`);
        }
      }
    }

    // Tratamento de STATUS DE MENSAGEM (MESSAGES_UPDATE / messages.update)
    if (event === 'messages.update' || event === 'MESSAGES_UPDATE' || eventData.type === 'message_update') {
      const messages = data || eventData.data;
      const messageList = Array.isArray(messages) ? messages : [messages];
      const instanceName = instance || eventData.instance;

      if (instanceName) {
        console.log(`📨 [Webhook Event] Processando ${messageList.length} atualizações de mensagem para ${instanceName}`);

        // 1. Encontrar o usuário dono dessa instância
        const { data: instanceData, error: instanceError } = await supabase
          .from('whatsapp_instances')
          .select('user_id')
          .eq('instance_name', instanceName)
          .single();

        if (instanceData) {
          const userId = instanceData.user_id;
          let successCount = 0;
          let failedCount = 0;

          for (const msg of messageList) {
            // Normalizar status
            const status = (msg.status || '').toLowerCase();
            const remoteJid = msg.key?.remoteJid || '';
            const phone = remoteJid.split('@')[0];

            // Ignorar status irrelevantes
            if (['pending', 'playing', 'server_ack'].includes(status)) continue;

            console.log(`🔍 [Status Update] ${phone} -> ${status}`);

            // Mapear status para contadores (Heurística: apenas 'delivered' ou 'read' contam como sucesso)
            // 'server_ack' ignorado para evitar contagem antecipada/dupla.
            if (['delivery_ack', 'delivered', 'read', 'played'].includes(status)) {
              // Contar apenas se for a transição para entregue/lido
              successCount++;
            } else if (['failed', 'error'].includes(status)) {
              failedCount++;
            }
          }

          if (successCount > 0 || failedCount > 0) {
            console.log(`📊 [Webhook Event] Atualizando campanhas para User ${userId}: +${successCount} sucessos, +${failedCount} falhas`);

            // 2. Encontrar campanha ATIVA ou RECENTE deste usuário na tabela campaigns (correta)
            const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

            const { data: activeCampaigns } = await supabase
              .from('campaigns')
              .select('id, status, success_count, failed_count')
              .eq('user_id', userId)
              .gte('updated_at', oneDayAgo)
              .neq('status', 'cancelled')
              .order('updated_at', { ascending: false })
              .limit(1);

            if (activeCampaigns && activeCampaigns.length > 0) {
              const campaign = activeCampaigns[0];
              console.log(`🎯 [Webhook Event] Atualizando campanha ${campaign.id} (${campaign.status})`);

              const { error: updateError } = await supabase
                .from('campaigns')
                .update({
                  success_count: (campaign.success_count || 0) + successCount,
                  failed_count: (campaign.failed_count || 0) + failedCount,
                  updated_at: new Date().toISOString()
                })
                .eq('id', campaign.id);

              if (updateError) {
                console.error('❌ Erro ao atualizar contadores da campanha:', updateError);
              } else {
                console.log('✅ Campanha atualizada com sucesso!');
              }
            } else {
              console.warn('⚠️ Nenhuma campanha ativa encontrada na tabela campaigns nos últimos 24h.');
            }
          }
        }
      }
    }

    res.status(200).json({ success: true });

  } catch (error) {
    console.error('❌ Erro no webhook de eventos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Função para classificar automaticamente o tipo de resposta
function classifyResponse(responseText) {
  const text = responseText.toLowerCase();

  // Palavras positivas
  const positiveWords = [
    'sim', 'yes', 'interessado', 'quero', 'gostaria', 'pode', 'pode ser',
    'legal', 'bom', 'ótimo', 'excelente', 'perfeito', 'combinado', 'ok',
    'aceito', 'vamos', 'pode ser', 'me interessa', 'tenho interesse'
  ];

  // Palavras negativas
  const negativeWords = [
    'não', 'no', 'não quero', 'não tenho interesse', 'não me interessa',
    'não preciso', 'não obrigado', 'não obrigada', 'não estou interessado',
    'não estou interessada', 'não quero', 'não posso', 'não dá', 'não rola'
  ];

  // Palavras de pergunta
  const questionWords = [
    '?', 'quanto', 'como', 'quando', 'onde', 'por que', 'porque',
    'pode me explicar', 'como funciona', 'quanto custa', 'qual o preço',
    'tem desconto', 'tem promoção', 'como faço', 'o que preciso'
  ];

  // Palavras de descadastro
  const unsubscribeWords = [
    'parar', 'sair', 'remover', 'descadastrar', 'não quero receber',
    'pare de enviar', 'não me envie mais', 'remover da lista'
  ];

  // Verificar descadastro primeiro
  if (unsubscribeWords.some(word => text.includes(word))) {
    return 'unsubscribe';
  }

  // Verificar perguntas
  if (questionWords.some(word => text.includes(word))) {
    return 'question';
  }

  // Verificar respostas negativas
  if (negativeWords.some(word => text.includes(word))) {
    return 'negative';
  }

  // Verificar respostas positivas
  if (positiveWords.some(word => text.includes(word))) {
    return 'positive';
  }

  // Default para neutro
  return 'neutral';
}

// Função para atualizar métricas da campanha
async function updateCampaignMetrics(campaignId, userId) {
  try {
    // Buscar todas as respostas da campanha
    const { data: responses, error: responsesError } = await supabase
      .from('whatsapp_responses')
      .select('response_type')
      .eq('campaign_id', campaignId)
      .eq('user_id', userId);

    if (responsesError) {
      console.error('Erro ao buscar respostas:', responsesError);
      return;
    }

    // Calcular métricas
    const totalResponses = responses.length;
    const positiveResponses = responses.filter(r => r.response_type === 'positive').length;
    const responseRate = totalResponses > 0 ? (positiveResponses / totalResponses) * 100 : 0;

    // Atualizar métricas na tabela de performance
    const { error: metricsError } = await supabase
      .from('campaign_performance_metrics')
      .upsert({
        campaign_id: campaignId,
        user_id: userId,
        metric_type: 'response_rate',
        metric_value: responseRate,
        metric_period: 'total',
        created_at: new Date().toISOString()
      });

    if (metricsError) {
      console.error('Erro ao atualizar métricas:', metricsError);
    }

  } catch (error) {
    console.error('Erro ao atualizar métricas da campanha:', error);
  }
}

// Função para gerar insights de resposta
async function generateResponseInsights(userId, campaignId, responseType) {
  try {
    // Buscar campanha
    const { data: campaign, error: campaignError } = await supabase
      .from('bulk_campaigns')
      .select('name, success_count, failed_count')
      .eq('id', campaignId)
      .eq('user_id', userId)
      .single();

    if (campaignError || !campaign) {
      return;
    }

    // Gerar insight baseado no tipo de resposta
    let insight = null;

    if (responseType === 'positive') {
      insight = {
        user_id: userId,
        insight_type: 'performance_alert',
        title: 'Resposta Positiva Recebida!',
        description: `Ótimo! Você recebeu uma resposta positiva da campanha "${campaign.name}". Continue o follow-up para converter este lead.`,
        severity: 'info',
        is_actionable: true,
        action_url: `/campaigns/${campaignId}`
      };
    } else if (responseType === 'question') {
      insight = {
        user_id: userId,
        insight_type: 'recommendation',
        title: 'Lead com Perguntas',
        description: `Um lead da campanha "${campaign.name}" fez uma pergunta. Responda rapidamente para manter o engajamento.`,
        severity: 'warning',
        is_actionable: true,
        action_url: `/campaigns/${campaignId}`
      };
    } else if (responseType === 'unsubscribe') {
      insight = {
        user_id: userId,
        insight_type: 'performance_alert',
        title: 'Lead Solicitou Descadastro',
        description: `Um lead da campanha "${campaign.name}" solicitou para ser removido da lista. Considere revisar sua abordagem.`,
        severity: 'warning',
        is_actionable: true,
        action_url: `/campaigns/${campaignId}`
      };
    }

    if (insight) {
      await supabase
        .from('analytics_insights')
        .insert(insight);
    }

  } catch (error) {
    console.error('Erro ao gerar insights de resposta:', error);
  }
}

// Função para gerar insights de conversão
async function generateConversionInsights(userId, campaignId, saleValue) {
  try {
    // Buscar campanha
    const { data: campaign, error: campaignError } = await supabase
      .from('bulk_campaigns')
      .select('name')
      .eq('id', campaignId)
      .eq('user_id', userId)
      .single();

    if (campaignError || !campaign) {
      return;
    }

    // Gerar insight de conversão
    const insight = {
      user_id: userId,
      insight_type: 'performance_alert',
      title: '🎉 Venda Realizada!',
      description: `Parabéns! Você fechou uma venda de R$ ${parseFloat(saleValue).toFixed(2)} através da campanha "${campaign.name}".`,
      severity: 'info',
      is_actionable: false,
      data: {
        sale_value: parseFloat(saleValue),
        campaign_id: campaignId
      }
    };

    await supabase
      .from('analytics_insights')
      .insert(insight);

  } catch (error) {
    console.error('Erro ao gerar insights de conversão:', error);
  }
}

module.exports = router;



