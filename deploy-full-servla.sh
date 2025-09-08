#!/bin/bash

# 🚀 Script de Deploy Completo para Servla - LeadBaze
# Autor: MindFlow Digital
# Versão: 2.0 - Otimizado para Servla.com.br

set -e

echo "🚀 Iniciando deploy completo do LeadBaze na Servla..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Função para log
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] ✅ $1${NC}"
}

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    error "Execute este script no diretório raiz do projeto LeadBaze"
fi

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    error "Node.js não está instalado. Instale Node.js 18+ primeiro."
fi

# Verificar se npm está instalado
if ! command -v npm &> /dev/null; then
    error "npm não está instalado."
fi

# Verificar se git está instalado
if ! command -v git &> /dev/null; then
    warn "Git não está instalado. Instalando..."
    apt update && apt install -y git
fi

log "📋 Verificando dependências do sistema..."

# Verificar se Nginx está instalado
if ! command -v nginx &> /dev/null; then
    warn "Nginx não está instalado. Instalando..."
    apt update && apt install -y nginx
    systemctl enable nginx
    systemctl start nginx
fi

# Verificar se PM2 está instalado
if ! command -v pm2 &> /dev/null; then
    warn "PM2 não está instalado. Instalando..."
    npm install -g pm2
fi

# Verificar se UFW está instalado
if ! command -v ufw &> /dev/null; then
    warn "UFW não está instalado. Instalando..."
    apt update && apt install -y ufw
fi

log "🔧 Configurando firewall..."
ufw allow 22    # SSH
ufw allow 80    # HTTP
ufw allow 443   # HTTPS
ufw --force enable

log "📦 Instalando dependências..."
npm ci --production=false

# Verificar TypeScript
log "🔍 Verificando TypeScript..."
npm run type-check

# Verificar se o arquivo .env existe
if [ ! -f ".env" ]; then
    warn "Arquivo .env não encontrado. Copiando de env.example..."
    cp env.example .env
    warn "⚠️  IMPORTANTE: Configure as variáveis de ambiente no arquivo .env antes de continuar!"
    warn "Pressione ENTER após configurar o arquivo .env..."
    read
fi

# Build de produção
log "🏗️ Fazendo build de produção..."
npm run build:prod

# Verificar se o build foi bem-sucedido
if [ ! -d "dist" ]; then
    error "Build falhou. Diretório 'dist' não foi criado."
fi

success "Build concluído com sucesso!"

# Criar diretório de deploy se não existir
DEPLOY_DIR="/var/www/leadflow"
log "📁 Preparando diretório de deploy: $DEPLOY_DIR"

sudo mkdir -p $DEPLOY_DIR
sudo chown -R $USER:$USER $DEPLOY_DIR

# Fazer backup do deploy anterior se existir
if [ -d "$DEPLOY_DIR/dist" ]; then
    log "💾 Fazendo backup do deploy anterior..."
    sudo cp -r $DEPLOY_DIR $DEPLOY_DIR.backup.$(date +%Y%m%d_%H%M%S)
fi

