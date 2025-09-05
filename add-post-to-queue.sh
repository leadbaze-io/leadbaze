#!/bin/bash

echo "�� Adicionando post à fila para processamento manual no Dashboard..."

# Dados do post
TITLE="Como Implementar Automação de Marketing Digital: Guia Completo"
CATEGORY="Automação de Vendas"
DATE="2025-09-05"
AUTHOR="LeadBaze Team"
IMAGE_URL="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop&crop=center"

# Conteúdo em Markdown
CONTENT='# Como Implementar Automação de Marketing Digital

## A Revolução da Automação

O marketing digital evoluiu drasticamente nos últimos anos, e a **automação** se tornou uma das ferramentas mais poderosas para empreendedores que desejam escalar seus negócios de forma eficiente.

### Por que a Automação é Fundamental?

A automação de marketing não é apenas uma tendência - é uma **necessidade** para empresas que querem:

- **Aumentar a produtividade** da equipe em até 300%
- **Melhorar a experiência do cliente** com conteúdo personalizado
- **Reduzir custos operacionais** em até 40%
- **Escalar o negócio** sem aumentar proporcionalmente a equipe

## Estratégias Avançadas

### 1. Segmentação Inteligente de Leads

A segmentação é o coração de qualquer estratégia de automação eficaz:

#### Critérios de Segmentação:

1. **Comportamento no site**
   - Páginas visitadas
   - Tempo de permanência
   - Downloads realizados
   - Formulários preenchidos

2. **Dados demográficos**
   - Localização geográfica
   - Tamanho da empresa
   - Setor de atuação
   - Cargo/função

### 2. Sequências de Email Automatizadas

#### Sequência de Boas-vindas:

**Dia 1: Apresentação**
- Boas-vindas personalizadas
- Apresentação da empresa
- Benefícios principais

**Dia 3: Social Proof**
- Cases de sucesso
- Depoimentos de clientes
- Números e resultados

## Ferramentas Essenciais

### CRM e Automação

**HubSpot** - Plataforma completa
- CRM integrado
- Automação de marketing
- Análise de performance
- Gestão de leads

**Salesforce** - Líder de mercado
- CRM robusto
- IA integrada (Einstein)
- Customização avançada
- Integrações ilimitadas

## Métricas Importantes

### KPIs Principais:

1. **Taxa de Conversão**
   - Meta: 5%+
   - Medição: Leads convertidos / Total de visitantes

2. **Custo por Lead (CPL)**
   - Meta: Redução de 30%
   - Medição: Investimento total / Leads gerados

3. **ROI das Campanhas**
   - Meta: 300%+
   - Medição: Receita gerada / Investimento

## Conclusão

A automação de marketing digital não é mais uma opção - é uma **necessidade** para empresas que querem crescer de forma sustentável.

**Próximos passos:**
1. Escolha uma ferramenta para começar
2. Implemente com foco e disciplina
3. Meça resultados constantemente
4. Otimize baseado em dados
5. Escale o que funciona

O futuro do seu marketing digital está em suas mãos. Comece hoje mesmo!'

# Criar arquivo temporário com o JSON
cat > /tmp/post-data.json << JSON_EOF
{
  "title": "$TITLE",
  "content": "$CONTENT",
  "category": "$CATEGORY",
  "date": "$DATE",
  "imageurl": "$IMAGE_URL",
  "autor": "$AUTHOR"
}
JSON_EOF

echo "�� Adicionando post à fila..."
echo "Título: $TITLE"
echo "Categoria: $CATEGORY"
echo "Data: $DATE"
echo "Autor: $AUTHOR"
echo "Imagem: $IMAGE_URL"
echo ""

# Adicionar à fila usando arquivo JSON
RESPONSE=$(curl -s -X POST http://localhost:3001/api/blog/queue/add \
  -H "Content-Type: application/json" \
  -d @/tmp/post-data.json)

echo " Resposta da API:"
echo "$RESPONSE"
echo ""

# Verificar se foi adicionado com sucesso
if echo "$RESPONSE" | grep -q "success.*true"; then
    echo "✅ Post adicionado à fila com sucesso!"
    echo ""
    
    echo " Verificando status da fila..."
    QUEUE_STATUS=$(curl -s -X GET http://localhost:3001/api/blog/queue/list)
    echo "📤 Status da fila:"
    echo "$QUEUE_STATUS" | jq '.data[0] | {title, processed, created_at}' 2>/dev/null || echo "$QUEUE_STATUS"
    
    echo ""
    echo " Próximos passos:"
    echo "1. Acesse o Dashboard em https://leadbaze.io/dashboard"
    echo "2. Vá para a seção 'Blog Queue'"
    echo "3. Você verá o post na fila com status 'processed: false'"
    echo "4. Clique em 'Processar Fila' para executar manualmente"
    echo "5. O post será convertido de Markdown para HTML e publicado"
    
else
    echo "❌ Erro ao adicionar post à fila"
    echo "$RESPONSE"
fi

# Limpar arquivo temporário
rm -f /tmp/post-data.json

echo ""
echo "🎉 Script executado! Verifique o Dashboard para processar o post."
