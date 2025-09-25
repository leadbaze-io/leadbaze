# 🚀 Script para Configurar LocalTunnel para Mercado Pago Auto Return
# LocalTunnel é mais simples que ngrok e não precisa de cadastro

Write-Host "🚀 Configurando LocalTunnel para Mercado Pago Auto Return" -ForegroundColor Green
Write-Host ""

# Verificar se Node.js está instalado
$nodePath = Get-Command node -ErrorAction SilentlyContinue
if (-not $nodePath) {
    Write-Host "❌ Node.js não encontrado. Instale o Node.js primeiro!" -ForegroundColor Red
    exit 1
}

# Verificar se npm está instalado
$npmPath = Get-Command npm -ErrorAction SilentlyContinue
if (-not $npmPath) {
    Write-Host "❌ npm não encontrado. Instale o npm primeiro!" -ForegroundColor Red
    exit 1
}

# Instalar localtunnel globalmente
Write-Host "📦 Instalando localtunnel..." -ForegroundColor Yellow
try {
    npm install -g localtunnel
    Write-Host "✅ localtunnel instalado com sucesso!" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro ao instalar localtunnel: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🔧 Configurando tunnel na porta 5173..." -ForegroundColor Yellow
Write-Host ""

# Iniciar localtunnel
Write-Host "🚀 Iniciando localtunnel..." -ForegroundColor Yellow
$ltJob = Start-Job -ScriptBlock {
    & "lt" --port 5173 --subdomain leadbaze-test
}

# Aguardar localtunnel inicializar
Write-Host "⏳ Aguardando localtunnel inicializar..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# URL do tunnel
$tunnelUrl = "https://leadbaze-test.loca.lt"

Write-Host "✅ Tunnel configurado: $tunnelUrl" -ForegroundColor Green
Write-Host ""

# Atualizar configuração do backend
Write-Host "🔧 Atualizando configuração do backend..." -ForegroundColor Yellow
try {
    $configPath = "backend/ecosystem.config.js"
    $content = Get-Content $configPath -Raw
    $content = $content -replace "NEXT_PUBLIC_APP_URL: '[^']*'", "NEXT_PUBLIC_APP_URL: '$tunnelUrl'"
    Set-Content $configPath $content -Encoding UTF8
    Write-Host "✅ Configuração atualizada!" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro ao atualizar configuração: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Reiniciar backend com nova configuração
Write-Host "🔄 Reiniciando backend..." -ForegroundColor Yellow
try {
    Set-Location "backend"
    pm2 stop leadbaze-backend
    pm2 start ecosystem.config.js
    Set-Location ".."
    Write-Host "✅ Backend reiniciado!" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro ao reiniciar backend: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "💡 Execute manualmente: cd backend && pm2 restart leadbaze-backend" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 Tunnel configurado com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Informações:" -ForegroundColor Cyan
Write-Host "   Frontend Local: http://localhost:5173" -ForegroundColor White
Write-Host "   Frontend Público: $tunnelUrl" -ForegroundColor White
Write-Host "   Backend: http://localhost:3001" -ForegroundColor White
Write-Host "   Mercado Pago: Usará $tunnelUrl para auto_return" -ForegroundColor White
Write-Host ""
Write-Host "🧪 Para testar:" -ForegroundColor Cyan
Write-Host "   1. Acesse: $tunnelUrl/plans" -ForegroundColor White
Write-Host "   2. Clique em 'Assinar por R$ 997,00'" -ForegroundColor White
Write-Host "   3. Complete o pagamento no Mercado Pago" -ForegroundColor White
Write-Host "   4. Deve redirecionar automaticamente para $tunnelUrl/payment/success" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  IMPORTANTE: Mantenha este terminal aberto para o tunnel funcionar" -ForegroundColor Yellow
Write-Host ""

# Manter o script rodando
Write-Host "Pressione Ctrl+C para parar o tunnel..." -ForegroundColor Yellow
try {
    while ($true) {
        Start-Sleep -Seconds 10
        # Verificar se localtunnel ainda está rodando
        $ltProcess = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*lt*" }
        if (-not $ltProcess) {
            Write-Host "❌ localtunnel parou de funcionar!" -ForegroundColor Red
            break
        }
    }
} catch {
    Write-Host "🛑 Tunnel interrompido pelo usuário" -ForegroundColor Yellow
} finally {
    # Limpar
    Stop-Job $ltJob -ErrorAction SilentlyContinue
    Remove-Job $ltJob -ErrorAction SilentlyContinue
    Write-Host "🧹 Limpeza concluída" -ForegroundColor Green
}



