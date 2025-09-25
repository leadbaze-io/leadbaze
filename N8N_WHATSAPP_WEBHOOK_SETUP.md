# 🔧 Configuração do Webhook WhatsApp no N8N

## 📋 **VISÃO GERAL**

Este guia mostra como configurar o webhook do WhatsApp no N8N para integrar com o sistema de Advanced Analytics do LeadBaze.

## 🎯 **ENDPOINTS DISPONÍVEIS**

### **1. Webhook de Respostas**
- **URL**: `http://localhost:3000/api/whatsapp/webhook/response`
- **Método**: `POST`
- **Autenticação**: Token Bearer

### **2. Webhook de Status de Entrega**
- **URL**: `http://localhost:3000/api/whatsapp/webhook/delivery-status`
- **Método**: `POST`
- **Autenticação**: Token Bearer

### **3. Webhook de Conversões**
- **URL**: `http://localhost:3000/api/whatsapp/webhook/conversion`
- **Método**: `POST`
- **Autenticação**: Token Bearer

## 🔑 **CONFIGURAÇÃO DE AUTENTICAÇÃO**

### **Token de Acesso**
```javascript
// Configure no N8N como Header
Authorization: Bearer SEU_TOKEN_AQUI
```

### **Token Padrão (para desenvolvimento)**
```
whatsapp_webhook_token_2024
```

## 📊 **ESTRUTURA DOS DADOS**

### **1. Resposta de Mensagem**
```json
{
  "campaign_id": "uuid-da-campanha",
  "lead_phone": "+5511999999999",
  "response_type": "text|image|audio|video|document",
  "response_content": "Conteúdo da resposta",
  "response_timestamp": "2024-01-15T10:30:00Z",
  "lead_name": "Nome do Lead",
  "message_id": "id-da-mensagem-original"
}
```

### **2. Status de Entrega**
```json
{
  "campaign_id": "uuid-da-campanha",
  "lead_phone": "+5511999999999",
  "delivery_status": "sent|delivered|read|failed",
  "status_timestamp": "2024-01-15T10:30:00Z",
  "message_id": "id-da-mensagem",
  "error_message": "Mensagem de erro (se houver)"
}
```

### **3. Conversão de Venda**
```json
{
  "campaign_id": "uuid-da-campanha",
  "lead_phone": "+5511999999999",
  "conversion_type": "sale|meeting|demo|proposal",
  "conversion_value": 1500.00,
  "conversion_date": "2024-01-15T10:30:00Z",
  "lead_name": "Nome do Lead",
  "notes": "Observações sobre a conversão"
}
```

## 🔧 **CONFIGURAÇÃO NO N8N**

### **PASSO 1: Criar Workflow**

1. **Abra o N8N**
2. **Crie um novo workflow**
3. **Adicione um nó "Webhook"**

### **PASSO 2: Configurar Webhook**

```javascript
// Configuração do nó Webhook
{
  "httpMethod": "POST",
  "path": "whatsapp-response",
  "responseMode": "responseNode",
  "options": {
    "noResponseBody": true
  }
}
```

### **PASSO 3: Adicionar Nó HTTP Request**

```javascript
// Configuração do nó HTTP Request
{
  "method": "POST",
  "url": "http://localhost:3000/api/whatsapp/webhook/response",
  "headers": {
    "Authorization": "Bearer whatsapp_webhook_token_2024",
    "Content-Type": "application/json"
  },
  "body": {
    "campaign_id": "{{ $json.campaign_id }}",
    "lead_phone": "{{ $json.lead_phone }}",
    "response_type": "{{ $json.response_type }}",
    "response_content": "{{ $json.response_content }}",
    "response_timestamp": "{{ $json.response_timestamp }}",
    "lead_name": "{{ $json.lead_name }}",
    "message_id": "{{ $json.message_id }}"
  }
}
```

## 📱 **EXEMPLO DE WORKFLOW COMPLETO**

### **Workflow para Respostas de Mensagens**

