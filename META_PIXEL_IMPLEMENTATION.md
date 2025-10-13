# 📊 Meta Pixel - Implementação Completa no LeadBaze

## 🎯 Visão Geral

O Meta Pixel foi implementado no LeadBaze para rastrear eventos importantes do usuário e otimizar campanhas de marketing no Facebook/Instagram.

## 🔧 Configuração Implementada

### 1. Script Base no HTML
- **Arquivo**: `index.html`
- **Pixel ID**: `1494096711901020`
- **Verificação de domínio**: `ygh647h1b3kkq9jvwquqfda8j96umb`

### 2. Hook Personalizado
- **Arquivo**: `src/hooks/useMetaPixel.ts`
- **Funcionalidades**: 
  - Rastreamento automático de eventos
  - Funções específicas para e-commerce
  - Eventos customizados do LeadBaze

### 3. Provider Global
- **Arquivo**: `src/components/MetaPixelProvider.tsx`
- **Funcionalidade**: Rastreamento automático de mudanças de rota

## 📈 Eventos Implementados

### Eventos Padrão do Facebook
- ✅ **PageView**: Rastreado automaticamente em todas as páginas
- ✅ **ViewContent**: Rastreado por página específica
- ✅ **Login**: Quando usuário faz login
- ✅ **CompleteRegistration**: Quando usuário se cadastra
- ✅ **InitiateCheckout**: Quando inicia processo de pagamento
- ✅ **Purchase**: Quando compra é confirmada
- ✅ **AddToCart**: Para pacotes de leads

### Eventos Customizados do LeadBaze
- ✅ **CampaignCreated**: Quando usuário cria uma campanha
- ✅ **LeadsGenerated**: Quando leads são gerados
- ✅ **PlanUpgrade**: Quando usuário faz upgrade de plano
- ✅ **SubscriptionCancelled**: Quando cancela assinatura
- ✅ **SessionDuration**: Duração da sessão do usuário

## 🚀 Como Usar

### Uso Básico
```typescript
import { useMetaPixel } from '../hooks/useMetaPixel';

const MyComponent = () => {
  const { trackEvent, trackPurchase } = useMetaPixel();
  
  const handlePurchase = () => {
    trackPurchase(197.00, 'BRL', 'start-plan');
  };
  
  return <button onClick={handlePurchase}>Comprar</button>;
};
```

### Eventos Específicos
```typescript
const { 
  trackLogin,
  trackCompleteRegistration,
  trackCampaignCreated,
  trackLeadsGenerated 
} = useMetaPixel();

// Login
trackLogin('email');

// Cadastro
trackCompleteRegistration('email');

// Campanha criada
trackCampaignCreated('whatsapp', 100);

// Leads gerados
trackLeadsGenerated(50, 'email');
```

## 📍 Páginas com Tracking Implementado

### ✅ Implementado
- **Página de Planos** (`/plans`): ViewContent, InitiateCheckout, Purchase
- **Página de Login** (`/login`): ViewContent, Login
- **Formulário de Cadastro**: CompleteRegistration
- **Botão de Assinatura**: InitiateCheckout, Purchase, PlanUpgrade

### 🔄 Tracking Automático
- **Mudanças de rota**: PageView automático
- **Visualização de conteúdo**: ViewContent por página
- **Navegação**: Rastreado pelo MetaPixelProvider

## 🎛️ Configurações Avançadas

### Personalização de Eventos
```typescript
// Evento customizado
trackEvent('CustomEvent', {
  event_name: 'LeadQualified',
  lead_value: 100,
  source: 'google_maps',
  content_name: 'Lead Qualificado',
  content_category: 'lead_generation'
});
```

### Dados de E-commerce
```typescript
// Compra com dados completos
trackPurchase(497.00, 'BRL', 'scale-plan', {
  content_type: 'subscription',
  content_name: 'Plano Scale',
  content_category: 'saas_subscription'
});
```

## 🔍 Verificação e Debug

### Console do Navegador
Todos os eventos são logados no console com prefixo `📊 [Meta Pixel]`:

```
📊 [Meta Pixel] Evento rastreado: Purchase {value: 197, currency: "BRL"}
📊 [Meta Pixel] PageView rastreado
```

### Facebook Pixel Helper
Use a extensão do Chrome "Facebook Pixel Helper" para verificar se os eventos estão sendo enviados corretamente.

### Eventos Manager
Acesse o Facebook Events Manager para ver os eventos em tempo real:
- URL: https://business.facebook.com/events_manager

## 📊 Métricas Importantes

### Conversões Principais
1. **CompleteRegistration**: Cadastros de novos usuários
2. **Purchase**: Assinaturas pagas
3. **PlanUpgrade**: Upgrades de plano
4. **CampaignCreated**: Engajamento com a plataforma

### Funil de Conversão
```
PageView → ViewContent → InitiateCheckout → Purchase
     ↓
CompleteRegistration → Login → CampaignCreated
```

## 🛠️ Manutenção

### Adicionando Novos Eventos
1. Adicione a função no hook `useMetaPixel.ts`
2. Implemente o tracking no componente desejado
3. Teste no console do navegador
4. Verifique no Facebook Events Manager

### Monitoramento
- Verifique logs no console regularmente
- Monitore eventos no Facebook Events Manager
- Ajuste campanhas baseado nos dados coletados

## 🔒 Privacidade e LGPD

- ✅ Meta Pixel carrega apenas após consentimento do usuário
- ✅ Dados são enviados de forma anônima quando possível
- ✅ Respeita configurações de privacidade do navegador
- ✅ Compatível com bloqueadores de anúncios

## 📞 Suporte

Para dúvidas sobre implementação ou configuração:
1. Verifique logs no console do navegador
2. Use Facebook Pixel Helper para debug
3. Consulte documentação oficial do Meta Pixel
4. Teste em ambiente de desenvolvimento primeiro

---

**Última atualização**: 28/09/2025  
**Versão**: 1.0  
**Status**: ✅ Implementado e Funcionando







