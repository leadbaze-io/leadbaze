#!/bin/bash

# 🚀 Script de Deploy para Servla - LeadBaze
# Autor: MindFlow Digital
# Versão: 1.0

set -e

echo "🚀 Iniciando deploy do LeadBaze na Servla..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    error "Execute este script no diretório raiz do projeto LeadFlow"
fi

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    error "Node.js não está instalado. Instale Node.js 18+ primeiro."
fi

# Verificar se npm está instalado
if ! command -v npm &> /dev/null; then
    error "npm não está instalado."
fi

log "📋 Verificando dependências..."

# Instalar dependências
log "📦 Instalando dependências..."
npm ci --production=false

# Verificar TypeScript
log "🔍 Verificando TypeScript..."
npm run type-check

# Build de produção
log "🏗️ Fazendo build de produção..."
npm run build:prod

# Verificar se o build foi bem-sucedido
if [ ! -d "dist" ]; then
    error "Build falhou. Diretório 'dist' não foi criado."
fi

log "✅ Build concluído com sucesso!"

# Criar diretório de deploy se não existir
DEPLOY_DIR="/var/www/leadflow"
log "📁 Preparando diretório de deploy: $DEPLOY_DIR"

sudo mkdir -p $DEPLOY_DIR
sudo chown -R $USER:$USER $DEPLOY_DIR

# Copiar arquivos para o diretório de deploy
log "📋 Copiando arquivos..."
cp -r dist/* $DEPLOY_DIR/

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

# Configurar SSL (se necessário)
if [ "$1" = "--ssl" ]; then
    log "🔒 Configurando SSL..."
    sudo apt-get update
    sudo apt-get install -y certbot python3-certbot-nginx
    
    read -p "Digite seu domínio (ex: leadflow.com): " DOMAIN
    sudo certbot --nginx -d $DOMAIN
fi

# Configurar PM2 para gerenciamento de processos (se necessário)
if command -v pm2 &> /dev/null; then
    log "⚡ Configurando PM2..."
    
    # Criar arquivo de configuração do PM2
    cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'leadflow',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/leadflow',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
EOF

    pm2 start ecosystem.config.js
    pm2 save
    pm2 startup
fi

# Configurar firewall
log "🛡️ Configurando firewall..."
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 22

log "✅ Deploy concluído com sucesso!"
log "🌐 Acesse: http://$(hostname -I | awk '{print $1}')"
log "📊 Status do Nginx: sudo systemctl status nginx"
log "📊 Status do PM2: pm2 status"

echo ""
echo "🎉 LeadFlow está rodando na Servla!"
echo "📧 Suporte: contato@mindflowdigital.com.br"
echo "📱 WhatsApp: 31 97266-1278"


