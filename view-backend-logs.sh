#!/bin/bash

echo "🔍 Visualizando logs do backend LeadBaze..."
echo ""

# Verificar se PM2 está rodando
echo "📊 Status do PM2:"
pm2 status

echo ""
echo "📋 Opções para visualizar logs:"
echo ""

echo "1️⃣ LOGS EM TEMPO REAL (recomendado):"
echo "   pm2 logs leadbaze-backend --lines 50"
echo ""

echo "2️⃣ LOGS COM FILTRO (apenas erros):"
echo "   pm2 logs leadbaze-backend --err"
echo ""

echo "3️⃣ LOGS COM FILTRO (apenas output normal):"
echo "   pm2 logs leadbaze-backend --out"
echo ""

echo "4️⃣ LOGS DE TODOS OS PROCESSOS:"
echo "   pm2 logs"
echo ""

echo "5️⃣ LOGS DO SISTEMA (se não estiver usando PM2):"
echo "   journalctl -u leadbaze-backend -f"
echo ""

echo "6️⃣ LOGS DO NGINX (se houver problemas de proxy):"
echo "   tail -f /var/log/nginx/error.log"
echo ""

echo "🚀 Executando logs em tempo real..."
echo "   (Pressione Ctrl+C para sair)"
echo ""

# Executar logs em tempo real
pm2 logs leadbaze-backend --lines 50




