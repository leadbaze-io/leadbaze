const crypto = require('crypto');

/**
 * Valida a assinatura do webhook do MercadoPago
 * @param {Object} payload - Dados do webhook
 * @param {string} signature - Assinatura recebida no header x-signature
 * @param {string} requestId - ID da requisição recebido no header x-request-id
 * @returns {boolean} - True se a assinatura for válida
 */
function validateMercadoPagoWebhook(payload, signature, requestId) {
  try {
    const webhookSecret = process.env.MERCADO_PAGO_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      console.log('⚠️ [Webhook] MERCADO_PAGO_WEBHOOK_SECRET não configurado');
      return false;
    }

    if (!signature) {
      console.log('⚠️ [Webhook] Assinatura não fornecida');
      return false;
    }

    // Extrair ts e v1 da assinatura
    // Formato: ts=1234567890,v1=hash
    const signatureParts = {};
    signature.split(',').forEach(part => {
      const [key, value] = part.split('=');
      signatureParts[key] = value;
    });

    const timestamp = signatureParts.ts;
    const hash = signatureParts.v1;

    if (!timestamp || !hash) {
      console.log('❌ [Webhook] Formato de assinatura inválido:', signature);
      return false;
    }

    // Criar string para validação
    // Formato: id + request_id + ts + payload
    const dataId = payload.data?.id || payload.id || '';
    const stringToSign = `${dataId}${requestId}${timestamp}`;
    
    console.log('🔍 [Webhook] Validando assinatura:');
    console.log('  - Data ID:', dataId);
    console.log('  - Request ID:', requestId);
    console.log('  - Timestamp:', timestamp);
    console.log('  - String to sign:', stringToSign);
    
    // Calcular HMAC SHA256
    const expectedHash = crypto
      .createHmac('sha256', webhookSecret)
      .update(stringToSign)
      .digest('hex');

    console.log('  - Expected hash:', expectedHash);
    console.log('  - Received hash:', hash);

    // Comparar hashes de forma segura
    const isValid = crypto.timingSafeEqual(
      Buffer.from(expectedHash, 'hex'),
      Buffer.from(hash, 'hex')
    );

    if (isValid) {
      console.log('✅ [Webhook] Assinatura válida');
    } else {
      console.log('❌ [Webhook] Assinatura inválida');
    }

    return isValid;

  } catch (error) {
    console.error('❌ [Webhook] Erro ao validar assinatura:', error);
    return false;
  }
}

/**
 * Middleware para validar webhook do MercadoPago
 */
function validateWebhookMiddleware(req, res, next) {
  const signature = req.headers['x-signature'];
  const requestId = req.headers['x-request-id'];
  
  console.log('🔐 [Webhook] Iniciando validação de assinatura');
  console.log('  - Signature header:', signature);
  console.log('  - Request ID header:', requestId);
  
  // Em desenvolvimento, permitir webhooks sem assinatura para testes
  if (process.env.NODE_ENV === 'development' && !signature) {
    console.log('⚠️ [Webhook] Modo desenvolvimento - pulando validação de assinatura');
    return next();
  }
  
  const isValid = validateMercadoPagoWebhook(req.body, signature, requestId);
  
  if (!isValid) {
    console.log('❌ [Webhook] Assinatura inválida - rejeitando webhook');
    return res.status(401).json({
      success: false,
      message: 'Assinatura inválida'
    });
  }
  
  console.log('✅ [Webhook] Assinatura válida - processando webhook');
  next();
}

module.exports = {
  validateMercadoPagoWebhook,
  validateWebhookMiddleware
};






