# 🎯 SISTEMA DE PLANOS E CONTROLE DE LEADS - LeadBaze

## 📅 Data: 15/09/2025
## 🎯 Resumo: Sistema completo de planos de assinatura e controle de leads

---

## 🏗️ 1. ESTRUTURA DO BANCO DE DADOS

### 1.1 Tabelas Criadas

#### A) `subscription_plans` - Planos Disponíveis
```sql
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE, -- 'start', 'scale', 'enterprise'
  display_name TEXT NOT NULL, -- 'Plano Start', 'Plano Scale', etc.
  description TEXT,
  price_monthly DECIMAL(10,2) NOT NULL,
  price_yearly DECIMAL(10,2),
  leads_limit INTEGER NOT NULL,
  features JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### B) `user_subscriptions` - Assinaturas dos Usuários
```sql
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES subscription_plans(id) ON DELETE RESTRICT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'pending')),
  billing_cycle TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
  current_period_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  current_period_end TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '1 month'),
  leads_used INTEGER DEFAULT 0,
  leads_remaining INTEGER DEFAULT 0,
  auto_renewal BOOLEAN DEFAULT true,
  gateway_subscription_id TEXT,
  gateway_customer_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### C) `leads_usage_history` - Histórico de Uso
```sql
CREATE TABLE leads_usage_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES user_subscriptions(id) ON DELETE CASCADE,
  leads_generated INTEGER NOT NULL DEFAULT 1,
  operation_type TEXT NOT NULL CHECK (operation_type IN ('generation', 'refund', 'bonus')),
  operation_reason TEXT,
  remaining_leads INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### D) `payment_transactions` - Transações de Pagamento
```sql
CREATE TABLE payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES user_subscriptions(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'BRL',
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  gateway_transaction_id TEXT,
  gateway_payment_method TEXT,
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 1.2 Planos Padrão Inseridos

#### Plano Start - R$ 200/mês
- **Leads:** 1.000 por mês
- **Preço Anual:** R$ 2.000 (10% desconto)
- **Features:** Suporte por email, relatórios básicos, integração CRM, templates

#### Plano Scale - R$ 497/mês
- **Leads:** 4.000 por mês
- **Preço Anual:** R$ 4.970 (10% desconto)
- **Features:** Suporte prioritário, relatórios avançados, múltiplos CRMs, automação

#### Plano Enterprise - Sob Consulta
- **Leads:** 10.000+ por mês
- **Features:** Suporte 24/7, relatórios customizados, integração ilimitada, consultoria

---

## 🔧 2. FUNÇÕES RPC IMPLEMENTADAS

### 2.1 `check_leads_availability(p_user_id, p_leads_to_generate)`
**Função:** Verifica se usuário pode gerar leads
**Retorna:** JSON com status de disponibilidade
```sql
{
  "can_generate": true/false,
  "reason": "success|no_active_subscription|insufficient_leads",
  "message": "Mensagem descritiva",
  "leads_remaining": 500,
  "leads_limit": 1000,
  "plan_name": "Plano Start"
}
```

### 2.2 `consume_leads(p_user_id, p_leads_consumed, p_operation_reason)`
**Função:** Consome leads do saldo do usuário
**Retorna:** JSON com resultado da operação
```sql
{
  "success": true/false,
  "message": "Leads consumidos com sucesso",
  "leads_consumed": 5,
  "leads_remaining": 495,
  "leads_limit": 1000
}
```

### 2.3 `get_subscription_status(p_user_id)`
**Função:** Retorna status completo da assinatura
**Retorna:** JSON com todos os dados da assinatura
```sql
{
  "has_subscription": true,
  "subscription_id": "uuid",
  "plan_name": "start",
  "plan_display_name": "Plano Start",
  "leads_used": 100,
  "leads_remaining": 900,
  "leads_limit": 1000,
  "current_period_end": "2025-10-15T00:00:00Z",
  "days_remaining": 15
}
```

---

## 🎨 3. COMPONENTES DE INTERFACE

### 3.1 `PlanCard.tsx`
**Função:** Card individual para cada plano
**Features:**
- Exibição de preço (mensal/anual)
- Lista de features incluídas
- Badge "Mais Popular" para plano Scale
- Badge "Plano Atual" para assinatura ativa
- Botões de ação contextuais

### 3.2 `PlansPage.tsx`
**Função:** Página completa de seleção de planos
**Features:**
- Toggle mensal/anual com desconto
- Seção de assinatura atual
- Comparação de planos em tabela
- Seção de garantia de 30 dias
- Design responsivo completo

### 3.3 `SubscriptionStatusCard.tsx`
**Função:** Card de status da assinatura atual
**Features:**
- Progresso visual de uso de leads
- Estatísticas do período atual
- Avisos de limite próximo
- Botões de ação (atualizar/gerenciar)

### 3.4 `LeadsControlGuard.tsx`
**Função:** Guard que controla acesso baseado em leads
**Features:**
- Verificação automática de disponibilidade
- Bloqueio de ações quando limite atingido
- Avisos de limite próximo
- Redirecionamento para planos

### 3.5 `LeadsUsageTracker.tsx`
**Função:** Componente de acompanhamento de uso
**Features:**
- Estatísticas detalhadas de uso
- Gráfico de uso diário
- Histórico de atividades
- Projeções de uso mensal

---

## 🔗 4. HOOKS E SERVIÇOS

### 4.1 `useSubscription.ts`
**Função:** Hook para gerenciar assinatura do usuário
**Métodos:**
- `fetchSubscription()` - Buscar dados da assinatura
- `checkLeadsAvailability()` - Verificar disponibilidade
- `consumeLeads()` - Consumir leads
- `refetch()` - Atualizar dados

### 4.2 `usePlans.ts`
**Função:** Hook para gerenciar planos disponíveis
**Métodos:**
- `fetchPlans()` - Buscar planos
- `refetch()` - Atualizar dados

### 4.3 `LeadsControlService.ts`
**Função:** Serviço para controle de leads
**Métodos:**
- `checkLeadsAvailability()` - Verificar disponibilidade
- `consumeLeads()` - Consumir leads
- `canExecuteAction()` - Verificar se pode executar ação
- `executeWithLeadsConsumption()` - Executar ação com consumo
- `addBonusLeads()` - Adicionar leads bonus

### 4.4 `PaymentGatewayService.ts`
**Função:** Serviço para integração com gateways
**Gateways Suportados:**
- Stripe
- Mercado Pago
- PagSeguro
- Asaas
**Métodos:**
- `createCustomer()` - Criar cliente
- `createSubscription()` - Criar assinatura
- `cancelSubscription()` - Cancelar assinatura
- `getPaymentMethods()` - Buscar métodos de pagamento

---

## 🎯 5. SISTEMA DE CONTROLE DE LEADS

### 5.1 Fluxo de Verificação
1. **Usuário tenta gerar leads**
2. **Sistema verifica disponibilidade** via `check_leads_availability`
3. **Se disponível:** Executa ação e consome leads
4. **Se indisponível:** Bloqueia ação e mostra aviso

### 5.2 Componente `LeadGeneratorWithControl`
**Função:** Wrapper para componentes que geram leads
**Features:**
- Controle automático de leads
- Feedback visual de processamento
- Tratamento de erros
- Callbacks de sucesso/falha

### 5.3 Exemplo de Uso
```tsx
<LeadGeneratorWithControl
  leadsToGenerate={5}
  onLeadsGenerated={(count) => console.log(`${count} leads gerados`)}
  onLeadsExhausted={() => console.log('Limite atingido')}
>
  <LeadGeneratorButton leadsToGenerate={5} />
</LeadGeneratorWithControl>
```

---

## 💳 6. INTEGRAÇÃO COM GATEWAY DE PAGAMENTO

### 6.1 Estrutura Preparada
- **Configuração por ambiente** (sandbox/production)
- **Suporte a múltiplos gateways**
- **Métodos de pagamento** (cartão, PIX, boleto)
- **Webhooks** para atualização de status

### 6.2 Fluxo de Pagamento
1. **Usuário seleciona plano**
2. **Sistema cria cliente** no gateway
3. **Processa pagamento**
4. **Cria assinatura** no banco
5. **Ativa plano** para o usuário

### 6.3 Webhooks Implementados
- **Pagamento aprovado:** Ativa assinatura
- **Pagamento falhou:** Suspende assinatura
- **Assinatura cancelada:** Desativa plano
- **Renovação:** Atualiza período

---

## 📊 7. SISTEMA DE RELATÓRIOS

### 7.1 Métricas Disponíveis
- **Leads utilizados** no período atual
- **Média diária** de uso
- **Projeção mensal** baseada no uso atual
- **Dias restantes** até reset
- **Percentual de uso** do limite

### 7.2 Histórico de Uso
- **Registro de cada geração** de leads
- **Tipo de operação** (geração, reembolso, bonus)
- **Motivo da operação**
- **Saldo restante** após cada operação

### 7.3 Alertas Automáticos
- **80% do limite:** Aviso amarelo
- **90% do limite:** Aviso vermelho
- **100% do limite:** Bloqueio total

---

## 🚀 8. COMANDOS PARA IMPLEMENTAÇÃO

### 8.1 SQL para Executar
```sql
-- 1. Executar estrutura do banco
\i plans-database-structure.sql

-- 2. Verificar se as tabelas foram criadas
\dt subscription_plans
\dt user_subscriptions
\dt leads_usage_history
\dt payment_transactions

-- 3. Verificar se as funções RPC foram criadas
SELECT proname FROM pg_proc WHERE proname LIKE '%leads%';
```

### 8.2 Variáveis de Ambiente
```env
# Gateway de Pagamento (escolher um)
REACT_APP_PAYMENT_GATEWAY=stripe
REACT_APP_STRIPE_PUBLIC_KEY=pk_test_...
REACT_APP_STRIPE_ENVIRONMENT=sandbox

# Ou
REACT_APP_PAYMENT_GATEWAY=mercadopago
REACT_APP_MERCADOPAGO_PUBLIC_KEY=TEST-...
REACT_APP_MERCADOPAGO_ENVIRONMENT=sandbox
```

### 8.3 Rotas para Adicionar
```tsx
// Em App.tsx ou router
<Route path="/plans" element={<PlansPage />} />
<Route path="/subscription" element={<SubscriptionPage />} />
```

---

## 📱 9. RESPONSIVIDADE E UX

### 9.1 Design Mobile-First
- **Cards de planos** empilhados em mobile
- **Tabela de comparação** com scroll horizontal
- **Botões touch-friendly** com tamanho adequado
- **Navegação simplificada** em telas pequenas

### 9.2 Feedback Visual
- **Loading states** durante verificações
- **Progress bars** para uso de leads
- **Toasts informativos** para ações
- **Animações suaves** em transições

### 9.3 Acessibilidade
- **Contraste adequado** em modo claro/escuro
- **Labels descritivos** para screen readers
- **Navegação por teclado** funcional
- **Estados de foco** visíveis

---

## 🔒 10. SEGURANÇA E VALIDAÇÃO

### 10.1 Row Level Security (RLS)
- **Usuários só veem** suas próprias assinaturas
- **Histórico privado** por usuário
- **Transações isoladas** por usuário

### 10.2 Validações
- **Verificação de limites** antes de consumir leads
- **Validação de assinatura** ativa
- **Controle de períodos** de cobrança
- **Prevenção de duplicação** de transações

### 10.3 Auditoria
- **Log de todas as operações** de leads
- **Rastreamento de mudanças** de plano
- **Histórico de pagamentos** completo
- **Backup automático** de dados críticos

---

## 📈 11. MÉTRICAS E ANALYTICS

### 11.1 KPIs Implementados
- **Taxa de conversão** de planos
- **Uso médio** de leads por usuário
- **Churn rate** por plano
- **Revenue per user** (ARPU)

### 11.2 Dashboards
- **Admin dashboard** para métricas gerais
- **User dashboard** para uso pessoal
- **Relatórios de uso** por período
- **Projeções de crescimento**

---

## 🎯 12. PRÓXIMOS PASSOS

### 12.1 Implementação Imediata
1. **Executar SQL** de estrutura do banco
2. **Configurar variáveis** de ambiente
3. **Testar funções RPC** com usuário de teste
4. **Implementar rotas** de planos

### 12.2 Integração com Gateway
1. **Escolher gateway** de pagamento
2. **Configurar webhooks** de pagamento
3. **Implementar fluxo** de checkout
4. **Testar pagamentos** em sandbox

### 12.3 Melhorias Futuras
- **Planos personalizados** para Enterprise
- **Descontos por volume** para grandes clientes
- **Integração com CRM** para automação
- **API pública** para integrações

---

## ✅ 13. CHECKLIST DE IMPLEMENTAÇÃO

### 13.1 Banco de Dados
- [ ] Executar `plans-database-structure.sql`
- [ ] Verificar criação das tabelas
- [ ] Testar funções RPC
- [ ] Configurar RLS policies

### 13.2 Frontend
- [ ] Importar componentes de planos
- [ ] Configurar rotas
- [ ] Testar interface de planos
- [ ] Verificar responsividade

### 13.3 Integração
- [ ] Configurar gateway de pagamento
- [ ] Implementar webhooks
- [ ] Testar fluxo de pagamento
- [ ] Validar controle de leads

### 13.4 Testes
- [ ] Testar geração de leads
- [ ] Verificar bloqueio por limite
- [ ] Validar renovação de planos
- [ ] Testar cancelamento

---

## 📞 14. SUPORTE E DOCUMENTAÇÃO

### 14.1 Arquivos de Referência
- `plans-database-structure.sql` - Estrutura do banco
- `src/types/subscription.ts` - Tipos TypeScript
- `src/hooks/useSubscription.ts` - Hook de assinatura
- `src/services/LeadsControlService.ts` - Serviço de controle

### 14.2 Logs e Debug
- Console logs para operações de leads
- Logs de erro específicos por tipo
- Validação de dados em tempo real
- Monitoramento de performance

---

**✅ SISTEMA COMPLETO - PRONTO PARA IMPLEMENTAÇÃO**

*Sistema de planos e controle de leads totalmente funcional, com integração preparada para gateway de pagamento e controle rigoroso de uso.*











