#!/bin/bash

# Script para adicionar post de teste com título único
echo "🚀 Adicionando post de teste com título único..."

# Gerar timestamp único
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
TITLE="Teste Automático - $TIMESTAMP"

# Criar arquivo JSON temporário
cat > /tmp/unique-post-data.json << EOF
{
  "title": "$TITLE",
  "content": "# Teste de Processamento Automático

Este é um post de teste criado automaticamente para verificar o sistema de processamento em tempo real.

## Funcionalidades Testadas

- ✅ Adição à fila de processamento
- ✅ Trigger automático do banco de dados
- ✅ Notificação em tempo real
- ✅ Processamento automático pelo backend
- ✅ Publicação no blog

## Detalhes Técnicos

- **Timestamp**: $TIMESTAMP
- **Sistema**: Blog Automation
- **Status**: Teste Automático
- **Processamento**: Tempo Real

Este post foi criado para testar o sistema completo de automação do blog, incluindo o monitor de tempo real no Dashboard.

## Conclusão

Se você está lendo este post, significa que o sistema de processamento automático está funcionando perfeitamente! 🎉",
  "autor": "Sistema de Teste",
  "categoria": "Automação de Vendas",
  "tags": ["teste", "automação", "tempo-real", "blog"],
  "meta_description": "Post de teste para verificar o sistema de processamento automático em tempo real do blog LeadBaze.",
  "featured_image": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop",
  "status": "pending"
}
EOF

# Enviar para a API
curl -X POST "https://leadbaze.io/api/blog/queue/add" \
  -H "Content-Type: application/json" \
  -d @/tmp/unique-post-data.json

echo ""
echo "✅ Post de teste único enviado!"
echo "📝 Título: $TITLE"
echo "🕐 Timestamp: $TIMESTAMP"

# Limpar arquivo temporário
rm -f /tmp/unique-post-data.json








