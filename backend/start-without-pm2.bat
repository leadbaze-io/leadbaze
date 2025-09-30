@echo off
title LeadBaze Backend - Sem PM2
color 0A

echo.
echo ========================================
echo    🚀 LEADBAZE BACKEND SERVER 🚀
echo    (Executando sem PM2)
echo ========================================
echo.

REM Verificar Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js não encontrado!
    pause
    exit /b 1
)

echo ✅ Node.js: 
node --version
echo.

REM Verificar arquivo server.js
if not exist "server.js" (
    echo ❌ server.js não encontrado!
    pause
    exit /b 1
)

echo ✅ Arquivo server.js encontrado
echo.

REM Carregar variáveis de ambiente
if exist "config.env" (
    echo ✅ Carregando config.env...
    for /f "usebackq tokens=1,2 delims==" %%a in ("config.env") do (
        if not "%%a"=="" if not "%%a:~0,1%"=="#" (
            set "%%a=%%b"
        )
    )
) else (
    echo ⚠️ config.env não encontrado, usando padrões...
)

REM Definir variáveis padrão
if not defined NODE_ENV set NODE_ENV=production
if not defined PORT set PORT=3001

echo.
echo 🔧 Configurações:
echo    - Ambiente: %NODE_ENV%
echo    - Porta: %PORT%
echo    - CORS: %CORS_ORIGIN%
echo.

echo 🚀 Iniciando servidor...
echo 💡 Pressione Ctrl+C para parar
echo.

REM Iniciar servidor
node server.js

echo.
echo 🛑 Servidor finalizado.
pause









