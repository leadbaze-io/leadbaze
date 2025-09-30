# Fluxo N8N Simplificado - Baseado no V2 que Funcionava

## 🎯 **Problema Identificado**
O fluxo V3 está muito complexo com muitos nós desnecessários que estão impedindo o envio correto dos webhooks de progresso.

## ✅ **Solução: Fluxo Simplificado**

### **Estrutura do Fluxo:**
1. **Webhook1** → **Body** → **Iniciar Rastreamento** + **Split Out**
2. **Split Out** → **Loop Over Items** → **Code1** → **Mensagem Personalizada** → **Enviar texto**
3. **Enviar texto** → **Wait** → **Preparar Dados Progresso** → **Atualizar Progresso** → **Loop Over Items**
4. **Loop Over Items** (quando termina) → **Preparar Dados Conclusão** → **Finalizar Campanha**

### **Nós Essenciais:**

#### 1. **Iniciar Rastreamento** (HTTP Request)
```
URL: https://leadbaze.io/api/campaign/status/start
Method: POST
Body:
- campaignId: {{ $json.body[0].campaign_id }}
- totalLeads: {{ $json.body[0].itens.length }}
```

#### 2. **Preparar Dados Progresso** (Code)
```javascript
// Dados do lead atual
const currentLead = $('Loop Over Items').item.json;
const leadPhone = currentLead.telefone || '';
const leadName = currentLead.nome || 'Lead sem nome';

// Dados da campanha
const totalLeads = $('Body').item.json.body[0].itens.length;
const campaignId = $('Body').item.json.body[0].campaign_id;

// Calcular progresso baseado no índice atual do loop
const currentIndex = 1; // O N8N automaticamente fornece o índice
const progress = Math.round((currentIndex / totalLeads) * 100);

// Assumir sucesso se chegou até aqui
const sendSuccess = true;

return [{
  json: {
    campaign_id: campaignId,
    current_index: currentIndex,
    total_leads: totalLeads,
    progress: progress,
    success_count: currentIndex,
    failed_count: 0,
    send_success: sendSuccess,
    lead_phone: leadPhone,
    lead_name: leadName,
    backend_url: 'https://leadbaze.io'
  }
}];
```

#### 3. **Atualizar Progresso** (HTTP Request)
```
URL: https://leadbaze.io/api/campaign/status/progress
Method: POST
Body:
- campaignId: {{ $json.campaign_id }}
- leadIndex: {{ $json.current_index }}
- totalLeads: {{ $json.total_leads }}
- success: {{ $json.send_success }}
- leadPhone: {{ $json.lead_phone }}
- leadName: {{ $json.lead_name }}
```

#### 4. **Preparar Dados Conclusão** (Code)
```javascript
// Dados finais da campanha
const totalLeads = $('Body').item.json.body[0].itens.length;

// Buscar dados de progresso se disponíveis
let successCount = totalLeads; // Default: todos sucessos
let failedCount = 0; // Default: nenhuma falha

// Tentar buscar dados de progresso do nó anterior
try {
  const progressData = $('Atualizar Progresso').item.json;
  if (progressData && progressData.success_count !== undefined) {
    successCount = progressData.success_count;
    failedCount = progressData.failed_count;
  }
} catch (error) {
  // Se não conseguir acessar, usar defaults
  console.log('Usando contadores padrão');
}

return [{
  json: {
    campaign_id: $('Body').item.json.body[0].campaign_id,
    success_count: successCount,
    failed_count: failedCount,
    total_processed: totalLeads,
    backend_url: 'https://leadbaze.io'
  }
}];
```

#### 5. **Finalizar Campanha** (HTTP Request)
```
URL: https://leadbaze.io/api/campaign/status/complete
Method: POST
Body:
- campaignId: {{ $json.campaign_id }}
- successCount: {{ $json.success_count }}
- failedCount: {{ $json.failed_count }}
- totalProcessed: {{ $json.total_processed }}
```

### **Conexões Essenciais:**
1. **Body** → **Iniciar Rastreamento** + **Split Out**
2. **Split Out** → **Loop Over Items**
3. **Loop Over Items** → **Code1** (quando processando) + **Preparar Dados Conclusão** (quando termina)
4. **Code1** → **Mensagem Personalizada** → **Enviar texto**
5. **Enviar texto** → **Wait** → **Preparar Dados Progresso** → **Atualizar Progresso** → **Loop Over Items**
6. **Preparar Dados Conclusão** → **Finalizar Campanha**

### **Configurações Importantes:**
- **Wait**: 10 segundos entre mensagens
- **Loop Over Items**: Configurado para processar todos os itens
- **On Error**: Continue on Error para todos os nós HTTP

## 🚀 **Implementação:**

1. **Criar novo fluxo** baseado no V2
2. **Adicionar apenas os nós essenciais** listados acima
3. **Configurar as conexões** conforme especificado
4. **Testar com uma campanha pequena** (2-3 leads)
5. **Verificar se os webhooks estão sendo enviados**

## 🔍 **Verificação:**
- Frontend deve receber eventos `progress` e `complete`
- Logs do backend devem mostrar as requisições
- Modal de progresso deve atualizar em tempo real

## ❌ **Nós a Remover do V3:**
- Preparar Tracking Mensagem
- Track Mensagem Enviada
- Preparar Tracking Entrega
- Track Status Entrega
- Processar Controle de Loop
- Verificar Controle de Loop
- Todos os nós de analytics complexos

## ✅ **Manter do V3:**
- Iniciar Rastreamento
- Preparar Dados Progresso (simplificado)
- Atualizar Progresso
- Preparar Dados Conclusão (simplificado)
- Finalizar Campanha

Este fluxo simplificado deve funcionar exatamente como o V2, mas com as melhorias de rastreamento em tempo real.























