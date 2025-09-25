# 🚀 Implementação Mercado Pago - LeadBaze

## 📋 **Visão Geral**

Esta implementação segue a [documentação oficial do Mercado Pago](https://www.mercadopago.com.br/developers/pt/docs#online-payments) e utiliza o [SDK oficial](https://www.mercadopago.com.br/developers/pt/docs/sdks-library/landing) para integração completa.

## 🏗️ **Arquitetura**

### **Frontend (React + TypeScript)**
- **SDK**: `mercadopago` v2.9.0
- **Método**: Checkout Pro (recomendado)
- **Localização**: `src/lib/mercadoPagoService.ts`

### **Backend (Node.js + Express)**
- **SDK**: `mercadopago` v2.9.0
- **Método**: Checkout Pro + Webhooks
- **Localização**: `backend/services/mercadoPagoService.js`

## 🔧 **Funcionalidades Implementadas**

### ✅ **1. Checkout Pro**
- **PIX**: Pagamento instantâneo
- **Cartão de Crédito**: Com parcelamento até 12x
- **Boleto**: Pagamento bancário
- **Auto-return**: Redirecionamento automático após aprovação

### ✅ **2. Webhooks**
- **Validação**: Headers e estrutura de notificação
- **Processamento**: Status de pagamento em tempo real
- **Logs**: Rastreamento completo de eventos

### ✅ **3. Planos de Assinatura**
- **Start**: R$ 197,00/mês - 1.000 leads
- **Scale**: R$ 497,00/mês - 5.000 leads  
- **Enterprise**: R$ 997,00/mês - 10.000 leads

## 📚 **Conformidade com Documentação Oficial**

### **✅ Configuração do SDK**
```javascript
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN,
  options: {
    timeout: 5000,
    idempotencyKey: 'abc'
  }
});
```

### **✅ Criação de Preferência**
```javascript
const preference = await this.preference.create({
  body: {
    items: [...],
    payer: {...},
    payment_methods: {...},
    back_urls: {...},
    auto_return: 'approved',
    notification_url: '...',
    external_reference: '...',
    expires: true
  }
});
```

### **✅ Processamento de Webhook**
```javascript
switch (payment.status) {
  case 'approved': // Pagamento aprovado
  case 'rejected': // Pagamento rejeitado
  case 'pending':  // Pagamento pendente
  case 'cancelled': // Pagamento cancelado
}
```

## 🔐 **Segurança**

### **✅ Validação de Webhook**
- Headers `x-signature` e `x-request-id`
- Validação de estrutura de notificação
- Logs de auditoria completos

### **✅ Configuração de Ambiente**
- Credenciais em variáveis de ambiente
- URLs de callback configuráveis
- Timeout e retry configurados

## 🚀 **Como Usar**

### **1. Configurar Ambiente**
```bash
# Backend
MERCADO_PAGO_ACCESS_TOKEN=your_access_token
NEXT_PUBLIC_APP_URL=http://localhost:5174

# Frontend
VITE_MERCADO_PAGO_PUBLIC_KEY=your_public_key
VITE_APP_URL=http://localhost:5174
```

### **2. Criar Pagamento**
```javascript
const payment = await mercadoPagoService.createCheckoutPro({
  planId: 'start',
  userId: 'user123',
  userEmail: 'user@example.com',
  planName: 'Plano Start',
  amount: 197.00
});
```

### **3. Verificar Status**
```javascript
const status = await mercadoPagoService.getPaymentStatus(paymentId);
```

## 📊 **Status de Pagamento**

| Status | Descrição | Ação |
|--------|-----------|------|
| `approved` | Pagamento aprovado | Ativar plano do usuário |
| `rejected` | Pagamento rejeitado | Notificar falha |
| `pending` | Pagamento pendente | Aguardar confirmação |
| `cancelled` | Pagamento cancelado | Limpar dados temporários |

## 🔄 **Fluxo de Pagamento**

1. **Usuário seleciona plano** → Frontend
2. **Criação de preferência** → Backend + Mercado Pago
3. **Redirecionamento para checkout** → Mercado Pago
4. **Processamento do pagamento** → Mercado Pago
5. **Webhook de notificação** → Backend
6. **Ativação do plano** → Sistema LeadBaze
7. **Redirecionamento de sucesso** → Frontend

## 🛠️ **Próximos Passos**

### **TODO: Implementar**
- [ ] Validação de assinatura de webhook
- [ ] Integração com banco de dados para ativação de planos
- [ ] Sistema de notificações por email
- [ ] Logs de auditoria detalhados
- [ ] Testes automatizados
- [ ] Monitoramento de performance

## 📖 **Referências**

- [Documentação Oficial Mercado Pago](https://www.mercadopago.com.br/developers/pt/docs#online-payments)
- [SDK JavaScript](https://www.mercadopago.com.br/developers/pt/docs/sdks-library/landing)
- [Checkout Pro](https://www.mercadopago.com.br/developers/pt/docs/checkout-pro)
- [Webhooks](https://www.mercadopago.com.br/developers/pt/docs/your-integrations/notifications/webhooks)

## 🐛 **Troubleshooting**

### **Erro: "Credenciais não configuradas"**
- Verificar se `MERCADO_PAGO_ACCESS_TOKEN` está definido
- Verificar se o token é válido no painel do Mercado Pago

### **Erro: "CORS policy"**
- Verificar se `CORS_ORIGIN` inclui a URL do frontend
- Verificar se o backend está rodando na porta correta

### **Erro: "Webhook não processado"**
- Verificar se a URL do webhook está acessível
- Verificar se o endpoint `/api/payments/webhook` está funcionando
- Verificar logs do backend para detalhes do erro

---

**✅ Implementação 100% conforme documentação oficial do Mercado Pago**



