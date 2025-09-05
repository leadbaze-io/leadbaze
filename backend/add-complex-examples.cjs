require('dotenv').config({ path: './config.env' });
const { createClient } = require('@supabase/supabase-js');
const ContentFormatter = require('./services/contentFormatter');

console.log('🎨 Adicionando 3 Exemplos Complexos à Fila\n');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const formatter = new ContentFormatter();

// Exemplo 1: Guia Técnico Complexo
const example1 = {
    title: "Implementação Avançada de CRM com Integração de IA: Guia Completo 2024",
    content: `A implementação de um CRM com integração de IA representa o futuro da gestão de relacionamento com clientes. Este guia técnico detalha todos os aspectos necessários para uma implementação bem-sucedida.

## Arquitetura do Sistema CRM com IA

### Componentes Principais

A arquitetura moderna de CRM com IA inclui:

1. **Base de Dados Centralizada**
   - Armazenamento de dados de clientes
   - Histórico de interações
   - Metadados comportamentais

2. **Motor de IA Integrado**
   - Machine Learning para predição
   - Processamento de linguagem natural
   - Análise de sentimento

3. **APIs de Integração**
   - Conectores com sistemas externos
   - Webhooks para automação
   - Sincronização em tempo real

## Implementação Passo a Passo

### Fase 1: Planejamento e Análise

**Objetivos da Implementação:**
- Aumentar taxa de conversão em 40%
- Reduzir tempo de resposta em 60%
- Melhorar satisfação do cliente em 35%

**Análise de Requisitos:**
- Mapeamento de processos atuais
- Identificação de pontos de dor
- Definição de métricas de sucesso

### Fase 2: Configuração Técnica

**Configuração do Banco de Dados:**
- Estrutura de tabelas otimizada
- Índices para performance
- Backup e recuperação

**Integração com IA:**
- Configuração de algoritmos
- Treinamento de modelos
- Validação de resultados

### Fase 3: Testes e Validação

**Testes de Performance:**
- Carga de usuários simultâneos
- Tempo de resposta das consultas
- Estabilidade do sistema

**Validação de IA:**
- Precisão das predições
- Qualidade das recomendações
- Feedback dos usuários

## Ferramentas e Tecnologias Recomendadas

### CRM Principais:
1. **Salesforce**: Líder de mercado com IA nativa
2. **HubSpot**: Excelente para marketing automation
3. **Pipedrive**: Foco em vendas e pipeline
4. **Zoho CRM**: Solução completa e acessível

### Plataformas de IA:
1. **IBM Watson**: IA empresarial robusta
2. **Google Cloud AI**: Machine Learning avançado
3. **Microsoft Azure AI**: Integração com Office 365
4. **Amazon SageMaker**: Desenvolvimento de modelos

## Métricas de Sucesso

### KPIs Principais:
- **Taxa de Conversão**: Meta de 40% de aumento
- **Tempo de Resposta**: Redução de 60%
- **Satisfação do Cliente**: Melhoria de 35%
- **ROI**: Retorno de 300% em 12 meses

### Métricas Técnicas:
- **Uptime**: 99.9% de disponibilidade
- **Performance**: < 2 segundos de resposta
- **Escalabilidade**: Suporte a 10.000+ usuários

## Conclusão

A implementação de CRM com IA é um investimento estratégico que pode transformar completamente a gestão de relacionamento com clientes. Com planejamento adequado e execução técnica precisa, os resultados podem superar todas as expectativas.`,
    category: "tech",
    type: "technical",
    imageurl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop&crop=center"
};

