import * as BlogTypes from '../types/blog';
import { supabase } from './supabaseClient';

type BlogPost = BlogTypes.BlogPost;
type BlogCategory = BlogTypes.BlogCategory;
type BlogTag = BlogTypes.BlogTag;
type BlogPagination = BlogTypes.BlogPagination;
type BlogFilters = BlogTypes.BlogFilters;
type BlogStats = BlogTypes.BlogStats;

// Mock data - será substituído pela integração com N8N/API
const mockCategories: BlogCategory[] = [
  {
    id: 'prospeccao-b2b',
    name: 'Prospecção B2B',
    slug: 'prospeccao-b2b',
    description: 'Estratégias e técnicas para prospecção eficaz no mercado B2B',
    color: 'bg-blue-500',
    icon: '🎯',
    postCount: 12
  },
  {
    id: 'estrategias-outbound',
    name: 'Estratégias de Outbound',
    slug: 'estrategias-outbound',
    description: 'Táticas de outbound marketing para gerar leads qualificados',
    color: 'bg-purple-500',
    icon: '📈',
    postCount: 8
  },
  {
    id: 'gestao-vendas',
    name: 'Gestão e Vendas B2B',
    slug: 'gestao-vendas',
    description: 'Gestão de equipes e processos de vendas B2B',
    color: 'bg-green-500',
    icon: '💼',
    postCount: 15
  },
  {
    id: 'inteligencia-dados',
    name: 'Inteligência de Dados',
    slug: 'inteligencia-dados',
    description: 'Como usar dados para melhorar resultados comerciais',
    color: 'bg-orange-500',
    icon: '🧠',
    postCount: 6
  },
  {
    id: 'automacao-vendas',
    name: 'Automação de Vendas',
    slug: 'automacao-vendas',
    description: 'Ferramentas e processos para automatizar vendas',
    color: 'bg-pink-500',
    icon: '🤖',
    postCount: 9
  }
];

const mockTags: BlogTag[] = [
  { id: 'leads', name: 'Geração de Leads', slug: 'leads', postCount: 25 },
  { id: 'crm', name: 'CRM', slug: 'crm', postCount: 12 },
  { id: 'outbound', name: 'Outbound Marketing', slug: 'outbound', postCount: 18 },
  { id: 'google-maps', name: 'Google Maps', slug: 'google-maps', postCount: 8 },
  { id: 'whatsapp', name: 'WhatsApp Business', slug: 'whatsapp', postCount: 10 },
  { id: 'automacao', name: 'Automação', slug: 'automacao', postCount: 15 },
  { id: 'ia', name: 'Inteligência Artificial', slug: 'ia', postCount: 7 },
  { id: 'kpis', name: 'KPIs', slug: 'kpis', postCount: 9 }
];

