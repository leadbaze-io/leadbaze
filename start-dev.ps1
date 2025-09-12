# =====================================================
# SCRIPT DE INICIALIZAÇÃO - SERVIDOR LOCAL LEADBAZE
# =====================================================
# Execute este script no PowerShell para iniciar o ambiente de desenvolvimento

Write-Host "🚀 Iniciando servidor local LeadBaze..." -ForegroundColor Green
Write-Host ""

# Verificar se estamos no diretório correto
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Erro: Execute este script no diretório raiz do projeto (leadflow)" -ForegroundColor Red
    Write-Host "   Diretório atual: $(Get-Location)" -ForegroundColor Yellow
    Write-Host "   Diretório esperado: C:\Gaveta 2\Projetos\leadflow" -ForegroundColor Yellow
    exit 1
}

Write-Host "📁 Diretório atual: $(Get-Location)" -ForegroundColor Cyan
Write-Host ""

# Verificar se PM2 está instalado
Write-Host "🔍 Verificando PM2..." -ForegroundColor Yellow
try {
    $pm2Version = pm2 --version 2>$null
    if ($pm2Version) {
        Write-Host "✅ PM2 encontrado: v$pm2Version" -ForegroundColor Green
    } else {
        Write-Host "❌ PM2 não encontrado. Instalando..." -ForegroundColor Red
        npm install -g pm2
        Write-Host "✅ PM2 instalado com sucesso!" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Erro ao verificar PM2. Instalando..." -ForegroundColor Red
    npm install -g pm2
    Write-Host "✅ PM2 instalado com sucesso!" -ForegroundColor Green
}

Write-Host ""

# Parar processos PM2 existentes
Write-Host "🛑 Parando processos PM2 existentes..." -ForegroundColor Yellow
pm2 delete all 2>$null
Write-Host "✅ Processos PM2 parados" -ForegroundColor Green
Write-Host ""

# Verificar se o backend existe
if (-not (Test-Path "backend/server.js")) {
    Write-Host "❌ Erro: Arquivo backend/server.js não encontrado" -ForegroundColor Red
    exit 1
}

# Verificar se o ecosystem.config.cjs existe
if (-not (Test-Path "ecosystem.config.cjs")) {
    Write-Host "❌ Erro: Arquivo ecosystem.config.cjs não encontrado" -ForegroundColor Red
    exit 1
}

Write-Host "📦 Instalando dependências do frontend..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao instalar dependências do frontend" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Dependências do frontend instaladas" -ForegroundColor Green
Write-Host ""

Write-Host "📦 Instalando dependências do backend..." -ForegroundColor Yellow
Set-Location "backend"
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao instalar dependências do backend" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Dependências do backend instaladas" -ForegroundColor Green
Set-Location ".."
Write-Host ""

# Iniciar backend com PM2
Write-Host "🔧 Iniciando backend com PM2..." -ForegroundColor Yellow
pm2 start ecosystem.config.cjs
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao iniciar backend com PM2" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Backend iniciado com PM2" -ForegroundColor Green
Write-Host ""

# Aguardar um pouco para o backend inicializar
Write-Host "⏳ Aguardando backend inicializar..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Verificar status do PM2
Write-Host "📊 Status dos processos PM2:" -ForegroundColor Cyan
pm2 status
Write-Host ""

# Iniciar frontend
Write-Host "🎨 Iniciando frontend..." -ForegroundColor Yellow
Write-Host "   Frontend será iniciado em: http://localhost:5173" -ForegroundColor Cyan
Write-Host "   Backend está rodando em: http://localhost:3001" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Para parar o servidor, pressione Ctrl+C" -ForegroundColor Yellow
Write-Host "💡 Para ver logs do backend: pm2 logs leadbaze-backend" -ForegroundColor Yellow
Write-Host "💡 Para parar o backend: pm2 stop leadbaze-backend" -ForegroundColor Yellow
Write-Host ""

# Iniciar frontend em modo desenvolvimento
npm run dev




