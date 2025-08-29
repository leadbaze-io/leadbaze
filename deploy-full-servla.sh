#!/bin/bash

# 🚀 Script de Deploy Completo para Servla - LeadFlow (Frontend + Backend)
# Autor: MindFlow Digital
# Versão: 2.0

set -e

echo "🚀 Iniciando deploy completo do LeadFlow na Servla..."

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

# Verificar se PM2 está instalado
if ! command -v pm2 &> /dev/null; then
    log "📦 Instalando PM2..."
    npm install -g pm2
fi

log "📋 Verificando dependências do Frontend..."

# ========================================
# DEPLOY DO FRONTEND
# ========================================

log "🎨 Iniciando deploy do Frontend..."

# Instalar dependências do frontend
log "📦 Instalando dependências do frontend..."
npm ci --production=false

# Verificar TypeScript
log "🔍 Verificando TypeScript..."
npm run type-check

# Build de produção do frontend
log "🏗️ Fazendo build de produção do frontend..."
npm run build:prod

# Verificar se o build foi bem-sucedido
if [ ! -d "dist" ]; then
    error "Build do frontend falhou. Diretório 'dist' não foi criado."
fi

log "✅ Build do frontend concluído com sucesso!"

# Criar diretório de deploy se não existir
FRONTEND_DIR="/var/www/leadflow"
log "📁 Preparando diretório de deploy do frontend: $FRONTEND_DIR"

sudo mkdir -p $FRONTEND_DIR
sudo chown -R $USER:$USER $FRONTEND_DIR

# Copiar arquivos do frontend para o diretório de deploy
log "📋 Copiando arquivos do frontend..."
cp -r dist/* $FRONTEND_DIR/

# ========================================
# DEPLOY DO BACKEND
# ========================================

log "⚙️ Iniciando deploy do Backend..."

# Verificar se o diretório backend existe
if [ ! -d "backend" ]; then
    error "Diretório 'backend' não encontrado."
fi

# Navegar para o diretório backend
cd backend

# Verificar se package.json existe no backend
if [ ! -f "package.json" ]; then
    error "package.json não encontrado no diretório backend."
fi

# Instalar dependências do backend
log "📦 Instalando dependências do backend..."
npm ci --production=false

# Verificar se o arquivo de configuração existe
if [ ! -f "config.env.example" ]; then
    error "config.env.example não encontrado no backend."
fi

# Configurar variáveis de ambiente do backend
log "🔧 Configurando variáveis de ambiente do backend..."
if [ ! -f "config.env" ]; then
    cp config.env.example config.env
    warn "Arquivo config.env criado. Configure as variáveis de ambiente antes de continuar."
    warn "Edite o arquivo: nano config.env"
    read -p "Pressione Enter após configurar as variáveis de ambiente..."
fi

# Criar diretório de logs se não existir
mkdir -p logs

# Testar se o backend está funcionando
log "🧪 Testando backend..."
if node -e "require('./server.js')" 2>/dev/null; then
    log "✅ Backend testado com sucesso!"
else
    warn "⚠️ Teste do backend falhou, mas continuando..."
fi

# Voltar para o diretório raiz
cd ..

# ========================================
# CONFIGURAÇÃO DO NGINX
# ========================================

log "🌐 Configurando Nginx..."

# Configurar Nginx para frontend e backend
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

# ========================================
# CONFIGURAÇÃO DO PM2
# ========================================

log "⚡ Configurando PM2 para o backend..."

# Navegar para o diretório backend
cd backend

# Parar processos PM2 existentes
pm2 stop leadflow-evolution-api 2>/dev/null || true
pm2 delete leadflow-evolution-api 2>/dev/null || true

# Iniciar o backend com PM2
log "🚀 Iniciando backend com PM2..."
pm2 start ecosystem.config.js --env production

# Salvar configuração do PM2
pm2 save

# Configurar PM2 para iniciar com o sistema
pm2 startup

# Voltar para o diretório raiz
cd ..

# ========================================
# CONFIGURAÇÕES DE SEGURANÇA
# ========================================

log "🛡️ Configurando firewall..."
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw allow 3001  # Backend API

# ========================================
# TESTES FINAIS
# ========================================

log "🧪 Executando testes finais..."

# Testar se o frontend está acessível
if curl -s http://localhost > /dev/null; then
    log "✅ Frontend acessível em http://localhost"
else
    warn "⚠️ Frontend não está respondendo em http://localhost"
fi

# Testar se o backend está acessível
if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    log "✅ Backend acessível em http://localhost:3001"
else
    warn "⚠️ Backend não está respondendo em http://localhost:3001"
fi

# Verificar status do PM2
log "📊 Status do PM2:"
pm2 status

# ========================================
# CONFIGURAÇÃO DE BACKUP
# ========================================

log "💾 Configurando backup automático..."

# Criar script de backup
cat > /root/backup-leadflow-full.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backup/leadflow"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup do frontend
tar -czf $BACKUP_DIR/frontend_$DATE.tar.gz /var/www/leadflow

# Backup do backend
tar -czf $BACKUP_DIR/backend_$DATE.tar.gz /var/www/leadflow/backend

# Manter apenas últimos 7 backups
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
EOF

chmod +x /root/backup-leadflow-full.sh

# Adicionar ao crontab (backup diário às 2h)
(crontab -l 2>/dev/null; echo "0 2 * * * /root/backup-leadflow-full.sh") | crontab -

log "✅ Deploy completo concluído com sucesso!"
log "🌐 Frontend: http://$(hostname -I | awk '{print $1}')"
log "🔗 Backend API: http://$(hostname -I | awk '{print $1}'):3001"
log "📊 Status do PM2: pm2 status"
log "📊 Status do Nginx: sudo systemctl status nginx"

echo ""
echo "🎉 LeadFlow está rodando completamente na Servla!"
echo "📧 Suporte: contato@mindflowdigital.com.br"
echo "📱 WhatsApp: 31 97266-1278"
echo ""
echo "📋 Próximos passos:"
echo "1. Configure as variáveis de ambiente do backend em backend/config.env"
echo "2. Teste a integração com Evolution API"
echo "3. Configure SSL se necessário"
echo "4. Monitore os logs: pm2 logs leadflow-evolution-api"
