# 🚀 Script de Configuração do GitHub - LeadFlow
# Execute este script como Administrador

Write-Host "🚀 Configurando LeadFlow para GitHub..." -ForegroundColor Green

# 1. Verificar se Git está instalado
Write-Host "📦 Verificando instalação do Git..." -ForegroundColor Yellow
try {
    $gitVersion = git --version
    Write-Host "✅ Git encontrado: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Git não encontrado. Instalando..." -ForegroundColor Red
    
    # Instalar Git via winget (Windows 10/11)
    try {
        Write-Host "📥 Instalando Git via winget..." -ForegroundColor Yellow
        winget install --id Git.Git -e --source winget
        Write-Host "✅ Git instalado com sucesso!" -ForegroundColor Green
        
        # Atualizar PATH
        $env:PATH = [System.Environment]::GetEnvironmentVariable("PATH","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH","User")
        
        # Aguardar um pouco para o sistema reconhecer a instalação
        Start-Sleep -Seconds 5
    } catch {
        Write-Host "❌ Erro ao instalar Git. Por favor, instale manualmente:" -ForegroundColor Red
        Write-Host "   https://git-scm.com/download/win" -ForegroundColor Cyan
        Write-Host "   Execute este script novamente após a instalação." -ForegroundColor Yellow
        exit 1
    }
}

# 2. Configurar Git
Write-Host "⚙️ Configurando Git..." -ForegroundColor Yellow
git config --global user.name "MindFlow Digital"
git config --global user.email "mindflow.ai.tests@gmail.com"
git config --global init.defaultBranch main
Write-Host "✅ Git configurado!" -ForegroundColor Green

# 3. Inicializar repositório
Write-Host "📁 Inicializando repositório Git..." -ForegroundColor Yellow
if (Test-Path ".git") {
    Write-Host "✅ Repositório Git já existe!" -ForegroundColor Green
} else {
    git init
    Write-Host "✅ Repositório Git inicializado!" -ForegroundColor Green
}

# 4. Adicionar arquivos
Write-Host "📤 Adicionando arquivos ao Git..." -ForegroundColor Yellow
git add .
Write-Host "✅ Arquivos adicionados!" -ForegroundColor Green

# 5. Primeiro commit
Write-Host "💾 Fazendo primeiro commit..." -ForegroundColor Yellow
git commit -m "feat: initial commit - LeadFlow project setup"
Write-Host "✅ Primeiro commit realizado!" -ForegroundColor Green

# 6. Criar repositório no GitHub via API
Write-Host "🌐 Criando repositório no GitHub..." -ForegroundColor Yellow

# Token de acesso pessoal (você precisará criar um)
Write-Host "⚠️  ATENÇÃO: Para criar o repositório automaticamente, você precisa:" -ForegroundColor Yellow
Write-Host "   1. Acessar: https://github.com/settings/tokens" -ForegroundColor Cyan
Write-Host "   2. Clicar em 'Generate new token (classic)'" -ForegroundColor Cyan
Write-Host "   3. Selecionar 'repo' e 'workflow'" -ForegroundColor Cyan
Write-Host "   4. Copiar o token gerado" -ForegroundColor Cyan
Write-Host ""
$githubToken = Read-Host "🔑 Cole seu token do GitHub aqui (ou pressione Enter para criar manualmente)"

if ($githubToken) {
    try {
        $headers = @{
            'Authorization' = "token $githubToken"
            'Accept' = 'application/vnd.github.v3+json'
        }
        
        $body = @{
            name = 'leadflow'
            description = '🚀 LeadFlow - Gerador de Leads Profissional'
            private = $false
            auto_init = $false
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri 'https://api.github.com/user/repos' -Method Post -Headers $headers -Body $body -ContentType 'application/json'
        
        Write-Host "✅ Repositório criado: $($response.html_url)" -ForegroundColor Green
        
        # 7. Adicionar remote e fazer push
        Write-Host "📤 Configurando remote e fazendo push..." -ForegroundColor Yellow
        git remote add origin $response.clone_url
        git branch -M main
        git push -u origin main
        
        Write-Host "🎉 SUCESSO! Repositório configurado e código enviado!" -ForegroundColor Green
        Write-Host "🔗 URL do repositório: $($response.html_url)" -ForegroundColor Cyan
        
    } catch {
        Write-Host "❌ Erro ao criar repositório via API: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "📝 Criando manualmente..." -ForegroundColor Yellow
    }
}

# Se não conseguiu criar via API, instruções manuais
if (-not $githubToken -or $?) {
    Write-Host ""
    Write-Host "📝 INSTRUÇÕES MANUAIS:" -ForegroundColor Yellow
    Write-Host "   1. Acesse: https://github.com/new" -ForegroundColor Cyan
    Write-Host "   2. Repository name: leadflow" -ForegroundColor Cyan
    Write-Host "   3. Description: 🚀 LeadFlow - Gerador de Leads Profissional" -ForegroundColor Cyan
    Write-Host "   4. Visibility: Public" -ForegroundColor Cyan
    Write-Host "   5. NÃO marque 'Add a README file'" -ForegroundColor Cyan
    Write-Host "   6. Clique em 'Create repository'" -ForegroundColor Cyan
    Write-Host ""
    
    $repoUrl = Read-Host "🔗 Cole a URL do repositório criado (ex: https://github.com/seu-usuario/leadflow)"
    
    if ($repoUrl) {
        Write-Host "📤 Configurando remote e fazendo push..." -ForegroundColor Yellow
        git remote add origin $repoUrl
        git branch -M main
        git push -u origin main
        
        Write-Host "🎉 SUCESSO! Repositório configurado e código enviado!" -ForegroundColor Green
        Write-Host "🔗 URL do repositório: $repoUrl" -ForegroundColor Cyan
    } else {
        Write-Host "⚠️  Você pode fazer o push manualmente depois:" -ForegroundColor Yellow
        Write-Host "   git remote add origin https://github.com/seu-usuario/leadflow.git" -ForegroundColor Cyan
        Write-Host "   git push -u origin main" -ForegroundColor Cyan
    }
}

Write-Host ""
Write-Host "🎉 CONFIGURAÇÃO CONCLUÍDA!" -ForegroundColor Green
Write-Host "📚 Próximos passos:" -ForegroundColor Yellow
Write-Host "   1. Configure os Secrets no GitHub (Settings > Secrets and variables > Actions)" -ForegroundColor Cyan
Write-Host "   2. Conecte com Vercel ou Netlify para deploy automático" -ForegroundColor Cyan
Write-Host "   3. Teste todas as funcionalidades" -ForegroundColor Cyan
Write-Host ""
Write-Host "📞 Suporte: contato@mindflowdigital.com.br" -ForegroundColor Cyan 