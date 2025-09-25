@echo off
echo 🚀 Iniciando LeadBaze Backend com PM2...
echo.

REM Limpar processos PM2 existentes
echo 🧹 Limpando processos PM2 existentes...
taskkill /f /im node.exe 2>nul
taskkill /f /im pm2.exe 2>nul

REM Aguardar um momento
timeout /t 2 /nobreak >nul

REM Tentar deletar pasta PM2 se existir
echo 🗑️ Removendo configurações PM2 antigas...
if exist "%USERPROFILE%\.pm2" (
    rmdir /s /q "%USERPROFILE%\.pm2" 2>nul
)

REM Aguardar um momento
timeout /t 2 /nobreak >nul

REM Iniciar PM2 com privilégios administrativos
echo 🔧 Iniciando PM2...
pm2 kill 2>nul
pm2 start ecosystem.config.js

REM Verificar status
echo.
echo 📊 Status dos processos:
pm2 status

echo.
echo ✅ Backend iniciado! Acesse: http://localhost:3001
echo 💡 Para parar: pm2 stop leadbaze-backend
echo 💡 Para logs: pm2 logs leadbaze-backend
echo.
pause









