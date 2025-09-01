#!/bin/bash

# 🔍 Script de Verificação Pós-Deploy - LeadFlow
# Autor: MindFlow Digital
# Versão: 1.0

set -e

echo "🔍 Verificando deploy do LeadFlow..."

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
}

success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] ✅ $1${NC}"
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

# Obter IP do servidor
SERVER_IP=$(hostname -I | awk '{print $1}')

echo "=========================================="
echo "🔍 VERIFICAÇÃO PÓS-DEPLOY - LEADFLOW"
echo "=========================================="
echo "Servidor: $SERVER_IP"
echo "Data/Hora: $(date)"
echo "=========================================="

# 1. Verificar se os arquivos estão no lugar correto
log "1. Verificando arquivos de deploy..."
if [ -d "/var/www/leadflow" ]; then
    success "Diretório /var/www/leadflow existe"
    
    if [ -f "/var/www/leadflow/index.html" ]; then
        success "Arquivo index.html encontrado"
    else
        error "Arquivo index.html não encontrado"
    fi
    
    if [ -d "/var/www/leadflow/assets" ]; then
        success "Diretório assets encontrado"
    else
        error "Diretório assets não encontrado"
    fi
else
    error "Diretório /var/www/leadflow não existe"
fi

# 2. Verificar permissões
log "2. Verificando permissões..."
if [ -r "/var/www/leadflow" ]; then
    success "Diretório é legível"
else
    error "Diretório não é legível"
fi

if [ -w "/var/www/leadflow" ]; then
    success "Diretório é gravável"
else
    warn "Diretório não é gravável (pode ser normal)"
fi

# 3. Verificar Nginx
log "3. Verificando Nginx..."
if systemctl is-active --quiet nginx; then
    success "Nginx está rodando"
else
    error "Nginx não está rodando"
fi

if systemctl is-enabled --quiet nginx; then
    success "Nginx está habilitado para iniciar com o sistema"
else
    warn "Nginx não está habilitado para iniciar com o sistema"
fi

# Verificar configuração do Nginx
if nginx -t > /dev/null 2>&1; then
    success "Configuração do Nginx é válida"
else
    error "Configuração do Nginx é inválida"
fi

# 4. Verificar PM2
log "4. Verificando PM2..."
if command -v pm2 &> /dev/null; then
    success "PM2 está instalado"
    
    if pm2 list | grep -q "leadflow.*online"; then
        success "Aplicação LeadFlow está rodando no PM2"
    else
        error "Aplicação LeadFlow não está rodando no PM2"
    fi
else
    error "PM2 não está instalado"
fi

# 5. Verificar firewall
log "5. Verificando firewall..."
if command -v ufw &> /dev/null; then
    if ufw status | grep -q "Status: active"; then
        success "Firewall está ativo"
        
        # Verificar portas
        if ufw status | grep -q "80.*ALLOW"; then
            success "Porta 80 está aberta"
        else
            warn "Porta 80 não está aberta"
        fi
        
        if ufw status | grep -q "443.*ALLOW"; then
            success "Porta 443 está aberta"
        else
            warn "Porta 443 não está aberta"
        fi
    else
        warn "Firewall não está ativo"
    fi
else
    error "UFW não está instalado"
fi

# 6. Verificar conectividade HTTP
log "6. Verificando conectividade HTTP..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost | grep -q "200\|301\|302"; then
    success "Servidor HTTP está respondendo"
else
    error "Servidor HTTP não está respondendo"
fi

# 7. Verificar variáveis de ambiente
log "7. Verificando variáveis de ambiente..."
if [ -f ".env" ]; then
    success "Arquivo .env existe"
    
    if grep -q "VITE_SUPABASE_URL" .env; then
        success "VITE_SUPABASE_URL configurada"
    else
        warn "VITE_SUPABASE_URL não configurada"
    fi
    
    if grep -q "VITE_SUPABASE_ANON_KEY" .env; then
        success "VITE_SUPABASE_ANON_KEY configurada"
    else
        warn "VITE_SUPABASE_ANON_KEY não configurada"
    fi
    
    if grep -q "VITE_N8N_WEBHOOK_URL" .env; then
        success "VITE_N8N_WEBHOOK_URL configurada"
    else
        warn "VITE_N8N_WEBHOOK_URL não configurada"
    fi
else
    error "Arquivo .env não existe"
fi

