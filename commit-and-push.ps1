# Script para fazer commit e push das alterações
Write-Host "Iniciando commit e push das alteracoes..." -ForegroundColor Green

# Adicionar todas as alterações
Write-Host "Adicionando arquivos..." -ForegroundColor Yellow
git add .

# Fazer commit
Write-Host "Fazendo commit..." -ForegroundColor Yellow
git commit -m "feat: Adicionar botao de desconectar WhatsApp

- Implementar botao de desconectar na aba Configuracao WhatsApp
- Adicionar funcao handleDisconnectWhatsApp no WhatsAppConnection
- Atualizar estado local quando WhatsApp for desconectado
- Permitir conectar novo numero apos desconexao
- Melhorar UX com feedback visual durante desconexao"

# Fazer push para o repositório
Write-Host "Enviando para GitHub..." -ForegroundColor Yellow
git push origin main

Write-Host "Alteracoes enviadas com sucesso!" -ForegroundColor Green
