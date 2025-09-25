@echo off
echo 🔧 Corrigindo permissões do PM2...
echo.

REM Executar como administrador
net session >nul 2>&1
if %errorLevel% == 0 (
    echo ✅ Executando como administrador
) else (
    echo ❌ Este script precisa ser executado como administrador
    echo 💡 Clique com botão direito e selecione "Executar como administrador"
    pause
    exit /b 1
)

echo.
echo 🧹 Limpando processos PM2...
taskkill /f /im node.exe 2>nul
taskkill /f /im pm2.exe 2>nul

echo.
echo 🗑️ Removendo pasta PM2...
if exist "%USERPROFILE%\.pm2" (
    takeown /f "%USERPROFILE%\.pm2" /r /d y >nul 2>&1
    icacls "%USERPROFILE%\.pm2" /grant "%USERNAME%":F /t >nul 2>&1
    rmdir /s /q "%USERPROFILE%\.pm2" 2>nul
    echo ✅ Pasta PM2 removida
) else (
    echo ✅ Pasta PM2 não existe
)

echo.
echo 🔧 Reinstalando PM2...
npm uninstall -g pm2 2>nul
npm install -g pm2

echo.
echo 🚀 Testando PM2...
pm2 --version

echo.
echo ✅ Correção concluída!
echo 💡 Agora você pode executar: pm2 start ecosystem.config.js
echo.
pause









