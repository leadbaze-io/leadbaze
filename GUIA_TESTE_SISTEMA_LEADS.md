# 🧪 GUIA COMPLETO DE TESTE DO SISTEMA DE CONTROLE DE LEADS

## 📋 Pré-requisitos

1. **Banco de dados configurado** com as tabelas e funções RPC
2. **Usuário de teste** com perfil criado
3. **Plano de assinatura** ativo para o usuário

---

## 🚀 PASSO 1: Verificar Estrutura do Banco

### Execute no Supabase SQL Editor:

```sql
-- Verificar se as tabelas existem
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('subscription_plans', 'user_subscriptions', 'leads_usage_history');

-- Verificar planos disponíveis
SELECT id, name, display_name, price_monthly, leads_limit, is_active
FROM subscription_plans
ORDER BY price_monthly;
```

**✅ Resultado esperado:** 3 tabelas encontradas e pelo menos 3 planos (Start, Scale, Enterprise)

---

## 🚀 PASSO 2: Criar Assinatura de Teste

### Execute no Supabase SQL Editor:

```sql
-- Substitua 'SEU_USER_ID_AQUI' pelo ID real do usuário
-- Para encontrar o ID: SELECT id, email FROM auth.users WHERE email = 'seu_email@exemplo.com';

-- Criar assinatura de teste (Plano Start)
INSERT INTO user_subscriptions (
    user_id,
    plan_id,
    status,
    leads_used,
    current_period_start,
    current_period_end
) VALUES (
    'SEU_USER_ID_AQUI',  -- Substitua pelo ID real
    (SELECT id FROM subscription_plans WHERE name = 'start'),
    'active',
    0,
    NOW(),
    NOW() + INTERVAL '30 days'
);
```

**✅ Resultado esperado:** 1 linha inserida

---

## 🚀 PASSO 3: Testar Funções RPC

### Execute no Supabase SQL Editor:

```sql
-- Substitua 'SEU_USER_ID_AQUI' pelo ID real do usuário

-- 1. Verificar status da assinatura
SELECT * FROM get_user_subscription_status('SEU_USER_ID_AQUI');

-- 2. Consumir 5 leads
SELECT * FROM consume_leads('SEU_USER_ID_AQUI', 5, 'teste_manual');

-- 3. Verificar status novamente
SELECT * FROM get_user_subscription_status('SEU_USER_ID_AQUI');

-- 4. Ver histórico de uso
SELECT * FROM get_leads_usage_history('SEU_USER_ID_AQUI', 30);
```

**✅ Resultado esperado:**
- Status inicial: 1000 leads disponíveis
- Após consumo: 995 leads disponíveis
- Histórico mostra 1 registro com 5 leads consumidos

---

## 🚀 PASSO 4: Testar no Frontend

### 1. Acesse a página de perfil:
- Vá para `/profile`
- Clique na aba "Assinatura"
- Verifique se mostra o plano ativo e leads disponíveis

### 2. Teste os botões de geração:
- Clique em "Gerar 1 Lead" - deve funcionar
- Clique em "Gerar 5 Leads" - deve funcionar
- Clique em "Gerar 10 Leads" - deve funcionar

### 3. Verifique o rastreamento:
- Observe o contador de leads usados
- Verifique o histórico de uso
- Confirme que os números estão atualizando

---

## 🚀 PASSO 5: Testar Limites

### Execute no Supabase SQL Editor:

```sql
-- Consumir quase todos os leads (deixar apenas 1)
SELECT * FROM consume_leads('SEU_USER_ID_AQUI', 994, 'teste_limite');

-- Verificar status
SELECT * FROM get_user_subscription_status('SEU_USER_ID_AQUI');

-- Tentar consumir mais do que disponível
SELECT * FROM consume_leads('SEU_USER_ID_AQUI', 10, 'teste_limite_excedido');
```

**✅ Resultado esperado:**
- Primeiro consumo: sucesso
- Segundo consumo: erro "Leads insuficientes"

---

## 🚀 PASSO 6: Testar na Página de Planos

### 1. Acesse `/plans`:
- Verifique se os 3 planos aparecem
- Confirme preços e limites
- Teste o botão "Escolher Plano"

### 2. Teste responsividade:
- Redimensione a janela
- Verifique se a tabela de comparação funciona no mobile
- Confirme que o scroll horizontal funciona

---

## 🚀 PASSO 7: Testar Integração com Gerador de Leads

### 1. Acesse o gerador de leads:
- Vá para `/gerador` ou `/disparador`
- Tente gerar leads
- Verifique se o sistema bloqueia quando não há leads

