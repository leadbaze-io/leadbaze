#!/bin/bash

echo "🚀 Adicionando post de teste com JSON válido..."

# Criar arquivo JSON temporário
cat > /tmp/post-data.json << 'JSONEOF'
{
  "title": "Teste Completo: Sistema de Blog Automation",
  "content": "# Teste Completo do Sistema\n\nEste é um **teste** para verificar se o sistema está funcionando corretamente.\n\n## Funcionalidades Testadas\n\n- ✅ Formatação Markdown\n- ✅ Imagens\n- ✅ Categorias\n- ✅ Autores\n- ✅ Processamento automático\n\n## Resultado Esperado\n\nO post deve aparecer no blog após o processamento automático.",
  "category": "Automação de Vendas",
  "date": "2025-09-05",
  "imageurl": "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=400&fit=crop&crop=center",
  "autor": "LeadBaze Team"
}
JSONEOF

# Fazer a requisição
curl -X POST "https://leadbaze.io/api/blog/queue/add" \
  -H "Content-Type: application/json" \
  -H "x-user-email: creaty12345@gmail.com" \
  -d @/tmp/post-data.json

echo ""
echo "✅ Post enviado com JSON válido!"

# Limpar arquivo temporário
rm /tmp/post-data.json
