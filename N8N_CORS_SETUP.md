# 🔧 Configuração CORS para N8N - LeadFlow

## Problema CORS Identificado

O erro `Access to XMLHttpRequest... has been blocked by CORS policy` indica que o N8N não está configurado para aceitar requisições do frontend React.

## ⚠️ Solução Rápida para Desenvolvimento

### Opção 1: Configurar CORS no N8N

Adicione as seguintes configurações no seu N8N:

```bash
# Variáveis de ambiente do N8N
N8N_CORS_ORIGIN="http://localhost:5173,https://seudominio.com"
N8N_WEBHOOK_CORS_ENABLED=true
```

### Opção 2: Proxy de Desenvolvimento (Alternativa)

Se não conseguir configurar o N8N, adicione um proxy no `vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/n8n': {
        target: 'https://n8n-n8n-start.kof6cn.easypanel.host',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/n8n/, ''),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('Proxy error:', err)
          })
        }
      }
    }
  }
})
```

E então atualize a URL no `leadService.ts`:

```typescript
// Em desenvolvimento, usar o proxy
const N8N_WEBHOOK_URL = process.env.NODE_ENV === 'development' 
  ? '/api/n8n/webhook-test/842e7854-35df-4b20-9a6e-994fd934505e'
  : 'https://n8n-n8n-start.kof6cn.easypanel.host/webhook-test/842e7854-35df-4b20-9a6e-994fd934505e'
```

## 🏷️ Configuração N8N para Produção

### 1. Headers CORS no Workflow

Adicione um nó "Set Headers" antes da resposta do webhook:

```json
{
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Content-Type": "application/json"
}
```

### 2. Webhook Response Format

Certifique-se que o webhook retorna:

```json
{
  "success": true,
  "leads": [
    {
      "name": "Nome do Estabelecimento",
      "address": "Endereço completo",
      "phone": "(11) 99999-9999",
      "rating": 4.5,
      "website": "https://site.com",
      "business_type": "Tipo de negócio",
      "google_maps_url": "URL original",
      "place_id": "Google Place ID",
      "reviews_count": 150,
      "price_level": 2
    }
  ],
  "total_found": 1,
  "search_url": "URL de entrada",
  "location": "Localização detectada",
  "search_term": "Termo de busca",
  "processing_time": 2.5
}
```

### 3. Tratamento de Erros

Para erros, retorne:

```json
{
  "success": false,
  "error": "Descrição do erro",
  "leads": [],
  "total_found": 0
}
```

## 🧪 Teste de Conectividade

Você pode testar o endpoint diretamente:

```bash
curl -X POST https://n8n-n8n-start.kof6cn.easypanel.host/webhook-test/842e7854-35df-4b20-9a6e-994fd934505e \
  -H "Content-Type: application/json" \
  -d '{
    "google_maps_url": "https://www.google.com/maps/search/restaurantes+sp",
    "limit": 5,
    "user_id": "test",
    "timestamp": "2025-01-31T10:00:00.000Z"
  }'
```

## 🌐 URLs Suportadas

O sistema agora aceita estes formatos de URL:

✅ `https://www.google.com/maps/search/hamburguerias+bh/@-19.9116841,-44.1175295,13z`
✅ `https://maps.google.com/maps?q=restaurantes+sao+paulo`
✅ `https://google.com/maps/place/Restaurant+Name`
✅ `https://goo.gl/maps/xyz123`
✅ `https://maps.app.goo.gl/xyz123`

## ⚡ Aplicar Correções

Depois de configurar o CORS no N8N, o sistema deve funcionar sem erros.

Se ainda houver problemas, verifique:
1. N8N está respondendo (teste com curl)
2. Headers CORS estão corretos
3. Formato da resposta está correto
4. Não há firewall bloqueando