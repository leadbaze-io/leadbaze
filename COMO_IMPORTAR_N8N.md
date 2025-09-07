# 🚀 Como Importar o Fluxo N8N com Status em Tempo Real

## 📋 Instruções Simples

### **1. Acesse o N8N**
- Vá para o seu N8N: `https://n8n-evolution.kof6cn.easypanel.host`
- Faça login na sua conta

### **2. Importe o Fluxo**
1. **Clique em "Import"** (ou use Ctrl+I)
2. **Cole o JSON** do arquivo `n8n-flow-with-webhooks.json`
3. **Clique em "Import"**

### **3. Configure as Credenciais**
O fluxo já está configurado com suas credenciais existentes:
- ✅ **Apify API** - Já configurada
- ✅ **Evolution API** - Já configurada

### **4. Teste o Fluxo**
1. **Execute o fluxo** manualmente primeiro
2. **Verifique se os webhooks** estão funcionando
3. **Teste com uma campanha** pequena

## 🔧 O que foi Adicionado

### **Novos Nós:**
1. **"Iniciar Rastreamento"** - Notifica o início da campanha
2. **"Preparar Dados Progresso"** - Prepara dados de cada envio
3. **"Atualizar Progresso"** - Envia status de cada mensagem
4. **"Preparar Dados Conclusão"** - Prepara dados finais
5. **"Finalizar Campanha"** - Notifica o fim da campanha

### **URLs Configuradas:**
- **Produção**: `https://leadbaze.io/api/campaign/status/`
- **Desenvolvimento**: `http://localhost:3001/api/campaign/status/`

## 📊 Como Funciona

### **Fluxo Completo:**
1. **Webhook recebe campanha** → **Inicia rastreamento**
2. **Para cada lead** → **Envia mensagem** → **Atualiza progresso**
3. **Após todos os leads** → **Finaliza campanha**

### **Dados Enviados:**
- **Campaign ID** - ID da campanha
- **Lead Index** - Posição atual (1, 2, 3...)
- **Total Leads** - Total de leads
- **Success** - Se enviou com sucesso
- **Lead Phone** - Telefone do lead
- **Lead Name** - Nome do lead

## 🧪 Teste Rápido

### **1. Execute o Fluxo Manualmente**
- Clique em "Execute Workflow"
- Verifique se os webhooks são chamados

### **2. Verifique os Logs**
- No N8N, veja se os nós de webhook executaram
- No backend, verifique os logs de status

### **3. Teste com Frontend**
- Crie uma campanha no frontend
- Veja se o status atualiza em tempo real

## ⚠️ Possíveis Problemas

### **Se os webhooks não funcionarem:**
1. **Verifique a URL** - Deve ser `https://leadbaze.io`
2. **Verifique o backend** - Deve estar rodando
3. **Verifique os logs** - No N8N e no backend

### **Se o status não atualizar:**
1. **Verifique o campaign_id** - Deve ser o mesmo no frontend
2. **Verifique a conexão** - Entre N8N e backend
3. **Verifique os logs** - Para erros específicos

## 🔄 URLs dos Endpoints

### **Backend (Produção):**
- `https://leadbaze.io/api/campaign/status/start`
- `https://leadbaze.io/api/campaign/status/progress`
- `https://leadbaze.io/api/campaign/status/complete`

### **Backend (Desenvolvimento):**
- `http://localhost:3001/api/campaign/status/start`
- `http://localhost:3001/api/campaign/status/progress`
- `http://localhost:3001/api/campaign/status/complete`

## 📝 Dados que o N8N Envia

### **Início da Campanha:**
```json
{
  "campaignId": "uuid-da-campanha",
  "totalLeads": 5
}
```

### **Progresso de Cada Envio:**
```json
{
  "campaignId": "uuid-da-campanha",
  "leadIndex": 1,
  "totalLeads": 5,
  "success": true,
  "leadPhone": "+5531999999999",
  "leadName": "Nome do Lead"
}
```

### **Conclusão da Campanha:**
```json
{
  "campaignId": "uuid-da-campanha",
  "successCount": 5,
  "failedCount": 0,
  "totalProcessed": 5
}
```

## ✅ Pronto!

Após importar o fluxo:
1. **Execute uma vez** para testar
2. **Verifique os logs** do backend
3. **Teste com o frontend** para ver o status em tempo real

**O sistema agora enviará status em tempo real para o frontend!** 🎉
