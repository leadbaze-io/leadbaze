npm# Guia de Configuração - Webhook N8N para Blog Automation

## Resumo do Sistema

O sistema de Blog Automation está **100% implementado** e pronto para uso! Ele recebe dados do N8N via webhook e cria artigos automaticamente no blog.

## Status da Implementação

✅ **Concluído:**
- Schema do banco de dados (tabela `n8n_blog_queue`)
- Backend com API completa (`/api/blog/automation/*`)
- Frontend com dashboard admin (`/admin/blog-automation`)
- Sistema de processamento automático
- Scheduler configurado (9h todo dia)
- Autenticação admin (creaty12345@gmail.com)

## Como Testar o Sistema

### 1. Iniciar o Backend
```bash
cd leadflow/backend
node server.js
```

### 2. Iniciar o Frontend
```bash
cd leadflow
npm run dev
```

### 3. Acessar o Dashboard
- URL: `http://localhost:5173/admin/blog-automation`
- Login: `creaty12345@gmail.com`
- Senha: sua senha do Supabase

### 4. Testar com Dados Manuais

#### Inserir dados de teste na fila N8N:
```sql
INSERT INTO n8n_blog_queue (title, content, category, date, imageurl, autor)
VALUES (
  'Artigo de Teste - Automação N8N',
  '<h1>Teste de Automação</h1><p>Este é um artigo criado automaticamente pelo sistema N8N para testar a automação do blog.</p><p>O sistema deve processar este artigo e criar um post no blog automaticamente.</p>',
  'Teste',
  CURRENT_DATE,
  'https://via.placeholder.com/800x400/6366f1/ffffff?text=Artigo+de+Teste',
  'Sistema N8N'
);
```

#### Processar a fila:
- No dashboard, clique em "Processar Fila"
- Ou aguarde o scheduler automático (9h todo dia)

## Configuração do Webhook N8N

### 1. Estrutura do Webhook

O N8N deve enviar dados para a tabela `n8n_blog_queue` com a seguinte estrutura:

```json
{
  "title": "Título do Artigo",
  "content": "<h1>Conteúdo HTML</h1><p>Artigo completo em HTML</p>",
  "category": "Categoria do Artigo",
  "date": "2024-01-15",
  "imageurl": "https://exemplo.com/imagem.jpg",
  "autor": "Nome do Autor"
}
```

### 2. Endpoint do Webhook

**URL:** `https://seu-backend.com/api/blog/automation/webhook`

**Método:** POST

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "title": "Como Automatizar seu Blog com N8N",
  "content": "<h1>Introdução</h1><p>Neste artigo, vamos aprender como automatizar a criação de artigos no blog usando N8N...</p>",
  "category": "Automação",
  "date": "2024-01-15",
  "imageurl": "https://exemplo.com/automacao-blog.jpg",
  "autor": "LeadBaze Team"
}
```

### 3. Configuração no N8N

1. **Criar um novo workflow no N8N**
2. **Adicionar um trigger** (ex: Schedule, Webhook, etc.)
3. **Adicionar um nó HTTP Request**
4. **Configurar o HTTP Request:**
   - Method: POST
   - URL: `https://seu-backend.com/api/blog/automation/webhook`
   - Headers: `Content-Type: application/json`
   - Body: JSON com os dados do artigo

### 4. Exemplo de Workflow N8N

```json
{
  "nodes": [
    {
      "name": "Schedule Trigger",
      "type": "n8n-nodes-base.scheduleTrigger",
      "parameters": {
        "rule": {
          "interval": [
            {
              "field": "cronExpression",
              "expression": "0 9 * * *"
            }
          ]
        }
      }
    },
    {
      "name": "Generate Article",
      "type": "n8n-nodes-base.function",
      "parameters": {
        "functionCode": "// Gerar dados do artigo\nreturn [{\n  json: {\n    title: 'Artigo Gerado Automaticamente',\n    content: '<h1>Conteúdo do Artigo</h1><p>Este artigo foi gerado automaticamente pelo N8N.</p>',\n    category: 'Automação',\n    date: new Date().toISOString().split('T')[0],\n    imageurl: 'https://via.placeholder.com/800x400',\n    autor: 'Sistema N8N'\n  }\n}];"
      }
    },
    {
      "name": "Send to Blog API",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "method": "POST",
        "url": "https://seu-backend.com/api/blog/automation/webhook",
        "headers": {
          "Content-Type": "application/json"
        },
        "body": "={{ $json }}"
      }
    }
  ]
}
```

## Endpoints da API

### Públicos
- `GET /api/blog/automation/health` - Status do sistema
- `GET /api/blog/automation/stats` - Estatísticas da fila

### Admin (requer header `x-user-email: creaty12345@gmail.com`)
- `POST /api/blog/automation/admin/process` - Processar fila manualmente
- `GET /api/blog/automation/admin/queue` - Ver fila completa
- `POST /api/blog/automation/admin/process/:itemId` - Processar item específico
- `GET /api/blog/automation/admin/config` - Ver configuração
- `PUT /api/blog/automation/admin/config` - Atualizar configuração
- `POST /api/blog/automation/admin/scheduler/start` - Iniciar scheduler
- `POST /api/blog/automation/admin/scheduler/stop` - Parar scheduler

## Monitoramento

### Dashboard Admin
- Acesse: `http://localhost:5173/admin/blog-automation`
- Visualize estatísticas em tempo real
- Controle o scheduler
- Processe itens manualmente
- Veja logs do sistema

### Logs do Sistema
- Backend: Console do servidor
- Frontend: Console do navegador
- Dashboard: Seção de logs em tempo real

## Troubleshooting

### Backend não inicia
```bash
cd leadflow/backend
npm install
node server.js
```

### Erro de conexão com Supabase
- Verificar `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` no `config.env`
- Verificar se as tabelas foram criadas no Supabase

### Dashboard não carrega
- Verificar se o backend está rodando na porta 3001
- Verificar `VITE_BACKEND_URL` no `.env`

### Artigos não aparecem no blog
- Verificar se foram processados na fila
- Verificar se `published = true` na tabela `blog_posts`
- Verificar se a categoria foi criada

## Próximos Passos

1. **Configurar webhook no N8N** com a URL do seu backend
2. **Testar com dados reais** do seu workflow N8N
3. **Ajustar configurações** conforme necessário
4. **Monitorar** o sistema via dashboard

## URLs Importantes

- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:3001
- **Dashboard Admin:** http://localhost:5173/admin/blog-automation
- **API Health:** http://localhost:3001/api/blog/automation/health

---

🎉 **Sistema 100% funcional e pronto para produção!**
