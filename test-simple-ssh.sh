#!/bin/bash

echo "🔍 Teste simples de conexão SSH..."

# Verificar se a chave existe
if [ ! -f ~/.ssh/servla_key ]; then
    echo "❌ Arquivo de chave SSH não encontrado"
    exit 1
fi

# Verificar permissões
ls -la ~/.ssh/servla_key

# Testar conexão simples
echo "🔗 Testando conexão..."
ssh -i ~/.ssh/servla_key \
    -o StrictHostKeyChecking=no \
    -o UserKnownHostsFile=/dev/null \
    -p $SERVLA_PORT \
    $SERVLA_USERNAME@$SERVLA_HOST \
    "echo '✅ Conexão SSH OK!' && date"

echo "✅ Teste concluído!"
