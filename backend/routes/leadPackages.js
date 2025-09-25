const express = require('express');
const router = express.Router();
const PerfectPayService = require('../services/perfectPayService');

const perfectPayService = new PerfectPayService();

/**
 * GET /api/lead-packages
 * Listar pacotes de leads disponíveis
 */
router.get('/', async (req, res) => {
  try {
    const packages = [
      {
        id: 'leads_500',
        name: 'Pacote 500 Leads',
        leads: 500,
        price_cents: 0, // Você definirá os preços
        description: 'Ideal para campanhas pequenas',
        popular: false,
        icon: '📊'
      },
      {
        id: 'leads_1000',
        name: 'Pacote 1.000 Leads',
        leads: 1000,
        price_cents: 0, // Você definirá os preços
        description: 'Perfeito para testes e validações',
        popular: true,
        icon: '🚀'
      },
      {
        id: 'leads_2000',
        name: 'Pacote 2.000 Leads',
        leads: 2000,
        price_cents: 0, // Você definirá os preços
        description: 'Excelente para campanhas médias',
        popular: false,
        icon: '⚡'
      },
      {
        id: 'leads_5000',
        name: 'Pacote 5.000 Leads',
        leads: 5000,
        price_cents: 0, // Você definirá os preços
        description: 'Ideal para campanhas grandes',
        popular: false,
        icon: '🎯'
      },
      {
        id: 'leads_10000',
        name: 'Pacote 10.000 Leads',
        leads: 10000,
        price_cents: 0, // Você definirá os preços
        description: 'Para campanhas enterprise',
        popular: false,
        icon: '💎'
      }
    ];

    res.json({
      success: true,
      packages: packages.map(pkg => ({
        ...pkg,
        price_formatted: `R$ ${(pkg.price_cents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
      }))
    });

  } catch (error) {
    console.error('❌ [LeadPackages] Erro ao listar pacotes:', error.message);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

/**
 * POST /api/lead-packages/purchase
 * Criar checkout para compra de pacote de leads
 */
router.post('/purchase', async (req, res) => {
  try {
    const { userId, packageId, leads } = req.body;
    
    if (!userId || !packageId || !leads) {
      return res.status(400).json({
        success: false,
        message: 'userId, packageId e leads são obrigatórios'
      });
    }

    console.log(`🛒 [LeadPackages] Compra de pacote iniciada:`, {
      userId,
      packageId,
      leads
    });

    // Buscar dados do usuário
    const { data: userData, error: userError } = await perfectPayService.supabase.auth.admin.getUserById(userId);
    
    if (userError || !userData) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    const userEmail = userData.user.email;
    const userName = userData.user.user_metadata?.full_name || userData.user.user_metadata?.name || 'Cliente';

    // Criar checkout usando Perfect Pay
    const checkoutData = {
      email: userEmail,
      customer_name: userName,
      external_reference: `leads_${packageId}_${userId}_${Date.now()}`,
      description: `🎯 Pacote de ${leads} Leads Extras - LeadBaze`,
      amount: 500, // R$ 5,00 para teste (você definirá os preços reais)
      notification_url: `${process.env.BACKEND_URL}/api/perfect-pay/webhook`,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/profile?tab=lead-packages&success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/profile?tab=lead-packages&cancel=true`
    };

    // Usar link fixo do Perfect Pay (você criará links específicos para cada pacote)
    const checkoutUrl = perfectPayService.getPerfectPayLink('leads_package'); // Link específico para pacotes

    res.json({
      success: true,
      message: 'Checkout criado com sucesso',
      checkout_url: checkoutUrl,
      checkout_data: checkoutData,
      package: {
        id: packageId,
        leads,
        price_formatted: 'R$ 5,00' // Preço de teste
      }
    });

  } catch (error) {
    console.error('❌ [LeadPackages] Erro na compra:', error.message);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

/**
 * POST /api/lead-packages/webhook
 * Processar webhook de compra de pacote de leads
 */
router.post('/webhook', async (req, res) => {
  try {
    console.log('🎯 [LeadPackages] Webhook de pacote recebido:', req.body);
    
    const webhookData = req.body;
    
    // Validar se é um pagamento de pacote de leads
    if (webhookData.external_reference && webhookData.external_reference.startsWith('leads_')) {
      console.log('🎯 [LeadPackages] Processando compra de pacote de leads...');
      
      // Extrair dados do external_reference
      const refParts = webhookData.external_reference.split('_');
      const packageId = refParts[1];
      const userId = refParts[2];
      const leads = parseInt(refParts[1].replace('leads', ''));
      
      console.log(`🎯 [LeadPackages] Dados extraídos:`, { packageId, userId, leads });
      
      // Buscar assinatura ativa do usuário
      const { data: subscription, error: subError } = await perfectPayService.supabase
        .from('user_payment_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();
      
      if (subError || !subscription) {
        console.log('⚠️ [LeadPackages] Usuário sem assinatura ativa, ignorando compra de pacote');
        return res.json({ success: true, message: 'Usuário sem assinatura ativa' });
      }
      
      // Adicionar leads extras à assinatura
      const newLeadsBalance = subscription.leads_balance + leads;
      
      const { error: updateError } = await perfectPayService.supabase
        .from('user_payment_subscriptions')
        .update({
          leads_balance: newLeadsBalance,
          updated_at: new Date().toISOString()
        })
        .eq('id', subscription.id);
      
      if (updateError) {
        console.error('❌ [LeadPackages] Erro ao atualizar leads:', updateError.message);
        return res.status(500).json({ success: false, error: updateError.message });
      }
      
      // Log da atividade
      await perfectPayService.logSubscriptionActivity(userId, 'lead_package_purchase', {
        package_id: packageId,
        leads_added: leads,
        new_total: newLeadsBalance,
        transaction_id: webhookData.code || webhookData.transaction_id
      });
      
      console.log(`✅ [LeadPackages] Pacote processado: +${leads} leads para usuário ${userId}`);
      console.log(`📊 [LeadPackages] Novo saldo: ${newLeadsBalance} leads`);
      
      return res.json({
        success: true,
        message: 'Pacote de leads processado com sucesso',
        leads_added: leads,
        new_balance: newLeadsBalance
      });
    }
    
    // Se não é um pacote de leads, passar para o webhook normal
    return res.redirect('/api/perfect-pay/webhook');
    
  } catch (error) {
    console.error('❌ [LeadPackages] Erro no webhook:', error.message);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

module.exports = router;

