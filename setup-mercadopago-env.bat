@echo off
echo Configurando variaveis de ambiente do Mercado Pago...

REM Criar arquivo .env.local se nao existir
if not exist ".env.local" (
    echo Criando arquivo .env.local...
    copy "env.example" ".env.local"
)

REM Adicionar credenciais do Mercado Pago ao .env.local
echo.
echo Adicionando credenciais do Mercado Pago...
echo.
echo # Mercado Pago Configuration >> .env.local
echo MERCADO_PAGO_ACCESS_TOKEN=TEST-1726022588351373-092114-c98b6e76e06ef202f26204ee01d87584-2705589354 >> .env.local
echo MERCADO_PAGO_PUBLIC_KEY=TEST-13626612-b21b-4c97-a89b-7270d5532dc6 >> .env.local
echo NEXT_PUBLIC_APP_URL=http://localhost:3000 >> .env.local
echo NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY=TEST-13626612-b21b-4c97-a89b-7270d5532dc6 >> .env.local

echo.
echo ✅ Credenciais do Mercado Pago configuradas com sucesso!
echo.
echo 📋 Próximos passos:
echo 1. Reinicie o backend: pm2 restart leadbaze-backend
echo 2. Reinicie o frontend: npm run dev
echo 3. Teste o sistema de pagamentos
echo.
pause