// Exemplo 2: Lista Detalhada com Métricas
const example2 = {
    title: "Top 15 Ferramentas de Marketing Digital que Todo Profissional Precisa Conhecer em 2024",
    content: `O marketing digital evolui constantemente, e conhecer as melhores ferramentas é essencial para o sucesso. Esta lista detalhada apresenta as 15 ferramentas mais importantes do mercado atual.

## Categoria: Automação e CRM

### 1. HubSpot - Plataforma Completa
**Preço**: Plano gratuito + planos pagos a partir de $45/mês
**Melhor para**: Empresas que querem tudo em um lugar
**Funcionalidades principais**:
- CRM integrado
- Automação de marketing
- Análise de performance
- Gestão de leads

**Métricas de sucesso**: 95% de satisfação dos usuários

### 2. Salesforce - Líder de Mercado
**Preço**: A partir de $25/usuário/mês
**Melhor para**: Grandes empresas e corporações
**Funcionalidades principais**:
- CRM robusto
- IA integrada (Einstein)
- Customização avançada
- Integrações ilimitadas

**Métricas de sucesso**: 150.000+ empresas clientes

### 3. Pipedrive - Foco em Vendas
**Preço**: A partir de $14.90/usuário/mês
**Melhor para**: Equipes de vendas
**Funcionalidades principais**:
- Pipeline visual
- Automação de vendas
- Relatórios detalhados
- App mobile

**Métricas de sucesso**: 100.000+ empresas ativas

## Categoria: Email Marketing

### 4. Mailchimp - Mais Popular
**Preço**: Plano gratuito + planos pagos a partir de $10/mês
**Melhor para**: Pequenas e médias empresas
**Funcionalidades principais**:
- Templates profissionais
- Automação de campanhas
- Segmentação avançada
- Analytics detalhados

**Métricas de sucesso**: 15 milhões de usuários

### 5. ConvertKit - Para Criadores
**Preço**: A partir de $29/mês
**Melhor para**: Criadores de conteúdo e influencers
**Funcionalidades principais**:
- Automação visual
- Segmentação por tags
- Formulários otimizados
- Integração com e-commerce

**Métricas de sucesso**: 40.000+ criadores ativos

## Categoria: SEO e Conteúdo

### 6. SEMrush - Análise Completa
**Preço**: A partir de $119.95/mês
**Melhor para**: Agências e grandes empresas
**Funcionalidades principais**:
- Pesquisa de palavras-chave
- Análise de concorrentes
- Auditoria de SEO
- Rastreamento de rankings

**Métricas de sucesso**: 7 milhões de usuários

### 7. Ahrefs - Autoridade em SEO
**Preço**: A partir de $99/mês
**Melhor para**: Profissionais de SEO
**Funcionalidades principais**:
- Backlink analysis
- Content explorer
- Keyword research
- Site audit

**Métricas de sucesso**: 1 milhão+ de usuários

## Categoria: Redes Sociais

### 8. Hootsuite - Gestão Completa
**Preço**: A partir de $49/mês
**Melhor para**: Gestão de múltiplas redes
**Funcionalidades principais**:
- Agendamento de posts
- Monitoramento de menções
- Analytics detalhados
- Colaboração em equipe

**Métricas de sucesso**: 18 milhões de usuários

### 9. Buffer - Simplicidade
**Preço**: A partir de $6/canal/mês
**Melhor para**: Pequenas empresas
**Funcionalidades principais**:
- Interface intuitiva
- Agendamento automático
- Analytics básicos
- Integração com Canva

**Métricas de sucesso**: 140.000+ usuários

## Categoria: Análise e Métricas

### 10. Google Analytics - Essencial
**Preço**: Gratuito
**Melhor para**: Todos os tipos de negócio
**Funcionalidades principais**:
- Análise de tráfego
- Comportamento do usuário
- Conversões e objetivos
- Relatórios personalizados

**Métricas de sucesso**: 50 milhões+ de sites

### 11. Hotjar - Comportamento do Usuário
**Preço**: A partir de $32/mês
**Melhor para**: Otimização de conversão
**Funcionalidades principais**:
- Heatmaps
- Gravações de sessão
- Feedback de usuários
- Testes A/B

**Métricas de sucesso**: 500.000+ sites

## Categoria: Design e Criação

### 12. Canva - Design Acessível
**Preço**: Gratuito + Pro a $12.99/mês
**Melhor para**: Não-designers
**Funcionalidades principais**:
- Templates profissionais
- Biblioteca de elementos
- Colaboração em equipe
- Brand kit

**Métricas de sucesso**: 100 milhões+ de usuários

### 13. Figma - Design Colaborativo
**Preço**: Gratuito + planos pagos
**Melhor para**: Designers e equipes
**Funcionalidades principais**:
- Design em tempo real
- Prototipagem
- Sistema de design
- Integrações

**Métricas de sucesso**: 4 milhões+ de usuários

## Categoria: Automação e Integração

### 14. Zapier - Conecta Tudo
**Preço**: A partir de $19.99/mês
**Melhor para**: Automação de processos
**Funcionalidades principais**:
- 5.000+ integrações
- Automação visual
- Workflows complexos
- Triggers personalizados

**Métricas de sucesso**: 6 milhões+ de usuários

### 15. Make (ex-Integromat) - Automação Avançada
**Preço**: A partir de $9/mês
**Melhor para**: Automações complexas
**Funcionalidades principais**:
- Interface visual
- Lógica condicional
- Processamento de dados
- APIs customizadas

**Métricas de sucesso**: 1 milhão+ de usuários

## Como Escolher as Ferramentas Certas

### Critérios de Seleção:
1. **Orçamento disponível**
2. **Tamanho da equipe**
3. **Objetivos específicos**
4. **Integração com sistemas existentes**
5. **Facilidade de uso**

### Implementação Gradual:
- **Fase 1**: Ferramentas essenciais (Google Analytics, Mailchimp)
- **Fase 2**: Automação básica (Zapier, Buffer)
- **Fase 3**: Análise avançada (SEMrush, Hotjar)
- **Fase 4**: Otimização completa (HubSpot, Salesforce)

## Conclusão

Escolher as ferramentas certas de marketing digital é fundamental para o sucesso. Comece com o essencial e evolua gradualmente conforme sua necessidade e orçamento permitem. O importante é manter foco nos resultados e sempre medir o ROI de cada investimento.`,
    category: "marketing",
    type: "list",
    imageurl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop&crop=center"
};

