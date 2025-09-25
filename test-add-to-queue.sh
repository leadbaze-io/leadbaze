#!/bin/bash

echo "🚀 Testando adição de post à fila..."

# Gerar timestamp único
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
TITLE="Teste Fila - $TIMESTAMP"

echo "📝 Título: $TITLE"

# Criar JSON de teste
JSON_DATA=$(cat <<EOF
{
  "title": "$TITLE",
  "content": "# Teste de Adição à Fila\n\nEste é um teste para verificar se o sistema de fila está funcionando corretamente.\n\n## Detalhes do Teste\n\n- **Timestamp**: $TIMESTAMP\n- **Sistema**: Blog Queue Test\n- **Status**: Teste Manual\n\nSe este post aparecer na fila, significa que o sistema está funcionando!",
  "autor": "Sistema de Teste",
  "categoria": "Automação de Vendas",
  "date": "$(date +%Y-%m-%d)",
  "tags": ["teste", "fila", "sistema"],
  "meta_description": "Teste de adição à fila do sistema de blog automation",
  "featured_image": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop",
  "status": "pending"
}
EOF
)

echo "📦 JSON sendo enviado:"
echo "$JSON_DATA" | jq .

echo ""
echo "🌐 Enviando para a API..."

# Enviar para a API
RESPONSE=$(curl -s -X POST "https://leadbaze.io/api/blog/queue/add" \
  -H "Content-Type: application/json" \
  -d "$JSON_DATA")

echo "📡 Resposta da API:"
echo "$RESPONSE" | jq .

echo ""
echo "🔍 Verificando status da fila..."

# Verificar status
STATUS_RESPONSE=$(curl -s "https://leadbaze.io/api/blog/auto/status")
echo "📊 Status da fila:"
echo "$STATUS_RESPONSE" | jq .

echo ""
echo "✅ Teste concluído!"






























