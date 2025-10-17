#!/bin/bash
# =====================================================
# SCRIPT DE EXECUÇÃO COMPLETA - TESTES PERFECT PAY
# =====================================================
# Este script executa todos os testes do sistema Perfect Pay
# =====================================================

echo "🚀 INICIANDO TESTES COMPLETOS PERFECT PAY"
echo "=========================================="
echo ""

# Verificar se o backend está rodando
echo "🔍 Verificando se o backend está rodando..."
if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    echo "✅ Backend está rodando na porta 3001"
else
    echo "❌ Backend não está rodando na porta 3001"
    echo "   Execute: cd backend && npm start"
    exit 1
fi

echo ""

# Executar verificação do banco de dados
echo "📊 Executando verificação do banco de dados..."
echo "=============================================="
psql $DATABASE_URL -f verificacao-completa-perfect-pay.sql

echo ""

# Executar testes JavaScript
echo "🧪 Executando testes JavaScript..."
echo "=================================="
cd backend
node test-complete-perfect-pay-system.js

echo ""

# Executar testes específicos se existirem
if [ -f "test-perfect-pay-start.js" ]; then
    echo "🔍 Executando teste específico de assinatura Start..."
    echo "===================================================="
    node test-perfect-pay-start.js
    echo ""
fi

if [ -f "test-package-purchase-flow.js" ]; then
    echo "🔍 Executando teste de compra de pacotes..."
    echo "==========================================="
    node test-package-purchase-flow.js
    echo ""
fi

echo "🎯 TESTES COMPLETOS FINALIZADOS!"
echo "================================"
echo ""
echo "📋 PRÓXIMOS PASSOS:"
echo "1. Verifique os resultados acima"
echo "2. Se algum teste falhou, verifique os logs"
echo "3. Teste manualmente na aplicação se necessário"
echo "4. Documente qualquer problema encontrado"









