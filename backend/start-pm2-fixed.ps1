# Script PowerShell para iniciar o backend com PM2
Write-Host "🚀 Iniciando LeadBaze Backend com PM2..." -ForegroundColor Green
Write-Host ""

# Limpar processos existentes
Write-Host "🧹 Limpando processos existentes..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Get-Process -Name "pm2" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

Start-Sleep -Seconds 2

# Tentar remover pasta PM2
Write-Host "🗑️ Removendo configurações PM2 antigas..." -ForegroundColor Yellow
$pm2Path = "$env:USERPROFILE\.pm2"
if (Test-Path $pm2Path) {
    try {
        Remove-Item -Path $pm2Path -Recurse -Force -ErrorAction Stop
        Write-Host "✅ Pasta PM2 removida" -ForegroundColor Green
    } catch {
        Write-Host "⚠️ Não foi possível remover pasta PM2: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

Start-Sleep -Seconds 2

# Verificar se PM2 está instalado
Write-Host "🔍 Verificando instalação do PM2..." -ForegroundColor Yellow
try {
    $pm2Version = pm2 --version 2>&1
    Write-Host "✅ PM2 instalado: $pm2Version" -ForegroundColor Green
} catch {
    Write-Host "❌ PM2 não encontrado. Instalando..." -ForegroundColor Red
    npm install -g pm2
}

# Iniciar PM2
Write-Host "🚀 Iniciando backend com PM2..." -ForegroundColor Green
try {
    pm2 kill 2>$null
    pm2 start ecosystem.config.js
    
    Write-Host ""
    Write-Host "📊 Status dos processos:" -ForegroundColor Cyan
    pm2 status
    
    Write-Host ""
    Write-Host "✅ Backend iniciado com sucesso!" -ForegroundColor Green
    Write-Host "🌐 Acesse: http://localhost:3001" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "💡 Comandos úteis:" -ForegroundColor Yellow
    Write-Host "   - Parar: pm2 stop leadbaze-backend" -ForegroundColor White
    Write-Host "   - Logs: pm2 logs leadbaze-backend" -ForegroundColor White
    Write-Host "   - Status: pm2 status" -ForegroundColor White
    Write-Host "   - Restart: pm2 restart leadbaze-backend" -ForegroundColor White
    
} catch {
    Write-Host "❌ Erro ao iniciar PM2: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "🔄 Tentando método alternativo..." -ForegroundColor Yellow
    
    # Método alternativo: executar diretamente
    try {
        Write-Host "🚀 Iniciando servidor diretamente..." -ForegroundColor Green
        Start-Process -FilePath "node" -ArgumentList "server.js" -WorkingDirectory (Get-Location) -WindowStyle Normal
        Write-Host "✅ Servidor iniciado em nova janela" -ForegroundColor Green
    } catch {
        Write-Host "❌ Erro ao iniciar servidor: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Pressione Enter para continuar..." -ForegroundColor Gray
Read-Host









