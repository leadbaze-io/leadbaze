#!/bin/bash

# 🚀 Script de Deploy Remoto Automatizado - LeadBaze na Servla
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

# Verificar parâmetros
if [ $# -lt 3 ]; then
    echo "Uso: $0 <IP_SERVIDOR> <USUARIO> <CAMINHO_CHAVE_SSH> [PORTA]"
    echo "Exemplo: $0 192.168.1.100 root ~/.ssh/id_rsa 22"
    exit 1
fi

SERVLA_HOST=$1
SERVLA_USER=$2
SSH_KEY=$3
SERVLA_PORT=${4:-22}

log "🚀 Iniciando deploy remoto do LeadBaze na Servla..."
log "Servidor: $SERVLA_HOST"
log "Usuário: $SERVLA_USER"
log "Porta: $SERVLA_PORT"

# Verificar se a chave SSH existe
if [ ! -f "$SSH_KEY" ]; then
    error "Chave SSH não encontrada: $SSH_KEY"
fi

# Verificar conectividade SSH
log "🔍 Testando conectividade SSH..."
if ! ssh -i "$SSH_KEY" -p "$SERVLA_PORT" -o ConnectTimeout=10 -o StrictHostKeyChecking=no "$SERVLA_USER@$SERVLA_HOST" "echo 'SSH connection successful'" 2>/dev/null; then
    error "Não foi possível conectar ao servidor via SSH"
fi

# Build local
log "🏗️ Fazendo build local..."
if ! npm ci --production=false; then
    error "Falha ao instalar dependências"
fi

if ! npm run type-check; then
    error "Falha na verificação TypeScript"
fi

if ! npm run build:prod; then
    error "Falha no build de produção"
fi

# Criar pacote de deploy
log "📦 Criando pacote de deploy..."
DEPLOY_PACKAGE="leadflow-deploy-$(date +%Y%m%d_%H%M%S).tar.gz"
tar -czf "$DEPLOY_PACKAGE" dist/ deploy-full-servla.sh check-deployment.sh nginx-servla.conf env.example

# Upload para servidor
log "📤 Enviando arquivos para o servidor..."
scp -i "$SSH_KEY" -P "$SERVLA_PORT" -o StrictHostKeyChecking=no "$DEPLOY_PACKAGE" "$SERVLA_USER@$SERVLA_HOST:/tmp/"

# Executar deploy remoto
log "🚀 Executando deploy no servidor..."
ssh -i "$SSH_KEY" -p "$SERVLA_PORT" -o StrictHostKeyChecking=no "$SERVLA_USER@$SERVLA_HOST" << 'EOF'
set -e

echo "🚀 Iniciando deploy no servidor..."

# Criar diretório de deploy
mkdir -p /tmp/leadflow-remote-deploy
cd /tmp/leadflow-remote-deploy

# Encontrar e extrair o pacote mais recente
LATEST_PACKAGE=$(ls -t /tmp/leadflow-deploy-*.tar.gz | head -1)
if [ -z "$LATEST_PACKAGE" ]; then
    echo "❌ Nenhum pacote de deploy encontrado"
    exit 1
fi

echo "📦 Extraindo: $LATEST_PACKAGE"
tar -xzf "$LATEST_PACKAGE"

# Verificar se o arquivo .env existe
if [ ! -f ".env" ]; then
    echo "⚠️ Arquivo .env não encontrado. Copiando de env.example..."
    cp env.example .env
    echo "⚠️ IMPORTANTE: Configure as variáveis de ambiente no arquivo .env"
    echo "Pressione ENTER após configurar o arquivo .env..."
    read
fi

# Executar deploy
chmod +x deploy-full-servla.sh
./deploy-full-servla.sh --auto

# Verificar deploy
chmod +x check-deployment.sh
./check-deployment.sh

# Limpar arquivos temporários
cd /
rm -rf /tmp/leadflow-remote-deploy
rm -f /tmp/leadflow-deploy-*.tar.gz

echo "✅ Deploy concluído com sucesso!"
EOF

# Limpar arquivo local
rm -f "$DEPLOY_PACKAGE"

log "✅ Deploy remoto concluído!"
log "🌐 Acesse: http://$SERVLA_HOST"
log "📧 Suporte: contato@mindflowdigital.com.br"

