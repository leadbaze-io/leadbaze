#!/bin/bash

echo "🔍 Testando conexão SSH com Servla..."

# Verificar se as variáveis estão definidas
if [ -z "$SERVLA_HOST" ]; then
    echo "❌ SERVLA_HOST não definido"
    exit 1
fi

if [ -z "$SERVLA_USERNAME" ]; then
    echo "❌ SERVLA_USERNAME não definido"
    exit 1
fi

if [ -z "$SERVLA_SSH_KEY" ]; then
    echo "❌ SERVLA_SSH_KEY não definido"
    exit 1
fi

# Criar arquivo temporário com a chave SSH
echo "$SERVLA_SSH_KEY" > /tmp/servla_key
chmod 600 /tmp/servla_key

# Testar conexão SSH
echo "🔗 Conectando em $SERVLA_USERNAME@$SERVLA_HOST:$SERVLA_PORT..."

ssh -i /tmp/servla_key \
    -o StrictHostKeyChecking=no \
    -o UserKnownHostsFile=/dev/null \
    -p $SERVLA_PORT \
    $SERVLA_USERNAME@$SERVLA_HOST \
    "echo '✅ Conexão SSH bem-sucedida!' && whoami && pwd"

# Limpar arquivo temporário
rm -f /tmp/servla_key

echo "✅ Teste de conexão concluído!"
