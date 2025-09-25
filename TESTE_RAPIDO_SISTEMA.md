# 🚀 TESTE RÁPIDO DO SISTEMA DE CONTROLE DE LEADS

## 📋 PASSO A PASSO SIMPLES

### 1️⃣ **Verificar se as tabelas existem**
Execute no Supabase SQL Editor:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('subscription_plans', 'user_subscriptions', 'leads_usage_history');
```

**✅ Deve retornar:** 3 tabelas

---

### 2️⃣ **Verificar se os planos existem**
```sql
SELECT name, display_name, price_monthly, leads_limit 
FROM subscription_plans 
ORDER BY price_monthly;
```

**✅ Deve retornar:** Start (R$ 200), Scale (R$ 497), Enterprise

---

### 3️⃣ **Verificar se as funções existem**
```sql
SELECT proname FROM pg_proc 
WHERE proname IN ('check_leads_availability', 'consume_leads', 'get_subscription_status');
```

**✅ Deve retornar:** 3 funções

---

### 4️⃣ **Verificar usuário creaty1234567@gmail.com**
```sql
SELECT id, email FROM auth.users WHERE email = 'creaty1234567@gmail.com';
```

**✅ Deve retornar:** ID do usuário creaty

---

### 5️⃣ **Deletar assinatura existente e criar nova**
```sql
-- Deletar assinatura existente
DELETE FROM user_subscriptions 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'creaty1234567@gmail.com');

-- Criar nova assinatura
INSERT INTO user_subscriptions (
    user_id, plan_id, status, billing_cycle, 
    leads_used, leads_remaining, current_period_start, 
    current_period_end, auto_renewal
) VALUES (
    (SELECT id FROM auth.users WHERE email = 'creaty1234567@gmail.com'),
    (SELECT id FROM subscription_plans WHERE name = 'start'),
    'active', 'monthly', 0, 1000, 
    NOW(), NOW() + INTERVAL '30 days', true
);
```

**✅ Deve retornar:** 1 linha inserida

---

### 6️⃣ **Testar verificação de leads**
```sql
SELECT * FROM check_leads_availability(
    (SELECT id FROM auth.users WHERE email = 'creaty1234567@gmail.com'), 
    1
);
```

**✅ Deve retornar:** `"can_generate": true`

---

### 7️⃣ **Testar status da assinatura**
```sql
SELECT * FROM get_subscription_status(
    (SELECT id FROM auth.users WHERE email = 'creaty1234567@gmail.com')
);
```

**✅ Deve retornar:** Dados da assinatura com 1000 leads disponíveis

---

### 8️⃣ **Testar consumo de leads**
```sql
SELECT * FROM consume_leads(
    (SELECT id FROM auth.users WHERE email = 'creaty1234567@gmail.com'), 
    5, 
    'teste_manual'
);
```

**✅ Deve retornar:** `"success": true, "leads_consumed": 5`

---

### 9️⃣ **Verificar status após consumo**
```sql
SELECT * FROM get_subscription_status(
    (SELECT id FROM auth.users WHERE email = 'creaty1234567@gmail.com')
);
```

**✅ Deve retornar:** 995 leads disponíveis

---

### 🔟 **Verificar histórico**
```sql
SELECT luh.leads_generated, luh.operation_reason, luh.remaining_leads, luh.created_at 
FROM leads_usage_history luh
JOIN auth.users au ON luh.user_id = au.id
WHERE au.email = 'creaty1234567@gmail.com'
ORDER BY luh.created_at DESC LIMIT 1;
```

**✅ Deve retornar:** 1 registro com 5 leads consumidos

---

## 🎯 TESTE NO FRONTEND

### 1. **Acesse `/profile`**
- Clique na aba "Assinatura"
- Deve mostrar o plano Start ativo
- Deve mostrar 995 leads disponíveis

### 2. **Teste os botões de geração**
- Clique em "Gerar 1 Lead" → deve funcionar
- Clique em "Gerar 5 Leads" → deve funcionar
- Verifique se os contadores atualizam

### 3. **Acesse `/plans`**
- Deve mostrar os 3 planos
- Tabela deve ser responsiva no mobile
- Botões devem estar alinhados

---

## 🐛 SOLUÇÃO DE PROBLEMAS

### ❌ "Função não encontrada"
**Solução:** Execute o arquivo `plans-database-structure.sql` completo

### ❌ "Usuário não encontrado"
**Solução:** Use um ID de usuário real do passo 4

### ❌ "Assinatura não encontrada"
**Solução:** Execute o passo 5 para criar assinatura

### ❌ "Leads insuficientes"
**Solução:** Verifique se `leads_remaining` está correto na assinatura

---

## 📊 RESULTADO ESPERADO

Se tudo funcionar:
- ✅ 3 tabelas criadas
- ✅ 3 planos disponíveis
- ✅ 3 funções RPC funcionando
- ✅ Assinatura criada com sucesso
- ✅ Leads sendo consumidos corretamente
- ✅ Histórico sendo registrado
- ✅ Interface mostrando dados corretos

**🎉 Sistema funcionando = Controle de leads ativo!**
