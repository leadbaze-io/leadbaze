#!/bin/bash

# 🚀 Script para Push do Projeto Local para Servla
# Autor: MindFlow Digital
# Versão: 1.0

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Função para log
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    error "Execute este script no diretório raiz do projeto LeadFlow"
fi

# Configurações do Servla
SERVLA_HOST="coUle95K"
SERVLA_USER="root"
SERVLA_PATH="/root/leadbaze"

log "🚀 Iniciando push do projeto local para Servla..."
log "Servidor: $SERVLA_HOST"
log "Usuário: $SERVLA_USER"
log "Caminho: $SERVLA_PATH"

# Verificar conectividade SSH
log "🔍 Testando conectividade SSH..."
if ! ssh -o ConnectTimeout=10 -o StrictHostKeyChecking=no "$SERVLA_USER@$SERVLA_HOST" "echo 'SSH connection successful'" 2>/dev/null; then
    error "Não foi possível conectar ao servidor via SSH"
fi

# Fazer backup no servidor antes de atualizar
log "💾 Fazendo backup no servidor..."
ssh "$SERVLA_USER@$SERVLA_HOST" "cd /root && cp -r leadbaze leadbaze-backup-$(date +%Y%m%d_%H%M%S)"

# Sincronizar arquivos (excluindo node_modules e outros arquivos desnecessários)
log "📤 Sincronizando arquivos..."
rsync -avz --progress \
    --exclude 'node_modules/' \
    --exclude '.git/' \
    --exclude 'dist/' \
    --exclude '.env' \
    --exclude '*.log' \
    --exclude 'backup-*' \
    --exclude '.DS_Store' \
    --exclude 'Thumbs.db' \
    ./ "$SERVLA_USER@$SERVLA_HOST:$SERVLA_PATH/"

# Instalar dependências no servidor
log "📦 Instalando dependências no servidor..."
ssh "$SERVLA_USER@$SERVLA_HOST" "cd $SERVLA_PATH && npm ci --production=false"

# Fazer build no servidor
log "🏗️ Fazendo build no servidor..."
ssh "$SERVLA_USER@$SERVLA_HOST" "cd $SERVLA_PATH && npm run build"

# Reiniciar serviços
log "🔄 Reiniciando serviços..."
ssh "$SERVLA_USER@$SERVLA_HOST" "cd $SERVLA_PATH && pm2 restart ecosystem.config.cjs"

# Verificar status
log "🔍 Verificando status dos serviços..."
ssh "$SERVLA_USER@$SERVLA_HOST" "pm2 status"

log "✅ Push concluído com sucesso!"
log "🌐 Acesse: http://$(ssh $SERVLA_USER@$SERVLA_HOST 'hostname -I | awk \"{print \\$1}\"')"

echo ""
echo "🎉 Projeto atualizado na Servla!"
echo "📊 Status do PM2: ssh $SERVLA_USER@$SERVLA_HOST 'pm2 status'"
echo "📊 Logs: ssh $SERVLA_USER@$SERVLA_HOST 'pm2 logs'"
echo ""
echo "✅ Push finalizado em $(date)"
