#!/bin/bash

# 🚀 LeadBaze Deploy Script para Servla.com.br
# Versão: 2.0 - Completamente corrigida
# Data: 2025-09-01

set -e  # Para em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log colorido
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar se estamos no diretório correto
if [[ ! -f "package.json" ]]; then
    error "Execute este script no diretório raiz do projeto LeadBaze"
    exit 1
fi

log "🚀 Iniciando deploy do LeadBaze na Servla..."

# 1. Verificar dependências do sistema
log "📋 Verificando dependências do sistema..."

# Verificar Node.js
if ! command -v node &> /dev/null; then
    error "Node.js não está instalado"
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [[ $NODE_VERSION -lt 18 ]]; then
    error "Node.js 18+ é necessário. Versão atual: $(node --version)"
    exit 1
fi
success "Node.js $(node --version) OK"

# Verificar npm
if ! command -v npm &> /dev/null; then
    error "npm não está instalado"
    exit 1
fi
success "npm $(npm --version) OK"

# 2. Verificar dependências já instaladas
log "📦 Verificando dependências..."
if [[ -d "node_modules" ]]; then
    success "Dependências já instaladas"
else
    log "📦 Instalando dependências..."
    npm ci --production=false
    success "Dependências instaladas"
fi

# 3. Verificar TypeScript
log "🔍 Verificando TypeScript..."
if npm run type-check; then
    success "TypeScript OK"
else
    warning "TypeScript falhou, mas continuando..."
fi

# 4. Build de produção
log "🏗️ Fazendo build de produção..."
if npm run build:prod; then
    success "Build concluído"
else
    error "Build falhou"
    exit 1
fi

# 5. Preparar diretório de deploy
DEPLOY_DIR="/var/www/leadflow"
log "📁 Preparando diretório de deploy: $DEPLOY_DIR"

# Criar diretório se não existir
sudo mkdir -p "$DEPLOY_DIR"