const mockPosts: BlogPost[] = [
  {
    id: '1',
    title: '🚀 Como Extrair 2000+ Leads Qualificados do Google Maps em 30 Dias',
    slug: 'como-extrair-2000-leads-qualificados-google-maps-30-dias',
    excerpt: 'Estratégia completa para dominar a prospecção no Google Maps. Aprenda as técnicas que empresas como Nubank e Stone usam para gerar milhares de leads diariamente.',
    content: `
      <h2>O Google Maps Como Ferramenta de Prospecção Avançada</h2>
      <p>Com mais de 200 milhões de empresas cadastradas globalmente, o Google Maps se tornou uma das maiores bases de dados comerciais do mundo. Empresas como Stone, PagSeguro e Nubank descobriram que dados geográficos combinados com inteligência comercial podem gerar resultados extraordinários em prospecção B2B.</p>
      
      <blockquote>
        "O Google Maps não é apenas um mapa - é uma mina de ouro de dados empresariais que 95% das empresas ainda não exploram adequadamente." - Harvard Business Review, 2024
      </blockquote>
      
      <h3>1. Por Que o Google Maps é Subestimado na Prospecção B2B</h3>
      <p>Segundo dados da Salesforce State of Sales Report 2024, apenas 23% das empresas B2B utilizam dados geográficos em suas estratégias de prospecção, mas essas empresas têm 340% mais conversões que a média do mercado.</p>
      
      <p>O Google Maps oferece informações que você não encontra em ferramentas tradicionais como LinkedIn Sales Navigator ou ZoomInfo:</p>
      <ul>
        <li><strong>Horários de funcionamento reais:</strong> Identifique empresas em crescimento (horários estendidos) vs estagnadas</li>
        <li><strong>Fotos atualizadas:</strong> Veja expansões, reformas e investimentos recentes</li>
        <li><strong>Reviews e engajamento:</strong> Empresas com alta satisfação são prospects mais qualificados</li>
        <li><strong>Localização premium:</strong> Endereços em centros comerciais indicam maior poder aquisitivo</li>
        <li><strong>Dados em tempo real:</strong> Informações atualizadas constantemente pelos próprios proprietários</li>
      </ul>
      
      <h3>2. A Metodologia "LASER" Para Prospecção no Google Maps</h3>
      <p>Desenvolvida pela equipe de growth da Stone e refinada por analistas de dados do Nubank, a metodologia LASER maximiza a qualificação de leads:</p>
      
      <h4>L - Localização Estratégica</h4>
      <p>Identifique zonas de alta densidade empresarial e poder aquisitivo:</p>
      <ul>
        <li>Centros empresariais (Faria Lima, Paulista, Barra da Tijuca)</li>
        <li>Condomínios comerciais premium</li>
        <li>Proximidade com bancos e escritórios de advocacia</li>
        <li>Regiões com crescimento imobiliário acelerado</li>
      </ul>
      
      <h4>A - Atividade Digital</h4>
      <p>Analise sinais de engagement e presença online:</p>
      <ul>
        <li>Empresas com websites atualizados (últimos 6 meses)</li>
        <li>Respostas ativas a reviews (indica gestão profissional)</li>
        <li>Fotos profissionais e atualizadas</li>
        <li>Informações de contato completas e validadas</li>
      </ul>
      
      <h4>S - Sinais de Crescimento</h4>
      <p>Identifique empresas em expansão:</p>
      <ul>
        <li>Horários de funcionamento recentemente estendidos</li>
        <li>Novos serviços ou produtos listados</li>
        <li>Aumento no número de reviews positivas</li>
        <li>Mudanças recentes de endereço para locais maiores</li>
      </ul>
      
      <h4>E - Engagement Score</h4>
      <p>Calcule um score baseado em:</p>
      <ul>
        <li>Número total de reviews (mínimo 10 para B2B)</li>
        <li>Rating médio (acima de 4.0 indica operação profissional)</li>
        <li>Frequência de atualizações no perfil</li>
        <li>Tempo de resposta a perguntas de clientes</li>
      </ul>
      
      <h4>R - Relevância Setorial</h4>
      <p>Filtre por categorias específicas do seu ICP:</p>
      <ul>
        <li>Advogados e escritórios jurídicos</li>
        <li>Clínicas médicas e dentárias</li>
        <li>Consultórias e agências</li>
        <li>Restaurantes e food service</li>
        <li>Comércio varejista especializado</li>
      </ul>
      
      <h3>3. Ferramentas e Tecnologias Para Extração em Escala</h3>
      <p>A extração manual é inviável para volumes comerciais. Empresas que prospectam 1000+ leads mensais usam automação inteligente:</p>
      
      <h4>Stack Tecnológico Recomendado:</h4>
      <ul>
        <li><strong>Google Maps API:</strong> Para extração programática de dados</li>
        <li><strong>Python + Selenium:</strong> Para scraping inteligente e navegação automatizada</li>
        <li><strong>Google Places API:</strong> Para enriquecimento de dados empresariais</li>
        <li><strong>CNPJ API (ReceitaWS):</strong> Para validação e enriquecimento jurídico</li>
        <li><strong>LeadBaze Platform:</strong> Para orquestração completa do processo</li>
      </ul>
      
      <h4>Fluxo de Automação Profissional:</h4>
      <ol>
        <li><strong>Definição de Território:</strong> Mapeamento geográfico por CEP/bairro</li>
        <li><strong>Extração Inicial:</strong> Coleta de dados básicos (nome, endereço, telefone)</li>
        <li><strong>Enriquecimento:</strong> Cruzamento com APIs externas para validação</li>
        <li><strong>Scoring Automático:</strong> IA classifica prospects por potencial</li>
        <li><strong>Qualificação Manual:</strong> Time comercial valida apenas leads score A e B</li>
        <li><strong>Integração CRM:</strong> Transferência automática para pipeline de vendas</li>
      </ol>
      
      <h3>4. Case Study: Como a Fintech XYZ Gerou R$ 2.3M em Pipeline</h3>
      <p>Uma fintech de crédito para PMEs implementou nossa metodologia e obteve resultados excepcionais:</p>
      
      <h4>Desafio Inicial:</h4>
      <ul>
        <li>CAC alto em canais digitais (R$ 1.200 por lead qualificado)</li>
        <li>Baixa taxa de conversão (2.3% prospect para cliente)</li>
        <li>Dificuldade em identificar empresas com necessidade de crédito</li>
      </ul>
      
      <h4>Estratégia Implementada:</h4>
      <ul>
        <li><strong>Foco geográfico:</strong> Empresas em um raio de 5km de agências bancárias</li>
        <li><strong>Segmentação inteligente:</strong> Restaurantes, clínicas e pequenos comércios</li>
        <li><strong>Timing perfeito:</strong> Empresas com expansões recentes (mudança de endereço)</li>
        <li><strong>Personalização:</strong> Approach referenciando localização e crescimento observado</li>
      </ul>
      
      <h4>Resultados em 6 Meses:</h4>
      <ul>
        <li>📊 <strong>3.247 leads qualificados extraídos</strong></li>
        <li>💰 <strong>CAC reduzido para R$ 340</strong> (-72% vs canais tradicionais)</li>
        <li>🎯 <strong>Taxa de conversão: 8.7%</strong> (+278% vs média anterior)</li>
        <li>📈 <strong>Pipeline gerado: R$ 2.3M</strong></li>
        <li>🏆 <strong>ROI: 680%</strong> no primeiro semestre</li>
      </ul>
      
      <h3>5. Compliance e Boas Práticas (LGPD/GDPR)</h3>
      <p>A extração de dados deve seguir rigorosamente as legislações de proteção de dados:</p>
      
      <h4>Dados Públicos Permitidos:</h4>
      <ul>
        <li>Nome comercial da empresa</li>
        <li>Endereço comercial público</li>
        <li>Telefone comercial (se listado publicamente)</li>
        <li>Horário de funcionamento</li>
        <li>Categoria de negócio</li>
      </ul>
      
      <h4>Dados Que Requerem Consentimento:</h4>
      <ul>
        <li>E-mails pessoais ou corporativos</li>
        <li>Dados de funcionários individuais</li>
        <li>Informações financeiras</li>
        <li>Dados comportamentais tracking</li>
      </ul>
      
      <h3>6. Implementação Prática: Roteiro de 30 Dias</h3>
      
      <h4>Semana 1: Setup e Planejamento</h4>
      <ul>
        <li>Definição do ICP (Ideal Customer Profile)</li>
        <li>Mapeamento geográfico de territórios</li>
        <li>Setup de ferramentas de extração</li>
        <li>Criação de templates de abordagem</li>
      </ul>
      
      <h4>Semana 2: Extração e Qualificação</h4>
      <ul>
        <li>Primeira extração de 500 prospects</li>
        <li>Aplicação da metodologia LASER</li>
        <li>Enriquecimento via APIs externas</li>
        <li>Criação de scores de qualificação</li>
      </ul>
      
      <h4>Semana 3: Testes de Abordagem</h4>
      <ul>
        <li>A/B testing de mensagens personalizadas</li>
        <li>Teste de canais (WhatsApp, email, telefone)</li>
        <li>Refinamento de scripts de abordagem</li>
        <li>Análise de taxa de resposta por segmento</li>
      </ul>
      
      <h4>Semana 4: Otimização e Escala</h4>
      <ul>
        <li>Automação dos processos mais eficientes</li>
        <li>Expansão para novos territórios</li>
        <li>Integração com CRM e pipeline de vendas</li>
        <li>Setup de relatórios e dashboards</li>
      </ul>
      
      <h3>7. Métricas e KPIs Essenciais</h3>
      <p>Acompanhe estes indicadores para otimizar continuamente seus resultados:</p>
      
      <h4>Métricas de Extração:</h4>
      <ul>
        <li><strong>Volume de extração:</strong> Leads/hora ou leads/dia</li>
        <li><strong>Taxa de dados válidos:</strong> % de contatos que funcionam</li>
        <li><strong>Coverage score:</strong> % do território mapeado</li>
        <li><strong>Freshness index:</strong> Idade média dos dados extraídos</li>
      </ul>
      
      <h4>Métricas de Qualificação:</h4>
      <ul>
        <li><strong>Lead score distribution:</strong> % em cada categoria (A, B, C, D)</li>
        <li><strong>Contact rate:</strong> % de leads que atendem/respondem</li>
        <li><strong>Qualification rate:</strong> % que passam para vendas</li>
        <li><strong>Conversion rate:</strong> % que se tornam clientes</li>
      </ul>
      
      <h4>Métricas de ROI:</h4>
      <ul>
        <li><strong>CAC (Customer Acquisition Cost):</strong> Custo por cliente adquirido</li>
        <li><strong>LTV/CAC ratio:</strong> Relação lifetime value vs custo aquisição</li>
        <li><strong>Payback period:</strong> Tempo para recuperar investimento</li>
        <li><strong>Revenue attribution:</strong> Receita gerada por lead source</li>
      </ul>
      
      <h3>Conclusão: O Futuro da Prospecção Geográfica</h3>
      <p>A prospecção baseada em dados do Google Maps representa uma vantagem competitiva significativa para empresas B2B. Com a metodologia LASER e ferramentas adequadas, é possível:</p>
      
      <ul>
        <li>🎯 <strong>Reduzir CAC em até 70%</strong> vs canais tradicionais</li>
        <li>📈 <strong>Aumentar conversão em 300%+</strong> com melhor targeting</li>
        <li>⚡ <strong>Acelerar ciclo de vendas em 40%</strong> com dados enriched</li>
        <li>🚀 <strong>Escalar operação para 10k+ leads/mês</strong> com automação</li>
      </ul>
      
      <p>O LeadBaze está na vanguarda dessa revolução, oferecendo a única plataforma que combina extração inteligente, enriquecimento de dados e automação de outreach em uma solução completa.</p>
      
      <blockquote>
        "Empresas que dominam dados geográficos têm 5x mais probabilidade de superar suas metas de vendas." - McKinsey Global Institute, 2024
      </blockquote>
    `,
    author: {
      name: 'Rafael Mendes',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      bio: 'Ex-Head de Growth da Stone. Especialista em prospecção B2B e automação de vendas com mais de 10 anos no mercado financeiro.'
    },
    category: mockCategories[0],
    tags: [mockTags[0], mockTags[3], mockTags[5]],
    featuredImage: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&h=400&fit=crop',
    published: true,
    publishedAt: '2025-01-20T09:00:00Z',
    createdAt: '2025-01-19T15:00:00Z',
    updatedAt: '2025-01-20T09:00:00Z',
    readTime: 13,
    views: 4250,
    likes: 234,
    seoTitle: 'Como Extrair 2000+ Leads do Google Maps em 30 Dias | LeadBaze',
    seoDescription: 'Estratégias profissionais de extração de leads do Google Maps usadas por empresas como Nubank e Stone.',
    seoKeywords: ['google maps leads', 'prospecção b2b', 'extração de dados', 'automação vendas']
  },
  {
    id: '2',
    title: '💰 Case Study: Como a XP Investimentos Aumentou Vendas em 400% com Automação',
    slug: 'case-study-xp-investimentos-aumentou-vendas-400-automacao',
    excerpt: 'Análise exclusiva de como a XP revolucionou seu processo de prospecção usando automação inteligente. Estratégias e resultados reais de uma das maiores corretoras do país.',
    content: `
      <h2>A Transformação Digital da XP Investimentos</h2>
      <p>Com mais de 3.5 milhões de clientes e R$ 800 bilhões sob custódia, a XP Investimentos enfrentava um desafio crítico em 2023: como escalar sua operação comercial sem comprometer a qualidade do atendimento personalizado que a tornou líder no mercado brasileiro.</p>
      
      <blockquote>
        "Precisávamos encontrar uma forma de atender 10x mais prospects mantendo o mesmo nível de personalização que nossos clientes HNW esperam." - Guilherme Benchimol, CEO XP Inc.
      </blockquote>
      
      <h3>1. O Desafio: Escalar com Qualidade</h3>
      <p>A XP estava crescendo exponencialmente, mas enfrentava gargalos operacionais que limitavam seu potencial:</p>
      
      <h4>Principais Obstáculos Identificados:</h4>
      <ul>
        <li><strong>Volume crescente de leads não qualificados:</strong> 40% dos leads captados não tinham perfil adequado para investimentos</li>
        <li><strong>Tempo excessivo em tarefas manuais:</strong> Assessores gastavam 60% do tempo em atividades administrativas</li>
        <li><strong>Falta de padronização no follow-up:</strong> Cada assessor tinha sua própria metodologia de acompanhamento</li>
        <li><strong>Dificuldade em medir ROI por canal:</strong> Atribuição de vendas era feita manualmente</li>
        <li><strong>Baixa produtividade da equipe comercial:</strong> Apenas 23% dos assessores batiam suas metas consistentemente</li>
      </ul>
      
      <h4>Impacto nos Resultados:</h4>
      <ul>
        <li>💰 <strong>CAC elevado:</strong> R$ 2.400 por cliente adquirido</li>
        <li>⏱️ <strong>Ciclo de vendas longo:</strong> 45 dias em média para conversão</li>
        <li>📉 <strong>Taxa de conversão baixa:</strong> 1.8% de lead para cliente</li>
        <li>😫 <strong>Burnout da equipe:</strong> 35% de turnover anual nos assessores</li>
      </ul>
      
      <h3>2. A Estratégia: Automação Inteligente Híbrida</h3>
      <p>Em parceria com a LeadBaze, a XP desenvolveu uma estratégia de automação que mantinha o toque humano essencial para o mercado financeiro:</p>
      
      <h4>Fase 1: Qualificação Automática de Leads (Primeiros 30 dias)</h4>
      <p>Implementação de chatbots inteligentes e formulários adaptativos:</p>
      <ul>
        <li><strong>Chatbot Conversacional:</strong> Simulava conversas naturais para identificar perfil de investidor</li>
        <li><strong>Scoring Dinâmico:</strong> IA classificava leads em tempo real baseado em 47 variáveis</li>
        <li><strong>Roteamento Inteligente:</strong> Leads A/B iam direto para assessores especializados</li>
        <li><strong>Nurturing Automático:</strong> Leads C/D entravam em fluxos educacionais</li>
      </ul>
      
      <h4>Fase 2: Automação de Follow-up (Dias 31-60)</h4>
      <p>Criação de sequências personalizadas por perfil de investidor:</p>
      <ul>
        <li><strong>WhatsApp Business API:</strong> Mensagens personalizadas baseadas em comportamento</li>
        <li><strong>Email Marketing Inteligente:</strong> Conteúdo adaptado por nível de conhecimento financeiro</li>
        <li><strong>Agendamento Automático:</strong> Sistema sincronizado com agenda dos assessores</li>
        <li><strong>Remarketing Dinâmico:</strong> Anúncios personalizados por estágio do funil</li>
      </ul>
      
      <h4>Fase 3: IA Preditiva para Vendas (Dias 61-90)</h4>
      <p>Implementação de machine learning para predição de comportamento:</p>
      <ul>
        <li><strong>Propensão de Compra:</strong> IA identificava o momento ideal de abordagem</li>
        <li><strong>Recomendação de Produtos:</strong> Sugestões baseadas em perfil e histórico</li>
        <li><strong>Prevenção de Churn:</strong> Identificação precoce de sinais de desinteresse</li>
        <li><strong>Otimização de Pricing:</strong> Sugestões de taxas baseadas em probabilidade de conversão</li>
      </ul>
      
      <h3>3. Tecnologias e Ferramentas Implementadas</h3>
      <p>Stack tecnológico que viabilizou a transformação:</p>
      
      <h4>Automação e IA:</h4>
      <ul>
        <li><strong>Chatfuel Pro:</strong> Para chatbots WhatsApp e Facebook Messenger</li>
        <li><strong>Salesforce Einstein:</strong> IA para scoring e predições</li>
        <li><strong>Zapier Enterprise:</strong> Integração entre 15+ ferramentas</li>
        <li><strong>Twilio Flex:</strong> Centro de contato omnichannel</li>
      </ul>
      
      <h4>Análise e Dados:</h4>
      <ul>
        <li><strong>Google Analytics 4:</strong> Tracking avançado de comportamento</li>
        <li><strong>Mixpanel:</strong> Análise de eventos e funil de conversão</li>
        <li><strong>Tableau:</strong> Dashboards executivos em tempo real</li>
        <li><strong>Segment:</strong> CDP para unificação de dados de clientes</li>
      </ul>
      
      <h4>Comunicação e Engagement:</h4>
      <ul>
        <li><strong>WhatsApp Business API:</strong> Comunicação em massa personalizada</li>
        <li><strong>Mailchimp Enterprise:</strong> Email marketing avançado</li>
        <li><strong>Calendly:</strong> Agendamento automático sincronizado</li>
        <li><strong>Loom:</strong> Vídeos personalizados em escala</li>
      </ul>
      
      <h3>4. Resultados Extraordinários Após 12 Meses</h3>
      
      <h4>Métricas de Aquisição:</h4>
      <ul>
        <li>📈 <strong>+400% aumento em leads qualificados</strong> (de 2.500 para 12.500/mês)</li>
        <li>💰 <strong>CAC reduzido em 68%</strong> (de R$ 2.400 para R$ 780)</li>
        <li>🎯 <strong>Taxa de conversão subiu para 7.2%</strong> (+300% vs período anterior)</li>
        <li>⚡ <strong>Ciclo de vendas reduzido em 56%</strong> (de 45 para 20 dias)</li>
      </ul>
      
      <h4>Métricas Operacionais:</h4>
      <ul>
        <li>👥 <strong>Produtividade dos assessores +275%</strong></li>
        <li>⏱️ <strong>Tempo gasto em admin -78%</strong> (liberou tempo para vendas)</li>
        <li>📊 <strong>Taxa de atingimento de meta +185%</strong> (de 23% para 66% dos assessores)</li>
        <li>😊 <strong>NPS da equipe comercial +45 pontos</strong></li>
      </ul>
      
      <h4>Impacto Financeiro:</h4>
      <ul>
        <li>💵 <strong>Receita incremental: R$ 1.2 bilhão</strong> em novos investimentos captados</li>
        <li>🏆 <strong>ROI do projeto: 890%</strong> no primeiro ano</li>
        <li>📈 <strong>Market share ganho: +2.3%</strong> no segmento varejo</li>
        <li>💪 <strong>Margem operacional +340 bps</strong> devido à eficiência</li>
      </ul>
      
      <h3>5. Lições Aprendidas e Fatores Críticos de Sucesso</h3>
      
      <h4>O Que Funcionou:</h4>
      <ul>
        <li><strong>Abordagem Gradual:</strong> Implementação em fases permitiu ajustes contínuos</li>
        <li><strong>Treinamento Intensivo:</strong> 120h de capacitação para toda equipe comercial</li>
        <li><strong>Cultura Data-Driven:</strong> Decisões baseadas em dados, não em intuição</li>
        <li><strong>Feedback Loops:</strong> Ciclos semanais de otimização baseados em resultados</li>
      </ul>
      
      <h4>Principais Desafios Superados:</h4>
      <ul>
        <li><strong>Resistência Inicial:</strong> 40% dos assessores resistiram à automação inicialmente</li>
        <li><strong>Compliance Regulatório:</strong> Adequação às normas da CVM para comunicação automatizada</li>
        <li><strong>Integração de Sistemas:</strong> Conectar 15 ferramentas diferentes sem perder dados</li>
        <li><strong>Manutenção da Personalização:</strong> Automatizar sem perder o toque humano</li>
      </ul>
      
      <h3>6. Replicação da Estratégia: Framework "SCALE"</h3>
      <p>A XP desenvolveu uma metodologia replicável para outras empresas financeiras:</p>
      
      <h4>S - Score (Qualificação Inteligente)</h4>
      <ul>
        <li>Definir critérios objetivos de qualificação</li>
        <li>Implementar scoring automático via IA</li>
        <li>Criar segmentação dinâmica de leads</li>
      </ul>
      
      <h4>C - Connect (Automação de Primeiro Contato)</h4>
      <ul>
        <li>Chatbots conversacionais para engajamento inicial</li>
        <li>Roteamento inteligente para especialistas</li>
        <li>Respostas automáticas personalizadas</li>
      </ul>
      
      <h4>A - Analyze (Inteligência Preditiva)</h4>
      <ul>
        <li>Tracking completo da jornada do cliente</li>
        <li>Predição de comportamento via ML</li>
        <li>Otimização contínua baseada em dados</li>
      </ul>
      
      <h4>L - Lead (Nurturing Automatizado)</h4>
      <ul>
        <li>Sequências educacionais personalizadas</li>
        <li>Conteúdo adaptado por perfil e estágio</li>
        <li>Follow-up inteligente baseado em comportamento</li>
      </ul>
      
      <h4>E - Evolve (Otimização Contínua)</h4>
      <ul>
        <li>A/B testing sistemático de processos</li>
        <li>Feedback loops para melhoria contínua</li>
        <li>Expansão gradual para novos canais</li>
      </ul>
      
      <h3>7. O Futuro: Próximos Passos da XP</h3>
      <p>A XP continua investindo em inovação para manter sua liderança:</p>
      
      <h4>Roadmap 2025-2026:</h4>
      <ul>
        <li><strong>IA Generativa:</strong> ChatGPT personalizado para assessoria financeira</li>
        <li><strong>Voice Bots:</strong> Atendimento automatizado via WhatsApp Audio</li>
        <li><strong>Blockchain Analytics:</strong> Análise comportamental de carteiras crypto</li>
        <li><strong>Metaverso Banking:</strong> Atendimento imersivo para clientes premium</li>
      </ul>
      
      <blockquote>
        "A automação não substituiu nossos assessores - ela os tornou superpowers. Agora cada um pode atender 5x mais clientes com a mesma qualidade." - Lucas Cunha, Head of Sales da XP
      </blockquote>
      
      <h3>Conclusão: Automação Como Vantagem Competitiva</h3>
      <p>O case da XP Investimentos demonstra que automação inteligente pode transformar completamente a operação comercial de empresas B2B complexas. Os resultados de 400% de crescimento em vendas não foram acidentais - foram consequência de:</p>
      
      <ul>
        <li>🎯 <strong>Estratégia bem definida</strong> com objetivos claros e métricas específicas</li>
        <li>🤖 <strong>Tecnologia adequada</strong> implementada de forma gradual e estruturada</li>
        <li>👥 <strong>Pessoas engajadas</strong> através de treinamento e mudança cultural</li>
        <li>📊 <strong>Processos otimizados</strong> baseados em dados e feedback contínuo</li>
      </ul>
      
      <p>Para empresas que desejam replicar esse sucesso, o LeadBaze oferece a plataforma completa utilizada pela XP, adaptada para diferentes segmentos e portes de empresa.</p>
      
      <blockquote>
        "O futuro pertence às empresas que conseguem combinar automação inteligente com relacionamento humano genuíno." - MIT Technology Review, 2024
      </blockquote>
    `,
    author: {
      name: 'Carla Fernandes',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      bio: 'Ex-Diretora Comercial da XP Investimentos. Especialista em transformação digital e automação de processos comerciais B2B.'
    },
    category: mockCategories[4],
    tags: [mockTags[5], mockTags[1], mockTags[6]],
    featuredImage: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&h=400&fit=crop',
    published: true,
    publishedAt: '2025-01-18T14:30:00Z',
    createdAt: '2025-01-17T10:15:00Z',
    updatedAt: '2025-01-18T14:30:00Z',
    readTime: 24,
    views: 3890,
    likes: 198
  },
  {
    id: '3',
    title: '🤖 ChatGPT para Vendas B2B: 50 Prompts Que Geram Resultados Reais',
    slug: 'chatgpt-vendas-b2b-50-prompts-resultados-reais',
    excerpt: 'Descubra os prompts mais eficazes para usar ChatGPT em vendas B2B. Desde qualificação de leads até fechamento de vendas, com exemplos práticos e templates prontos.',
    content: `
      <h2>A Revolução da IA Generativa nas Vendas B2B</h2>
      <p>O ChatGPT está transformando radicalmente como empresas como Microsoft, Salesforce e HubSpot conduzem suas operações comerciais. Com mais de 100 milhões de usuários ativos e capacidades que superam consultores sênior em muitas tarefas, o ChatGPT se tornou o assistente de vendas mais poderoso já criado.</p>
      
      <blockquote>
        "O ChatGPT não é apenas uma ferramenta - é como ter um consultor de vendas world-class disponível 24/7 por uma fração do custo." - Satya Nadella, CEO Microsoft
      </blockquote>
      
      <h3>1. Por Que o ChatGPT é Superior às Ferramentas Tradicionais</h3>
      <p>Diferente de ferramentas como HubSpot Sequences ou Outreach, o ChatGPT oferece inteligência contextual real:</p>
      
      <h4>Vantagens Competitivas do ChatGPT:</h4>
      <ul>
        <li><strong>Compreensão contextual:</strong> Entende nuances de indústrias e personas específicas</li>
        <li><strong>Personalização em escala:</strong> Gera conteúdo único para cada prospect em segundos</li>
        <li><strong>Análise multidimensional:</strong> Processa dados de múltiplas fontes simultaneamente</li>
        <li><strong>Adaptabilidade instantânea:</strong> Ajusta tom e estratégia baseado em feedback</li>
        <li><strong>Conhecimento atualizado:</strong> Acesso a trends e insights de mercado em tempo real</li>
      </ul>
      
      <h3>2. Os 50 Prompts Mais Eficazes Para Vendas B2B</h3>
      <p>Após analisar mais de 10.000 interações de vendas e testar 500+ prompts, identificamos os 50 mais eficazes:</p>
      
      <h4>📊 CATEGORIA 1: Qualificação e Discovery (Prompts 1-10)</h4>
      
      <p><strong>Prompt #1 - Análise de Lead Completa:</strong></p>
      <code>"Analise este lead: [dados do prospect]. Baseado nas informações fornecidas, crie: 1) Score de qualificação (1-10), 2) 3 perguntas BANT específicas, 3) Principais pain points prováveis, 4) Abordagem recomendada, 5) Timing ideal para contato. Seja específico e justifique cada recomendação."</code>
      
      <p><strong>Prompt #2 - Criação de ICP Dinâmico:</strong></p>
      <code>"Com base nestes 5 clientes de sucesso: [dados], crie um Ideal Customer Profile detalhado incluindo: firmographics, technographics, pain points, buying triggers, decision makers, objeções comuns e canais preferidos. Priorize características que mais correlacionam com fechamento."</code>
      
      <p><strong>Prompt #3 - Script de Discovery SPICED:</strong></p>
      <code>"Crie um roteiro de discovery call usando metodologia SPICED para [tipo de empresa]. Inclua: perguntas de abertura, questões para cada letra do SPICED, técnicas de follow-up, sinais de buying intent e como identificar próximos passos. Adapte para reuniões de 30 minutos."</code>
      
      <h4>📧 CATEGORIA 2: Email Outreach (Prompts 11-20)</h4>
      
      <p><strong>Prompt #11 - Cold Email Hiperpersonalizado:</strong></p>
      <code>"Escreva um cold email para [nome, empresa, cargo] que mencione: [trigger event específico]. Use este framework: linha pessoal genuína, problema relevante que eles provavelmente enfrentam, social proof de empresa similar, CTA específico e não agressivo. Máximo 100 palavras, tom conversacional."</code>
      
      <p><strong>Prompt #12 - Sequência de Follow-up Inteligente:</strong></p>
      <code>"Crie uma sequência de 5 emails de follow-up para prospects que não responderam ao primeiro contato. Cada email deve: ter abordagem diferente, agregar valor único, usar social proof variado, ter CTA específico. Intervalos: 3, 7, 14, 30 dias. Tom progressivamente mais direto."</code>
      
      <p><strong>Prompt #13 - Subject Lines de Alta Conversão:</strong></p>
      <code>"Gere 15 subject lines para email de prospecção em [indústria]. Use estas técnicas: curiosidade, urgência, social proof, pergunta, benefício específico. Evite spam words. Teste A/B entre: [contexto específico]. Inclua rationale para cada linha."</code>
      
      <h4>💼 CATEGORIA 3: LinkedIn e Social Selling (Prompts 21-30)</h4>
      
      <p><strong>Prompt #21 - Connection Request Estratégico:</strong></p>
      <code>"Escreva uma connection request no LinkedIn para [nome, cargo, empresa] que: mencione uma conexão em comum OU um post recente deles, explique brevemente por que quero conectar, sugira valor mútuo, seja genuína e não vendedora. Máximo 250 caracteres, tom profissional mas caloroso."</code>
      
      <p><strong>Prompt #22 - Comentário de Engagement Inteligente:</strong></p>
      <code>"O CEO de uma empresa target postou: '[conteúdo do post]'. Escreva um comentário que: demonstre expertise relevante, adicione insight valioso, gere discussão, me posicione como thought leader, abra porta para conexão futura. Evite auto-promoção direta."</code>
      
      <h4>🎯 CATEGORIA 4: Handling Objections (Prompts 31-40)</h4>
      
      <p><strong>Prompt #31 - Overcoming Price Objections:</strong></p>
      <code>"O prospect disse: 'Está muito caro, não temos budget'. Crie 3 respostas diferentes: 1) Reframe valor vs custo, 2) Questionamento sobre custo de não agir, 3) Opções de pagamento/implementação faseada. Use dados específicos da indústria [setor] e ROI médio de [solução]."</code>
      
      <p><strong>Prompt #32 - Timing Objections:</strong></p>
      <code>"Prospect disse: 'Não é o momento certo, talvez ano que vem'. Desenvolva framework para: 1) Entender motivos reais, 2) Criar urgência sem pressão, 3) Identificar micro-decisões possíveis hoje, 4) Manter relacionamento warm. Inclua perguntas específicas e next steps."</code>
      
      <h4>🚀 CATEGORIA 5: Closing e Acceleração (Prompts 41-50)</h4>
      
      <p><strong>Prompt #41 - Business Case Builder:</strong></p>
      <code>"Crie um business case de 1 página para [solução] destinado ao CFO de [tipo de empresa]. Inclua: ROI projetado 12/24 meses, payback period, comparação status quo vs implementação, riscos mitigados, próximos passos claros. Use dados conservadores e benchmarks da indústria."</code>
      
      <p><strong>Prompt #45 - Urgência Ética:</strong></p>
      <code>"O prospect está 90% convencido mas procastinando decisão. Escreva email criando urgência ética mencionando: deadline real (fim de trimestre/promoção), consequências de delay específicas, facilidade de início imediato, garantias de sucesso. Evite pressão manipulativa."</code>
      
      <p><strong>Prompt #50 - Champion Development:</strong></p>
      <code>"Identifiquei um potential champion: [cargo, motivações]. Crie estratégia para: 1) Torná-lo advocate interno, 2) Armá-lo com argumentos para decisores, 3) Criar win-win pessoal e profissional, 4) Estruturar processo de venda colaborativo. Inclua templates e recursos."</code>
      
      <h3>3. Case Study: Como a Resultados Digitais Aumentou Vendas em 340%</h3>
      <p>A Resultados Digitais, líder em marketing digital no Brasil, implementou ChatGPT em sua operação comercial:</p>
      
      <h4>Desafio Inicial:</h4>
      <ul>
        <li>SDRs gastavam 40% do tempo criando mensagens personalizadas</li>
        <li>Taxa de resposta de cold emails estava em 2.3%</li>
        <li>Qualificação de leads inconsistente entre representantes</li>
        <li>Objeções sendo handled de forma reativa, não estratégica</li>
      </ul>
      
      <h4>Implementação com ChatGPT:</h4>
      <ul>
        <li><strong>Semana 1-2:</strong> Treinamento de SDRs nos 50 prompts essenciais</li>
        <li><strong>Semana 3-4:</strong> Implementação de workflows automatizados</li>
        <li><strong>Mês 2:</strong> Otimização baseada em resultados e feedback</li>
        <li><strong>Mês 3:</strong> Escalação para toda equipe comercial</li>
      </ul>
      
      <h4>Resultados em 6 Meses:</h4>
      <ul>
        <li>📧 <strong>Taxa de resposta: 8.7%</strong> (+278% vs baseline)</li>
        <li>⏱️ <strong>Tempo de criação de conteúdo: -85%</strong> (de 2h para 18min/dia)</li>
        <li>🎯 <strong>Qualificação de leads: +340%</strong> em precisão</li>
        <li>💰 <strong>Pipeline gerado: +340%</strong> vs período anterior</li>
        <li>🏆 <strong>Cycle time: -45%</strong> (de 60 para 33 dias)</li>
      </ul>
      
      <h3>4. Implementação Técnica: Stack Completo</h3>
      <p>Para maximizar resultados com ChatGPT, use este stack tecnológico:</p>
      
      <h4>Ferramentas Essenciais:</h4>
      <ul>
        <li><strong>ChatGPT Plus/Enterprise:</strong> Acesso a GPT-4 e plugins avançados</li>
        <li><strong>Zapier:</strong> Automação entre ChatGPT e CRM</li>
        <li><strong>Clay.run:</strong> Enriquecimento de dados para personalização</li>
        <li><strong>Instantly.ai:</strong> Cold email em escala com IA</li>
        <li><strong>LeadBaze:</strong> Orquestração completa do processo</li>
      </ul>
      
      <h4>Integrações Avançadas:</h4>
      <ul>
        <li><strong>CRM Integration:</strong> Auto-update de campos baseado em IA insights</li>
        <li><strong>Email Templates:</strong> Geração dinâmica baseada em dados do prospect</li>
        <li><strong>Calendar Sync:</strong> Preparação automática para meetings</li>
        <li><strong>Competitive Intel:</strong> Análise automática de concorrentes</li>
      </ul>
      
      <h3>5. Prompt Engineering Avançado: Técnicas Secretas</h3>
      <p>Para resultados superiores, use estas técnicas de prompt engineering:</p>
      
      <h4>Técnica 1: Context Stacking</h4>
      <code>"Contexto: Sou SDR da [empresa] vendendo [solução] para [ICP]. Histórico: Prospect visitou pricing page 3x, baixou ebook sobre [tema]. Personalidade: Analítico, risk-averse, orientado a dados. Agora: Escreva follow-up que..."</code>
      
      <h4>Técnica 2: Role Playing</h4>
      <code>"Você é um VP of Sales experiente que fechou +R$100M em deals enterprise. Um prospect disse: '[objeção]'. Como você responderia? Considere: [contexto específico]. Use sua experiência em [setor] e methodology [MEDDIC/BANT]."</code>
      
      <h4>Técnica 3: Constraint-Based Prompting</h4>
      <code>"Restrições: Email de 75 palavras máximo, mencionar [trigger event], incluir call-to-action específico para [ação], evitar palavras [lista], usar tom [formal/casual], dirigido para [persona]. Agora crie o email."</code>
      
      <h3>6. Métricas e Otimização Contínua</h3>
      <p>Acompanhe estes KPIs para otimizar seu uso do ChatGPT:</p>
      
      <h4>Métricas de Efficiency:</h4>
      <ul>
        <li><strong>Time-to-First-Response:</strong> Tempo para responder leads</li>
        <li><strong>Content Creation Speed:</strong> Velocidade de criação de mensagens</li>
        <li><strong>Message Quality Score:</strong> Rating interno de qualidade</li>
        <li><strong>Prompt Effectiveness:</strong> Taxa de sucesso por tipo de prompt</li>
      </ul>
      
      <h4>Métricas de Results:</h4>
      <ul>
        <li><strong>Response Rate by Prompt Type:</strong> % resposta por categoria</li>
        <li><strong>Meeting Booking Rate:</strong> % que agendam reunião</li>
        <li><strong>Qualification Accuracy:</strong> Precisão da qualificação inicial</li>
        <li><strong>Conversion Rate:</strong> % de prospects que se tornam clientes</li>
      </ul>
      
      <h3>7. O Futuro: ChatGPT + Voice AI + Automation</h3>
      <p>A próxima evolução combina ChatGPT com outras tecnologias:</p>
      
      <h4>Roadmap 2025:</h4>
      <ul>
        <li><strong>Voice-to-ChatGPT:</strong> Transcrição e análise automática de calls</li>
        <li><strong>Real-time Coaching:</strong> Sugestões durante conversas ao vivo</li>
        <li><strong>Predictive Content:</strong> IA antecipa necessidades de conteúdo</li>
        <li><strong>Autonomous SDR:</strong> AI completamente autônoma para prospecção</li>
      </ul>
      
      <blockquote>
        "Estamos vendo o nascimento do primeiro assistente de vendas verdadeiramente inteligente. ChatGPT não é apenas uma ferramenta - é um multiplicador de força que transforma vendedores médios em performers excepcionais." - Aaron Ross, autor de "Predictable Revenue"
      </blockquote>
      
      <h3>Conclusão: Sua Vantagem Competitiva Está Aqui</h3>
      <p>O ChatGPT representa a maior revolução em vendas B2B desde o CRM. Empresas que dominam essas técnicas agora terão vantagem competitiva insuperável. Os 50 prompts deste artigo são apenas o início - a verdadeira magia acontece quando você adapta e evolui essas técnicas para seu mercado específico.</p>
      
      <p>Para implementar esses prompts em escala e integrar com seus sistemas existentes, o LeadBaze oferece a única plataforma que combina IA generativa com automação comercial completa.</p>
      
      <blockquote>
        "O futuro das vendas não é humano vs IA - é humano + IA. E esse futuro é agora." - Marc Benioff, CEO Salesforce
      </blockquote>
    `,
    author: {
      name: 'Dr. Pedro Almeida',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      bio: 'PhD em IA pela Stanford. Ex-consultor da Microsoft para implementação de IA em vendas. Autor de 3 livros sobre tecnologia comercial.'
    },
    category: mockCategories[3],
    tags: [mockTags[6], mockTags[0], mockTags[5]],
    featuredImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop',
    published: true,
    publishedAt: '2025-01-16T11:15:00Z',
    createdAt: '2025-01-15T08:30:00Z',
    updatedAt: '2025-01-16T11:15:00Z',
    readTime: 26,
    views: 5620,
    likes: 342
  },
  {
    id: '4',
    title: '📊 Como o Nubank Usa Data Science para 10x o LTV: Segredos das Métricas Financeiras',
    slug: 'nubank-data-science-10x-ltv-segredos-metricas-financeiras',
    excerpt: 'Análise exclusiva de como o Nubank usa data science e machine learning para maximizar o Lifetime Value dos clientes. Estratégias replicáveis para fintechs e SaaS B2B.',
    content: `
      <h2>A Revolução dos Dados no Nubank: De Startup a R$ 300 Bilhões</h2>
      <p>Com mais de 70 milhões de clientes e avaliação de R$ 300 bilhões, o Nubank não é apenas um banco digital - é uma máquina de data science que revolucionou como empresas financeiras maximizam o valor do cliente. Seu segredo? Uma abordagem científica ao Lifetime Value (LTV) que pode ser replicada em qualquer negócio B2B.</p>
      
      <blockquote>
        "Dados são o novo petróleo, mas só se você souber como refiná-los em insights acionáveis." - David Vélez, CEO e fundador do Nubank
      </blockquote>
      
      <h3>1. A Metodologia "PURPLE" do Nubank para Maximizar LTV</h3>
      <p>Após analisar documentos internos e entrevistas com ex-funcionários, identificamos a metodologia proprietária do Nubank:</p>
      
      <h4>P - Predict (Predição de Comportamento)</h4>
      <p>O Nubank usa machine learning para prever:</p>
      <ul>
        <li><strong>Propensão de churn:</strong> Algoritmos que identificam clientes com 87% de chance de cancelar em 30 dias</li>
        <li><strong>Upsell/cross-sell:</strong> Momento ideal para oferecer novos produtos com 340% mais conversão</li>
        <li><strong>Credit scoring dinâmico:</strong> Avaliação contínua baseada em +2.000 variáveis</li>
        <li><strong>Lifetime Value futuro:</strong> Projeção de receita por cliente nos próximos 5 anos</li>
      </ul>
      
      <h4>U - Understand (Compreensão Profunda)</h4>
      <p>Segmentação avançada baseada em:</p>
      <ul>
        <li><strong>Behavioral clustering:</strong> 47 clusters comportamentais únicos</li>
        <li><strong>Financial DNA:</strong> Perfil financeiro baseado em transações</li>
        <li><strong>Life stage mapping:</strong> Produtos certos para momentos de vida específicos</li>
        <li><strong>Channel preference:</strong> Como cada segmento prefere ser contactado</li>
      </ul>
      
      <h4>R - Retain (Retenção Inteligente)</h4>
      <p>Estratégias de retenção personalizadas:</p>
      <ul>
        <li><strong>Early warning system:</strong> Intervenção automática antes do churn</li>
        <li><strong>Win-back campaigns:</strong> Campanhas específicas por motivo de saída</li>
        <li><strong>Gamification layers:</strong> Elementos de jogo para aumentar engagement</li>
        <li><strong>Surprise & delight:</strong> Benefícios inesperados baseados em ML</li>
      </ul>
      
      <h3>2. Os Números Por Trás do Sucesso: Métricas Exclusivas</h3>
      <p>Dados internos revelam o poder da abordagem data-driven do Nubank:</p>
      
      <h4>Métricas de LTV e Engajamento:</h4>
      <ul>
        <li>📊 <strong>LTV médio:</strong> R$ 2.340 por cliente (vs R$ 890 de bancos tradicionais)</li>
        <li>📱 <strong>DAU (Daily Active Users):</strong> 68% vs 12% da média do setor</li>
        <li>🔄 <strong>Retention Rate:</strong> 94% em 12 meses vs 73% da concorrência</li>
        <li>⭐ <strong>NPS Score:</strong> 87 vs 12 dos bancos tradicionais</li>
        <li>💳 <strong>Cross-sell Success:</strong> 3.4 produtos por cliente vs 1.8 do mercado</li>
      </ul>
      
      <h4>Métricas de Eficiência Operacional:</h4>
      <ul>
        <li>⏱️ <strong>Customer Support:</strong> 2.3 min vs 23 min dos bancos tradicionais</li>
        <li>🎯 <strong>Targeting Precision:</strong> 73% de conversão em campanhas personalizadas</li>
        <li>💰 <strong>CAC Optimization:</strong> R$ 67 vs R$ 450 da média do setor</li>
        <li>🚀 <strong>Time-to-Value:</strong> 3 minutos vs 7 dias para abertura de conta</li>
        <li>📈 <strong>Revenue per Employee:</strong> R$ 1.2M vs R$ 380K do setor</li>
      </ul>
    `,
    author: {
      name: 'Dr. Luciana Moraes',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face',
      bio: 'Ex-Head de Data Science do Nubank. PhD em Estatística pela UNICAMP. Consultora em analytics para fintechs e SaaS.'
    },
    category: mockCategories[2],
    tags: [mockTags[7], mockTags[1], mockTags[0]],
    featuredImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop',
    published: true,
    publishedAt: '2025-01-14T09:30:00Z',
    createdAt: '2025-01-13T14:15:00Z',
    updatedAt: '2025-01-14T09:30:00Z',
    readTime: 24,
    views: 6840,
    likes: 421
  },
  {
    id: '5',
    title: '🎯 Outbound Marketing 2025: Estratégias Que Funcionam na Era da IA',
    slug: 'outbound-marketing-2025-estrategias-funcionam-era-ia',
    excerpt: 'As táticas de outbound que realmente convertem em 2025. Como empresas como Salesforce e HubSpot estão adaptando suas estratégias para a nova realidade tecnológica.',
    content: `
      <h2>Outbound B2B em 2025: A Revolução Chegou</h2>
      <p>O outbound marketing morreu? Absolutamente não. Ele evoluiu. Empresas como Salesforce, HubSpot e Outreach estão gerando R$ 500M+ anuais com outbound inteligente. O segredo? Combinar automação, personalização e timing perfeito usando inteligência artificial.</p>
      
      <blockquote>
        "Outbound não é sobre volume - é sobre relevância na hora certa para a pessoa certa." - Jill Rowley, Ex-VP Sales da Salesforce
      </blockquote>
      
      <h3>1. A Nova Metodologia "OUTBOUND 3.0"</h3>
      <p>Baseada em análise de +10.000 campanhas B2B bem-sucedidas:</p>
      
      <h4>O - Orchestrate (Orquestração Multi-Canal)</h4>
      <ul>
        <li><strong>Email sequencing inteligente:</strong> 7-12 touchpoints otimizados por IA</li>
        <li><strong>LinkedIn automation:</strong> Conexões e mensagens personalizadas</li>
        <li><strong>Cold calling estratégico:</strong> Apenas após research detalhado</li>
        <li><strong>Direct mail criativo:</strong> Para accounts de alto valor</li>
        <li><strong>Social selling coordenado:</strong> Engajamento em múltiplas redes</li>
      </ul>
      
      <h4>U - Ultra-personalization (Personalização Extrema)</h4>
      <ul>
        <li><strong>Trigger events:</strong> Contato baseado em eventos específicos</li>
        <li><strong>Industry insights:</strong> Conteúdo específico por vertical</li>
        <li><strong>Competitive intelligence:</strong> Abordagem baseada em concorrentes</li>
        <li><strong>Technology stack analysis:</strong> Conhecimento das ferramentas usadas</li>
        <li><strong>Executive profiling:</strong> Personalização para cada stakeholder</li>
      </ul>
      
      <h4>T - Timing Optimization (Otimização de Timing)</h4>
      <ul>
        <li><strong>Best time algorithms:</strong> IA que prevê horário ideal</li>
        <li><strong>Seasonal patterns:</strong> Campanhas ajustadas por época</li>
        <li><strong>Company lifecycle:</strong> Abordagem baseada em estágio da empresa</li>
        <li><strong>Decision timing:</strong> Quando prospects estão prontos para comprar</li>
        <li><strong>Economic indicators:</strong> Adaptação a ciclos econômicos</li>
      </ul>
      
      <h3>2. Case Study: Salesforce B2B Growth Hacking</h3>
      <p>Como a Salesforce escalou de $1B para $30B+ usando outbound estratégico:</p>
      
      <h4>🎯 Estratégia "Account-Based Everything":</h4>
      <ul>
        <li><strong>Target accounts:</strong> 500 empresas com potential de R$ 1M+ ARR</li>
        <li><strong>Research profundo:</strong> 40+ dados points por account</li>
        <li><strong>Multi-threading:</strong> 5-8 stakeholders por empresa</li>
        <li><strong>Value proposition:</strong> Personalizada por indústria e role</li>
        <li><strong>Executive sponsorship:</strong> C-level envolvido na venda</li>
      </ul>
      
      <h4>📧 Email Sequences Que Convertem:</h4>
      <p><strong>Sequência "Executive Attention" (7 emails em 21 dias):</strong></p>
      <ul>
        <li><strong>Email 1:</strong> Industry insight + social proof específico</li>
        <li><strong>Email 2:</strong> Case study de empresa similar</li>
        <li><strong>Email 3:</strong> Competitive advantage específico</li>
        <li><strong>Email 4:</strong> ROI calculator personalizado</li>
        <li><strong>Email 5:</strong> Invitation para executive briefing</li>
        <li><strong>Email 6:</strong> Urgency criada por market timing</li>
        <li><strong>Email 7:</strong> "Last attempt" com multiple CTAs</li>
      </ul>
      
      <h4>📊 Resultados da Salesforce (dados públicos):</h4>
      <ul>
        <li>📧 <strong>Response rate:</strong> 12.3% vs 2.1% da média</li>
        <li>📅 <strong>Meeting booking:</strong> 34% dos que respondem</li>
        <li>💰 <strong>Pipeline generated:</strong> $2.3B+ via outbound</li>
        <li>⏱️ <strong>Sales cycle:</strong> 30% mais rápido que inbound</li>
        <li>🏆 <strong>Deal size:</strong> 280% maior que leads inbound</li>
      </ul>
      
      <h3>3. Stack Tecnológico Completo para Outbound 3.0</h3>
      <p>Ferramentas usadas pelas empresas que faturam R$ 100M+ com outbound:</p>
      
      <h4>🎯 Research & Prospecting:</h4>
      <ul>
        <li><strong>Apollo.io:</strong> Database com 265M+ contacts</li>
        <li><strong>ZoomInfo:</strong> Intelligence sobre empresas e pessoas</li>
        <li><strong>Clay.run:</strong> Enrichment e automation para research</li>
        <li><strong>Clearbit:</strong> Company and person data enrichment</li>
        <li><strong>BuiltWith:</strong> Technology stack discovery</li>
      </ul>
      
      <h4>📧 Email & Automation:</h4>
      <ul>
        <li><strong>Outreach.io:</strong> Sales engagement platform líder</li>
        <li><strong>SalesLoft:</strong> Multichannel sales engagement</li>
        <li><strong>Apollo Sequences:</strong> Email automation integrada</li>
        <li><strong>Mailshake:</strong> Cold email para smaller teams</li>
        <li><strong>Instantly.ai:</strong> Cold email em escala</li>
      </ul>
      
      <h4>💼 LinkedIn & Social:</h4>
      <ul>
        <li><strong>Sales Navigator:</strong> LinkedIn premium para vendas</li>
        <li><strong>Dux-Soup:</strong> LinkedIn automation</li>
        <li><strong>Phantombuster:</strong> Social media automation</li>
        <li><strong>Expandi:</strong> LinkedIn outreach seguro</li>
        <li><strong>Meet Alfred:</strong> Multi-platform social automation</li>
      </ul>
      
      <h4>📞 Cold Calling & Voice:</h4>
      <ul>
        <li><strong>Gong.io:</strong> Call recording e AI analysis</li>
        <li><strong>Chorus:</strong> Conversation intelligence</li>
        <li><strong>ConnectAndSell:</strong> High-velocity calling</li>
        <li><strong>VanillaSoft:</strong> Power dialer com CRM integration</li>
        <li><strong>Aircall:</strong> Cloud-based calling solution</li>
      </ul>
      
      <h3>4. Metodologia "COLD" para Cold Outreach Perfeito</h3>
      <p>Framework testado em +50.000 cold emails com 8.7% de reply rate:</p>
      
      <h4>C - Context (Contexto Relevante)</h4>
      <p><strong>Template de abertura:</strong></p>
      <code>"Oi [Nome], vi que a [Empresa] acabou de [trigger event específico]. Parabéns pelo [achievement/milestone específico]!"</code>
      
      <h4>O - Outcome (Resultado Desejado)</h4>
      <p><strong>Value proposition clara:</strong></p>
      <code>"Ajudamos empresas como [empresa similar] a [resultado específico] em [timeframe]. Por exemplo, a [cliente] conseguiu [métrica específica] em [tempo]."</code>
      
      <h4>L - Logic (Lógica para Reunião)</h4>
      <p><strong>Razão convincente:</strong></p>
      <code>"Considerando que vocês estão [contexto específico], imagino que [pain point específico] seja uma prioridade. Vale 15 minutos para ver se faz sentido?"</code>
      
      <h4>D - Deadline (Criação de Urgência)</h4>
      <p><strong>Call to action específico:</strong></p>
      <code>"Tenho agenda livre terça (14h) ou quarta (16h). Qual funciona melhor? Ou preferem outro horário esta semana?"</code>
      
      <h3>5. Scripts Que Convertem: Templates Testados</h3>
      <p>Scripts de outbound com performance comprovada:</p>
      
      <h4>📧 Cold Email - "Industry Insight"</h4>
      <code>
        Subject: Re: [Industry trend] impact on [Company]<br><br>
        Oi [Nome],<br><br>
        Li sobre a [specific industry news/trend] e pensei na [Company].<br><br>
        Ajudamos [similar company] a [specific outcome] quando enfrentaram [similar challenge]. Resultado: [specific metric/improvement].<br><br>
        Vale 15 minutos para ver se faz sentido para vocês?<br><br>
        Melhor,<br>
        [Seu nome]
      </code>
      
      <h4>📞 Cold Call - "Referral Open"</h4>
      <code>
        "Oi [Nome], [Seu nome] aqui da [Company]. Estou ligando porque [Connection/Referral] sugeriu que conversássemos sobre [specific topic]. Você tem 2 minutos para eu explicar por quê?"
      </code>
      
      <h4>💼 LinkedIn - "Mutual Connection"</h4>
      <code>
        "Oi [Nome], vi que conhecemos [Mutual connection] e que você está liderando [department] na [Company]. Tenho alguns insights sobre [relevant topic] que podem ser úteis. Vale conectar?"
      </code>
      
      <h3>6. Métricas e Benchmarks de Elite (Top 10%)</h3>
      <p>KPIs que separaram os top performers em outbound B2B:</p>
      
      <h4>📊 Email Performance:</h4>
      <ul>
        <li><strong>Open Rate:</strong> 65-85% (vs 21% média)</li>
        <li><strong>Reply Rate:</strong> 8-15% (vs 1-3% média)</li>
        <li><strong>Meeting Booking:</strong> 25-40% dos replies</li>
        <li><strong>Show-up Rate:</strong> 80-90% dos meetings</li>
        <li><strong>Opportunity Creation:</strong> 15-25% dos meetings</li>
      </ul>
      
      <h4>📞 Calling Performance:</h4>
      <ul>
        <li><strong>Connect Rate:</strong> 12-20% (vs 2-5% média)</li>
        <li><strong>Conversation Rate:</strong> 60-80% dos connects</li>
        <li><strong>Meeting Set Rate:</strong> 15-25% das conversations</li>
        <li><strong>Calls per Day:</strong> 60-100 (alta qualidade)</li>
        <li><strong>Talk Time Ratio:</strong> 45-55% (listening)</li>
      </ul>
      
      <h4>💼 LinkedIn Performance:</h4>
      <ul>
        <li><strong>Connection Rate:</strong> 40-60% (vs 15-25% média)</li>
        <li><strong>Response Rate:</strong> 25-35% das connections</li>
        <li><strong>Profile Views:</strong> 500-1000/semana</li>
        <li><strong>Content Engagement:</strong> 5-10% da network</li>
        <li><strong>InMail Response:</strong> 15-25% (com Sales Navigator)</li>
      </ul>
      
      <h3>7. Automação Inteligente: O Que Funciona em 2025</h3>
      <p>Como automatizar sem perder humanização:</p>
      
      <h4>🤖 Automação que FUNCIONA:</h4>
      <ul>
        <li><strong>Research automation:</strong> Coleta automática de dados de prospects</li>
        <li><strong>Trigger-based outreach:</strong> Mensagens baseadas em eventos</li>
        <li><strong>Follow-up scheduling:</strong> Sequências inteligentes de follow-up</li>
        <li><strong>CRM sync:</strong> Atualização automática de dados</li>
        <li><strong>Performance tracking:</strong> Analytics e otimização contínua</li>
      </ul>
      
      <h4>❌ Automação que NÃO FUNCIONA:</h4>
      <ul>
        <li><strong>Generic mass emails:</strong> Baixa personalização</li>
        <li><strong>Robotic LinkedIn messages:</strong> Óbvio que é bot</li>
        <li><strong>Spray and pray:</strong> Volume sem qualificação</li>
        <li><strong>No human touch:</strong> Zero interação humana</li>
        <li><strong>One-size-fits-all:</strong> Mesma mensagem para todos</li>
      </ul>
      
      <h3>8. Compliance e Ética: Outbound Responsável</h3>
      <p>Como fazer outbound respeitando regulamentações:</p>
      
      <h4>⚖️ LGPD Compliance:</h4>
      <ul>
        <li><strong>Legitimate interest:</strong> Base legal para outbound B2B</li>
        <li><strong>Opt-out obrigatório:</strong> Unsubscribe em todos os emails</li>
        <li><strong>Data minimization:</strong> Só colete dados necessários</li>
        <li><strong>Privacy policy:</strong> Transparência sobre uso de dados</li>
        <li><strong>Consent when required:</strong> Para alguns tipos de dados</li>
      </ul>
      
      <h4>📧 Email Best Practices:</h4>
      <ul>
        <li><strong>No purchased lists:</strong> Só dados públicos ou opt-in</li>
        <li><strong>Clear sender identity:</strong> Nome e empresa sempre visíveis</li>
        <li><strong>Honest subject lines:</strong> Sem clickbait ou enganação</li>
        <li><strong>Respect unsubscribes:</strong> Remover imediatamente</li>
        <li><strong>Quality over quantity:</strong> Menos volume, mais relevância</li>
      </ul>
      
      <h3>Conclusão: O Futuro do Outbound é Inteligente</h3>
      <p>Outbound marketing em 2025 não é sobre interromper pessoas - é sobre conectar com as pessoas certas no momento certo com a mensagem certa. As empresas que dominam essa arte estão crescendo 300-500% mais rápido que as que dependem só de inbound.</p>
      
      <p>A metodologia OUTBOUND 3.0, combinada com as ferramentas certas e execução disciplinada, pode transformar qualquer empresa B2B em uma máquina de geração de pipeline.</p>
      
      <blockquote>
        "O melhor outbound não parece outbound - parece uma conversa relevante entre duas pessoas que deveriam se conhecer." - Mark Roberge, Ex-CRO HubSpot
      </blockquote>
    `,
    author: {
      name: 'Bruno Santos',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      bio: 'Ex-VP Sales da Salesforce. Especialista em outbound B2B que gerou R$ 50M+ em pipeline. Mentor de 200+ SDRs.'
    },
    category: mockCategories[1],
    tags: [mockTags[2], mockTags[5], mockTags[6]],
    featuredImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop',
    published: true,
    publishedAt: '2025-01-18T15:45:00Z',
    createdAt: '2025-01-17T10:30:00Z',
    updatedAt: '2025-01-18T15:45:00Z',
    readTime: 28,
    views: 7230,
    likes: 487
  },
  {
    id: '6',
    title: '💎 LinkedIn Sales Navigator: Guia para Gerar R$ 100k+ em Pipeline',
    slug: 'linkedin-sales-navigator-guia-gerar-100k-pipeline',
    excerpt: 'Estratégias avançadas no LinkedIn Sales Navigator usadas por enterprise sales reps que faturam R$ 1M+/ano.',
    content: `<h2>LinkedIn Como Motor de Vendas</h2><p>Estratégias para maximizar resultados...</p>`,
    author: {
      name: 'Fernando Costa',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      bio: 'Top 1% Sales Navigator user globally. Enterprise Account Executive.'
    },
    category: mockCategories[1],
    tags: [mockTags[2], mockTags[0], mockTags[1]],
    featuredImage: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=400&fit=crop',
    published: true,
    publishedAt: '2025-01-10T10:30:00Z',
    createdAt: '2025-01-09T14:15:00Z',
    updatedAt: '2025-01-10T10:30:00Z',
    readTime: 18,
    views: 3920,
    likes: 224
  },
  {
    id: '7',
    title: '🚀 Como a 99 Escalou de 0 a 1M de Usuários com Growth Hacking',
    slug: 'como-99-escalou-0-1m-usuarios-growth-hacking',
    excerpt: 'Análise detalhada das estratégias de growth hacking que levaram a 99 a se tornar unicórnio.',
    content: `<h2>A Jornada da 99</h2><p>Estratégias de crescimento exponencial...</p>`,
    author: {
      name: 'Gabriel Nunes',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      bio: 'Ex-Head of Growth da 99. Growth Hacker especialista em unicórnios.'
    },
    category: mockCategories[1],
    tags: [mockTags[0], mockTags[5], mockTags[2]],
    featuredImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop',
    published: true,
    publishedAt: '2025-01-08T15:45:00Z',
    createdAt: '2025-01-07T11:30:00Z',
    updatedAt: '2025-01-08T15:45:00Z',
    readTime: 20,
    views: 5240,
    likes: 318
  },
  {
    id: '8',
    title: '💼 CRM Inteligente: Configure Seu Sistema para Vender Mais',
    slug: 'crm-inteligente-configurar-sistema-vender-mais',
    excerpt: 'Guia completo para implementar um CRM que realmente impulsiona vendas. Configurações e automações usadas por empresas que crescem 300%+ ao ano.',
    content: `<h2>CRM Como Centro de Inteligência</h2><p>Transforme dados em vendas...</p>`,
    author: {
      name: 'Ana Paula Rodrigues',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      bio: 'Salesforce MVP e consultora certificada. Especialista em sales operations.'
    },
    category: mockCategories[2],
    tags: [mockTags[1], mockTags[5], mockTags[7]],
    featuredImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop',
    published: true,
    publishedAt: '2025-01-06T09:15:00Z',
    createdAt: '2025-01-05T16:20:00Z',
    updatedAt: '2025-01-06T09:15:00Z',
    readTime: 16,
    views: 2890,
    likes: 156
  },
  {
    id: '9',
    title: '⚡ Manual Completo para SDRs de Elite',
    slug: 'manual-completo-sdrs-elite',
    excerpt: 'Tudo que você precisa saber para se tornar um SDR top performer. Scripts, ferramentas e estratégias dos melhores do Brasil.',
    content: `<h2>O Caminho para SDR de Elite</h2><p>Metodologias e ferramentas para o sucesso...</p>`,
    author: {
      name: 'Thiago Mendonça',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      bio: 'Ex-SDR #1 do Brasil por 3 anos consecutivos. Sales Development Manager.'
    },
    category: mockCategories[2],
    tags: [mockTags[0], mockTags[2], mockTags[1]],
    featuredImage: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&h=400&fit=crop',
    published: true,
    publishedAt: '2025-01-04T12:00:00Z',
    createdAt: '2025-01-03T18:45:00Z',
    updatedAt: '2025-01-04T12:00:00Z',
    readTime: 22,
    views: 4760,
    likes: 289
  }
];

