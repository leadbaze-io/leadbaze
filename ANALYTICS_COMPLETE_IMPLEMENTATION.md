# 📊 Analytics Completo - LeadBaze

## 🎯 Visão Geral

Implementação completa de todos os sistemas de analytics no LeadBaze para rastreamento abrangente de usuários e conversões.

## 🔧 Sistemas Implementados

### 1. **Google Analytics (GA4)**
- **ID**: `G-9CN9TF7GHG`
- **Função**: Rastreamento de páginas, eventos e conversões
- **Eventos**: page_view, purchase, login, sign_up, generate_lead, etc.

### 2. **Google Ads**
- **ID**: `AW-17598053351`
- **Função**: Rastreamento de conversões para campanhas pagas
- **Eventos**: conversion, purchase, lead generation

### 3. **Google Tag Manager (GTM)**
- **ID**: `GTM-PRP8DKW9`
- **Função**: Gerenciamento centralizado de tags
- **Benefícios**: Facilita adição de novas tags sem alterar código

### 4. **Microsoft Clarity**
- **ID**: `thhq3efjo4`
- **Função**: Análise de comportamento do usuário
- **Recursos**: Heatmaps, gravações de sessão, análise de cliques

### 5. **Meta Pixel (Facebook)**
- **ID**: `1494096711901020`
- **Função**: Rastreamento para campanhas Facebook/Instagram
- **Eventos**: PageView, Purchase, Login, CompleteRegistration, etc.

## 🚀 Hook Unificado: `useAnalytics`

### Funcionalidades Principais

```typescript
const { 
  trackPageView,
  trackEvent,
  trackPurchase,
  trackLogin,
  trackSignUp,
  trackLead,
  trackCampaignCreated,
  trackPlanUpgrade
} = useAnalytics();
```

### Eventos Implementados

#### 📄 **Navegação**
- `trackPageView(path?)` - Visualização de página
- `trackEvent(eventName, parameters?)` - Evento personalizado

#### 💰 **E-commerce**
- `trackPurchase(value, currency, transactionId?, items?)` - Compra
- `trackInitiateCheckout(value, currency, items?)` - Início checkout

#### 👤 **Conversões**
- `trackLogin(method?)` - Login do usuário
- `trackSignUp(method?)` - Cadastro do usuário
- `trackLead(source?, value?)` - Lead gerado

#### 🎯 **LeadBaze Específicos**
- `trackCampaignCreated(campaignType, leadsCount)` - Campanha criada
- `trackPlanUpgrade(fromPlan, toPlan, value)` - Upgrade de plano
- `trackSessionDuration(duration)` - Duração da sessão
- `trackError(errorType, errorMessage)` - Erros do sistema

## 📍 Implementação por Página

### ✅ **Páginas com Tracking Completo**

1. **Página de Planos** (`/plans`)
   - PageView automático
   - InitiateCheckout ao clicar em assinar
   - Purchase quando pagamento é confirmado
   - PlanUpgrade para upgrades

2. **Página de Login** (`/login`)
   - PageView automático
   - Login quando usuário faz login

3. **Formulário de Cadastro**
   - SignUp quando usuário se cadastra
   - CompleteRegistration no Meta Pixel

4. **Navegação Global**
   - PageView automático em todas as páginas
   - Eventos específicos por rota

## 🔍 Verificação e Debug

### Console do Navegador
Todos os eventos são logados com prefixos específicos:

```
📊 [Google Analytics] PageView: /plans
📊 [Google Ads] Conversion: {value: 197, currency: "BRL"}
📊 [Meta Pixel] Purchase: {value: 197, currency: "BRL"}
📊 [Clarity] Event: page_view
```

### Ferramentas de Debug

1. **Google Analytics Debugger** (Chrome Extension)
2. **Facebook Pixel Helper** (Chrome Extension)
3. **Google Tag Assistant** (Chrome Extension)
4. **Microsoft Clarity** (Dashboard próprio)

### Dashboards de Monitoramento

- **Google Analytics**: https://analytics.google.com
- **Google Ads**: https://ads.google.com
- **Google Tag Manager**: https://tagmanager.google.com
- **Microsoft Clarity**: https://clarity.microsoft.com
- **Facebook Events Manager**: https://business.facebook.com/events_manager

## 📊 Métricas Importantes

### Conversões Principais
1. **CompleteRegistration**: Novos cadastros
2. **Purchase**: Assinaturas pagas
3. **PlanUpgrade**: Upgrades de plano
4. **CampaignCreated**: Engajamento com plataforma
5. **Lead**: Leads gerados

### Funil de Conversão Completo
```
PageView → ViewContent → InitiateCheckout → Purchase
     ↓
CompleteRegistration → Login → CampaignCreated → Lead
```

### KPIs por Sistema

#### Google Analytics
- Taxa de conversão de cadastro
- Tempo de sessão
- Páginas mais visitadas
- Funil de conversão

#### Google Ads
- Conversões de campanhas pagas
- ROI por campanha
- Custo por aquisição (CPA)

#### Meta Pixel
- Conversões do Facebook/Instagram
- Lookalike audiences
- Remarketing

#### Microsoft Clarity
- Comportamento do usuário
- Pontos de fricção
- Heatmaps de cliques

## 🛠️ Manutenção

### Adicionando Novos Eventos
1. Adicione a função no hook `useAnalytics.ts`
2. Implemente o tracking no componente desejado
3. Teste no console do navegador
4. Verifique nos dashboards

### Monitoramento Regular
- Verifique logs no console
- Monitore eventos nos dashboards
- Ajuste campanhas baseado nos dados
- Otimize funis de conversão

## 🔒 Privacidade e LGPD

- ✅ Scripts carregam apenas após consentimento
- ✅ Dados são enviados de forma anônima quando possível
- ✅ Respeita configurações de privacidade do navegador
- ✅ Compatível com bloqueadores de anúncios
- ✅ Dados são processados conforme LGPD

## 📞 Suporte

### Para Debug
1. Verifique logs no console do navegador
2. Use extensões de debug específicas
3. Consulte dashboards de cada sistema
4. Teste em ambiente de desenvolvimento primeiro

### Contatos de Suporte
- **Google Analytics**: Suporte via Google Analytics Help Center
- **Google Ads**: Suporte via Google Ads Help Center
- **Meta Pixel**: Suporte via Facebook Business Help Center
- **Microsoft Clarity**: Suporte via Microsoft Clarity Help Center

---

**Última atualização**: 28/09/2025  
**Versão**: 2.0  
**Status**: ✅ Implementado e Funcionando  
**Sistemas**: 5 (GA4, Google Ads, GTM, Clarity, Meta Pixel)


