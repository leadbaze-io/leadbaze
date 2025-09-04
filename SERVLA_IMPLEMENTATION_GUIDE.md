# 🚀 Guia Completo de Implementação - LeadFlow na Servla.com.br

## 📋 **Visão Geral do Projeto**

O **LeadFlow** é uma aplicação web moderna para geração e gerenciamento de leads, desenvolvida com:
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Automação**: N8N para extração de dados
- **WhatsApp**: Evolution API para disparos em massa

## 🎯 **Funcionalidades Principais**

✅ **Gerador de Leads**: Extração automática do Google Maps  
✅ **Dashboard**: Gerenciamento de listas e métricas  
✅ **Disparador em Massa**: Campanhas via WhatsApp  
✅ **Sistema de Autenticação**: Login seguro com Supabase  
✅ **Interface Responsiva**: Design moderno e profissional  

## 🛠️ **Implementação na Servla.com.br**

### **Passo 1: Preparação do Servidor**

#### **1.1 Conectar ao Servidor**
```bash
ssh root@SEU_IP_SERVLA
```

#### **1.2 Atualizar Sistema**
```bash
# Atualizar pacotes
apt update && apt upgrade -y

# Instalar dependências básicas
apt install -y curl wget git unzip software-properties-common nginx
```

#### **1.3 Instalar Node.js 18+**
```bash
# Adicionar repositório NodeSource
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# Instalar Node.js
apt-get install -y nodejs

# Verificar instalação
node --version  # Deve mostrar v18.x.x
npm --version   # Deve mostrar 9.x.x ou superior
```

#### **1.4 Instalar PM2 (Gerenciador de Processos)**
```bash
# Instalar PM2 globalmente
npm install -g pm2

# Verificar instalação
pm2 --version
```

### **Passo 2: Deploy do LeadFlow**

#### **2.1 Clonar Repositório**
```bash
# Navegar para diretório web
cd /var/www

# Clonar repositório
git clone https://github.com/mindflowai1/leadflow.git
cd leadflow

# Verificar se clonou corretamente
ls -la
```

#### **2.2 Configurar Variáveis de Ambiente**
```bash
# Copiar arquivo de exemplo
cp env.example .env

# Editar variáveis de ambiente
nano .env
```

**Configurar as seguintes variáveis no arquivo `.env`:**
```env
# Supabase (OBRIGATÓRIO)
VITE_SUPABASE_URL=https://lsvwjyhnnzeewuuuykmb.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzdndqeWhubnplZXd1dXV5a21iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMzc4NTYsImV4cCI6MjA2OTkxMzg1Nn0.jNw-YTXlnbd51l7RHHQpTYgCqxERz6NqPggqMM41Fck

# N8N Webhook (OBRIGATÓRIO)
VITE_N8N_WEBHOOK_URL=https://n8n-n8n-start.kof6cn.easypanel.host/webhook-test/leadflow-extraction

# Configurações da aplicação
VITE_APP_ENV=production
VITE_DEBUG_MODE=false

# Evolution API (OPCIONAL - para WhatsApp)
VITE_EVOLUTION_API_URL=https://api.evolutionapi.com
VITE_EVOLUTION_API_KEY=sua_chave_da_evolution_api
VITE_EVOLUTION_INSTANCE_NAME=sua_instancia
```

#### **2.3 Deploy Automatizado**
```bash
# Dar permissão de execução ao script
chmod +x deploy-servla.sh

# Executar deploy
./deploy-servla.sh
```

**O script irá:**
- ✅ Instalar dependências
- ✅ Fazer build de produção
- ✅ Configurar Nginx
- ✅ Configurar SSL (se solicitado)
- ✅ Configurar PM2
- ✅ Configurar firewall

#### **2.4 Deploy Manual (Alternativo)**
```bash
# Instalar dependências
npm ci --production=false

# Verificar TypeScript
npm run type-check

# Build de produção
npm run build:prod

# Verificar se o build foi bem-sucedido
ls -la dist/

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

### **Passo 3: Configuração SSL (HTTPS)**

#### **3.1 Instalar Certbot**
```bash
# Instalar Certbot
apt install -y certbot python3-certbot-nginx

# Verificar instalação
certbot --version
```

#### **3.2 Configurar SSL**
```bash
# Configurar SSL para seu domínio
sudo certbot --nginx -d seu-dominio.com

