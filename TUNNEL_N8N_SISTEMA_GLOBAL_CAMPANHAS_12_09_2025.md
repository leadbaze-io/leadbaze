# 🚀 **TUNNEL N8N - SISTEMA GLOBAL DE CAMPANHAS - 12/09/2025**

## 📋 **RESUMO**
Tunnel atualizado para integração com o sistema global de campanhas do LeadBaze, incluindo todas as melhorias implementadas no modal de progresso, SSE em tempo real e correções de backend.

---

## 🔧 **ENDPOINTS ATUALIZADOS**

### **1. Iniciar Campanha**
```
POST https://leadbaze.com/api/campaign/status/start
```

**Headers:**
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer SEU_TOKEN_AQUI"
}
```

**Body:**
```json
{
  "campaignId": "{{ $json.campaignId }}",
  "campaignName": "{{ $json.campaignName }}",
  "totalContacts": {{ $json.totalContacts }},
  "message": "{{ $json.message }}",
  "instanceName": "{{ $json.instanceName }}",
  "status": "sending",
  "startedAt": "{{ $now }}",
  "progress": {
    "sent": 0,
    "delivered": 0,
    "read": 0,
    "failed": 0,
    "pending": {{ $json.totalContacts }}
  }
}
```

### **2. Atualizar Progresso**
```
POST https://leadbaze.com/api/campaign/status/progress
```

**Headers:**
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer SEU_TOKEN_AQUI"
}
```

**Body:**
```json
{
  "campaignId": "{{ $json.campaignId }}",
  "progress": {
    "sent": {{ $json.sent }},
    "delivered": {{ $json.delivered }},
    "read": {{ $json.read }},
    "failed": {{ $json.failed }},
    "pending": {{ $json.pending }}
  },
  "currentContact": {
    "name": "{{ $json.currentContactName }}",
    "phone": "{{ $json.currentContactPhone }}",
    "status": "{{ $json.currentContactStatus }}"
  },
  "timestamp": "{{ $now }}"
}
```

### **3. Finalizar Campanha**
```
POST https://leadbaze.com/api/campaign/status/complete
```

**Headers:**
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer SEU_TOKEN_AQUI"
}
```

**Body:**
```json
{
  "campaignId": "{{ $json.campaignId }}",
  "status": "{{ $json.finalStatus }}",
  "completedAt": "{{ $now }}",
  "finalProgress": {
    "sent": {{ $json.totalSent }},
    "delivered": {{ $json.totalDelivered }},
    "read": {{ $json.totalRead }},
    "failed": {{ $json.totalFailed }},
    "pending": 0
  },
  "summary": {
    "totalContacts": {{ $json.totalContacts }},
    "successRate": {{ $json.successRate }},
    "duration": "{{ $json.duration }}"
  }
}
```

---

## 🎯 **FLUXO COMPLETO NO N8N**

### **1. Trigger de Início**
```javascript
// Node: "Iniciar Campanha"
const campaignData = {
  campaignId: $input.first().json.campaignId,
  campaignName: $input.first().json.campaignName,
  totalContacts: $input.first().json.contacts.length,
  message: $input.first().json.message,
  instanceName: $input.first().json.instanceName
}

return [{ json: campaignData }]
```

### **2. Loop de Envio**
```javascript
// Node: "Processar Contatos"
const contacts = $input.first().json.contacts
const campaignId = $input.first().json.campaignId
const results = []

for (let i = 0; i < contacts.length; i++) {
  const contact = contacts[i]
  
  // Enviar mensagem
  const sendResult = await sendWhatsAppMessage(contact, message)
  
  // Atualizar progresso
  const progressData = {
    campaignId: campaignId,
    sent: i + 1,
    delivered: sendResult.delivered ? i + 1 : i,
    read: sendResult.read ? i + 1 : i,
    failed: sendResult.failed ? 1 : 0,
    pending: contacts.length - (i + 1),
    currentContactName: contact.name,
    currentContactPhone: contact.phone,
    currentContactStatus: sendResult.status
  }
  
  // Chamar endpoint de progresso
  await fetch('https://leadbaze.com/api/campaign/status/progress', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer SEU_TOKEN_AQUI'
    },
    body: JSON.stringify(progressData)
  })
  
  results.push(sendResult)
}

