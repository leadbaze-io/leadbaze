# 🚀 Instruções de Deploy - Evolution API Backend

## 📋 Pré-requisitos

1. **Evolution API rodando** em `https://SEU_DOMINIO_DA_EVOLUTION_API:8080`
2. **API Key válida**: `qwSYwLlijZOh+FaBHrK0tfGzxG6W/J4O`
3. **Node.js 18+** instalado
4. **Git** para clonar o repositório

## 🔧 Configuração Local

### 1. Instalar Dependências
```bash
cd backend
npm install
```

### 2. Configurar Variáveis de Ambiente
```bash
# Copiar arquivo de configuração
cp config.env .env

# Editar com suas configurações
nano .env
```

**Conteúdo do `.env`:**
```env
# Evolution API Configuration
EVOLUTION_API_URL=https://SEU_DOMINIO_DA_EVOLUTION_API:8080
EVOLUTION_API_KEY=qwSYwLlijZOh+FaBHrK0tfGzxG6W/J4O

# Server Configuration
PORT=3001
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=https://leadflow-indol.vercel.app

# Security
API_SECRET=your-secret-key-here
```

### 3. Testar Conexão
```bash
# Testar se a Evolution API está funcionando
node test-connection.js
```

### 4. Executar Localmente
```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

## 🌐 Deploy em Produção

### Opção 1: Railway (Recomendado)

1. **Criar conta no Railway**
   - Acesse [railway.app](https://railway.app)
   - Faça login com GitHub

2. **Conectar repositório**
   - Clique em "New Project"
   - Selecione "Deploy from GitHub repo"
   - Escolha o repositório do LeadFlow

3. **Configurar variáveis de ambiente**
   - Vá em "Variables"
   - Adicione todas as variáveis do `.env`

4. **Deploy automático**
   - O Railway detecta automaticamente que é um projeto Node.js
   - Deploy acontece automaticamente a cada push

### Opção 2: Heroku

1. **Instalar Heroku CLI**
```bash
npm install -g heroku
```

2. **Login e criar app**
```bash
heroku login
heroku create leadflow-evolution-api
```

3. **Configurar variáveis**
```bash
heroku config:set EVOLUTION_API_URL=https://SEU_DOMINIO_DA_EVOLUTION_API:8080
heroku config:set EVOLUTION_API_KEY=qwSYwLlijZOh+FaBHrK0tfGzxG6W/J4O
heroku config:set NODE_ENV=production
heroku config:set CORS_ORIGIN=https://leadflow-indol.vercel.app
```

4. **Deploy**
```bash
git push heroku main
```

### Opção 3: DigitalOcean App Platform

1. **Criar app no DigitalOcean**
   - Acesse [cloud.digitalocean.com](https://cloud.digitalocean.com)
   - Vá em "Apps" → "Create App"

2. **Conectar repositório**
   - Escolha "GitHub" como fonte
   - Selecione o repositório

3. **Configurar build**
   - **Build Command**: `npm install`
   - **Run Command**: `npm start`
   - **Source Directory**: `backend`

4. **Configurar variáveis de ambiente**
   - Adicione todas as variáveis do `.env`

### Opção 4: Vercel (Serverless)

1. **Instalar Vercel CLI**
```bash
npm i -g vercel
```

2. **Configurar projeto**
```bash
cd backend
vercel
```

3. **Configurar variáveis**
```bash
vercel env add EVOLUTION_API_URL
vercel env add EVOLUTION_API_KEY
vercel env add CORS_ORIGIN
```

4. **Deploy**
```bash
vercel --prod
```

## 🔗 Atualizar Frontend

Após o deploy, atualize a URL do backend no frontend:

**Arquivo:** `leadflow/src/lib/evolutionApiService.ts`

```typescript
// Linha 6 - Substitua pela URL do seu backend
const BACKEND_URL = process.env.NODE_ENV === 'production' 
  ? 'https://seu-backend-deployado.railway.app' // ← SUA URL AQUI
  : 'http://localhost:3001';
```

## 🧪 Testar Deploy

### 1. Testar Endpoint de Saúde
```bash
curl https://seu-backend-deployado.railway.app/api/health
```

**Resposta esperada:**
```json
{
  "success": true,
  "message": "Evolution API Backend está funcionando",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "environment": "production"
}
```

### 2. Testar Criação de Instância
```bash
curl -X POST https://seu-backend-deployado.railway.app/api/create-instance-and-qrcode \
  -H "Content-Type: application/json" \
  -d '{"instanceName": "test_instance"}'
```

### 3. Testar Frontend
- Acesse: `https://leadflow-indol.vercel.app/disparador`
- Vá na aba "Configuração WhatsApp"
- Clique em "Conectar meu WhatsApp"
- Verifique se o QR Code aparece

## 🔒 Segurança

### Variáveis Sensíveis
- ✅ **Nunca** commite o arquivo `.env`
- ✅ Use variáveis de ambiente no servidor
- ✅ API Key nunca exposta no frontend

### CORS
- ✅ Configurado apenas para `https://leadflow-indol.vercel.app`
- ✅ Não permite requisições de outros domínios

### Logs
- ✅ Logs detalhados para debug
- ✅ Não expõe informações sensíveis

## 🐛 Troubleshooting

### Erro de CORS
```bash
# Verificar se CORS_ORIGIN está correto
echo $CORS_ORIGIN
```

### Erro de Conexão com Evolution API
```bash
# Testar conectividade
curl -X GET "https://SEU_DOMINIO:8080/instance/fetchInstances" \
  -H "apikey: qwSYwLlijZOh+FaBHrK0tfGzxG6W/J4O"
```

### Backend não responde
```bash
# Verificar logs
heroku logs --tail  # Heroku
railway logs        # Railway
```

## 📞 Suporte

Se encontrar problemas:

1. **Verifique os logs** do servidor
2. **Teste a Evolution API** diretamente
3. **Confirme as variáveis** de ambiente
4. **Verifique o CORS** está configurado corretamente

## 🎯 Próximos Passos

Após o deploy bem-sucedido:

1. ✅ **Teste a conexão** no frontend
2. ✅ **Configure webhooks** (opcional)
3. ✅ **Implemente persistência** de dados
4. ✅ **Adicione monitoramento** (logs, métricas)

---

**🎉 Parabéns!** Seu backend está pronto para conectar WhatsApp via Evolution API! 