```json
{
  "nodes": [
    {
      "name": "Webhook WhatsApp Response",
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "httpMethod": "POST",
        "path": "whatsapp-response",
        "responseMode": "responseNode"
      }
    },
    {
      "name": "Send to Analytics",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "method": "POST",
        "url": "http://localhost:3000/api/whatsapp/webhook/response",
        "headers": {
          "Authorization": "Bearer whatsapp_webhook_token_2024",
          "Content-Type": "application/json"
        },
        "body": "={{ $json }}"
      }
    },
    {
      "name": "Response",
      "type": "n8n-nodes-base.respondToWebhook",
      "parameters": {
        "respondWith": "json",
        "responseBody": {
          "status": "success",
          "message": "Response tracked successfully"
        }
      }
    }
  ],
  "connections": {
    "Webhook WhatsApp Response": {
      "main": [
        [
          {
            "node": "Send to Analytics",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Send to Analytics": {
      "main": [
        [
          {
            "node": "Response",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
```

## 🧪 **TESTE DO WEBHOOK**

### **1. Teste Manual**

```bash
# Teste de resposta
curl -X POST http://localhost:3000/api/whatsapp/webhook/response \
  -H "Authorization: Bearer whatsapp_webhook_token_2024" \
  -H "Content-Type: application/json" \
  -d '{
    "campaign_id": "123e4567-e89b-12d3-a456-426614174000",
    "lead_phone": "+5511999999999",
    "response_type": "text",
    "response_content": "Olá, tenho interesse no produto!",
    "response_timestamp": "2024-01-15T10:30:00Z",
    "lead_name": "João Silva",
    "message_id": "msg_123"
  }'
```

### **2. Teste de Status de Entrega**

```bash
# Teste de status
curl -X POST http://localhost:3000/api/whatsapp/webhook/delivery-status \
  -H "Authorization: Bearer whatsapp_webhook_token_2024" \
  -H "Content-Type: application/json" \
  -d '{
    "campaign_id": "123e4567-e89b-12d3-a456-426614174000",
    "lead_phone": "+5511999999999",
    "delivery_status": "delivered",
    "status_timestamp": "2024-01-15T10:30:00Z",
    "message_id": "msg_123"
  }'
```

### **3. Teste de Conversão**

```bash
# Teste de conversão
curl -X POST http://localhost:3000/api/whatsapp/webhook/conversion \
  -H "Authorization: Bearer whatsapp_webhook_token_2024" \
  -H "Content-Type: application/json" \
  -d '{
    "campaign_id": "123e4567-e89b-12d3-a456-426614174000",
    "lead_phone": "+5511999999999",
    "conversion_type": "sale",
    "conversion_value": 1500.00,
    "conversion_date": "2024-01-15T10:30:00Z",
    "lead_name": "João Silva",
    "notes": "Cliente interessado no plano premium"
  }'
```

## 🔍 **VERIFICAÇÃO NO BANCO DE DADOS**

### **Verificar Respostas Recebidas**

```sql
-- Verificar respostas do WhatsApp
SELECT 
  campaign_id,
  lead_phone,
  response_type,
  response_content,
  created_at
FROM whatsapp_responses 
ORDER BY created_at DESC 
LIMIT 10;
```

### **Verificar Conversões**

```sql
-- Verificar conversões
SELECT 
  campaign_id,
  lead_phone,
  conversion_type,
  conversion_value,
  conversion_date
FROM sales_conversions 
ORDER BY conversion_date DESC 
LIMIT 10;
```

## 🚨 **TROUBLESHOOTING**

### **Erro 401 - Unauthorized**
- Verifique se o token está correto
- Confirme se o header Authorization está sendo enviado

### **Erro 500 - Internal Server Error**
- Verifique se o backend está rodando
- Confirme se as tabelas foram criadas no Supabase

### **Dados não aparecem no Analytics**
- Verifique se o RLS está configurado corretamente
- Confirme se o user_id está sendo passado

## 📊 **MONITORAMENTO**

### **Logs do Backend**
```bash
# Ver logs do backend
cd backend
npm run dev
```

### **Verificar Status do Webhook**
```bash
# Verificar se o endpoint está respondendo
curl -X GET http://localhost:3000/api/whatsapp/webhook/status
```

## 🎯 **PRÓXIMOS PASSOS**

1. **Configure o webhook no N8N** seguindo este guia
2. **Teste com dados reais** do WhatsApp
3. **Verifique os dados** no Analytics Dashboard
4. **Configure alertas** para conversões importantes

---

**🎉 Com esta configuração, o sistema de Analytics estará 100% funcional com tracking em tempo real!**


























