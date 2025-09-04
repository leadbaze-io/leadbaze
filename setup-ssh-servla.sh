#!/bin/bash

# 🔑 Script de Configuração SSH para LeadBaze na Servla
# Execute este script no servidor Servla

echo "🚀 Configurando SSH para LeadBaze na Servla..."
echo "================================================"

# 1. Verificar/criar diretório .ssh
echo "📁 Configurando diretório .ssh..."
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# 2. Gerar chave SSH (se não existir)
if [ ! -f ~/.ssh/id_rsa ]; then
    echo "🔑 Gerando nova chave SSH..."
    ssh-keygen -t rsa -b 4096 -C "leadbaze@gmail.com" -f ~/.ssh/id_rsa -N ""
    echo "✅ Chave SSH gerada com sucesso!"
else
    echo "✅ Chave SSH já existe!"
fi

# 3. Configurar authorized_keys
echo "🔐 Configurando authorized_keys..."
if [ ! -f ~/.ssh/authorized_keys ]; then
    touch ~/.ssh/authorized_keys
fi

# Adicionar chave pública se não existir
if ! grep -q "$(cat ~/.ssh/id_rsa.pub)" ~/.ssh/authorized_keys 2>/dev/null; then
    cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys
    echo "✅ Chave pública adicionada ao authorized_keys!"
else
    echo "✅ Chave pública já está no authorized_keys!"
fi

# 4. Configurar permissões
echo "🔒 Configurando permissões..."
chmod 600 ~/.ssh/authorized_keys
chmod 600 ~/.ssh/id_rsa
chmod 644 ~/.ssh/id_rsa.pub

# 5. Verificar configuração
echo "📊 Verificando configuração..."
echo "Arquivos SSH:"
ls -la ~/.ssh/

echo ""
echo "Permissões:"
stat -c "%A %n" ~/.ssh/authorized_keys
stat -c "%A %n" ~/.ssh/id_rsa
stat -c "%A %n" ~/.ssh/id_rsa.pub

# 6. Testar conexão SSH
echo ""
echo "🧪 Testando conexão SSH..."
if ssh -o StrictHostKeyChecking=no localhost "echo 'SSH funcionando!'" 2>/dev/null; then
    echo "✅ Conexão SSH funcionando!"
else
    echo "⚠️  Teste SSH falhou, mas pode ser normal em alguns ambientes"
fi

# 7. Mostrar chave privada para GitHub Actions
echo ""
echo "🔐 CHAVE PRIVADA PARA GITHUB ACTIONS:"
echo "================================================"
echo "Copie TODO o conteúdo abaixo para o secret SERVLA_SSH_KEY:"
echo ""
cat ~/.ssh/id_rsa
echo ""
echo "================================================"

# 8. Mostrar chave pública
echo ""
echo "🔑 CHAVE PÚBLICA:"
echo "================================================"
cat ~/.ssh/id_rsa.pub
echo "================================================"

echo ""
echo "🎉 Configuração SSH concluída!"
echo ""
echo "📋 PRÓXIMOS PASSOS:"
echo "1. Copie a CHAVE PRIVADA acima"
echo "2. Vá para: https://github.com/leadbaze-io/leadbaze/settings/secrets/actions"
echo "3. Crie um secret chamado 'SERVLA_SSH_KEY'"
echo "4. Cole a chave privada completa"
echo "5. Configure os outros secrets necessários"
echo ""
echo "📞 Suporte: contato@mindflowdigital.com.br"












