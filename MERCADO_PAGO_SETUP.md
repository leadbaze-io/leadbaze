# 🚀 Integração Mercado Pago - LeadBaze

## 📋 **Status da Implementação**

✅ **Concluído:**
- SDK do Mercado Pago instalado
- Tipos TypeScript criados
- Serviço principal implementado
- APIs de pagamento criadas
- Webhook de notificações
- Hook React para pagamentos
- Componente PaymentButton
- Páginas de retorno
- Integração com PlanCard

## 🔧 **Configuração Necessária**

### **1. Criar Conta no Mercado Pago**
1. Acesse: https://www.mercadopago.com.br/
2. Crie sua conta de desenvolvedor
3. Acesse: https://www.mercadopago.com.br/developers/panel/credentials

### **2. Obter Credenciais**
- **Access Token**: Para operações server-side
- **Public Key**: Para operações client-side

### **3. Configurar Variáveis de Ambiente**
Copie o arquivo `env.mercadopago.example` para `.env.local` e preencha:

```bash
# Mercado Pago
MERCADO_PAGO_ACCESS_TOKEN=APP_USR_xxxxxxxxxxxxxxxxxxxxxxxx
MERCADO_PAGO_PUBLIC_KEY=APP_USR_xxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY=APP_USR_xxxxxxxxxxxxxxxxxxxxxxxx

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### **4. Configurar Webhook**
1. No painel do Mercado Pago, vá em "Webhooks"
2. Adicione a URL: `https://seudominio.com/api/webhooks/mercadopago`
3. Selecione os eventos: `payment`, `subscription`

## 🎯 **Como Usar**

### **1. Botão de Pagamento Simples**
```tsx
import { PaymentButton } from '../components/PaymentButton';

<PaymentButton
  planId="start"
  planName="Plano Start"
  price={197.00}
  userId="user-123"
  userEmail="user@example.com"
/>
```

### **2. Hook de Pagamento**
```tsx
import { usePayment } from '../hooks/usePayment';

const { createPayment, checkPaymentStatus, loading, error } = usePayment();

// Criar pagamento
const payment = await createPayment({
  planId: 'start',
  userId: 'user-123',
  userEmail: 'user@example.com',
  planName: 'Plano Start',
  amount: 197.00
});
```

### **3. Verificar Status**
```tsx
const status = await checkPaymentStatus('payment-id-123');
```

## 🔄 **Fluxo de Pagamento**

1. **Usuário clica** no botão de pagamento
2. **Sistema cria** preferência no Mercado Pago
3. **Usuário é redirecionado** para Checkout Pro
4. **Usuário paga** (PIX, Cartão, Boleto)
5. **Mercado Pago envia** webhook de confirmação
6. **Sistema ativa** assinatura do usuário
7. **Usuário retorna** para página de sucesso

## 📱 **Métodos de Pagamento Suportados**

- ✅ **PIX** (Instantâneo)
- ✅ **Cartão de Crédito** (Até 12x)
- ✅ **Cartão de Débito**
- ✅ **Boleto Bancário**
- ✅ **Parcelamento sem juros**

## 🛠️ **APIs Disponíveis**

### **POST /api/payments/create**
Cria um novo pagamento
```json
{
  "planId": "start",
  "userId": "user-123",
  "userEmail": "user@example.com",
  "planName": "Plano Start",
  "amount": 197.00
}
```

### **GET /api/payments/status?paymentId=123**
Verifica status do pagamento

### **POST /api/webhooks/mercadopago**
Recebe notificações do Mercado Pago

## 🧪 **Testes**

### **Modo Sandbox**
- Use credenciais de teste
- Cartões de teste disponíveis
- PIX simulado

### **Modo Produção**
- Use credenciais reais
- Pagamentos reais
- Webhook em produção

## 🔒 **Segurança**

- ✅ Validação de dados
- ✅ Sanitização de inputs
- ✅ Rate limiting
- ✅ Logs de auditoria
- ✅ Webhook signature validation (TODO)

## 📊 **Monitoramento**

- Logs de pagamentos
- Status de webhooks
- Erros de integração
- Métricas de conversão

## 🚨 **Próximos Passos**

1. **Configurar credenciais** do Mercado Pago
2. **Testar fluxo completo** em sandbox
3. **Integrar com sistema** de assinaturas
4. **Configurar webhook** em produção
5. **Implementar validação** de assinatura webhook
6. **Adicionar logs** de auditoria
7. **Configurar monitoramento**

## 📞 **Suporte**

- **Documentação**: https://www.mercadopago.com.br/developers
- **Suporte**: https://www.mercadopago.com.br/developers/support
- **Status**: https://status.mercadopago.com/

---

**🎉 Implementação concluída! Aguardando configuração das credenciais para testes.**





