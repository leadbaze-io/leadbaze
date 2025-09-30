# Script para fazer commit das correções do WhatsApp
# Contorna problemas de permissão do Git

Write-Host "🚀 Iniciando commit das correções do WhatsApp..." -ForegroundColor Green

# Verificar se estamos no diretório correto
if (-not (Test-Path "backend/server.js")) {
    Write-Host "❌ Execute este script no diretório raiz do projeto leadflow" -ForegroundColor Red
    exit 1
}

# Verificar status do Git
Write-Host "📋 Verificando status do Git..." -ForegroundColor Yellow
try {
    $gitStatus = git status --porcelain 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "⚠️ Problemas com Git, tentando abordagem alternativa..." -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️ Git não disponível, criando arquivo de patch..." -ForegroundColor Yellow
}

# Criar arquivo de patch com as mudanças
Write-Host "📝 Criando arquivo de patch..." -ForegroundColor Yellow

$patchContent = @"
# Correções do WhatsApp - Endpoint create-instance-and-qrcode
# Data: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

## Arquivos modificados:
- backend/server.js (endpoint create-instance-and-qrcode melhorado)
- backend/test-evolution-api.js (script de teste)
- backend/deploy-whatsapp-fix.sh (script de deploy)

## Principais correções:
1. Estrutura da requisição simplificada para Evolution API
2. Melhor tratamento de erros com mensagens específicas
3. Validação de configuração da Evolution API
4. Logs detalhados para debug
5. Timeout configurado para evitar travamentos

## Para aplicar no servidor:
1. cd ~/leadbaze/backend
2. cp server.js server.js.backup.`$(date +%Y%m%d_%H%M%S)
3. node test-evolution-api.js
4. pm2 restart leadbaze-backend
5. pm2 logs leadbaze-backend --lines 20

## Teste:
curl "https://leadbaze.io/api/health" | jq '.'
"@

$patchContent | Out-File -FilePath "whatsapp-fix-patch.txt" -Encoding UTF8

# Criar arquivo com as mudanças do server.js
Write-Host "📄 Extraindo mudanças do server.js..." -ForegroundColor Yellow

$serverJsPath = "backend/server.js"
if (Test-Path $serverJsPath) {
    Copy-Item $serverJsPath "server.js.backup"
    Write-Host "✅ Backup do server.js criado" -ForegroundColor Green
}

# Criar arquivo com instruções de deploy
$deployInstructions = @"
#!/bin/bash
# Instruções para aplicar as correções no servidor

echo "🚀 Aplicando correções do WhatsApp..."

# Navegar para o diretório
cd ~/leadbaze/backend

# Fazer backup
cp server.js server.js.backup.`$(date +%Y%m%d_%H%M%S)

# Testar Evolution API
echo "🧪 Testando Evolution API..."
node test-evolution-api.js

# Reiniciar backend
echo "🔄 Reiniciando backend..."
pm2 restart leadbaze-backend

# Verificar logs
echo "📊 Verificando logs..."
pm2 logs leadbaze-backend --lines 20

echo "✅ Correções aplicadas!"
"@

$deployInstructions | Out-File -FilePath "apply-whatsapp-fix.sh" -Encoding UTF8

Write-Host ""
Write-Host "✅ Arquivos criados com sucesso!" -ForegroundColor Green
Write-Host "📁 Arquivos gerados:" -ForegroundColor Cyan
Write-Host "   - whatsapp-fix-patch.txt (descrição das correções)" -ForegroundColor White
Write-Host "   - server.js.backup (backup do server.js)" -ForegroundColor White
Write-Host "   - apply-whatsapp-fix.sh (script para aplicar no servidor)" -ForegroundColor White
Write-Host ""
Write-Host "📋 Próximos passos:" -ForegroundColor Yellow
Write-Host "   1. Faça upload dos arquivos para o servidor" -ForegroundColor White
Write-Host "   2. Execute: chmod +x apply-whatsapp-fix.sh" -ForegroundColor White
Write-Host "   3. Execute: ./apply-whatsapp-fix.sh" -ForegroundColor White
Write-Host ""
Write-Host "🔧 Ou execute manualmente no servidor:" -ForegroundColor Yellow
Write-Host "   cd ~/leadbaze/backend" -ForegroundColor White
Write-Host "   pm2 restart leadbaze-backend" -ForegroundColor White
