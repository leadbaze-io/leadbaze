# 🔗 Guia Completo: Configuração do Webhook Calendly

## 📋 Pré-requisitos

- ✅ Tabelas criadas no Supabase
- ✅ Backend rodando (api.leadbaze.io)
- ✅ Conta Calendly (orafamachado)

---

## 🎯 Passo 1: Configurar Webhook no Calendly

### 1.1 Acessar Configurações de Webhooks

**URL direta:**
```
https://calendly.com/integrations/webhooks
```

**Ou navegue:**
1. Acesse: https://calendly.com
2. Clique no seu avatar (canto superior direito)
3. Vá em: **Account** → **Integrations**
4. Procure por: **Webhooks**
5. Clique em: **Add Webhook** ou **Create Webhook**

---

### 1.2 Preencher Dados do Webhook

**Webhook URL:**
```
https://api.leadbaze.io/api/calendly/webhook
```

**Eventos para Selecionar:**
- ✅ `invitee.created` - Quando alguém agenda
- ✅ `invitee.canceled` - Quando alguém cancela

**Signing Key (Opcional):**
- Deixe em branco por enquanto
- Ou gere uma chave aleatória para segurança

**Exemplo de chave:**
```
leadbaze_webhook_secret_2024_calendly
```

---

### 1.3 Salvar Webhook

1. Clique em **Create Webhook** ou **Save**
2. ✅ Webhook criado!
3. **Copie o Webhook ID** (você vai precisar)

---

## 🔧 Passo 2: Configurar Backend

### 2.1 Adicionar Variáveis de Ambiente

**Arquivo:** `backend/config.env`

Adicione estas linhas:

```env
# Calendly Webhook Configuration
CALENDLY_WEBHOOK_URL=https://api.leadbaze.io/api/calendly/webhook
CALENDLY_WEBHOOK_SECRET=leadbaze_webhook_secret_2024_calendly
CALENDLY_ACCOUNT_EMAIL=orafamachadoc@gmail.com
```

---

### 2.2 Registrar Rota no Backend

**Arquivo:** `backend/server.js` (ou `app.js`)

Adicione estas linhas:

```javascript
// Importar rota do webhook
const calendlyWebhookRoutes = require('./routes/calendly-webhook');

// Registrar rota (ANTES das outras rotas)
app.use('/api/calendly', calendlyWebhookRoutes);
```

**Exemplo completo:**

```javascript
const express = require('express');
const app = express();

// Middleware
app.use(express.json());

// ADICIONAR AQUI:
const calendlyWebhookRoutes = require('./routes/calendly-webhook');
app.use('/api/calendly', calendlyWebhookRoutes);

// Outras rotas...
app.use('/api/leads', leadRoutes);
// etc...

app.listen(3001, () => {
  console.log('Server running on port 3001');
});
```

---

### 2.3 Reiniciar Backend

**No servidor:**

```bash
# Se usar PM2:
pm2 restart leadbaze-backend

# Se usar npm:
npm run start

# Se usar node:
node server.js
```

---

## 🧪 Passo 3: Testar Webhook

### 3.1 Teste Manual (Endpoint de Teste)

**Abra no navegador:**
```
https://api.leadbaze.io/api/calendly/webhook/test
```

**Resposta esperada:**
```json
{
  "status": "ok",
  "message": "Webhook endpoint está funcionando",
  "timestamp": "2025-12-05T19:42:00.000Z"
}
```

✅ Se aparecer isso, o endpoint está funcionando!

---

### 3.2 Teste Real (Agendar no Calendly)

**Teste completo:**

1. **Acesse:** http://localhost:5173/agendar-demo
2. **Complete o formulário** conversacional
3. **Clique em:** "Agendar Minha Demonstração"
4. **Agende um horário** no Calendly
5. **Confirme o agendamento**

**Verificar no Supabase:**

