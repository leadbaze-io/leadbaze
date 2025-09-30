#!/bin/bash

# Script para fazer deploy das correções do WhatsApp no Servla
# Execute: ./deploy-whatsapp-fix.sh

echo "🚀 Iniciando deploy das correções do WhatsApp..."

# Verificar se estamos no diretório correto
if [ ! -f "server.js" ]; then
    echo "❌ Execute este script no diretório backend/"
    exit 1
fi

# Verificar se o PM2 está rodando
echo "📋 Verificando status do PM2..."
pm2 status

# Fazer backup do server.js atual
echo "💾 Fazendo backup do server.js atual..."
cp server.js server.js.backup.$(date +%Y%m%d_%H%M%S)

# Testar a Evolution API antes do deploy
echo "🧪 Testando Evolution API..."
node test-evolution-api.js

if [ $? -ne 0 ]; then
    echo "⚠️ Teste da Evolution API falhou. Continuando com o deploy mesmo assim..."
fi

# Reiniciar o backend com PM2
echo "🔄 Reiniciando backend com PM2..."
pm2 restart leadbaze-backend

# Verificar se o restart foi bem-sucedido
sleep 5
echo "📊 Verificando status após restart..."
pm2 status

# Testar endpoint de health
echo "🏥 Testando endpoint de health..."
curl -s "http://localhost:3001/api/health" | jq '.' || echo "❌ Erro ao testar health endpoint"

echo ""
echo "✅ Deploy concluído!"
echo "📝 Próximos passos:"
echo "   1. Teste a conexão WhatsApp no frontend"
echo "   2. Verifique os logs: pm2 logs leadbaze-backend"
echo "   3. Se houver problemas, restaure o backup: cp server.js.backup.* server.js"