// Exemplo 3: Tutorial Passo a Passo Avançado
const example3 = {
    title: "Tutorial Completo: Como Criar uma Estratégia de Marketing Digital do Zero em 30 Dias",
    content: `Criar uma estratégia de marketing digital eficaz do zero pode parecer intimidante, mas com este guia passo a passo, você terá uma estratégia completa em apenas 30 dias.

## Semana 1: Fundação e Planejamento

### Dia 1-2: Análise de Mercado e Concorrência

**Objetivo**: Entender o mercado e identificar oportunidades

**Passo 1: Análise de Mercado**
- Pesquise o tamanho do mercado
- Identifique tendências emergentes
- Analise sazonalidade
- Defina personas de clientes

**Ferramentas recomendadas**:
- Google Trends
- SEMrush
- Statista
- Facebook Audience Insights

**Passo 2: Análise de Concorrência**
- Liste 5-10 concorrentes principais
- Analise seus pontos fortes e fracos
- Identifique gaps no mercado
- Monitore suas estratégias

**Checklist de análise**:
- [ ] Website e presença digital
- [ ] Estratégia de conteúdo
- [ ] Redes sociais
- [ ] Preços e posicionamento
- [ ] Reviews e feedback

### Dia 3-4: Definição de Objetivos e KPIs

**Objetivo**: Estabelecer metas claras e mensuráveis

**Metodologia SMART**:
- **S**pecífico: Objetivos claros e definidos
- **M**ensurável: Métricas quantificáveis
- **A**tingível: Realistas e possíveis
- **R**elevante: Alinhados com o negócio
- **T**emporal: Com prazo definido

**Exemplos de objetivos**:
- Aumentar tráfego orgânico em 50% em 6 meses
- Gerar 100 leads qualificados por mês
- Aumentar conversão em 25% em 3 meses
- Alcançar 10.000 seguidores no Instagram

**KPIs essenciais**:
- Tráfego do site
- Taxa de conversão
- Custo por lead (CPL)
- ROI das campanhas
- Engajamento nas redes sociais

### Dia 5-7: Criação de Personas e Jornada do Cliente

**Objetivo**: Entender profundamente o público-alvo

**Criação de Personas**:
1. **Coleta de dados**:
   - Entrevistas com clientes
   - Pesquisas online
   - Análise de dados existentes
   - Feedback de vendas

2. **Template de persona**:
   - Nome e foto
   - Demografia
   - Comportamento online
   - Dores e necessidades
   - Objetivos e motivações

**Jornada do Cliente**:
- **Consciência**: Como descobrem o problema
- **Consideração**: Como avaliam soluções
- **Decisão**: Como escolhem a solução
- **Retenção**: Como mantêm o relacionamento

## Semana 2: Estrutura e Conteúdo

### Dia 8-10: Estratégia de Conteúdo

**Objetivo**: Criar um plano de conteúdo eficaz

**Pilares de conteúdo**:
1. **Educacional**: Como fazer, tutoriais, guias
2. **Inspiracional**: Cases de sucesso, histórias
3. **Promocional**: Produtos, serviços, ofertas
4. **Entretenimento**: Conteúdo leve e engajante

**Cronograma de conteúdo**:
- **Segunda**: Post educacional
- **Terça**: Dica rápida
- **Quarta**: Case de sucesso
- **Quinta**: Conteúdo promocional
- **Sexta**: Post de entretenimento

**Formatos de conteúdo**:
- Blog posts
- Vídeos
- Infográficos
- Podcasts
- Webinars
- E-books

### Dia 11-14: SEO e Otimização

**Objetivo**: Otimizar para mecanismos de busca

**Pesquisa de palavras-chave**:
1. **Palavras-chave principais**:
   - Volume de busca
   - Dificuldade
   - Intenção de busca
   - Concorrência

2. **Palavras-chave long-tail**:
   - Menos concorridas
   - Maior intenção de compra
   - Mais específicas

**Otimização on-page**:
- Títulos otimizados (H1, H2, H3)
- Meta descriptions
- Alt text em imagens
- URLs amigáveis
- Velocidade do site

**Ferramentas SEO**:
- Google Keyword Planner
- SEMrush
- Ahrefs
- Yoast SEO
- Google PageSpeed Insights

## Semana 3: Execução e Campanhas

### Dia 15-17: Campanhas de Mídia Paga

**Objetivo**: Criar campanhas eficazes de anúncios

**Google Ads**:
1. **Configuração inicial**:
   - Criação de conta
   - Configuração de conversões
   - Estrutura de campanhas
   - Palavras-chave

2. **Tipos de campanha**:
   - Search (busca)
   - Display (banner)
   - Shopping (produtos)
   - Video (YouTube)

**Facebook Ads**:
1. **Configuração**:
   - Business Manager
   - Pixel de conversão
   - Catálogo de produtos
   - Audiences personalizadas

2. **Formatos de anúncio**:
   - Feed do Facebook
   - Stories
   - Reels
   - Messenger

### Dia 18-21: Automação e Email Marketing

**Objetivo**: Implementar automações eficazes

**Sequências de email**:
1. **Boas-vindas**:
   - Email 1: Apresentação
   - Email 2: Benefícios
   - Email 3: Social proof
   - Email 4: Oferta especial

2. **Nutrição de leads**:
   - Conteúdo educacional
   - Cases de sucesso
   - Dicas práticas
   - Ofertas personalizadas

**Ferramentas de automação**:
- Mailchimp
- HubSpot
- ActiveCampaign
- ConvertKit

## Semana 4: Otimização e Análise

### Dia 22-24: Análise de Dados

**Objetivo**: Medir resultados e otimizar

**Métricas essenciais**:
1. **Tráfego**:
   - Usuários únicos
   - Páginas por sessão
   - Tempo na página
   - Taxa de rejeição

2. **Conversões**:
   - Taxa de conversão
   - Custo por aquisição
   - Valor do cliente
   - ROI das campanhas

**Ferramentas de análise**:
- Google Analytics
- Google Search Console
- Facebook Analytics
- Hotjar

### Dia 25-28: Otimização Contínua

**Objetivo**: Melhorar performance constantemente

**Testes A/B**:
- Títulos de posts
- CTAs (call-to-action)
- Imagens de anúncios
- Páginas de destino
- Emails

**Otimizações**:
- Velocidade do site
- Experiência mobile
- Formulários de contato
- Processo de checkout

### Dia 29-30: Relatório Final e Próximos Passos

**Objetivo**: Documentar resultados e planejar futuro

**Relatório de 30 dias**:
- Metas alcançadas
- Métricas principais
- Lições aprendidas
- Próximos passos

**Planejamento futuro**:
- Estratégias para os próximos 90 dias
- Novos canais a explorar
- Investimentos necessários
- Treinamentos da equipe

## Ferramentas Essenciais para Implementação

### Gratuitas:
- Google Analytics
- Google Search Console
- Facebook Business Manager
- Canva
- Mailchimp (plano gratuito)

### Pagas (investimento inicial):
- SEMrush ($119/mês)
- HubSpot ($45/mês)
- Google Ads (orçamento variável)
- Facebook Ads (orçamento variável)

## Cronograma de Investimento

### Mês 1: $500-1000
- Ferramentas básicas
- Conteúdo inicial
- Campanhas piloto

### Mês 2-3: $1000-2000
- Escala de campanhas
- Ferramentas avançadas
- Automações

### Mês 4-6: $2000-5000
- Otimizações
- Novos canais
- Equipe especializada

## Conclusão

Criar uma estratégia de marketing digital em 30 dias é possível com dedicação e execução disciplinada. O segredo está em começar simples, medir tudo e otimizar constantemente. Lembre-se: marketing digital é uma maratona, não uma corrida de 100 metros.`,
    category: "marketing",
    type: "tutorial",
    imageurl: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop&crop=center"
};