### 2. Verifique mensagens:
- Deve mostrar quantos leads foram consumidos
- Deve alertar quando o limite é atingido
- Deve sugerir upgrade do plano

---

## 🚀 PASSO 8: Testar Sistema de Notificações

### 1. Teste toasts de sucesso:
- Geração de leads bem-sucedida
- Atualização de assinatura

### 2. Teste toasts de erro:
- Limite de leads atingido
- Erro de assinatura

### 3. Teste toasts de aviso:
- Leads quase esgotados
- Renovação próxima

---

## 🚀 PASSO 9: Testar Diferentes Cenários

### Cenário 1: Usuário sem assinatura
```sql
-- Criar usuário sem assinatura
-- Tentar gerar leads
-- Deve mostrar erro e sugerir plano
```

### Cenário 2: Assinatura expirada
```sql
-- Alterar data de expiração para o passado
UPDATE user_subscriptions 
SET current_period_end = NOW() - INTERVAL '1 day'
WHERE user_id = 'SEU_USER_ID_AQUI';

-- Tentar gerar leads
-- Deve mostrar erro de assinatura expirada
```

### Cenário 3: Múltiplos usuários
```sql
-- Criar assinaturas para diferentes usuários
-- Testar isolamento de dados
-- Verificar que cada usuário vê apenas seus dados
```

---

## 🚀 PASSO 10: Teste de Performance

### 1. Teste com muitos registros:
```sql
-- Inserir muitos registros de uso
-- Verificar performance das consultas
-- Testar paginação se necessário
```

### 2. Teste de concorrência:
- Múltiplos usuários gerando leads simultaneamente
- Verificar se não há race conditions
- Confirmar que os limites são respeitados

---

## 📊 CHECKLIST DE VALIDAÇÃO

### ✅ Estrutura do Banco
- [ ] Tabelas criadas corretamente
- [ ] Funções RPC funcionando
- [ ] Políticas RLS ativas
- [ ] Índices criados

### ✅ Funcionalidades Básicas
- [ ] Criação de assinatura
- [ ] Consumo de leads
- [ ] Verificação de limites
- [ ] Histórico de uso

### ✅ Interface do Usuário
- [ ] Página de perfil funcionando
- [ ] Página de planos responsiva
- [ ] Toasts de notificação
- [ ] Contadores atualizando

### ✅ Integração
- [ ] Gerador de leads integrado
- [ ] Sistema de bloqueio funcionando
- [ ] Mensagens de erro adequadas
- [ ] Sugestões de upgrade

### ✅ Casos Extremos
- [ ] Usuário sem assinatura
- [ ] Assinatura expirada
- [ ] Limite atingido
- [ ] Erros de rede

---

## 🐛 SOLUÇÃO DE PROBLEMAS

### Problema: "Função não encontrada"
**Solução:** Execute o script `plans-database-structure.sql` completo

### Problema: "Usuário não tem permissão"
**Solução:** Verifique as políticas RLS e funções SECURITY DEFINER

### Problema: "Leads não estão sendo consumidos"
**Solução:** Verifique se a função `consume_leads` está sendo chamada corretamente

### Problema: "Interface não atualiza"
**Solução:** Verifique se os hooks `useSubscription` estão funcionando

### Problema: "Erro 401/403"
**Solução:** Verifique autenticação e políticas RLS

---

## 📈 MÉTRICAS DE SUCESSO

### Funcionalidade
- ✅ 100% das funções RPC funcionando
- ✅ 100% dos casos de teste passando
- ✅ 0 erros de permissão
- ✅ 0 vazamentos de dados

### Performance
- ✅ Consultas < 100ms
- ✅ Interface responsiva
- ✅ Toasts aparecem em < 500ms
- ✅ Contadores atualizam em tempo real

### Usabilidade
- ✅ Mensagens claras em PT-BR
- ✅ Interface intuitiva
- ✅ Responsividade completa
- ✅ Acessibilidade básica

---

## 🎯 PRÓXIMOS PASSOS

Após validar todos os testes:

1. **Integrar gateway de pagamento**
2. **Implementar webhooks de pagamento**
3. **Adicionar relatórios avançados**
4. **Implementar sistema de notificações**
5. **Adicionar testes automatizados**

---

## 📞 SUPORTE

Se encontrar problemas:

1. Verifique os logs do console do navegador
2. Verifique os logs do Supabase
3. Execute os scripts de teste SQL
4. Verifique as políticas RLS
5. Confirme que as funções RPC existem

**🎉 Sistema funcionando = Leads controlados + Usuários satisfeitos + Receita garantida!**











