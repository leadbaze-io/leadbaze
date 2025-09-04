# Script para Limpar Cache e Fazer Rebuild - LeadBaze
# Execute este script para resolver problemas de cores/estilos

Write-Host "Limpando cache e fazendo rebuild..." -ForegroundColor Green

# 1. Parar servidor se estiver rodando
Write-Host "Parando servidor de desenvolvimento..." -ForegroundColor Yellow
try {
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
    Write-Host "Servidor parado" -ForegroundColor Green
} catch {
    Write-Host "Nenhum servidor rodando" -ForegroundColor Cyan
}

# 2. Limpar diretórios de build
Write-Host "Limpando diretórios de build..." -ForegroundColor Yellow
if (Test-Path "dist") {
    Remove-Item "dist" -Recurse -Force
    Write-Host "Diretório dist removido" -ForegroundColor Green
}

if (Test-Path "node_modules/.vite") {
    Remove-Item "node_modules/.vite" -Recurse -Force
    Write-Host "Cache do Vite removido" -ForegroundColor Green
}

# 3. Limpar cache do npm
Write-Host "Limpando cache do npm..." -ForegroundColor Yellow
npm cache clean --force

# 4. Reinstalar dependências
Write-Host "Reinstalando dependências..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Remove-Item "node_modules" -Recurse -Force
    Write-Host "node_modules removido" -ForegroundColor Green
}

if (Test-Path "package-lock.json") {
    Remove-Item "package-lock.json" -Force
    Write-Host "package-lock.json removido" -ForegroundColor Green
}

npm install

# 5. Fazer build completo
Write-Host "Fazendo build completo..." -ForegroundColor Yellow
npm run build

# 6. Verificar se build foi bem-sucedido
if (Test-Path "dist") {
    Write-Host "Build concluído com sucesso!" -ForegroundColor Green
    Write-Host "Arquivos gerados em: dist/" -ForegroundColor Cyan
    
    # Mostrar estatísticas
    $cssFiles = Get-ChildItem "dist" -Filter "*.css" -Recurse
    $jsFiles = Get-ChildItem "dist" -Filter "*.js" -Recurse
    
    Write-Host "Estatísticas do build:" -ForegroundColor Cyan
    Write-Host "   CSS: $($cssFiles.Count) arquivos" -ForegroundColor White
    Write-Host "   JS: $($jsFiles.Count) arquivos" -ForegroundColor White
    
    # Mostrar arquivos com hash
    Write-Host "Arquivos com hash (cache seguro):" -ForegroundColor Cyan
    $hashFiles = Get-ChildItem "dist/assets" -Filter "*-*.js" -ErrorAction SilentlyContinue
    if ($hashFiles) {
        $hashFiles | ForEach-Object {
            Write-Host "   $($_.Name)" -ForegroundColor Gray
        }
    } else {
        Write-Host "   Nenhum arquivo com hash encontrado" -ForegroundColor Yellow
    }
} else {
    Write-Host "Erro no build!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Próximos passos:" -ForegroundColor Yellow
Write-Host "1. Teste em navegação anônima" -ForegroundColor White
Write-Host "2. Use Ctrl+F5 para forçar recarregamento" -ForegroundColor White
Write-Host "3. Verifique se as cores estão corretas" -ForegroundColor White
Write-Host ""
Write-Host "Para testar: npm run preview" -ForegroundColor Cyan
Write-Host "Para desenvolvimento: npm run dev" -ForegroundColor Cyan
