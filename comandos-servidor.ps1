# =====================================================
# COMANDOS ÚTEIS - SERVIDOR LEADBAZE
# =====================================================
# Script com comandos úteis para gerenciar o servidor

Write-Host "🔧 Comandos úteis para o servidor LeadBaze" -ForegroundColor Green
Write-Host ""

# Função para mostrar status
function Show-Status {
    Write-Host "📊 Status dos processos PM2:" -ForegroundColor Cyan
    pm2 status
    Write-Host ""
    Write-Host "🌐 URLs do servidor:" -ForegroundColor Cyan
    Write-Host "   Frontend: http://localhost:5173" -ForegroundColor Yellow
    Write-Host "   Backend:  http://localhost:3001" -ForegroundColor Yellow
    Write-Host ""
}

# Função para parar tudo
function Stop-All {
    Write-Host "🛑 Parando todos os processos..." -ForegroundColor Yellow
    pm2 delete all
    Write-Host "✅ Todos os processos parados" -ForegroundColor Green
}

# Função para reiniciar backend
function Restart-Backend {
    Write-Host "🔄 Reiniciando backend..." -ForegroundColor Yellow
    pm2 restart leadbaze-backend
    Write-Host "✅ Backend reiniciado" -ForegroundColor Green
}

# Função para ver logs
function Show-Logs {
    Write-Host "📋 Logs do backend:" -ForegroundColor Cyan
    pm2 logs leadbaze-backend --lines 50
}

# Função para ver logs em tempo real
function Show-Logs-Realtime {
    Write-Host "📋 Logs do backend em tempo real (Ctrl+C para sair):" -ForegroundColor Cyan
    pm2 logs leadbaze-backend --follow
}

# Menu interativo
while ($true) {
    Write-Host ""
    Write-Host "🎯 Escolha uma opção:" -ForegroundColor Green
    Write-Host "   1. Ver status dos processos" -ForegroundColor White
    Write-Host "   2. Parar todos os processos" -ForegroundColor White
    Write-Host "   3. Reiniciar backend" -ForegroundColor White
    Write-Host "   4. Ver logs do backend" -ForegroundColor White
    Write-Host "   5. Ver logs em tempo real" -ForegroundColor White
    Write-Host "   6. Iniciar backend" -ForegroundColor White
    Write-Host "   7. Sair" -ForegroundColor White
    Write-Host ""
    
    $choice = Read-Host "Digite sua escolha (1-7)"
    
    switch ($choice) {
        "1" { Show-Status }
        "2" { Stop-All }
        "3" { Restart-Backend }
        "4" { Show-Logs }
        "5" { Show-Logs-Realtime }
        "6" { 
            Write-Host "🚀 Iniciando backend..." -ForegroundColor Yellow
            pm2 start ecosystem.config.cjs
            Write-Host "✅ Backend iniciado" -ForegroundColor Green
        }
        "7" { 
            Write-Host "👋 Até logo!" -ForegroundColor Green
            break
        }
        default { 
            Write-Host "❌ Opção inválida. Tente novamente." -ForegroundColor Red
        }
    }
}



