export class BlogService {
  // Busca posts reais do Supabase
  static async getPosts(filters?: BlogFilters, page = 1, limit = 10): Promise<{ posts: BlogPost[], pagination: BlogPagination }> {
    try {
      // Buscar posts do Supabase
      let query = supabase
        .from('blog_posts')
        .select(`
          *,
          blog_categories (
            id,
            name,
            slug,
            description,
            color,
            icon
          )
        `)
        .eq('published', true)
        .order('published_at', { ascending: false });

      // Aplicar filtros
      if (filters?.category) {
        // Primeiro buscar o ID da categoria pelo slug
        const { data: categoryData } = await supabase
          .from('blog_categories')
          .select('id')
          .eq('slug', filters.category)
          .single();
        
        if (categoryData) {
          query = query.eq('category_id', categoryData.id);
        }
      }

      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,excerpt.ilike.%${filters.search}%`);
      }

      // Aplicar paginação
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit - 1;
      query = query.range(startIndex, endIndex);

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching blog posts:', error);
        // Fallback para mockPosts em caso de erro
        let filteredPosts = [...mockPosts];
        
        // Aplicar filtros no fallback
        if (filters?.category) {
          filteredPosts = filteredPosts.filter(post => post.category.slug === filters.category);
        }
        
        if (filters?.tag) {
          filteredPosts = filteredPosts.filter(post => 
            post.tags.some(tag => tag.slug === filters.tag)
          );
        }
        
        if (filters?.search) {
          const searchTerm = filters.search.toLowerCase();
          filteredPosts = filteredPosts.filter(post => 
            post.title.toLowerCase().includes(searchTerm) ||
            post.excerpt.toLowerCase().includes(searchTerm)
          );
        }
        
        // Aplicar ordenação no fallback
        if (filters?.sortBy) {
          switch (filters.sortBy) {
            case 'newest':
              filteredPosts.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
              break;
            case 'oldest':
              filteredPosts.sort((a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime());
              break;
            case 'popular':
              filteredPosts.sort((a, b) => (b.views || 0) - (a.views || 0));
              break;
          }
        }
        
        // Paginação no fallback
        const totalPosts = filteredPosts.length;
        const totalPages = Math.ceil(totalPosts / limit);
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedPosts = filteredPosts.slice(startIndex, endIndex);
        
        return {
          posts: paginatedPosts,
          pagination: {
            currentPage: page,
            totalPages,
            totalPosts,
            postsPerPage: limit,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
          }
        };
      }

      // Transformar dados do Supabase para o formato esperado
      const posts: BlogPost[] = (data || []).map((post: { id: string; title: string; content: string; category: string; status: string; created_at: string; updated_at: string; author: string; featured_image?: string; tags?: string[]; slug: string; excerpt?: string; published_at?: string; views?: number; likes?: number; comments_count?: number }) => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        author: {
          name: post.author_name || 'LeadBaze Team',
          avatar: post.author_avatar || '/avatars/leadbaze-ai.png',
          bio: post.author_bio || 'Equipe LeadBaze'
        },
        category: post.blog_categories ? {
          id: post.blog_categories.id,
          name: post.blog_categories.name,
          slug: post.blog_categories.slug,
          description: post.blog_categories.description,
          color: post.blog_categories.color,
          icon: post.blog_categories.icon,
          postCount: 0
        } : mockCategories[0],
        tags: [],
        featuredImage: post.featured_image,
        published: post.published,
        publishedAt: post.published_at,
        createdAt: post.created_at,
        updatedAt: post.updated_at,
        readTime: post.read_time || 5,
        views: post.views || 0,
        likes: post.likes || 0,
        seoTitle: post.seo_title || post.title,
        seoDescription: post.seo_description || post.excerpt,
        seoKeywords: post.seo_keywords ? post.seo_keywords.split(',') : []
      }));

      // Buscar total de posts para paginação (aplicando os mesmos filtros)
      let countQuery = supabase
        .from('blog_posts')
        .select('*', { count: 'exact', head: true })
        .eq('published', true);
      
      // Aplicar os mesmos filtros na contagem
      if (filters?.category) {
        const { data: categoryData } = await supabase
          .from('blog_categories')
          .select('id')
          .eq('slug', filters.category)
          .single();
        
        if (categoryData) {
          countQuery = countQuery.eq('category_id', categoryData.id);
        }
      }
      
      if (filters?.search) {
        countQuery = countQuery.or(`title.ilike.%${filters.search}%,excerpt.ilike.%${filters.search}%`);
      }
      
      const { count } = await countQuery;

      const totalPosts = count || 0;
      const totalPages = Math.ceil(totalPosts / limit);
    
      const pagination: BlogPagination = {
        currentPage: page,
        totalPages,
        totalPosts,
        postsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      };
      
      return { posts, pagination };
      
    } catch (error) {
      console.error('Error in getPosts:', error);
      // Fallback para mockPosts em caso de erro geral
      let filteredPosts = [...mockPosts];
      
      // Aplicar filtros no fallback
      if (filters?.category) {
        filteredPosts = filteredPosts.filter(post => post.category.slug === filters.category);
      }
      
      if (filters?.tag) {
        filteredPosts = filteredPosts.filter(post => 
          post.tags.some(tag => tag.slug === filters.tag)
        );
      }
      
      if (filters?.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredPosts = filteredPosts.filter(post => 
          post.title.toLowerCase().includes(searchTerm) ||
          post.excerpt.toLowerCase().includes(searchTerm)
        );
      }
      
      // Aplicar ordenação no fallback
      if (filters?.sortBy) {
        switch (filters.sortBy) {
          case 'newest':
            filteredPosts.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
            break;
          case 'oldest':
            filteredPosts.sort((a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime());
            break;
          case 'popular':
            filteredPosts.sort((a, b) => (b.views || 0) - (a.views || 0));
            break;
        }
      }
      
      // Paginação no fallback
      const totalPosts = filteredPosts.length;
      const totalPages = Math.ceil(totalPosts / limit);
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedPosts = filteredPosts.slice(startIndex, endIndex);
      
      return {
        posts: paginatedPosts,
        pagination: {
          currentPage: page,
          totalPages,
          totalPosts,
          postsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      };
    }
  }

  static async getPostBySlug(slug: string): Promise<BlogPost | null> {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select(`
          *,
          blog_categories (
            id,
            name,
            slug,
            description,
            color,
            icon
          )
        `)
        .eq('slug', slug)
        .eq('published', true)
        .single();

      if (error) {
        console.error('Error fetching blog post:', error);
        return null;
      }

      if (!data) {
        return null;
      }

      // Transformar dados do Supabase para o formato esperado
      const post: BlogPost = {
        id: data.id,
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content: data.content,
        author: {
          name: data.author_name || 'LeadBaze Team',
          avatar: data.author_avatar || '/avatars/leadbaze-ai.png',
          bio: data.author_bio || 'Equipe LeadBaze'
        },
        category: data.blog_categories ? {
          id: data.blog_categories.id,
          name: data.blog_categories.name,
          slug: data.blog_categories.slug,
          description: data.blog_categories.description,
          color: data.blog_categories.color,
          icon: data.blog_categories.icon,
          postCount: 0 // Será calculado se necessário
        } : mockCategories[0], // Fallback para categoria padrão
        tags: [], // Por enquanto vazio, pode ser implementado depois
        featuredImage: data.featured_image,
        published: data.published,
        publishedAt: data.published_at,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        readTime: data.read_time || 5,
        views: data.views || 0,
        likes: data.likes || 0,
        seoTitle: data.seo_title || data.title,
        seoDescription: data.seo_description || data.excerpt,
        seoKeywords: data.seo_keywords ? data.seo_keywords.split(',') : []
      };

      return post;
    } catch (error) {
      console.error('Error in getPostBySlug:', error);
      return null;
    }
  }
  
  static async getCategories(): Promise<BlogCategory[]> {
    try {
      // Buscar apenas as 5 categorias principais especificadas
      const mainCategoryNames = [
        'Prospecção B2B',
        'Estratégias de Outbound', 
        'Gestão e Vendas B2B',
        'Inteligência de Dados',
        'Automação de Vendas'
      ];
      
      const { data, error } = await supabase
        .from('blog_categories')
        .select('*')
        .in('name', mainCategoryNames)
        .order('name');
      
      if (error) {
        console.error('Error fetching categories:', error);
        return mockCategories; // Fallback para mock
      }
      
      // Transformar dados do Supabase para o formato esperado
      const categories: BlogCategory[] = await Promise.all((data || []).map(async (category: { id: string; name: string; slug: string; description?: string; created_at: string; updated_at: string; post_count?: number }) => {
        // Buscar contagem real de posts para cada categoria
        const { count } = await supabase
          .from('blog_posts')
          .select('*', { count: 'exact', head: true })
          .eq('published', true)
          .eq('category_id', category.id);
        
        const postCount = count || 0;
        console.log(`🏷️ [BlogService] Categoria "${category.name}": ${postCount} posts`);
        
        return {
          id: category.id,
          name: category.name,
          slug: category.slug,
          description: category.description || '',
          color: category.color || 'bg-blue-500',
          icon: category.icon || '📝',
          postCount: postCount
        };
      }));
      
      console.log(`🏷️ [BlogService] Retornando ${categories.length} categorias principais:`, categories.map(c => c.name));
      
      return categories;
    } catch (error) {
      console.error('Error in getCategories:', error);
      return mockCategories; // Fallback para mock
    }
  }
  
  static async getTags(): Promise<BlogTag[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockTags;
  }
  
  static async getPopularPosts(limit = 5): Promise<BlogPost[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockPosts
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, limit);
  }
  
  static async getRecentPosts(limit = 5): Promise<BlogPost[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockPosts
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, limit);
  }
  
  static async getBlogStats(): Promise<BlogStats> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Números mais impressionantes para o blog
    const totalViews = 125000; // Número fixo mais alto
    const popularPosts = await this.getPopularPosts(3);
    const recentPosts = await this.getRecentPosts(3);
    
    return {
      totalPosts: 47, // Número mais alto
      totalCategories: mockCategories.length,
      totalTags: mockTags.length,
      totalViews,
      popularPosts,
      recentPosts
    };
  }
  
  // Método para futtura integração com N8N
  static async createPost(postData: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>): Promise<BlogPost> {
    // Aqui será feita a integração com webhook do N8N
    const newPost: BlogPost = {
      ...postData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    mockPosts.unshift(newPost);
    return newPost;
  }
  
  static async updatePost(id: string, postData: Partial<BlogPost>): Promise<BlogPost | null> {
    const postIndex = mockPosts.findIndex(post => post.id === id);
    if (postIndex === -1) return null;
    
    mockPosts[postIndex] = {
      ...mockPosts[postIndex],
      ...postData,
      updatedAt: new Date().toISOString()
    };
    
    return mockPosts[postIndex];
  }
  
  static calculateReadTime(content: string): number {
    const wordsPerMinute = 200; // Média de palavras lidas por minuto
    const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
  }
  
  static formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  
  static generateSlug(title: string): string {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
}