# 8. Verificar logs
log "8. Verificando logs..."
if [ -f "/var/log/nginx/leadflow_error.log" ]; then
    success "Log de erro do Nginx existe"
    
    # Verificar últimos erros
    RECENT_ERRORS=$(tail -n 10 /var/log/nginx/leadflow_error.log | grep -c "error" || true)
    if [ "$RECENT_ERRORS" -eq 0 ]; then
        success "Nenhum erro recente no Nginx"
    else
        warn "$RECENT_ERRORS erros recentes no Nginx"
    fi
else
    warn "Log de erro do Nginx não existe"
fi

if [ -f "/var/log/pm2/leadflow-error.log" ]; then
    success "Log de erro do PM2 existe"
    
    # Verificar últimos erros
    RECENT_ERRORS=$(tail -n 10 /var/log/pm2/leadflow-error.log | grep -c "error" || true)
    if [ "$RECENT_ERRORS" -eq 0 ]; then
        success "Nenhum erro recente no PM2"
    else
        warn "$RECENT_ERRORS erros recentes no PM2"
    fi
else
    warn "Log de erro do PM2 não existe"
fi

# 9. Verificar recursos do sistema
log "9. Verificando recursos do sistema..."
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -lt 90 ]; then
    success "Uso de disco: ${DISK_USAGE}%"
else
    warn "Uso de disco alto: ${DISK_USAGE}%"
fi

MEMORY_USAGE=$(free | awk 'NR==2{printf "%.1f", $3*100/$2}')
if (( $(echo "$MEMORY_USAGE < 90" | bc -l) )); then
    success "Uso de memória: ${MEMORY_USAGE}%"
else
    warn "Uso de memória alto: ${MEMORY_USAGE}%"
fi

# 10. Verificar backup
log "10. Verificando backup..."
if [ -d "/backup/leadflow" ]; then
    success "Diretório de backup existe"
    
    BACKUP_COUNT=$(ls /backup/leadflow/*.tar.gz 2>/dev/null | wc -l)
    if [ "$BACKUP_COUNT" -gt 0 ]; then
        success "$BACKUP_COUNT backup(s) encontrado(s)"
    else
        warn "Nenhum backup encontrado"
    fi
else
    warn "Diretório de backup não existe"
fi

# 11. Verificar monitoramento
log "11. Verificando monitoramento..."
if [ -f "/root/monitor-leadflow.sh" ]; then
    success "Script de monitoramento existe"
    
    if crontab -l 2>/dev/null | grep -q "monitor-leadflow.sh"; then
        success "Monitoramento está configurado no crontab"
    else
        warn "Monitoramento não está configurado no crontab"
    fi
else
    warn "Script de monitoramento não existe"
fi

# 12. Teste de funcionalidade básica
log "12. Testando funcionalidade básica..."
if curl -s http://localhost/health | grep -q "healthy"; then
    success "Endpoint de health check está funcionando"
else
    error "Endpoint de health check não está funcionando"
fi

# Resumo final
echo ""
echo "=========================================="
echo "📊 RESUMO DA VERIFICAÇÃO"
echo "=========================================="

# Contar sucessos e erros
SUCCESS_COUNT=$(grep -c "✅" <<< "$(tail -n 100 /dev/stdin)" || echo "0")
ERROR_COUNT=$(grep -c "❌\|ERROR" <<< "$(tail -n 100 /dev/stdin)" || echo "0")
WARN_COUNT=$(grep -c "⚠️\|WARNING" <<< "$(tail -n 100 /dev/stdin)" || echo "0")

echo "✅ Sucessos: $SUCCESS_COUNT"
echo "❌ Erros: $ERROR_COUNT"
echo "⚠️ Avisos: $WARN_COUNT"

if [ "$ERROR_COUNT" -eq 0 ]; then
    echo ""
    success "🎉 Deploy verificado com sucesso!"
    echo "🌐 Acesse: http://$SERVER_IP"
    echo "📧 Suporte: contato@mindflowdigital.com.br"
else
    echo ""
    warn "⚠️ Foram encontrados $ERROR_COUNT erro(s). Verifique os logs."
    echo "🔧 Comandos úteis para troubleshooting:"
    echo "   - Logs do Nginx: sudo tail -f /var/log/nginx/leadflow_error.log"
    echo "   - Logs do PM2: pm2 logs leadflow"
    echo "   - Status do Nginx: sudo systemctl status nginx"
    echo "   - Status do PM2: pm2 status"
fi

echo ""
echo "=========================================="
echo "Verificação concluída em $(date)"
echo "=========================================="
