# 🚀 Guia de Deploy na Servla - LeadFlow

## 📋 Pré-requisitos

### **1. Conta na Servla**
- ✅ Conta ativa na [Servla](https://servla.com.br/)
- ✅ VPS Cloud ou Servidor Dedicado configurado
- ✅ Acesso SSH ao servidor

### **2. Domínio (Opcional)**
- 🌐 Domínio configurado (ex: leadflow.com)
- 📧 Acesso ao painel de DNS

## 🛠️ Preparação do Servidor

### **1. Conectar via SSH**
```bash
ssh root@seu-ip-servla
```

### **2. Atualizar Sistema**
```bash
# Atualizar pacotes
apt update && apt upgrade -y

# Instalar dependências básicas
apt install -y curl wget git unzip software-properties-common
```

### **3. Instalar Node.js 18+**
```bash
# Adicionar repositório NodeSource
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# Instalar Node.js
apt-get install -y nodejs

# Verificar instalação
node --version
npm --version
```

### **4. Instalar Nginx**
```bash
# Instalar Nginx
apt install -y nginx

# Iniciar e habilitar Nginx
systemctl start nginx
systemctl enable nginx

# Verificar status
systemctl status nginx
```

### **5. Instalar PM2 (Opcional)**
```bash
# Instalar PM2 globalmente
npm install -g pm2

# Verificar instalação
pm2 --version
```

## 📦 Deploy do LeadFlow

### **1. Clonar Repositório**
```bash
# Navegar para diretório web
cd /var/www

# Clonar repositório
git clone https://github.com/mindflowai1/leadflow.git
cd leadflow
```

### **2. Configurar Variáveis de Ambiente**
```bash
# Copiar arquivo de exemplo
cp env.example .env

# Editar variáveis de ambiente
nano .env
```

**Configurar as seguintes variáveis:**
```env
# Supabase (obrigatório)
VITE_SUPABASE_URL=https://lsvwjyhnnzeewuuuykmb.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# N8N Webhook (obrigatório)
VITE_N8N_WEBHOOK_URL=https://n8n-n8n-start.kof6cn.easypanel.host/webhook-test/leadflow-extraction

# Configurações da aplicação
VITE_APP_ENV=production
VITE_DEBUG_MODE=false
```

### **3. Deploy Automatizado**
```bash
# Dar permissão de execução ao script
chmod +x deploy-servla.sh

# Executar deploy
./deploy-servla.sh
```

### **4. Deploy Manual (Alternativo)**
```bash
# Instalar dependências
npm ci --production=false

# Verificar TypeScript
npm run type-check

# Build de produção
npm run build:prod

# Copiar arquivos para diretório web
sudo cp -r dist/* /var/www/leadflow/

# Configurar Nginx
sudo cp nginx.conf /etc/nginx/sites-available/leadflow
sudo ln -sf /etc/nginx/sites-available/leadflow /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Testar e reiniciar Nginx
sudo nginx -t
sudo systemctl restart nginx
```

## 🔒 Configuração SSL (HTTPS)

### **1. Instalar Certbot**
```bash
# Instalar Certbot
apt install -y certbot python3-certbot-nginx

# Verificar instalação
certbot --version
```

### **2. Configurar SSL**
```bash
# Configurar SSL para seu domínio
sudo certbot --nginx -d seu-dominio.com

# Testar renovação automática
sudo certbot renew --dry-run
```

### **3. Configurar Renovação Automática**
```bash
# Adicionar ao crontab
sudo crontab -e

# Adicionar linha:
0 12 * * * /usr/bin/certbot renew --quiet
```

## 🔧 Configurações Avançadas

### **1. Configurar Firewall**
```bash
# Instalar UFW
apt install -y ufw

# Configurar regras
ufw allow 22    # SSH
ufw allow 80    # HTTP
ufw allow 443   # HTTPS

# Habilitar firewall
ufw enable

# Verificar status
ufw status
```

### **2. Configurar Backup Automático**
```bash
# Criar script de backup
cat > /root/backup-leadflow.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backup/leadflow"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR
tar -czf $BACKUP_DIR/leadflow_$DATE.tar.gz /var/www/leadflow

# Manter apenas últimos 7 backups
find $BACKUP_DIR -name "leadflow_*.tar.gz" -mtime +7 -delete
EOF

chmod +x /root/backup-leadflow.sh

# Adicionar ao crontab (backup diário às 2h)
echo "0 2 * * * /root/backup-leadflow.sh" | crontab -
```

### **3. Monitoramento com PM2**
```bash
# Configurar PM2 para monitoramento
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7

# Salvar configuração
pm2 save
pm2 startup
```

## 📊 Monitoramento e Logs

### **1. Verificar Status dos Serviços**
```bash
# Status do Nginx
systemctl status nginx

# Status do PM2
pm2 status

# Logs do Nginx
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# Logs do PM2
pm2 logs leadflow
```

### **2. Monitoramento de Recursos**
```bash
# Uso de CPU e memória
htop

# Uso de disco
df -h

# Processos em execução
ps aux | grep nginx
ps aux | grep node
```

## 🔍 Troubleshooting

### **Problemas Comuns**

#### **1. Erro 502 Bad Gateway**
```bash
# Verificar se a aplicação está rodando
pm2 status

# Verificar logs
pm2 logs leadflow

# Reiniciar aplicação
pm2 restart leadflow
```

#### **2. Erro de Permissão**
```bash
# Corrigir permissões
sudo chown -R www-data:www-data /var/www/leadflow
sudo chmod -R 755 /var/www/leadflow
```

#### **3. Problemas de SSL**
```bash
# Verificar certificado
sudo certbot certificates

# Renovar certificado
sudo certbot renew

# Verificar configuração Nginx
sudo nginx -t
```

#### **4. Problemas de Build**
```bash
# Limpar cache
npm cache clean --force

# Remover node_modules
rm -rf node_modules package-lock.json

# Reinstalar dependências
npm install
```

## 📞 Suporte

### **Contatos MindFlow Digital**
- 📧 **Email**: contato@mindflowdigital.com.br
- 📱 **WhatsApp**: 31 97266-1278
- 🌐 **Website**: [mindflowdigital.com.br](https://mindflowdigital.com.br)

### **Suporte Servla**
- 📧 **Email**: [email protected]
- 📞 **Telefone**: +55 31 4042-7655
- 🌐 **Website**: [servla.com.br](https://servla.com.br)

## 🎯 Checklist de Deploy

- [ ] Servidor configurado com Node.js 18+
- [ ] Nginx instalado e configurado
- [ ] Repositório clonado
- [ ] Variáveis de ambiente configuradas
- [ ] Build de produção executado
- [ ] Arquivos copiados para `/var/www/leadflow`
- [ ] Nginx configurado e reiniciado
- [ ] SSL configurado (se aplicável)
- [ ] Firewall configurado
- [ ] Backup automático configurado
- [ ] Monitoramento configurado
- [ ] Aplicação testada e funcionando

---

**🎉 Parabéns! O LeadFlow está rodando na Servla!**

**Desenvolvido com ❤️ pela MindFlow Digital**









