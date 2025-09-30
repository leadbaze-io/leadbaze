# 🔧 Configuração de CORS para LeadBaze no Servla

## 🚨 Problema Atual

O backend está retornando erro de CORS ao tentar conectar do domínio `https://leadbaze.io`:

```
Access to fetch at 'https://leadbaze.io/api/create-instance-and-qrcode' 
from origin 'https://leadbaze.io' has been blocked by CORS policy
```

## ✅ Solução para Servla

### 1. Acessar o Servidor Servla

```bash
# Conectar via SSH
ssh root@seu-ip-servla

# Navegar para o diretório do projeto
cd /var/www/leadflow
```

### 2. Configurar Variáveis de Ambiente do Backend

```bash
# Editar arquivo de configuração do backend
nano backend/config.env
```

**Atualizar a variável CORS_ORIGIN:**

```env
# Evolution API Configuration
EVOLUTION_API_URL=https://n8n-evolution.kof6cn.easypanel.host
EVOLUTION_API_KEY=qwSYwLlijZOh+FaBHrK0tfGzxG6W/J4O

# Server Configuration
PORT=3001
NODE_ENV=production

# CORS Configuration - IMPORTANTE!
CORS_ORIGIN=https://leadbaze.io,https://leadflow-indol.vercel.app,http://localhost:5173,http://localhost:5177,http://localhost:5178,http://localhost:5179,http://localhost:3000

# Webhook (N8N)
N8N_WEBHOOK_URL=https://n8n-n8n-start.kof6cn.easypanel.host/webhook/b1b11d27-2dfa-42a6-bbaf-b0fa456c0bae

# Security
API_SECRET=sua-chave-secreta-aqui
```

### 3. Reiniciar o Backend

```bash
# Parar o processo atual (se estiver rodando)
pm2 stop leadflow-backend

# Ou se estiver rodando com npm
pkill -f "node.*server.js"

# Navegar para o diretório do backend
cd backend

# Instalar dependências (se necessário)
npm install

# Iniciar o backend
pm2 start server.js --name "leadflow-backend"

# Ou iniciar com npm
npm start &

# Verificar se está rodando
pm2 list
# ou
ps aux | grep node
```

### 4. Verificar Configuração do Nginx

```bash
# Verificar configuração do Nginx
nano /etc/nginx/sites-available/leadflow

# Certifique-se de que o proxy para o backend está configurado:
```

```nginx
server {
    listen 80;
    server_name leadbaze.io www.leadbaze.io;
    
    # Frontend
    location / {
        root /var/www/leadflow/dist;
        try_files $uri $uri/ /index.html;
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 5. Reiniciar Nginx

```bash
# Testar configuração
nginx -t

# Se OK, reiniciar
systemctl restart nginx

# Verificar status
systemctl status nginx
```

### 6. Verificar Logs

```bash
# Logs do backend
pm2 logs leadflow-backend

# Logs do Nginx
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

## 🔍 Verificação

Após a configuração, teste a conexão do WhatsApp:

1. **Acesse**: https://leadbaze.io/disparador
2. **Clique**: "Conectar WhatsApp"
3. **Verifique**: Se não há mais erros de CORS

## 📝 Domínios Permitidos

O backend deve aceitar requisições dos seguintes domínios:

- ✅ `https://leadbaze.io` (DOMÍNIO PRINCIPAL)
- ✅ `https://leadflow-indol.vercel.app` (VERCEL)
- ✅ `http://localhost:5173` (DESENVOLVIMENTO LOCAL)
- ✅ `http://localhost:5177` (DESENVOLVIMENTO LOCAL)
- ✅ `http://localhost:5178` (DESENVOLVIMENTO LOCAL)
- ✅ `http://localhost:5179` (DESENVOLVIMENTO LOCAL)
- ✅ `http://localhost:3000` (DESENVOLVIMENTO LOCAL)

## 🚀 Deploy Automatizado (Opcional)

Se você quiser usar o script automatizado:

```bash
# Dar permissão ao script
chmod +x deploy-full-servla.sh

# Executar deploy completo
./deploy-full-servla.sh
```

## 📋 Checklist de Verificação

- [ ] ✅ CORS_ORIGIN atualizado no `backend/config.env`
- [ ] ✅ Backend reiniciado (PM2 ou npm)
- [ ] ✅ Nginx configurado com proxy para `/api/*`
- [ ] ✅ Nginx reiniciado
- [ ] ✅ Logs verificados
- [ ] ✅ Teste de conexão WhatsApp realizado
- [ ] ✅ Sem erros de CORS

## 🆘 Solução de Problemas

### Se o CORS persistir:

1. **Verificar se o backend está rodando:**
   ```bash
   netstat -tlnp | grep :3001
   ```

2. **Verificar se o Nginx está proxyando corretamente:**
   ```bash
   curl -I http://localhost:3001/api/health
   ```

3. **Verificar logs do backend:**
   ```bash
   pm2 logs leadflow-backend --lines 50
   ```

4. **Testar CORS diretamente:**
   ```bash
   curl -H "Origin: https://leadbaze.io" \
        -H "Access-Control-Request-Method: POST" \
        -H "Access-Control-Request-Headers: Content-Type" \
        -X OPTIONS \
        http://localhost:3001/api/create-instance-and-qrcode
   ```

### Se o backend não iniciar:

1. **Verificar dependências:**
   ```bash
   cd backend
   npm install
   ```

2. **Verificar variáveis de ambiente:**
   ```bash
   cat config.env
   ```

3. **Iniciar em modo debug:**
   ```bash
   node server.js
   ```

## 🔐 Segurança

- **CORS restritivo**: Apenas domínios autorizados
- **Proxy reverso**: Nginx como intermediário
- **Variáveis de ambiente**: Configurações sensíveis protegidas
- **Logs**: Monitoramento de acesso e erros

---

**📞 Suporte**: Se o problema persistir, verifique os logs e confirme que todas as etapas foram seguidas corretamente.










































