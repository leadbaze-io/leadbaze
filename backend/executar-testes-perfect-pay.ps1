# =====================================================
# SCRIPT POWERSHELL - TESTES COMPLETOS PERFECT PAY
# =====================================================
# Este script executa todos os testes do sistema Perfect Pay
# =====================================================

Write-Host "🚀 INICIANDO TESTES COMPLETOS PERFECT PAY" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""

# Verificar se o backend está rodando
Write-Host "🔍 Verificando se o backend está rodando..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/health" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✅ Backend está rodando na porta 3001" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend não está rodando na porta 3001" -ForegroundColor Red
    Write-Host "   Execute: cd backend && npm start" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Executar verificação do banco de dados
Write-Host "📊 Executando verificação do banco de dados..." -ForegroundColor Yellow
Write-Host "==============================================" -ForegroundColor Yellow

# Verificar se psql está disponível
if (Get-Command psql -ErrorAction SilentlyContinue) {
    try {
        psql $env:DATABASE_URL -f verificacao-completa-perfect-pay.sql
    } catch {
        Write-Host "❌ Erro ao executar verificação do banco: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "⚠️ psql não encontrado. Execute manualmente:" -ForegroundColor Yellow
    Write-Host "   psql `$env:DATABASE_URL -f verificacao-completa-perfect-pay.sql" -ForegroundColor Cyan
}

Write-Host ""

# Executar testes JavaScript
Write-Host "🧪 Executando testes JavaScript..." -ForegroundColor Yellow
Write-Host "==================================" -ForegroundColor Yellow

# Verificar se node está disponível
if (Get-Command node -ErrorAction SilentlyContinue) {
    try {
        Set-Location backend
        node test-complete-perfect-pay-system.js
        Set-Location ..
    } catch {
        Write-Host "❌ Erro ao executar testes JavaScript: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Node.js não encontrado. Instale Node.js primeiro." -ForegroundColor Red
}

Write-Host ""

# Executar testes específicos se existirem
if (Test-Path "backend/test-perfect-pay-start.js") {
    Write-Host "🔍 Executando teste específico de assinatura Start..." -ForegroundColor Yellow
    Write-Host "====================================================" -ForegroundColor Yellow
    try {
        Set-Location backend
        node test-perfect-pay-start.js
        Set-Location ..
    } catch {
        Write-Host "❌ Erro no teste Start: $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host ""
}

if (Test-Path "backend/test-package-purchase-flow.js") {
    Write-Host "🔍 Executando teste de compra de pacotes..." -ForegroundColor Yellow
    Write-Host "===========================================" -ForegroundColor Yellow
    try {
        Set-Location backend
        node test-package-purchase-flow.js
        Set-Location ..
    } catch {
        Write-Host "❌ Erro no teste de pacotes: $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host ""
}

Write-Host "🎯 TESTES COMPLETOS FINALIZADOS!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""
Write-Host "📋 PRÓXIMOS PASSOS:" -ForegroundColor Cyan
Write-Host "1. Verifique os resultados acima" -ForegroundColor White
Write-Host "2. Se algum teste falhou, verifique os logs" -ForegroundColor White
Write-Host "3. Teste manualmente na aplicação se necessário" -ForegroundColor White
Write-Host "4. Documente qualquer problema encontrado" -ForegroundColor White
Write-Host ""
Write-Host "💡 COMANDOS MANUAIS:" -ForegroundColor Cyan
Write-Host "   Verificar banco: psql `$env:DATABASE_URL -f backend/verificacao-completa-perfect-pay.sql" -ForegroundColor Gray
Write-Host "   Teste completo: cd backend && node test-complete-perfect-pay-system.js" -ForegroundColor Gray
Write-Host "   Teste Start: cd backend && node test-perfect-pay-start.js" -ForegroundColor Gray
Write-Host "   Teste Pacotes: cd backend && node test-package-purchase-flow.js" -ForegroundColor Gray