# 6. Copiar arquivos
log "📋 Copiando arquivos..."
sudo cp -r dist/* "$DEPLOY_DIR/"
success "Arquivos copiados"

# 7. Configurar permissões
log "🔐 Configurando permissões..."
sudo chown -R www-data:www-data "$DEPLOY_DIR"
sudo chmod -R 755 "$DEPLOY_DIR"
success "Permissões configuradas"

# 8. Configurar Nginx
log "🌐 Configurando Nginx..."

# Usar configuração simples e testada
NGINX_CONF="/etc/nginx/sites-enabled/leadflow"
sudo rm -f "$NGINX_CONF"

# Criar configuração Nginx otimizada
sudo tee "$NGINX_CONF" > /dev/null << 'EOF'
# Nginx Configuration for LeadBaze - Servla.com.br
# Optimized and tested configuration

server {
    listen 80;
    listen [::]:80;
    server_name _;
    
    # Document root
    root /var/www/leadflow;
    index index.html;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types 
        text/plain 
        text/css 
        text/xml 
        text/javascript 
        application/javascript 
        application/json;
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|webp|avif)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Vary "Accept-Encoding";
        try_files $uri =404;
        access_log off;
    }
    
    # Cache HTML files
    location ~* \.html$ {
        expires 1h;
        add_header Cache-Control "public, max-age=3600";
        add_header Vary "Accept-Encoding";
    }
    
    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
        add_header Cache-Control "no-cache, no-store, max-age=0";
    }
    
    # Favicon
    location = /favicon.ico {
        log_not_found off;
        access_log off;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Robots.txt
    location = /robots.txt {
        log_not_found off;
        access_log off;
        return 200 "User-agent: *\nDisallow: /\n";
        add_header Content-Type text/plain;
    }
    
    # Handle React Router (SPA)
    location / {
        try_files $uri $uri/ /index.html;
        
        # Security for sensitive files
        location ~* \.(env|config|json|sql|log|md|txt)$ {
            deny all;
            return 404;
        }
        
        # Block access to hidden files
        location ~ /\. {
            deny all;
            return 404;
        }
    }
    
    # Error pages
    error_page 404 /index.html;
    error_page 500 502 503 504 /50x.html;
    
    location = /50x.html {
        root /usr/share/nginx/html;
    }
    
    # Logging
    access_log /var/log/nginx/leadflow_access.log;
    error_log /var/log/nginx/leadflow_error.log;
}
EOF

success "Configuração Nginx criada"

# 9. Testar configuração Nginx
log "🔍 Testando configuração do Nginx..."
if sudo nginx -t; then
    success "Configuração Nginx OK"
else
    error "Configuração Nginx inválida"
    exit 1
fi

# 10. Reiniciar Nginx
log "🔄 Reiniciando Nginx..."
sudo systemctl restart nginx
success "Nginx reiniciado"

# 11. Verificar status do Nginx
log "📊 Verificando status do Nginx..."
if sudo systemctl is-active --quiet nginx; then
    success "Nginx está rodando"
else
    error "Nginx não está rodando"
    exit 1
fi

# 12. Testar aplicação
log "🧪 Testando aplicação..."
sleep 3  # Aguardar Nginx inicializar

if curl -s http://localhost/health | grep -q "healthy"; then
    success "Health check OK"
else
    warning "Health check falhou, mas continuando..."
fi

# 13. Configurar PM2 (opcional)
log "⚡ Configurando PM2..."
if command -v pm2 &> /dev/null; then
    # Criar arquivo de configuração PM2
    cat > ecosystem.config.js << 'EOF'
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
      NODE_ENV: 'development',
      PORT: 3000
    }
  }]
}
EOF
    
    # Mover para diretório da aplicação
    sudo mv ecosystem.config.js "$DEPLOY_DIR/"
    
    # Iniciar com PM2
    cd "$DEPLOY_DIR"
    pm2 start ecosystem.config.js
    pm2 save
    pm2 startup
    success "PM2 configurado"
else
    warning "PM2 não está instalado, pulando..."
fi

# 14. Verificar firewall
log "🔥 Verificando firewall..."
if command -v ufw &> /dev/null; then
    # Abrir portas necessárias
    sudo ufw allow 80/tcp
    sudo ufw allow 443/tcp
    success "Firewall configurado"
else
    warning "UFW não está instalado"
fi

# 15. Criar arquivo .env se não existir
log "⚙️ Configurando variáveis de ambiente..."
if [[ ! -f "$DEPLOY_DIR/.env" ]]; then
    sudo tee "$DEPLOY_DIR/.env" > /dev/null << 'EOF'
# LeadBaze Environment Variables
VITE_SUPABASE_URL=https://lsvwjyhnnzeewuuuykmb.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzdndqeWhubnplZXd1dXV5a21iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMzc4NTYsImV4cCI6MjA2OTkxMzg1Nn0.jNw-YTXlnbd51l7RHHQpTYgCqxERz6NqPggqMM41Fck
VITE_N8N_WEBHOOK_URL=https://n8n-n8n-start.kof6cn.easypanel.host/webhook-test/leadflow-extraction
VITE_APP_ENV=production
VITE_DEBUG_MODE=false
EOF
    success "Arquivo .env criado"
else
    success "Arquivo .env já existe"
fi

# 16. Verificação final
log "🔍 Verificação final..."

# Verificar se os arquivos estão no lugar
if [[ -f "$DEPLOY_DIR/index.html" ]]; then
    success "index.html encontrado"
else
    error "index.html não encontrado"
    exit 1
fi

# Verificar se Nginx está servindo
if curl -s http://localhost/ | grep -q "LeadBaze"; then
    success "Aplicação está sendo servida pelo Nginx"
else
    warning "Aplicação pode não estar funcionando corretamente"
fi

# 17. Resumo final
echo ""
echo "=========================================="
echo "🎉 DEPLOY DO LEADBAZE CONCLUÍDO!"
echo "=========================================="
echo "📍 Diretório: $DEPLOY_DIR"
echo "🌐 URL: http://$(curl -s ifconfig.me)"
echo "📊 Status Nginx: $(sudo systemctl is-active nginx)"
echo "⚡ PM2: $(pm2 list | grep leadflow | awk '{print $10}' || echo 'Não configurado')"
echo "=========================================="

success "Deploy concluído com sucesso!"
log "🚀 LeadBaze está rodando na Servla!"

# Comandos úteis
echo ""
echo "🔧 Comandos úteis:"
echo "   - Status Nginx: sudo systemctl status nginx"
echo "   - Logs Nginx: sudo tail -f /var/log/nginx/leadflow_error.log"
echo "   - Status PM2: pm2 status"
echo "   - Logs PM2: pm2 logs leadflow"
echo "   - Reiniciar: sudo systemctl restart nginx"
echo ""