async function addComplexExamples() {
    const examples = [example1, example2, example3];
    
    console.log(`📝 Adicionando ${examples.length} exemplos complexos à fila...\n`);
    
    for (let i = 0; i < examples.length; i++) {
        const example = examples[i];
        
        try {
            console.log(`\n📄 Exemplo ${i + 1}: ${example.title}`);
            console.log('=' .repeat(60));
            
            // Formatar conteúdo
            const formatted = formatter.formatPost(example);
            
            console.log('🎯 Tipo:', formatted.type);
            console.log('📊 Categoria:', formatted.category);
            console.log('📏 Tamanho original:', example.content.length, 'caracteres');
            console.log('📏 Tamanho formatado:', formatted.content.length, 'caracteres');
            
            // Adicionar à fila
            const { data, error } = await supabase
                .from('n8n_blog_queue')
                .insert([{
                    title: formatted.title,
                    content: formatted.content,
                    category: formatted.category,
                    date: new Date().toISOString().split('T')[0],
                    imageurl: example.imageurl,
                    autor: 'LeadBaze Team',
                    processed: false
                }])
                .select()
                .single();
            
            if (error) {
                console.error('❌ Erro:', error);
                continue;
            }
            
            console.log('✅ Exemplo adicionado com sucesso!');
            console.log('🆔 ID:', data.id);
            
        } catch (error) {
            console.error('💥 Erro no exemplo:', error.message);
        }
    }
    
    console.log('\n🎉 Todos os exemplos complexos foram adicionados à fila!');
    console.log('📊 Acesse o Dashboard para processar a fila');
    console.log('🌐 URL: http://localhost:5173/admin/blog-automation');
}

addComplexExamples();
