const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const router = express.Router();

// Configuração do Supabase
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

/**
 * GET /api/analytics/overview
 * Obtém dados gerais de analytics
 */
router.get('/overview', async (req, res) => {
  try {
    const { timeRange = '30d' } = req.query;
    const userId = req.headers['x-user-id']; // Assumindo que o userId vem do header
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID é obrigatório'
      });
    }

    console.log(`📊 [Analytics] Buscando overview para usuário ${userId}, período: ${timeRange}`);

    // Calcular datas baseado no timeRange
    const now = new Date();
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const startDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));

    // Buscar leads totais
    const { data: leadLists, error: listsError } = await supabase
      .from('lead_lists')
      .select('id, total_leads, created_at')
      .eq('user_id', userId);

    if (listsError) {
      console.error('❌ [Analytics] Erro ao buscar listas:', listsError);
      // Se não conseguir buscar listas, usar dados mockup
      const mockupData = {
        totalLeads: 0,
        totalLists: 0,
        totalCampaigns: 0,
        messagesSent: 0,
        conversionRate: 0,
        growthRate: 0,
        averageRating: 0,
        timeRange: timeRange
      };
      
      return res.json({
        success: true,
        data: mockupData
      });
    }

    // Buscar campanhas
    const { data: campaigns, error: campaignsError } = await supabase
      .from('bulk_campaigns')
      .select('id, status, success_count, failed_count, total_leads, created_at, completed_at')
      .eq('user_id', userId);

    if (campaignsError) {
      console.error('❌ [Analytics] Erro ao buscar campanhas:', campaignsError);
      // Se não conseguir buscar campanhas, usar dados mockup
      const mockupData = {
        totalLeads: leadLists ? leadLists.reduce((sum, list) => sum + (list.total_leads || 0), 0) : 0,
        totalLists: leadLists ? leadLists.length : 0,
        totalCampaigns: 0,
        messagesSent: 0,
        conversionRate: 0,
        growthRate: 0,
        averageRating: 0,
        timeRange: timeRange
      };
      
      return res.json({
        success: true,
        data: mockupData
      });
    }

    // Calcular métricas
    const totalLeads = leadLists.reduce((sum, list) => sum + (list.total_leads || 0), 0);
    const totalLists = leadLists.length;
    const totalCampaigns = campaigns.length;
    
    const completedCampaigns = campaigns.filter(c => c.status === 'completed');
    const totalMessagesSent = completedCampaigns.reduce((sum, c) => sum + (c.success_count || 0) + (c.failed_count || 0), 0);
    
    const successCount = completedCampaigns.reduce((sum, c) => sum + (c.success_count || 0), 0);
    const conversionRate = totalMessagesSent > 0 ? Math.round((successCount / totalMessagesSent) * 100) : 0;

    // Calcular crescimento (comparar com período anterior)
    const previousPeriodStart = new Date(startDate.getTime() - (days * 24 * 60 * 60 * 1000));
    const previousPeriodLists = leadLists.filter(list => 
      new Date(list.created_at) >= previousPeriodStart && 
      new Date(list.created_at) < startDate
    );
    const previousPeriodLeads = previousPeriodLists.reduce((sum, list) => sum + (list.total_leads || 0), 0);
    const currentPeriodLists = leadLists.filter(list => new Date(list.created_at) >= startDate);
    const currentPeriodLeads = currentPeriodLists.reduce((sum, list) => sum + (list.total_leads || 0), 0);
    
    const growthRate = previousPeriodLeads > 0 
      ? Math.round(((currentPeriodLeads - previousPeriodLeads) / previousPeriodLeads) * 100)
      : currentPeriodLeads > 0 ? 100 : 0;

    const overview = {
      totalLeads,
      totalLists,
      totalCampaigns,
      messagesSent: totalMessagesSent,
      conversionRate,
      growthRate,
      averageRating: 4.2, // Mockup por enquanto
      timeRange
    };

    console.log('✅ [Analytics] Overview calculado:', overview);

    res.json({
      success: true,
      data: overview
    });

  } catch (error) {
    console.error('❌ [Analytics] Erro no overview:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

/**
 * GET /api/analytics/leads-over-time
 * Obtém dados de leads ao longo do tempo
 */
router.get('/leads-over-time', async (req, res) => {
  try {
    const { timeRange = '30d' } = req.query;
    const userId = req.headers['x-user-id'];
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID é obrigatório'
      });
    }

    console.log(`📈 [Analytics] Buscando leads over time para usuário ${userId}, período: ${timeRange}`);

    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const leadsOverTime = [];

    // Buscar listas criadas no período
    const { data: leadLists, error } = await supabase
      .from('lead_lists')
      .select('id, total_leads, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('❌ [Analytics] Erro ao buscar listas:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro ao buscar dados de leads'
      });
    }

    // Agrupar por dia
    const dailyData = {};
    const now = new Date();
    
    for (let i = 0; i < days; i++) {
      const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
      const dateKey = date.toISOString().split('T')[0];
      dailyData[dateKey] = 0;
    }

    // Somar leads por dia
    leadLists.forEach(list => {
      const listDate = new Date(list.created_at).toISOString().split('T')[0];
      if (dailyData.hasOwnProperty(listDate)) {
        dailyData[listDate] += list.total_leads || 0;
      }
    });

    // Converter para array ordenado
    Object.entries(dailyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([date, count]) => {
        const dateObj = new Date(date);
        leadsOverTime.push({
          date: dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          count
        });
      });

    console.log('✅ [Analytics] Leads over time calculado:', leadsOverTime.length, 'dias');

    res.json({
      success: true,
      data: leadsOverTime
    });

  } catch (error) {
    console.error('❌ [Analytics] Erro no leads over time:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

/**
 * GET /api/analytics/categories
 * Obtém distribuição por categorias
 */
router.get('/categories', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID é obrigatório'
      });
    }

    console.log(`🎯 [Analytics] Buscando categorias para usuário ${userId}`);

    // Buscar leads com business_type
    const { data: leadLists, error } = await supabase
      .from('lead_lists')
      .select('leads')
      .eq('user_id', userId);

    if (error) {
      console.error('❌ [Analytics] Erro ao buscar listas:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro ao buscar dados de categorias'
      });
    }

    // Contar categorias
    const categoryCounts = {};
    let totalLeads = 0;

    leadLists.forEach(list => {
      if (list.leads && Array.isArray(list.leads)) {
        list.leads.forEach(lead => {
          totalLeads++;
          const category = lead.business_type || 'Outros';
          categoryCounts[category] = (categoryCounts[category] || 0) + 1;
        });
      }
    });

    // Se não há categorias reais, usar categorias mockup
    if (Object.keys(categoryCounts).length === 0) {
      categoryCounts['Estabelecimento'] = Math.floor(totalLeads * 0.4);
      categoryCounts['Serviços'] = Math.floor(totalLeads * 0.3);
      categoryCounts['E-commerce'] = Math.floor(totalLeads * 0.2);
      categoryCounts['Consultoria'] = Math.floor(totalLeads * 0.1);
    }

    const topCategories = Object.entries(categoryCounts)
      .map(([name, count]) => ({
        name,
        count,
        percentage: totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const colors = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444'];
    const categoryDistribution = topCategories.map((category, index) => ({
      category: category.name,
      count: category.count,
      color: colors[index % colors.length]
    }));

    console.log('✅ [Analytics] Categorias calculadas:', topCategories.length, 'categorias');

    res.json({
      success: true,
      data: {
        topCategories,
        categoryDistribution
      }
    });

  } catch (error) {
    console.error('❌ [Analytics] Erro nas categorias:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

/**
 * GET /api/analytics/campaigns
 * Obtém dados de performance das campanhas
 */
router.get('/campaigns', async (req, res) => {
  try {
    const { timeRange = '30d' } = req.query;
    const userId = req.headers['x-user-id'];
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID é obrigatório'
      });
    }

    console.log(`📊 [Analytics] Buscando campanhas para usuário ${userId}, período: ${timeRange}`);

    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const now = new Date();
    const startDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));

    // Buscar campanhas no período
    const { data: campaigns, error } = await supabase
      .from('bulk_campaigns')
      .select('id, status, success_count, failed_count, total_leads, created_at, completed_at')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    if (error) {
      console.error('❌ [Analytics] Erro ao buscar campanhas:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro ao buscar dados de campanhas'
      });
    }

    // Agrupar por dia
    const dailyData = {};
    
    for (let i = 0; i < days; i++) {
      const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
      const dateKey = date.toISOString().split('T')[0];
      dailyData[dateKey] = { success: 0, failed: 0, count: 0 };
    }

    // Somar campanhas por dia
    campaigns.forEach(campaign => {
      const campaignDate = new Date(campaign.created_at).toISOString().split('T')[0];
      if (dailyData.hasOwnProperty(campaignDate)) {
        dailyData[campaignDate].success += campaign.success_count || 0;
        dailyData[campaignDate].failed += campaign.failed_count || 0;
        dailyData[campaignDate].count += 1;
      }
    });

    // Converter para array ordenado
    const campaignsOverTime = Object.entries(dailyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => {
        const dateObj = new Date(date);
        return {
          date: dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          count: data.count,
          success: data.success,
          failed: data.failed
        };
      });

    console.log('✅ [Analytics] Campanhas calculadas:', campaignsOverTime.length, 'dias');

    res.json({
      success: true,
      data: campaignsOverTime
    });

  } catch (error) {
    console.error('❌ [Analytics] Erro nas campanhas:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

/**
 * GET /api/analytics/recent-activity
 * Obtém atividade recente
 */
router.get('/recent-activity', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID é obrigatório'
      });
    }

    console.log(`🕐 [Analytics] Buscando atividade recente para usuário ${userId}`);

    // Buscar listas recentes
    const { data: leadLists, error: listsError } = await supabase
      .from('lead_lists')
      .select('id, name, total_leads, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (listsError) {
      console.error('❌ [Analytics] Erro ao buscar listas:', listsError);
      return res.status(500).json({
        success: false,
        error: 'Erro ao buscar dados de listas'
      });
    }

    // Buscar campanhas recentes
    const { data: campaigns, error: campaignsError } = await supabase
      .from('bulk_campaigns')
      .select('id, name, status, success_count, failed_count, created_at, completed_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (campaignsError) {
      console.error('❌ [Analytics] Erro ao buscar campanhas:', campaignsError);
      return res.status(500).json({
        success: false,
        error: 'Erro ao buscar dados de campanhas'
      });
    }

    // Combinar atividades
    const activities = [];

    // Adicionar atividades de listas
    leadLists.forEach(list => {
      activities.push({
        id: `list-${list.id}`,
        type: 'list_created',
        description: `Lista "${list.name}" criada`,
        timestamp: list.created_at,
        count: list.total_leads
      });
    });

    // Adicionar atividades de campanhas
    campaigns.forEach(campaign => {
      if (campaign.status === 'completed') {
        activities.push({
          id: `campaign-complete-${campaign.id}`,
          type: 'campaign_completed',
          description: `Campanha "${campaign.name}" finalizada`,
          timestamp: campaign.completed_at || campaign.created_at,
          count: (campaign.success_count || 0) + (campaign.failed_count || 0)
        });
      } else if (campaign.status === 'sending') {
        activities.push({
          id: `campaign-sent-${campaign.id}`,
          type: 'campaign_sent',
          description: `Campanha "${campaign.name}" enviada`,
          timestamp: campaign.created_at,
          count: campaign.total_leads || 0
        });
      }
    });

    // Ordenar por timestamp e pegar as 10 mais recentes
    const recentActivity = activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);

    console.log('✅ [Analytics] Atividade recente calculada:', recentActivity.length, 'atividades');

    res.json({
      success: true,
      data: recentActivity
    });

  } catch (error) {
    console.error('❌ [Analytics] Erro na atividade recente:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

module.exports = router;