# Testar renovação automática
sudo certbot renew --dry-run
```

#### **3.3 Configurar Renovação Automática**
```bash
# Adicionar ao crontab
sudo crontab -e

# Adicionar linha:
0 12 * * * /usr/bin/certbot renew --quiet
```

### **Passo 4: Configurações de Segurança**

#### **4.1 Configurar Firewall**
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

#### **4.2 Configurar Backup Automático**
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

### **Passo 5: Monitoramento e Logs**

#### **5.1 Verificar Status dos Serviços**
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

#### **5.2 Monitoramento de Recursos**
```bash
# Uso de CPU e memória
htop

# Uso de disco
df -h

# Processos em execução
ps aux | grep nginx
ps aux | grep node
```

## 🔧 **Configurações Específicas**

### **Configuração do Supabase**

1. **Acesse o projeto Supabase**: https://supabase.com/dashboard
2. **Execute o script SQL** (`supabase-setup.sql`) no SQL Editor
3. **Configure as políticas RLS** (Row Level Security)
4. **Verifique as variáveis de ambiente** no arquivo `.env`

### **Configuração do N8N**

1. **Deploy do N8N** (já configurado no projeto)
2. **URL do Webhook**: https://n8n-n8n-start.kof6cn.easypanel.host/webhook-test/leadflow-extraction
3. **Teste a conectividade** através da aplicação

### **Configuração da Evolution API (WhatsApp)**

1. **Configure uma instância** da Evolution API
2. **Obtenha as credenciais** (URL, API Key, Instance Name)
3. **Configure no painel** do LeadFlow

## 🔍 **Troubleshooting**

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

#### **5. Problemas de CORS**
```bash
# Verificar configuração Nginx
sudo nginx -t

# Verificar logs de erro
sudo tail -f /var/log/nginx/error.log
```

## 📊 **Verificação Final**

### **Checklist de Implementação**

- [ ] ✅ Servidor configurado com Node.js 18+
- [ ] ✅ Nginx instalado e configurado
- [ ] ✅ Repositório clonado
- [ ] ✅ Variáveis de ambiente configuradas
- [ ] ✅ Build de produção executado
- [ ] ✅ Arquivos copiados para `/var/www/leadflow`
- [ ] ✅ Nginx configurado e reiniciado
- [ ] ✅ SSL configurado (se aplicável)
- [ ] ✅ Firewall configurado
- [ ] ✅ Backup automático configurado
- [ ] ✅ Monitoramento configurado
- [ ] ✅ Aplicação testada e funcionando

### **Testes de Funcionalidade**

1. **Acesse a aplicação**: http://SEU_IP_SERVLA
2. **Teste o cadastro/login**
3. **Teste o gerador de leads**
4. **Teste o dashboard**
5. **Teste o disparador em massa**

## 📞 **Suporte**

### **Contatos MindFlow Digital**
- 📧 **Email**: contato@mindflowdigital.com.br
- 📱 **WhatsApp**: 31 97266-1278
- 🌐 **Website**: [mindflowdigital.com.br](https://mindflowdigital.com.br)

### **Suporte Servla**
- 📧 **Email**: [email protected]
- 📞 **Telefone**: +55 31 4042-7655
- 🌐 **Website**: [servla.com.br](https://servla.com.br)

## 🎯 **Comandos Úteis**

### **Gerenciamento da Aplicação**
```bash
# Reiniciar aplicação
pm2 restart leadflow

# Ver logs em tempo real
pm2 logs leadflow --lines 100

# Parar aplicação
pm2 stop leadflow

# Iniciar aplicação
pm2 start leadflow
```

### **Gerenciamento do Nginx**
```bash
# Testar configuração
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx

# Ver status
sudo systemctl status nginx

# Ver logs
sudo tail -f /var/log/nginx/access.log
```

### **Monitoramento do Sistema**
```bash
# Uso de recursos
htop

# Espaço em disco
df -h

# Memória
free -h

# Processos
ps aux | grep -E "(nginx|node|pm2)"
```

---

## 🎉 **Parabéns!**

Seu **LeadFlow** está rodando com sucesso na **Servla.com.br**!

**Acesse**: http://SEU_IP_SERVLA ou https://seu-dominio.com

**Desenvolvido com ❤️ pela MindFlow Digital**















