# Configurações de Produção - LeadBaze

## URLs Corretas para Produção

### 1. Backend API
- **URL Base**: `https://leadbaze.io`
- **Porta**: 80 (HTTP) / 443 (HTTPS)

### 2. URLs para o Fluxo N8N

#### URL 1: Iniciar Campanha
```
https://leadbaze.io/api/campaign/status/start
```

#### URL 2: Atualizar Progresso
```
https://leadbaze.io/api/campaign/status/progress
```

#### URL 3: Finalizar Campanha
```
https://leadbaze.io/api/campaign/status/complete
```

### 3. URLs Adicionais do Sistema

#### Webhook N8N (para receber dados do N8N)
```
https://leadbaze.io/api/campaign/n8n-webhook
```

#### Stream SSE (para progresso em tempo real)
```
https://leadbaze.io/api/campaign/status/stream/{campaignId}
```

#### Health Check
```
https://leadbaze.io/api/health
```

#### WhatsApp Connection
```
https://leadbaze.io/api/create-instance-and-qrcode
https://leadbaze.io/api/qrcode/{instanceName}
https://leadbaze.io/api/connection-state/{instanceName}
```

### 4. Variáveis de Ambiente para Produção

```bash
# Backend
VITE_BACKEND_URL=https://leadbaze.io
NODE_ENV=production

# Supabase (já configurado)
VITE_SUPABASE_URL=https://lsvwjyhnnzeewuuuykmb.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzdndqeWhubnplZXd1dXV5a21iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMzc4NTYsImV4cCI6MjA2OTkxMzg1Nn0.jNw-YTXlnbd51l7RHHQpTYgCqxERz6NqPggqMM41Fck
```

### 5. Configuração do Servidor (Backend)

```bash
# CORS Origins permitidas
CORS_ORIGIN=https://leadbaze.io,https://leadflow-indol.vercel.app,http://localhost:5173

# Porta do servidor
PORT=3001

# N8N Webhook URL
N8N_WEBHOOK_URL=https://n8n-n8n-start.kof6cn.easypanel.host/webhook/b1b11d27-2dfa-42a6-bbaf-b0fa456c0bae
```

## Status das Correções

✅ **Concluído:**
- `evolutionApiService.ts` - BACKEND_URL atualizado para produção
- `NewDisparadorMassa.tsx` - URLs de dispatch e SSE atualizadas
- `vite.config.ts` - Proxy configurado para produção

✅ **URLs Corretas para N8N:**
1. `https://leadbaze.io/api/campaign/status/start`
2. `https://leadbaze.io/api/campaign/status/progress`  
3. `https://leadbaze.io/api/campaign/status/complete`

## Próximos Passos

1. ✅ Verificar todas as URLs
2. ✅ Atualizar serviços para produção
3. 🔄 Fazer push para GitHub
4. 🚀 Deploy no Servla

