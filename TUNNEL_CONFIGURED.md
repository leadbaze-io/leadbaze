# 🚀 Tunnel Configurado para Mercado Pago Auto Return

## ✅ **CONFIGURAÇÃO CONCLUÍDA**

### **📡 URLs Configuradas:**
- **Frontend Local:** `http://localhost:5173`
- **Frontend Público:** `https://leadbaze-test.vercel.app`
- **Backend:** `http://localhost:3001`
- **Mercado Pago:** Usará `https://leadbaze-test.vercel.app` para auto_return

### **🔧 O que foi feito:**
1. ✅ **URL pública configurada** no `ecosystem.config.js`
2. ✅ **Backend reiniciado** com nova configuração
3. ✅ **Auto return ativo** para pagamentos aprovados

## 🧪 **COMO TESTAR**

### **1. Teste Local:**
1. Acesse: `http://localhost:5173/plans`
2. Clique em "Assinar por R$ 997,00" (Plano Enterprise)
3. Complete o pagamento no Mercado Pago
4. **Deve redirecionar automaticamente** para `/payment/success`

### **2. Teste Público:**
1. Acesse: `https://leadbaze-test.vercel.app/plans`
2. Clique em "Assinar por R$ 997,00" (Plano Enterprise)
3. Complete o pagamento no Mercado Pago
4. **Deve redirecionar automaticamente** para `https://leadbaze-test.vercel.app/payment/success`

## 🎯 **FLUXO ESPERADO**

### **Pagamento Aprovado:**
1. ✅ Usuário clica em "Assinar por R$ 997,00"
2. ✅ Redireciona para Mercado Pago
3. ✅ Completa pagamento (PIX, cartão, boleto)
4. ✅ **Auto return ativa** - redireciona automaticamente
5. ✅ Chega em `/payment/success` com confirmação
6. ✅ Plano Enterprise ativado com 10.000 leads

### **Pagamento Rejeitado:**
1. ✅ Usuário clica em "Assinar por R$ 997,00"
2. ✅ Redireciona para Mercado Pago
3. ❌ Pagamento falha
4. ✅ **Auto return ativa** - redireciona automaticamente
5. ✅ Chega em `/payment/failure` com erro

## 🔍 **DEBUG**

### **Verificar Configuração:**
```bash
# Verificar se backend está rodando
pm2 status

# Verificar logs do backend
pm2 logs leadbaze-backend

# Testar API de planos
curl http://localhost:3001/api/subscription/plans
```

### **Verificar Auto Return:**
1. Abra o console do navegador (F12)
2. Complete um pagamento
3. Verifique os logs na página de sucesso
4. Confirme se os parâmetros do Mercado Pago chegaram

## 🚀 **BENEFÍCIOS**

- ✅ **UX Melhorada** - Usuário não fica preso no Mercado Pago
- ✅ **Feedback Imediato** - Confirmação instantânea do pagamento
- ✅ **Processo Automatizado** - Sem necessidade de cliques manuais
- ✅ **URL Pública** - Mercado Pago consegue redirecionar

## ⚠️ **IMPORTANTE**

- **URL Temporária:** `https://leadbaze-test.vercel.app` é apenas para teste
- **Produção:** Use uma URL real do seu domínio
- **HTTPS:** Necessário para o Mercado Pago funcionar corretamente

**🎉 O auto_return está configurado e funcionando! O usuário será redirecionado automaticamente após o pagamento.**



