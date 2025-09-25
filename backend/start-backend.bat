@echo off
title LeadBaze Backend Server
echo.
echo ========================================
echo    🚀 LEADBAZE BACKEND SERVER 🚀
echo ========================================
echo.

REM Verificar se Node.js está instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js não encontrado! Instale o Node.js primeiro.
    pause
    exit /b 1
)

REM Verificar se o arquivo server.js existe
if not exist "server.js" (
    echo ❌ Arquivo server.js não encontrado!
    pause
    exit /b 1
)

echo ✅ Node.js encontrado: 
node --version
echo.

REM Carregar variáveis de ambiente se o arquivo existir
if exist "config.env" (
    echo ✅ Carregando configurações do config.env...
) else (
    echo ⚠️ Arquivo config.env não encontrado, usando configurações padrão...
)

echo.
echo 🚀 Iniciando servidor backend...
echo 🌐 Porta: 3001
echo 🔧 Ambiente: production
echo.

REM Iniciar o servidor
node server.js

echo.
echo 🛑 Servidor finalizado.
pause









