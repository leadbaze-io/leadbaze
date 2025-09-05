# 🚀 Guia de Deploy Completo na Servla - LeadFlow (Frontend + Backend)

## 📋 Visão Geral

Este guia permite hospedar **TODA** a aplicação LeadFlow na Servla:
- ✅ **Frontend React** - Interface do usuário
- ✅ **Backend Node.js** - API para Evolution API (WhatsApp)
- ✅ **Nginx** - Proxy reverso e servidor web
- ✅ **PM2** - Gerenciamento de processos
- ✅ **SSL/HTTPS** - Segurança completa

## 🎯 Arquitetura Final

```
🌐 Internet
    ↓
🛡️ Servla VPS/Dedicado
    ├── 🌐 Nginx (Porta 80/443)
    │   ├── 📱 Frontend React (/var/www/leadflow)
    │   └── 🔗 Proxy para Backend (/api/* → localhost:3001)
    └── ⚙️ Backend Node.js (Porta 3001)
        ├── 📞 Evolution API Integration
        ├── 🔄 N8N Webhook
        └── 🗄️ Supabase Integration
```

## 🛠️ Pré-requisitos

### **1. Servla**
- ✅ VPS Cloud (R$ 39/mês) ou Servidor Dedicado
- ✅ Acesso SSH root
- ✅ IP público

### **2. Serviços Externos**
- ✅ **Supabase** - Banco de dados
- ✅ **Evolution API** - WhatsApp Business
- ✅ **N8N** - Automação de workflows

## 🚀 Deploy Automatizado (Recomendado)

### **1. Preparar Servidor**
```bash
# Conectar via SSH
ssh root@seu-ip-servla

# Atualizar sistema
apt update && apt upgrade -y

# Instalar dependências básicas
apt install -y curl wget git unzip software-properties-common nginx

# Instalar Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Instalar PM2
npm install -g pm2
```

### **2. Clonar e Deploy**
```bash
# Clonar repositório
cd /var/www
git clone https://github.com/mindflowai1/leadflow.git
cd leadflow

# Dar permissão ao script
chmod +x deploy-full-servla.sh

# Executar deploy completo
./deploy-full-servla.sh
```

### **3. Configurar Backend**
```bash
# Editar configurações do backend
nano backend/config.env
```

**Configuração mínima:**
```env
# Evolution API Configuration
EVOLUTION_API_URL=https://sua-evolution-api.com:8080
EVOLUTION_API_KEY=sua-api-key-aqui

# Server Configuration
PORT=3001
NODE_ENV=production

# CORS Configuration
CORS_ORIGIN=https://seu-dominio.com,http://localhost:5173

# Webhook (N8N)
N8N_WEBHOOK_URL=https://n8n-n8n-start.kof6cn.easypanel.host/webhook/...

# Security
API_SECRET=sua-chave-secreta-aqui
```

## 🔧 Deploy Manual (Passo a Passo)

### **1. Frontend**
```bash
# Instalar dependências
npm ci --production=false

# Build de produção
npm run build:prod

# Copiar para diretório web
sudo cp -r dist/* /var/www/leadflow/
```

### **2. Backend**
```bash
# Navegar para backend
cd backend

# Instalar dependências
npm ci --production=false

# Configurar variáveis de ambiente
cp config.env.example config.env
nano config.env

# Criar diretório de logs
mkdir -p logs

# Iniciar com PM2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

### **3. Nginx**
```bash
# Configurar Nginx
sudo cp nginx.conf /etc/nginx/sites-available/leadflow
sudo ln -sf /etc/nginx/sites-available/leadflow /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Testar e reiniciar
sudo nginx -t
sudo systemctl restart nginx
```

## 🔒 Configuração SSL (HTTPS)

### **1. Com Domínio**
```bash
# Instalar Certbot
apt install -y certbot python3-certbot-nginx

# Configurar SSL
sudo certbot --nginx -d seu-dominio.com

# Renovação automática
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -
```

### **2. Sem Domínio (IP Direto)**
```bash
# Gerar certificado auto-assinado
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/private/nginx-selfsigned.key \
  -out /etc/ssl/certs/nginx-selfsigned.crt

# Configurar Nginx para HTTPS
sudo nano /etc/nginx/sites-available/leadflow
```

## 📊 Monitoramento

### **1. Status dos Serviços**
```bash
# Frontend (Nginx)
sudo systemctl status nginx

# Backend (PM2)
pm2 status
pm2 logs leadflow-evolution-api

# Logs do Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### **2. Recursos do Sistema**
```bash
# CPU e memória
htop

# Uso de disco
df -h

# Portas em uso
netstat -tlnp
```

### **3. Testes de Conectividade**
```bash
# Testar frontend
curl -I http://localhost

# Testar backend
curl -I http://localhost:3001/health

# Testar API
curl -X POST http://localhost:3001/api/dispatch-campaign \
  -H "Content-Type: application/json" \
  -d '[]'
```

## 🔍 Troubleshooting

### **Problemas Comuns**

#### **1. Backend não inicia**
```bash
# Verificar logs
pm2 logs leadflow-evolution-api

# Verificar variáveis de ambiente
cat backend/config.env

# Reiniciar backend
pm2 restart leadflow-evolution-api
```

#### **2. Erro 502 Bad Gateway**
```bash
# Verificar se backend está rodando
pm2 status

# Verificar porta 3001
netstat -tlnp | grep 3001

# Verificar configuração Nginx
sudo nginx -t
```

#### **3. Problemas de CORS**
```bash
# Verificar configuração CORS no backend
cat backend/config.env | grep CORS

# Testar com curl
curl -H "Origin: https://seu-dominio.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -X OPTIONS http://localhost:3001/api/dispatch-campaign
```

#### **4. Problemas de SSL**
```bash
# Verificar certificado
sudo certbot certificates

# Renovar certificado
sudo certbot renew

# Verificar configuração Nginx
sudo nginx -t
```

## 🔄 Atualizações

### **1. Atualizar Frontend**
```bash
# Pull das mudanças
git pull origin main

# Rebuild
npm run build:prod

# Copiar arquivos
sudo cp -r dist/* /var/www/leadflow/
```

### **2. Atualizar Backend**
```bash
# Pull das mudanças
git pull origin main

# Reinstalar dependências
cd backend
npm ci --production=false

# Reiniciar com PM2
pm2 restart leadflow-evolution-api
```

### **3. Atualização Completa**
```bash
# Executar script de deploy novamente
./deploy-full-servla.sh
```

## 📞 Suporte

### **MindFlow Digital**
- 📧 **Email**: contato@mindflowdigital.com.br
- 📱 **WhatsApp**: 31 97266-1278
- 🌐 **Website**: [mindflowdigital.com.br](https://mindflowdigital.com.br)

### **Servla**
- 📞 **Telefone**: +55 31 4042-7655
- 🌐 **Website**: [servla.com.br](https://servla.com.br)

## 🎯 Checklist Final

- [ ] Servidor configurado com Node.js 18+
- [ ] Nginx instalado e configurado
- [ ] PM2 instalado e configurado
- [ ] Frontend buildado e servido
- [ ] Backend configurado e rodando
- [ ] Variáveis de ambiente configuradas
- [ ] Evolution API conectada
- [ ] N8N webhook funcionando
- [ ] SSL configurado (se aplicável)
- [ ] Firewall configurado
- [ ] Backup automático configurado
- [ ] Monitoramento configurado
- [ ] Testes de conectividade passando

---

**🎉 Parabéns! O LeadFlow está rodando completamente na Servla!**

**Desenvolvido com ❤️ pela MindFlow Digital**


















