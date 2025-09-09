# 🚀 Guia de Importação do Workflow N8N - WhatsApp Analytics

## 📋 **VISÃO GERAL**

Este guia mostra como importar e configurar o workflow completo do WhatsApp Analytics no N8N para integrar com o sistema LeadBaze.

## 🔧 **PRÉ-REQUISITOS**

### **1. Backend Rodando**
```bash
# No terminal do projeto
cd backend
npm start
```

### **2. N8N Instalado e Rodando**
- N8N deve estar acessível em `http://localhost:5678`
- Usuário admin configurado

## 📥 **PASSO 1: IMPORTAR WORKFLOW**

### **A. Abrir N8N**
1. Acesse: `http://localhost:5678`
2. Faça login com suas credenciais

### **B. Importar Workflow**
1. Clique em **"Import from File"** ou **"Import from URL"**
2. Selecione o arquivo: `n8n-whatsapp-analytics-workflow.json`
3. Clique em **"Import"**

### **C. Verificar Importação**
O workflow deve aparecer com:
- ✅ **3 Webhooks** (Resposta, Status, Conversão)
- ✅ **3 Validações** de dados
- ✅ **3 Envios** para Analytics
- ✅ **3 Condicionais** de sucesso/erro
- ✅ **6 Respostas** (3 sucesso + 3 erro)

## 🔑 **PASSO 2: CONFIGURAR CREDENCIAIS**

### **A. Criar Credencial HTTP Header**
1. Vá em **"Credentials"** no menu lateral
2. Clique em **"Add Credential"**
3. Selecione **"HTTP Header Auth"**
4. Configure:
   - **Name**: `WhatsApp Analytics Auth`
   - **Header Name**: `Authorization`
   - **Header Value**: `Bearer whatsapp_webhook_token_2024`
5. Clique em **"Save"**

### **B. Verificar Credencial**
- A credencial deve aparecer na lista
- Status deve ser **"Connected"**

## 🔧 **PASSO 3: CONFIGURAR WORKFLOW**

### **A. Ativar Workflow**
1. Abra o workflow importado
2. Clique no botão **"Active"** no canto superior direito
3. O status deve mudar para **"Active"**

### **B. Verificar URLs dos Webhooks**
Após ativar, o N8N mostrará as URLs dos webhooks:
- **Resposta**: `http://localhost:5678/webhook/whatsapp-response`
- **Status**: `http://localhost:5678/webhook/whatsapp-delivery`
- **Conversão**: `http://localhost:5678/webhook/whatsapp-conversion`

## 🧪 **PASSO 4: TESTAR WORKFLOW**

### **A. Teste de Resposta de Mensagem**
```bash
curl -X POST http://localhost:5678/webhook/whatsapp-response \
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

### **B. Teste de Status de Entrega**
```bash
curl -X POST http://localhost:5678/webhook/whatsapp-delivery \
  -H "Content-Type: application/json" \
  -d '{
    "campaign_id": "123e4567-e89b-12d3-a456-426614174000",
    "lead_phone": "+5511999999999",
    "delivery_status": "delivered",
    "status_timestamp": "2024-01-15T10:30:00Z",
    "message_id": "msg_123"
  }'
```

### **C. Teste de Conversão**
```bash
curl -X POST http://localhost:5678/webhook/whatsapp-conversion \
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

## 📊 **PASSO 5: VERIFICAR DADOS NO BANCO**

### **A. Verificar Respostas**
```sql
SELECT 
  campaign_id,
  lead_phone,
  response_type,
  response_content,
  created_at
FROM whatsapp_responses 
ORDER BY created_at DESC 
LIMIT 5;
```

### **B. Verificar Conversões**
```sql
SELECT 
  campaign_id,
  lead_phone,
  conversion_type,
  conversion_value,
  conversion_date
FROM sales_conversions 
ORDER BY conversion_date DESC 
LIMIT 5;
```

## 🔍 **PASSO 6: MONITORAR EXECUÇÕES**

### **A. Ver Execuções no N8N**
1. Vá em **"Executions"** no menu lateral
2. Verifique as execuções do workflow
3. Clique em uma execução para ver detalhes

### **B. Ver Logs do Backend**
```bash
# No terminal onde o backend está rodando
# Verifique os logs de requisições recebidas
```

## 🚨 **TROUBLESHOOTING**

### **Erro: "Credential not found"**
- Verifique se a credencial foi criada corretamente
- Confirme se o nome da credencial está correto

### **Erro: "Connection refused"**
- Verifique se o backend está rodando na porta 3000
- Confirme se a URL está correta

### **Erro: "Invalid data format"**
- Verifique se os dados enviados estão no formato correto
- Confirme se todos os campos obrigatórios estão presentes

### **Dados não aparecem no banco**
- Verifique se o RLS está configurado corretamente
- Confirme se o user_id está sendo passado

## 📱 **INTEGRAÇÃO COM WHATSAPP**

### **A. Configurar Webhook no WhatsApp Business API**
1. Use as URLs dos webhooks do N8N
2. Configure os eventos desejados
3. Teste com mensagens reais

### **B. Configurar Evolution API**
1. Configure o webhook da Evolution API para apontar para o N8N
2. Teste o envio de mensagens
3. Verifique se as respostas estão sendo capturadas

## 🎯 **RESULTADO ESPERADO**

Após a configuração completa:
- ✅ **Webhooks funcionando** no N8N
- ✅ **Dados sendo enviados** para o backend
- ✅ **Dados sendo salvos** no Supabase
- ✅ **Analytics Dashboard** mostrando dados em tempo real
- ✅ **Sistema completo** de tracking de WhatsApp

## 📋 **CHECKLIST FINAL**

- [ ] Workflow importado no N8N
- [ ] Credenciais configuradas
- [ ] Workflow ativado
- [ ] URLs dos webhooks anotadas
- [ ] Testes realizados com sucesso
- [ ] Dados aparecendo no banco
- [ ] Analytics Dashboard funcionando
- [ ] Integração com WhatsApp configurada

---

**🎉 Com esta configuração, o sistema de Analytics estará 100% funcional com tracking em tempo real do WhatsApp!**



