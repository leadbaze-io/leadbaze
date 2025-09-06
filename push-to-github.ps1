# 🚀 Script para Push no GitHub - LeadBaze
# Execute este script como administrador

Write-Host "🚀 Configurando push para GitHub LeadBaze..." -ForegroundColor Green

# 1. Limpar credenciais antigas
Write-Host "📋 Limpando credenciais antigas..." -ForegroundColor Yellow
git config --global --unset credential.helper
git config --global --unset user.name
git config --global --unset user.email

# 2. Configurar novas credenciais
Write-Host "⚙️ Configurando credenciais do LeadBaze..." -ForegroundColor Yellow
git config --global user.name "LeadBaze"
git config --global user.email "leadbaze@gmail.com"

# 3. Configurar remote
Write-Host "🔗 Configurando remote do GitHub..." -ForegroundColor Yellow
git remote set-url origin https://github.com/leadbaze-io/leadbaze.git

# 4. Verificar status
Write-Host "📊 Verificando status do repositório..." -ForegroundColor Yellow
git status

# 5. Fazer push
Write-Host "🚀 Fazendo push para GitHub..." -ForegroundColor Green
Write-Host "⚠️  IMPORTANTE: Use as credenciais:" -ForegroundColor Red
Write-Host "   Username: leadbaze@gmail.com" -ForegroundColor Cyan
Write-Host "   Password: Leadbaze@270825" -ForegroundColor Cyan
Write-Host ""

git push -u origin main --force

Write-Host ""
Write-Host "✅ Push concluído!" -ForegroundColor Green
Write-Host "🌐 Acesse: https://github.com/leadbaze-io/leadbaze" -ForegroundColor Cyan
Write-Host ""
Write-Host "📞 Suporte: contato@mindflowdigital.com.br" -ForegroundColor Yellow


