```sql
-- Ver lead criado
SELECT * FROM conversational_leads 
ORDER BY created_at DESC 
LIMIT 1;

-- Ver agendamento criado (deve aparecer após webhook)
SELECT * FROM demo_appointments 
ORDER BY created_at DESC 
LIMIT 1;

-- Ver vinculação (lead + agendamento)
SELECT 
  cl.name,
  cl.email,
  cl.company,
  cl.status,
  da.scheduled_at,
  da.calendly_event_id
FROM conversational_leads cl
LEFT JOIN demo_appointments da ON cl.demo_appointment_id = da.id
WHERE cl.email = 'seu_email_de_teste@gmail.com';
```

---

## 🔍 Passo 4: Monitorar Logs

### 4.1 Logs do Backend

**Ver logs em tempo real:**

```bash
# Se usar PM2:
pm2 logs leadbaze-backend

# Se usar npm:
# Os logs aparecem no terminal
```

**O que procurar:**
```
✅ Webhook recebido do Calendly: invitee.created
✅ Lead encontrado por email: usuario@email.com
✅ Agendamento salvo: uuid-do-agendamento
✅ Lead atualizado com agendamento: uuid-do-lead
```

---

### 4.2 Logs do Calendly

**Ver webhooks enviados:**

1. Acesse: https://calendly.com/integrations/webhooks
2. Clique no webhook que você criou
3. Veja a aba **Recent Deliveries**
4. Deve mostrar:
   - ✅ Status: 200 OK
   - ✅ Event: invitee.created
   - ✅ Timestamp

---

## 🚨 Troubleshooting

### Problema 1: Webhook não recebe eventos

**Possíveis causas:**
- ❌ URL incorreta no Calendly
- ❌ Backend não está rodando
- ❌ Firewall bloqueando

**Solução:**
1. Verifique URL: `https://api.leadbaze.io/api/calendly/webhook`
2. Teste endpoint: `/api/calendly/webhook/test`
3. Verifique logs do backend

---

### Problema 2: Erro 500 no webhook

**Possíveis causas:**
- ❌ Erro no código do webhook
- ❌ Supabase não conectado
- ❌ Variáveis de ambiente faltando

**Solução:**
1. Verifique logs do backend
2. Teste conexão com Supabase
3. Verifique `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`

---

### Problema 3: Lead não vincula com agendamento

**Possíveis causas:**
- ❌ Email diferente no formulário vs Calendly
- ❌ Lead não foi salvo antes

**Solução:**
```sql
-- Buscar lead por email
SELECT * FROM conversational_leads 
WHERE email = 'email@teste.com';

-- Buscar agendamento por email
SELECT * FROM demo_appointments 
WHERE attendee_email = 'email@teste.com';

-- Vincular manualmente se necessário
UPDATE conversational_leads 
SET demo_appointment_id = 'uuid-do-agendamento',
    status = 'demo_scheduled'
WHERE email = 'email@teste.com';
```

---

## ✅ Checklist de Verificação

- [ ] Webhook criado no Calendly
- [ ] URL configurada: `https://api.leadbaze.io/api/calendly/webhook`
- [ ] Eventos selecionados: `invitee.created`, `invitee.canceled`
- [ ] Variáveis de ambiente adicionadas no backend
- [ ] Rota registrada no `server.js`
- [ ] Backend reiniciado
- [ ] Endpoint de teste funcionando
- [ ] Teste real realizado (agendar no Calendly)
- [ ] Lead salvo no Supabase
- [ ] Agendamento salvo no Supabase
- [ ] Lead vinculado ao agendamento
- [ ] Status atualizado para `demo_scheduled`

---

## 🎯 Próximos Passos (Opcional)

### Automações Possíveis:

1. **Email de Confirmação:**
   - Enviar email automático após agendamento
   - Template personalizado com dados do lead

2. **WhatsApp:**
   - Lembrete 1 dia antes
   - Lembrete 1 hora antes
   - Link da reunião

3. **Notificação para Equipe:**
   - Email para vendedor responsável
   - Slack/Discord notification
   - Dashboard em tempo real

4. **CRM Integration:**
   - Criar deal no CRM
   - Atualizar pipeline
   - Atribuir vendedor

---

## 📞 Suporte

**Problemas?**
- Verifique logs do backend
- Teste endpoint manualmente
- Consulte documentação do Calendly: https://developer.calendly.com/api-docs/webhooks

**Dúvidas?**
- Me chame que eu ajudo! 🚀
