# Contas de Teste do Mercado Pago

## 🧪 Contas para Testes

### Conta 1 - Comprador
- **Email:** TESTUSER7013336842207690761
- **Senha:** YUoAExKCQC
- **Tipo:** Comprador (pode fazer pagamentos)

### Conta 2 - Vendedor
- **Email:** TESTUSER4465763898572702337
- **Senha:** 2bZPOZ20nS
- **Tipo:** Vendedor (recebe pagamentos)

## 💳 Cartões de Teste

### Cartões Aprovados
- **Visa:** 4509 9535 6623 3704
- **Mastercard:** 5031 7557 3453 0604
- **American Express:** 3753 651535 56885

### Cartões Rejeitados
- **Visa:** 4000 0000 0000 0002
- **Mastercard:** 5031 7557 3453 0605

### Cartões Pendentes
- **Visa:** 4000 0000 0000 0004
- **Mastercard:** 5031 7557 3453 0606

## 🔐 Dados para Todos os Cartões
- **CVV:** 123
- **Data de Vencimento:** Qualquer data futura
- **Nome:** APRO
- **CPF:** 12345678901

## 🏦 PIX de Teste
- **Chave PIX:** teste@mercadopago.com
- **Valor:** Qualquer valor
- **Status:** Aprovado automaticamente

## 📱 Boleto de Teste
- **Código de Barras:** Gerado automaticamente
- **Vencimento:** 3 dias úteis
- **Status:** Pendente até pagamento

## 🧪 Como Testar

### 1. Acesse a página de planos
```
http://localhost:3000/plans
```

### 2. Clique em "Assinar" em qualquer plano

### 3. Use uma das contas de teste acima

### 4. Use os cartões de teste listados

### 5. Verifique o retorno para:
- **Sucesso:** `http://localhost:3000/payment/success`
- **Falha:** `http://localhost:3000/payment/failure`

## 🔍 Verificar Logs

### Backend
```bash
pm2 logs leadbaze-backend
```

### Frontend
```bash
npm run dev
# Verificar console do navegador
```

## 📊 Webhook de Teste

### URL do Webhook
```
http://localhost:3001/api/payments/webhook
```

### Configurar no Mercado Pago
1. Acesse o painel do desenvolvedor
2. Vá em "Webhooks"
3. Adicione a URL acima
4. Selecione os eventos: `payment`, `subscription`

## 🚨 Importante

- ✅ **Use apenas em ambiente de teste**
- ✅ **Nunca use em produção**
- ✅ **As contas são resetadas diariamente**
- ✅ **Os pagamentos são simulados**

## 📞 Suporte

Se houver problemas:
- Verifique os logs do backend
- Confirme se as credenciais estão corretas
- Teste com diferentes cartões
- Verifique a configuração do webhook




