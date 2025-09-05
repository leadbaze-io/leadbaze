#!/bin/bash

echo "🚀 Executando script para adicionar post à fila..."

# Verificar se o script existe
if [ ! -f "add-post-to-queue.sh" ]; then
    echo "❌ Script add-post-to-queue.sh não encontrado!"
    echo "Execute primeiro: ./create-post-script.sh"
    exit 1
fi

# Executar o script
./add-post-to-queue.sh

echo ""
echo "🎯 Script executado! Agora acesse o Dashboard para processar o post."
