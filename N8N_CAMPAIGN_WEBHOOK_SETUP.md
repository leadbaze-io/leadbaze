# Configuração do Webhook N8N para Status de Campanhas

## 📋 Visão Geral

Este documento explica como configurar o N8N para enviar atualizações de status das campanhas para o backend do LeadBaze.

## 🔧 Configuração do N8N

### 1. Adicionar Node HTTP Request no N8N

No seu fluxo N8N, adicione um node **HTTP Request** após cada envio de mensagem:

```json
{
  "name": "Send Progress Update",
  "type": "n8n-nodes-base.httpRequest",
  "typeVersion": 4.1,
  "position": [1000, 300],
  "parameters": {
    "url": "https://leadbaze.io/api/campaign/n8n-webhook",
    "authentication": "none",
    "requestMethod": "POST",
    "sendHeaders": true,
    "headerParameters": {
      "parameters": [
        {
          "name": "Content-Type",
          "value": "application/json"
        }
      ]
    },
    "sendBody": true,
    "bodyParameters": {
      "parameters": [
        {
          "name": "campaignId",
          "value": "={{ $json.campaign_id }}"
        },
        {
          "name": "type",
          "value": "progress"
        },
        {
          "name": "data",
          "value": "={{ {\n  \"leadIndex\": $json.lead_index,\n  \"totalLeads\": $json.total_leads,\n  \"success\": $json.success,\n  \"error\": $json.error,\n  \"leadPhone\": $json.lead_phone,\n  \"leadName\": $json.lead_name\n} }}"
        }
      ]
    },
    "options": {
      "timeout": 10000
    }
  }
}
```

### 2. Adicionar Node para Conclusão da Campanha

Adicione outro node HTTP Request no final do fluxo:

```json
{
  "name": "Send Completion Update",
  "type": "n8n-nodes-base.httpRequest",
  "typeVersion": 4.1,
  "position": [1200, 500],
  "parameters": {
    "url": "https://leadbaze.io/api/campaign/n8n-webhook",
    "authentication": "none",
    "requestMethod": "POST",
    "sendHeaders": true,
    "headerParameters": {
      "parameters": [
        {
          "name": "Content-Type",
          "value": "application/json"
        }
      ]
    },
    "sendBody": true,
    "bodyParameters": {
      "parameters": [
        {
          "name": "campaignId",
          "value": "={{ $json.campaign_id }}"
        },
        {
          "name": "type",
          "value": "complete"
        },
        {
          "name": "data",
          "value": "={{ {\n  \"successCount\": $json.success_count,\n  \"failedCount\": $json.failed_count,\n  \"totalProcessed\": $json.total_processed\n} }}"
        }
      ]
    },
    "options": {
      "timeout": 10000
    }
  }
}
```

## 📊 Estrutura dos Dados

### Para Progresso (type: "progress")

```json
{
  "campaignId": "uuid-da-campanha",
  "type": "progress",
  "data": {
    "leadIndex": 1,
    "totalLeads": 10,
    "success": true,
    "error": null,
    "leadPhone": "+5531999999999",
    "leadName": "João Silva"
  }
}
```

### Para Conclusão (type: "complete")

```json
{
  "campaignId": "uuid-da-campanha",
  "type": "complete",
  "data": {
    "successCount": 8,
    "failedCount": 2,
    "totalProcessed": 10
  }
}
```

## 🔄 Fluxo Completo

1. **Início da Campanha**: O frontend envia a campanha para o N8N
2. **Para cada lead**:
   - N8N processa o lead
   - Envia webhook de progresso para o backend
   - Backend atualiza o status e notifica via SSE
3. **Final da Campanha**:
   - N8N envia webhook de conclusão
   - Backend marca campanha como concluída
   - Frontend recebe notificação final

## 🧪 Teste do Webhook

Para testar se o webhook está funcionando, você pode usar este comando:

```bash
curl -X POST https://leadbaze.io/api/campaign/n8n-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "campaignId": "test-campaign-id",
    "type": "progress",
    "data": {
      "leadIndex": 1,
      "totalLeads": 5,
      "success": true,
      "leadPhone": "+5531999999999",
      "leadName": "Teste"
    }
  }'
```

## 🚨 Troubleshooting

### Problema: Webhook não está sendo chamado
- Verifique se a URL está correta
- Confirme se o N8N tem acesso à internet
- Verifique os logs do N8N

### Problema: Frontend não recebe atualizações
- Verifique se o SSE está conectado
- Confirme se o campaignId está correto
- Verifique os logs do backend

### Problema: Status não atualiza no banco
- Verifique se o Supabase está configurado
- Confirme se as credenciais estão corretas
- Verifique os logs do backend

## 📝 Logs Importantes

No backend, você verá logs como:

```
📡 [N8N Webhook] Recebido: {...}
📡 [N8N Webhook] Processando progress para campanha xxx
✅ [N8N Webhook] Progresso processado: {...}
```

No frontend, você verá:

```
📊 [DisparadorMassa] ===== CALLBACK ONPROGRESS CHAMADO =====
📊 [DisparadorMassa] Progresso da campanha atualizado (tempo real): {...}
```

## 🔗 URLs Importantes

- **Webhook N8N**: `https://leadbaze.io/api/campaign/n8n-webhook`
- **SSE Stream**: `https://leadbaze.io/api/campaign/status/stream/{campaignId}`
- **Status da Campanha**: `https://leadbaze.io/api/campaign/status/{campaignId}`








