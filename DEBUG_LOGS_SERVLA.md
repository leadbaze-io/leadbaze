# Debug Logs - Servla Backend

## 🔍 **Como Verificar Logs do Backend no Servla**

### **1. Acessar o Servidor Servla**
```bash
# Conectar via SSH
ssh usuario@servla.com

# Navegar para o diretório do projeto
cd /path/to/leadflow
```

### **2. Verificar Status do PM2**
```bash
# Ver status dos processos
pm2 status

# Ver logs em tempo real
pm2 logs leadflow-backend

# Ver logs específicos
pm2 logs leadflow-backend --lines 100
```

### **3. Verificar Logs do Sistema**
```bash
# Ver logs do sistema
tail -f /var/log/syslog

# Ver logs do nginx (se aplicável)
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### **4. Verificar Logs da Aplicação**
```bash
# Se os logs estão em arquivo
tail -f logs/app.log

# Ver logs do Node.js
journalctl -u leadflow-backend -f
```

## 📊 **Logs Específicos para Procurar**

### **Logs de Webhook N8N:**
```
📡 [N8N Webhook] Recebido:
📡 [N8N Webhook] Processando progress para campanha
✅ [N8N Webhook] Progresso processado:
❌ [N8N Webhook] Erro ao processar webhook:
```

### **Logs de Status de Campanha:**
```
🚀 Iniciando rastreamento da campanha:
📊 Atualizando progresso da campanha:
✅ Progresso atualizado com sucesso:
🎉 Campanha finalizada:
```

### **Logs de SSE:**
```
📡 Enviando evento SSE para campanha:
📡 Clientes conectados:
📡 Evento enviado:
```

### **Logs de Erro:**
```
❌ Erro ao processar webhook:
❌ Erro ao atualizar campanha:
❌ Erro na conexão SSE:
❌ Rota não encontrada:
```

## 🔧 **Comandos Úteis para Debug**

### **Verificar se o Backend está Rodando:**
```bash
# Verificar processos Node.js
ps aux | grep node

# Verificar portas em uso
netstat -tlnp | grep :3001

# Verificar se o serviço está respondendo
curl -X GET http://localhost:3001/api/health
```

### **Verificar Logs em Tempo Real:**
```bash
# PM2 logs com filtro
pm2 logs leadflow-backend | grep "N8N Webhook"

# Logs com timestamp
pm2 logs leadflow-backend --timestamp

# Logs com cores
pm2 logs leadflow-backend --raw
```

### **Verificar Configuração:**
```bash
# Ver configuração do PM2
pm2 show leadflow-backend

# Ver variáveis de ambiente
pm2 env leadflow-backend

# Ver arquivo de configuração
cat ecosystem.config.cjs
```

## 🎯 **O que Procurar nos Logs**

### **1. Webhook N8N Funcionando:**
- ✅ `📡 [N8N Webhook] Recebido:` - Webhook chegou
- ✅ `📡 [N8N Webhook] Processando progress` - Processando
- ✅ `✅ [N8N Webhook] Progresso processado` - Sucesso

### **2. Webhook N8N com Problema:**
- ❌ `❌ [N8N Webhook] Dados inválidos` - Payload incorreto
- ❌ `❌ [N8N Webhook] Erro ao processar` - Erro interno
- ❌ `Rota não encontrada` - Endpoint não existe

### **3. SSE Funcionando:**
- ✅ `📡 Enviando evento SSE` - Enviando evento
- ✅ `📡 Clientes conectados: X` - Clientes conectados
- ✅ `📡 Evento enviado` - Evento enviado com sucesso

### **4. SSE com Problema:**
- ❌ `❌ Erro na conexão SSE` - Problema de conexão
- ❌ `❌ Cliente não encontrado` - Cliente desconectado
- ❌ `❌ Erro ao enviar evento` - Falha no envio

## 🚀 **Teste Manual do Webhook**

### **Testar Webhook Diretamente:**
```bash
# Testar webhook de progresso
curl -X POST https://leadbaze.io/api/campaign/n8n-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "campaignId": "test-campaign-123",
    "type": "progress",
    "data": {
      "leadIndex": 1,
      "totalLeads": 5,
      "success": true,
      "leadPhone": "+5531999999999",
      "leadName": "João Silva"
    }
  }'
```

### **Testar Endpoint de Status:**
```bash
# Testar endpoint de progresso
curl -X POST https://leadbaze.io/api/campaign/status/progress \
  -H "Content-Type: application/json" \
  -d '{
    "campaignId": "test-campaign-123",
    "leadIndex": 1,
    "totalLeads": 5,
    "success": true,
    "leadPhone": "+5531999999999",
    "leadName": "João Silva"
  }'
```

## 📋 **Checklist de Debug**

- [ ] Backend está rodando (PM2 status)
- [ ] Logs estão sendo gerados
- [ ] Webhook N8N está sendo recebido
- [ ] Webhook está sendo processado
- [ ] SSE está enviando eventos
- [ ] Frontend está recebendo eventos
- [ ] Não há erros nos logs
- [ ] Endpoints estão respondendo

## 🔍 **Próximos Passos**

1. **Executar campanha de teste** no N8N
2. **Monitorar logs em tempo real** no Servla
3. **Verificar se webhooks estão chegando**
4. **Verificar se SSE está funcionando**
5. **Identificar onde está o problema**

Com esses logs detalhados, conseguiremos identificar exatamente onde está o problema do progresso!
