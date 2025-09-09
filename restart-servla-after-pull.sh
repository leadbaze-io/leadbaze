#!/bin/bash

# Script para reiniciar serviços no Servla após pull do GitHub
echo "🚀 Reiniciando serviços no Servla após pull..."

# 1. Fazer pull das alterações
echo "📥 Fazendo pull das alterações..."
cd /root/leadbaze
git pull origin main

# 2. Reinstalar dependências (se necessário)
echo "📦 Verificando dependências..."
npm install

# 3. Build do frontend (se necessário)
echo "🔨 Fazendo build do frontend..."
npm run build

# 4. Reiniciar o backend Node.js
echo "🔄 Reiniciando backend Node.js..."
pm2 restart leadbaze-backend || pm2 start backend/server.js --name leadbaze-backend

# 5. Reiniciar o frontend (se estiver rodando com PM2)
echo "🔄 Reiniciando frontend..."
pm2 restart leadbaze-frontend || echo "Frontend não está rodando com PM2"

# 6. Reiniciar Nginx (para servir arquivos estáticos atualizados)
echo "🔄 Reiniciando Nginx..."
systemctl restart nginx

# 7. Verificar status dos serviços
echo "📊 Status dos serviços:"
pm2 status

echo "🌐 Status do Nginx:"
systemctl status nginx --no-pager -l

echo "✅ Reinicialização concluída!"
echo "🔗 Acesse: https://leadbaze.io"






