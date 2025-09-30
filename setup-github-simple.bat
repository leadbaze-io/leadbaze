@echo off
echo 🚀 Configurando LeadFlow para GitHub...
echo.

REM Verificar se Git está disponível
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Git não encontrado. Instalando...
    winget install --id Git.Git -e --source winget
    echo ✅ Git instalado! Reinicie este script.
    pause
    exit /b 1
)

echo ✅ Git encontrado!
echo.

REM Configurar Git
echo ⚙️ Configurando Git...
git config --global user.name "MindFlow Digital"
git config --global user.email "mindflow.ai.tests@gmail.com"
git config --global init.defaultBranch main
echo ✅ Git configurado!
echo.

REM Inicializar repositório
echo 📁 Inicializando repositório Git...
if exist ".git" (
    echo ✅ Repositório Git já existe!
) else (
    git init
    echo ✅ Repositório Git inicializado!
)
echo.

REM Adicionar arquivos
echo 📤 Adicionando arquivos ao Git...
git add .
echo ✅ Arquivos adicionados!
echo.

REM Primeiro commit
echo 💾 Fazendo primeiro commit...
git commit -m "feat: initial commit - LeadFlow project setup"
echo ✅ Primeiro commit realizado!
echo.

echo 📝 INSTRUÇÕES PARA CRIAR REPOSITÓRIO:
echo.
echo 1. Acesse: https://github.com/new
echo 2. Repository name: leadflow
echo 3. Description: 🚀 LeadFlow - Gerador de Leads Profissional
echo 4. Visibility: Public
echo 5. NÃO marque "Add a README file"
echo 6. Clique em "Create repository"
echo.
echo Após criar o repositório, execute:
echo git remote add origin https://github.com/seu-usuario/leadflow.git
echo git push -u origin main
echo.

set /p repo_url="🔗 Cole a URL do repositório criado: "

if not "%repo_url%"=="" (
    echo 📤 Configurando remote e fazendo push...
    git remote add origin %repo_url%
    git branch -M main
    git push -u origin main
    echo.
    echo 🎉 SUCESSO! Repositório configurado e código enviado!
    echo 🔗 URL do repositório: %repo_url%
) else (
    echo.
    echo ⚠️ Você pode fazer o push manualmente depois:
    echo git remote add origin https://github.com/seu-usuario/leadflow.git
    echo git push -u origin main
)

echo.
echo 🎉 CONFIGURAÇÃO CONCLUÍDA!
echo 📚 Próximos passos:
echo 1. Configure os Secrets no GitHub (Settings > Secrets and variables > Actions)
echo 2. Conecte com Vercel ou Netlify para deploy automático
echo 3. Teste todas as funcionalidades
echo.
echo 📞 Suporte: contato@mindflowdigital.com.br
echo.
pause 