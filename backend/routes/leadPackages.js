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
    console.log('📦 [LeadPackages] Buscando pacotes no banco de dados...');
    
    // Buscar pacotes ativos do banco de dados
    const { data: packages, error } = await perfectPayService.supabase
      .from('lead_packages')
      .select('*')
      .eq('active', true)
      .order('leads', { ascending: true });

    if (error) {
      console.error('❌ [LeadPackages] Erro ao buscar pacotes:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Erro ao buscar pacotes no banco de dados',
        error: error.message
      });
    }

    if (!packages || packages.length === 0) {
      console.log('⚠️ [LeadPackages] Nenhum pacote encontrado no banco de dados');
      return res.json({
        success: true,
        packages: []
      });
    }

    console.log(`✅ [LeadPackages] ${packages.length} pacotes encontrados`);

    // Formatar resposta
    const formattedPackages = packages.map(pkg => ({
      id: pkg.package_id,
      name: pkg.name,
      leads: pkg.leads,
      price_cents: pkg.price_cents,
      price_formatted: `R$ ${(pkg.price_cents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      description: pkg.description,
      popular: pkg.popular,
      icon: pkg.icon,
      perfect_pay_code: pkg.perfect_pay_code,
      checkout_url: pkg.checkout_url
    }));

    res.json({
      success: true,
      packages: formattedPackages
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

    // Buscar dados do pacote no banco de dados
    const { data: packageData, error: packageError } = await perfectPayService.supabase
      .from('lead_packages')
      .select('*')
      .eq('package_id', packageId)
      .eq('active', true)
      .single();

    if (packageError || !packageData) {
      return res.status(404).json({
        success: false,
        message: 'Pacote não encontrado ou inativo'
      });
    }

    // Criar checkout usando Perfect Pay
    const checkoutData = {
      email: userEmail,
      customer_name: userName,
      external_reference: `${packageId}_${userId}_${Date.now()}`,
      description: `🎯 ${packageData.name} - LeadBaze`,
      amount: packageData.price_cents / 100, // Converter centavos para reais
      notification_url: `${process.env.BACKEND_URL}/api/perfect-pay/webhook`,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://leadbaze.io'}/profile?tab=lead-packages&success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://leadbaze.io'}/profile?tab=lead-packages&cancel=true`
    };

    // Usar URL específica do pacote
    const checkoutUrl = packageData.checkout_url;

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
      
      // Validar formato: leads_packageId_userId_timestamp
      if (refParts.length < 4 || refParts[0] !== 'leads') {
        console.error('❌ [LeadPackages] Formato de external_reference inválido:', webhookData.external_reference);
        return res.status(400).json({ success: false, message: 'Formato de referência inválido' });
      }
      
      const packageId = `${refParts[0]}_${refParts[1]}`; // leads_1000
      const userId = refParts[2];
      
      console.log(`🎯 [LeadPackages] Dados extraídos:`, { packageId, userId });
      
      // Verificar se já foi processado (evitar duplicatas)
      const transactionId = webhookData.code || webhookData.transaction_id;
      if (transactionId) {
        const { data: existingLog } = await perfectPayService.supabase
          .from('subscription_activity_logs')
          .select('id')
          .eq('transaction_id', transactionId)
          .eq('activity_type', 'lead_package_purchase')
          .single();
        
        if (existingLog) {
          console.log('⚠️ [LeadPackages] Transação já processada:', transactionId);
          return res.json({ success: true, message: 'Transação já processada' });
        }
      }
      
      // Buscar dados do pacote no banco de dados
      const { data: packageData, error: packageError } = await perfectPayService.supabase
        .from('lead_packages')
        .select('*')
        .eq('package_id', packageId)
        .eq('active', true)
        .single();
      
      if (packageError || !packageData) {
        console.error('❌ [LeadPackages] Pacote não encontrado:', packageId);
        return res.json({ success: false, message: 'Pacote não encontrado' });
      }
      
      const leads = packageData.leads;
      
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
        transaction_id: transactionId
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





