# 🚀 Script para Configurar Tunnel ngrok para Mercado Pago Auto Return
# Autor: LeadBaze Team
# Data: 2024

Write-Host "🚀 Configurando Tunnel para Mercado Pago Auto Return" -ForegroundColor Green
Write-Host ""

# Verificar se ngrok está instalado
$ngrokPath = Get-Command ngrok -ErrorAction SilentlyContinue
if (-not $ngrokPath) {
    Write-Host "❌ ngrok não encontrado. Instalando..." -ForegroundColor Red
    Write-Host ""
    
    # Baixar ngrok
    Write-Host "📥 Baixando ngrok..." -ForegroundColor Yellow
    try {
        Invoke-WebRequest -Uri "https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-windows-amd64.zip" -OutFile "ngrok.zip"
        Write-Host "✅ Download concluído!" -ForegroundColor Green
    } catch {
        Write-Host "❌ Erro ao baixar ngrok: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
    
    # Extrair ngrok
    Write-Host "📦 Extraindo ngrok..." -ForegroundColor Yellow
    try {
        Expand-Archive -Path "ngrok.zip" -DestinationPath "." -Force
        Remove-Item "ngrok.zip" -Force
        Write-Host "✅ ngrok instalado com sucesso!" -ForegroundColor Green
    } catch {
        Write-Host "❌ Erro ao extrair ngrok: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✅ ngrok já está instalado" -ForegroundColor Green
}

Write-Host ""
Write-Host "🔧 Configurando tunnel na porta 5173..." -ForegroundColor Yellow
Write-Host ""

# Verificar se já existe um processo ngrok rodando
$ngrokProcess = Get-Process -Name "ngrok" -ErrorAction SilentlyContinue
if ($ngrokProcess) {
    Write-Host "⚠️  ngrok já está rodando. Parando processo anterior..." -ForegroundColor Yellow
    Stop-Process -Name "ngrok" -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
}

# Iniciar ngrok em background
Write-Host "🚀 Iniciando ngrok..." -ForegroundColor Yellow
$ngrokJob = Start-Job -ScriptBlock {
    & ".\ngrok.exe" http 5173 --log=stdout
}

# Aguardar ngrok inicializar
Write-Host "⏳ Aguardando ngrok inicializar..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Obter URL pública do ngrok
Write-Host "🔍 Obtendo URL pública..." -ForegroundColor Yellow
$ngrokUrl = $null
$attempts = 0
$maxAttempts = 10

while (-not $ngrokUrl -and $attempts -lt $maxAttempts) {
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:4040/api/tunnels" -ErrorAction Stop
        $ngrokUrl = $response.tunnels[0].public_url
        Write-Host "✅ URL pública obtida: $ngrokUrl" -ForegroundColor Green
    } catch {
        $attempts++
        Write-Host "⏳ Tentativa $attempts/$maxAttempts - Aguardando ngrok..." -ForegroundColor Yellow
        Start-Sleep -Seconds 2
    }
}

if (-not $ngrokUrl) {
    Write-Host "❌ Não foi possível obter URL do ngrok após $maxAttempts tentativas" -ForegroundColor Red
    Write-Host "💡 Verifique se o ngrok está rodando: http://localhost:4040" -ForegroundColor Yellow
    Write-Host "🔍 Logs do ngrok:" -ForegroundColor Yellow
    Receive-Job $ngrokJob
    Stop-Job $ngrokJob
    Remove-Job $ngrokJob
    exit 1
}

Write-Host ""

# Atualizar configuração do backend
Write-Host "🔧 Atualizando configuração do backend..." -ForegroundColor Yellow
try {
    $configPath = "backend/ecosystem.config.js"
    $content = Get-Content $configPath -Raw
    $content = $content -replace "NEXT_PUBLIC_APP_URL: '[^']*'", "NEXT_PUBLIC_APP_URL: '$ngrokUrl'"
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
Write-Host "   Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "   Backend: http://localhost:3001" -ForegroundColor White
Write-Host "   Tunnel: $ngrokUrl" -ForegroundColor White
Write-Host "   Mercado Pago: Usará $ngrokUrl para auto_return" -ForegroundColor White
Write-Host ""
Write-Host "🔍 Para monitorar: http://localhost:4040" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  IMPORTANTE: Mantenha este terminal aberto para o tunnel funcionar" -ForegroundColor Yellow
Write-Host ""

# Manter o script rodando
Write-Host "Pressione Ctrl+C para parar o tunnel..." -ForegroundColor Yellow
try {
    while ($true) {
        Start-Sleep -Seconds 10
        # Verificar se ngrok ainda está rodando
        $ngrokProcess = Get-Process -Name "ngrok" -ErrorAction SilentlyContinue
        if (-not $ngrokProcess) {
            Write-Host "❌ ngrok parou de funcionar!" -ForegroundColor Red
            break
        }
    }
} catch {
    Write-Host "🛑 Tunnel interrompido pelo usuário" -ForegroundColor Yellow
} finally {
    # Limpar
    Stop-Job $ngrokJob -ErrorAction SilentlyContinue
    Remove-Job $ngrokJob -ErrorAction SilentlyContinue
    Write-Host "🧹 Limpeza concluída" -ForegroundColor Green
}