return [{ json: { results, campaignId } }]
```

### **3. Finalização**
```javascript
// Node: "Finalizar Campanha"
const results = $input.first().json.results
const campaignId = $input.first().json.campaignId
const totalContacts = results.length

const summary = {
  totalSent: results.filter(r => r.sent).length,
  totalDelivered: results.filter(r => r.delivered).length,
  totalRead: results.filter(r => r.read).length,
  totalFailed: results.filter(r => r.failed).length,
  successRate: (results.filter(r => r.sent).length / totalContacts * 100).toFixed(2)
}

const finalData = {
  campaignId: campaignId,
  finalStatus: summary.totalFailed > totalContacts * 0.5 ? 'failed' : 'completed',
  totalContacts: totalContacts,
  totalSent: summary.totalSent,
  totalDelivered: summary.totalDelivered,
  totalRead: summary.totalRead,
  totalFailed: summary.totalFailed,
  successRate: summary.successRate,
  duration: $input.first().json.duration
}

return [{ json: finalData }]
```

---

## 🔍 **LOGS DE DEBUG**

### **1. Logs de Início**
```javascript
console.log('🚀 [N8N-CAMPAIGN] Iniciando campanha:', campaignId)
console.log('📊 [N8N-CAMPAIGN] Total de contatos:', totalContacts)
console.log('📱 [N8N-CAMPAIGN] Instância:', instanceName)
```

### **2. Logs de Progresso**
```javascript
console.log('📈 [N8N-PROGRESS] Campanha:', campaignId)
console.log('📈 [N8N-PROGRESS] Enviados:', sent, '/', totalContacts)
console.log('📈 [N8N-PROGRESS] Taxa de sucesso:', (sent/totalContacts*100).toFixed(1) + '%')
```

### **3. Logs de Finalização**
```javascript
console.log('🎉 [N8N-COMPLETE] Campanha finalizada:', campaignId)
console.log('📊 [N8N-COMPLETE] Resumo:', summary)
console.log('⏱️ [N8N-COMPLETE] Duração:', duration)
```

---

## 🎨 **MELHORIAS IMPLEMENTADAS**

### **1. Sistema Global de Estado**
- ✅ **ActiveCampaignContext**: Gerenciamento global de campanhas
- ✅ **Modal Minimizável**: Pode ser minimizado/expandido sem perder conexão
- ✅ **SSE Persistente**: Conexão mantida mesmo quando modal é minimizado
- ✅ **Estado Persistente**: Mantém estado ao navegar entre páginas

### **2. Backend Corrigido**
- ✅ **Tabela Correta**: Usa `campaigns` em vez de `bulk_campaigns`
- ✅ **SSE Streaming**: Endpoint `/api/campaign/status/stream/:campaignId`
- ✅ **Logs Detalhados**: Rastreamento completo do fluxo
- ✅ **Tratamento de Erros**: Respostas consistentes

### **3. UI/UX Melhorada**
- ✅ **Modal Moderno**: Design responsivo com animações
- ✅ **Modo Escuro**: Suporte completo a tema escuro
- ✅ **Feedback Visual**: Progresso em tempo real
- ✅ **Navegação Intuitiva**: Botões de minimizar/expandir

---

## 🧪 **TESTES RECOMENDADOS**

### **1. Teste de Conectividade**
```bash
# Testar se endpoints estão respondendo
curl -X POST https://leadbaze.com/api/campaign/status/start \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{"campaignId":"test-123","campaignName":"Teste","totalContacts":1,"message":"Teste","instanceName":"test","status":"sending","startedAt":"2025-09-12T10:00:00Z","progress":{"sent":0,"delivered":0,"read":0,"failed":0,"pending":1}}'
```

### **2. Teste de SSE**
```javascript
// Testar conexão SSE
const eventSource = new EventSource('https://leadbaze.com/api/campaign/status/stream/test-123')
eventSource.onmessage = (event) => {
  console.log('SSE recebido:', JSON.parse(event.data))
}
```

### **3. Teste de Progresso**
```bash
# Testar atualização de progresso
curl -X POST https://leadbaze.com/api/campaign/status/progress \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{"campaignId":"test-123","progress":{"sent":1,"delivered":1,"read":0,"failed":0,"pending":0},"currentContact":{"name":"Teste","phone":"5511999999999","status":"sent"},"timestamp":"2025-09-12T10:01:00Z"}'
```

---

## 🚨 **PONTOS DE ATENÇÃO**

### **1. Autenticação**
- ✅ **Token Bearer**: Incluir token de autenticação em todas as requisições
- ✅ **CORS**: Configurado para aceitar requisições do N8N
- ✅ **Rate Limiting**: Implementado para evitar spam

### **2. Tratamento de Erros**
- ✅ **Retry Logic**: Implementar retry em caso de falha
- ✅ **Timeout**: Configurar timeout adequado para requisições
- ✅ **Fallback**: Plano B caso SSE falhe

### **3. Performance**
- ✅ **Batch Updates**: Enviar updates em lotes para melhor performance
- ✅ **Debounce**: Evitar updates muito frequentes
- ✅ **Connection Pool**: Reutilizar conexões HTTP

---

## 📊 **ESTRUTURA DE DADOS**

### **Campaign Object**
```typescript
interface Campaign {
  campaignId: string
  campaignName: string
  totalContacts: number
  message: string
  instanceName: string
  status: 'sending' | 'completed' | 'failed'
  startedAt: string
  completedAt?: string
  progress: {
    sent: number
    delivered: number
    read: number
    failed: number
    pending: number
  }
}
```

### **Progress Update**
```typescript
interface ProgressUpdate {
  campaignId: string
  progress: {
    sent: number
    delivered: number
    read: number
    failed: number
    pending: number
  }
  currentContact: {
    name: string
    phone: string
    status: string
  }
  timestamp: string
}
```

---

## 🎯 **PRÓXIMOS PASSOS**

### **1. Implementação no N8N**
- [ ] Configurar webhooks com endpoints atualizados
- [ ] Implementar lógica de retry
- [ ] Configurar logs de debug
- [ ] Testar fluxo completo

### **2. Monitoramento**
- [ ] Configurar alertas para falhas
- [ ] Monitorar performance dos endpoints
- [ ] Acompanhar logs de SSE
- [ ] Verificar taxa de sucesso

### **3. Otimizações**
- [ ] Implementar cache de progresso
- [ ] Otimizar queries do banco
- [ ] Melhorar tratamento de erros
- [ ] Adicionar métricas de performance

---

## 🏆 **RESULTADOS ESPERADOS**

### **✅ Funcionalidades**
- Modal de progresso em tempo real
- Minimização/expansão sem perder conexão
- SSE persistente durante toda a campanha
- Integração completa com N8N

### **✅ Performance**
- Updates em tempo real (< 1s de latência)
- Conexão SSE estável
- Tratamento robusto de erros
- Interface responsiva

### **✅ UX**
- Feedback visual claro
- Navegação intuitiva
- Suporte a modo escuro
- Animações suaves

---

**🎉 TUNNEL ATUALIZADO E PRONTO PARA USO!**
**📅 Data: 12/09/2025**
**👨‍💻 Status: Implementação completa do sistema global**

---

## 📞 **SUPORTE**

Em caso de problemas:
1. Verificar logs do backend
2. Testar conectividade dos endpoints
3. Verificar configuração do N8N
4. Consultar documentação do sistema global

**🔗 Links Úteis:**
- Backend: `https://leadbaze.com/api/campaign/status/`
- SSE Stream: `https://leadbaze.com/api/campaign/status/stream/:campaignId`
- Logs: Console do navegador e terminal do backend