# Copiar arquivos para o diretório de deploy
log "📋 Copiando arquivos..."
sudo cp -r dist/* $DEPLOY_DIR/

# Configurar permissões
log "🔐 Configurando permissões..."
sudo chown -R www-data:www-data $DEPLOY_DIR
sudo chmod -R 755 $DEPLOY_DIR

# Configurar Nginx
log "🌐 Configurando Nginx..."
sudo cp nginx.conf /etc/nginx/sites-available/leadflow
sudo ln -sf /etc/nginx/sites-available/leadflow /etc/nginx/sites-enabled/

# Remover configuração padrão se existir
if [ -f "/etc/nginx/sites-enabled/default" ]; then
    sudo rm /etc/nginx/sites-enabled/default
fi

# Testar configuração do Nginx
log "🔍 Testando configuração do Nginx..."
sudo nginx -t

# Reiniciar Nginx
log "🔄 Reiniciando Nginx..."
sudo systemctl restart nginx

# Configurar PM2 para gerenciamento de processos
log "⚡ Configurando PM2..."

# Criar arquivo de configuração do PM2
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'leadflow',
    script: 'npm',
    args: 'start',
    cwd: '$DEPLOY_DIR',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    error_file: '/var/log/pm2/leadflow-error.log',
    out_file: '/var/log/pm2/leadflow-out.log',
    log_file: '/var/log/pm2/leadflow-combined.log',
    time: true
  }]
}
EOF

# Criar diretório de logs do PM2
sudo mkdir -p /var/log/pm2
sudo chown -R $USER:$USER /var/log/pm2

# Iniciar PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Configurar logrotate para PM2
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 save

# Configurar backup automático
log "💾 Configurando backup automático..."
sudo mkdir -p /backup/leadflow

cat > /root/backup-leadflow.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backup/leadflow"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR
tar -czf $BACKUP_DIR/leadflow_$DATE.tar.gz /var/www/leadflow

# Manter apenas últimos 7 backups
find $BACKUP_DIR -name "leadflow_*.tar.gz" -mtime +7 -delete

# Log do backup
echo "$(date): Backup realizado - leadflow_$DATE.tar.gz" >> /var/log/leadflow-backup.log
EOF

sudo chmod +x /root/backup-leadflow.sh

# Adicionar ao crontab (backup diário às 2h)
(crontab -l 2>/dev/null; echo "0 2 * * * /root/backup-leadflow.sh") | crontab -

# Configurar monitoramento
log "📊 Configurando monitoramento..."

# Criar script de monitoramento
cat > /root/monitor-leadflow.sh << 'EOF'
#!/bin/bash

# Verificar se Nginx está rodando
if ! systemctl is-active --quiet nginx; then
    echo "$(date): Nginx parou. Reiniciando..." >> /var/log/leadflow-monitor.log
    systemctl restart nginx
fi

# Verificar se PM2 está rodando
if ! pm2 list | grep -q "leadflow.*online"; then
    echo "$(date): LeadFlow parou. Reiniciando..." >> /var/log/leadflow-monitor.log
    pm2 restart leadflow
fi

# Verificar uso de disco
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 90 ]; then
    echo "$(date): Uso de disco alto: ${DISK_USAGE}%" >> /var/log/leadflow-monitor.log
fi
EOF

sudo chmod +x /root/monitor-leadflow.sh

# Adicionar monitoramento ao crontab (a cada 5 minutos)
(crontab -l 2>/dev/null; echo "*/5 * * * * /root/monitor-leadflow.sh") | crontab -

# Configurar SSL se solicitado
if [ "$1" = "--ssl" ]; then
    log "🔒 Configurando SSL..."
    
    # Verificar se Certbot está instalado
    if ! command -v certbot &> /dev/null; then
        warn "Certbot não está instalado. Instalando..."
        apt update && apt install -y certbot python3-certbot-nginx
    fi
    
    read -p "Digite seu domínio (ex: leadflow.com): " DOMAIN
    sudo certbot --nginx -d $DOMAIN
    
    # Configurar renovação automática
    (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -
fi

# Verificar status final
log "🔍 Verificando status final..."

# Verificar Nginx
if systemctl is-active --quiet nginx; then
    success "Nginx está rodando"
else
    error "Nginx não está rodando"
fi

# Verificar PM2
if pm2 list | grep -q "leadflow.*online"; then
    success "PM2 está rodando"
else
    error "PM2 não está rodando"
fi

# Verificar firewall
if ufw status | grep -q "Status: active"; then
    success "Firewall está ativo"
else
    warn "Firewall não está ativo"
fi

# Obter IP do servidor
SERVER_IP=$(hostname -I | awk '{print $1}')

success "Deploy concluído com sucesso!"
echo ""
echo "🎉 LeadFlow está rodando na Servla!"
echo "🌐 Acesse: http://$SERVER_IP"
echo "📊 Status do Nginx: sudo systemctl status nginx"
echo "📊 Status do PM2: pm2 status"
echo "📊 Logs do PM2: pm2 logs leadflow"
echo ""
echo "🔧 Comandos úteis:"
echo "   - Reiniciar aplicação: pm2 restart leadflow"
echo "   - Ver logs: pm2 logs leadflow --lines 100"
echo "   - Backup manual: /root/backup-leadflow.sh"
echo "   - Monitoramento: /root/monitor-leadflow.sh"
echo ""
echo "📧 Suporte: contato@mindflowdigital.com.br"
echo "📱 WhatsApp: 31 97266-1278"
echo ""
echo "✅ Deploy finalizado em $(date)"

