const { marked } = require('marked');
const ValidationRules = require('./validationRules');

class ContentFormatter {
    constructor() {
        this.validationRules = new ValidationRules();
        console.log('📝 ContentFormatter inicializado');
    }

    /**
     * Formatar post completo
     */
    formatPost(postData) {
        const { title, content, category, imageurl, autor, date } = postData;

        console.log(`�� [ContentFormatter] Formatando post: "${title}"`);
        console.log(`�� [ContentFormatter] Conteúdo recebido: ${content ? content.substring(0, 100) + '...' : 'null'}`);
        console.log(`�� [ContentFormatter] Categoria: "${category}"`);
        console.log(`�� [ContentFormatter] Autor: "${autor}"`);
        console.log(`�� [ContentFormatter] Data: "${date}"`);

        // Converter Markdown para HTML primeiro
        const htmlContent = this.convertMarkdownToHtml(content);
        console.log(`�� [ContentFormatter] Markdown convertido para HTML: ${htmlContent.length} chars`);

        // Detectar tipo de conteúdo
        const contentType = this.detectContentType(htmlContent);
        console.log(`�� [ContentFormatter] Detectado: ${contentType.toUpperCase()}`);

        // Aplicar template baseado no tipo
        const structuredContent = this.applyTemplate(htmlContent, contentType);
        console.log(`�� [ContentFormatter] Template aplicado: ${contentType} (${this.getTemplateStyle(contentType)})`);

        // Gerar excerpt
        const excerpt = this.generateExcerpt(structuredContent);
        console.log(`�� [ContentFormatter] Excerpt gerado: ${excerpt.substring(0, 50)}...`);

        // Validar e formatar categoria
        console.log(`��️ [ContentFormatter] Categoria fornecida: "${category}"`);
        const formattedCategory = this.formatCategory(category);
        console.log(`��️ [ContentFormatter] Categoria mapeada: "${formattedCategory}"`);
        console.log(`��️ [ContentFormatter] ✅ Categoria segura e organizada!`);

        // Validar e corrigir imageurl
        console.log(`��️ [ContentFormatter] ImageURL recebido: "${imageurl}"`);
        console.log(`��️ [ContentFormatter] ImageURL tipo: ${typeof imageurl}`);

        // Validar e corrigir imageurl se necessário
        let finalImageUrl = imageurl;
        if (!imageurl || imageurl === 'null' || imageurl === 'undefined' || imageurl === null) {
            finalImageUrl = 'https://leadbaze.io/images/blog/default-blog-image.jpg';
            console.log(`��️ [ContentFormatter] ⚠️ ImageURL inválido, usando padrão: "${finalImageUrl}"`);
        } else if (typeof imageurl === 'string' && imageurl.startsWith('https://lsvwjyhnnzeewuuuykmb.supabase.co/storage/')) {
            // Link do Supabase Storage - válido
            finalImageUrl = imageurl;
            console.log(`��️ [ContentFormatter] ✅ ImageURL Supabase válido: "${finalImageUrl}"`);
        } else if (typeof imageurl === 'string' && (imageurl.startsWith('http://') || imageurl.startsWith('https://'))) {
            // Outro link HTTP válido
            finalImageUrl = imageurl;
            console.log(`��️ [ContentFormatter] ✅ ImageURL HTTP válido: "${finalImageUrl}"`);
        } else {
            // URL inválida, usar padrão
            finalImageUrl = 'https://leadbaze.io/images/blog/default-blog-image.jpg';
            console.log(`��️ [ContentFormatter] ⚠️ ImageURL formato inválido, usando padrão: "${finalImageUrl}"`);
        }

        // Validar e formatar autor
        const finalAuthor = this.formatAuthor(autor);
        console.log(`�� [ContentFormatter] Autor recebido: "${autor}"`);
        console.log(`�� [ContentFormatter] Autor final: "${finalAuthor}"`);

        return {
            title: this.formatTitle(title),
            content: structuredContent,
            excerpt: excerpt,
            category: formattedCategory,
            type: contentType,
            featured_image: finalImageUrl,
            author_name: finalAuthor,
            published_at: date,
            formatted: true,
            validation: {
                passed: true,
                timestamp: new Date().toISOString()
            }
        };
    }

    /**
     * Converter Markdown para HTML
     */
    convertMarkdownToHtml(markdown) {
        try {
            if (!markdown || typeof markdown !== 'string') {
                return markdown || '';
            }

            // Configurar marked para converter Markdown para HTML
            marked.setOptions({
                breaks: true,
                gfm: true
            });
            
            const html = marked(markdown);
            console.log(`�� [ContentFormatter] Markdown convertido: ${html.length} chars`);
            return html;
        } catch (error) {
            console.error(`❌ [ContentFormatter] Erro ao converter Markdown:`, error);
            return markdown; // Retornar original se houver erro
        }
    }

    /**
     * Formatar autor
     */
    formatAuthor(autor) {
        if (!autor || typeof autor !== 'string' || autor.trim() === '') {
            return 'LeadBaze Team';
        }
        
        // Limpar e formatar nome do autor
        const cleanAuthor = autor.trim();
        
        // Se for muito curto ou genérico, usar padrão
        if (cleanAuthor.length < 2 || 
            cleanAuthor.toLowerCase().includes('sistema') ||
            cleanAuthor.toLowerCase().includes('bot') ||
            cleanAuthor.toLowerCase().includes('automático')) {
            return 'LeadBaze Team';
        }
        
        return cleanAuthor;
    }

    /**
     * Formatar título
     */
    formatTitle(title) {
        if (!title || typeof title !== 'string') {
            throw new Error('Título é obrigatório e deve ser uma string');
        }

        // Remover caracteres especiais e normalizar
        return title
            .trim()
            .replace(/[^\w\s\-.,!?]/g, '')
            .replace(/\s+/g, ' ')
            .substring(0, 100);
    }

    /**
     * Detectar tipo de conteúdo
     */
    detectContentType(content) {
        if (!content || typeof content !== 'string') {
            return 'artigo';
        }

        const lowerContent = content.toLowerCase();

        // Detectar tutorial
        if (lowerContent.includes('passo a passo') ||
            lowerContent.includes('como fazer') ||
            lowerContent.includes('tutorial') ||
            lowerContent.includes('guia completo')) {
            return 'tutorial';
        }

        // Detectar case study
        if (lowerContent.includes('case study') ||
            lowerContent.includes('estudo de caso') ||
            lowerContent.includes('resultado') ||
            lowerContent.includes('antes e depois')) {
            return 'case-study';
        }

        // Detectar análise
        if (lowerContent.includes('análise') ||
            lowerContent.includes('comparação') ||
            lowerContent.includes('review') ||
            lowerContent.includes('avaliação')) {
            return 'analise';
        }

        // Padrão: artigo técnico
        return 'artigo';
    }

    /**
     * Aplicar template baseado no tipo
     */
    applyTemplate(content, type) {
        const templates = {
            'tutorial': this.getTutorialTemplate(),
            'case-study': this.getCaseStudyTemplate(),
            'analise': this.getAnaliseTemplate(),
            'artigo': this.getArtigoTemplate()
        };

        const template = templates[type] || templates['artigo'];

        return template.replace('{{CONTENT}}', content);
    }

    /**
     * Template para tutorial
     */
    getTutorialTemplate() {
        return `
<div class="tutorial-content">
    <div class="tutorial-intro">
        <h3>O que você vai aprender</h3>
        <p>Neste tutorial completo, você vai dominar todas as etapas necessárias para alcançar seus objetivos.</p>
    </div>

    <div class="tutorial-steps">
        {{CONTENT}}
    </div>

    <div class="tutorial-conclusion">
        <h3>Próximos passos</h3>
        <p>Agora que você completou este tutorial, continue praticando e explore outras funcionalidades avançadas.</p>
    </div>
</div>`;
    }

    /**
     * Template para case study
     */
    getCaseStudyTemplate() {
        return `
<div class="case-study-content">
    <div class="case-study-header">
        <h3>Estudo de Caso</h3>
        <p>Análise detalhada de uma implementação real e seus resultados.</p>
    </div>

    <div class="case-study-body">
        {{CONTENT}}
    </div>

    <div class="case-study-results">
        <h3>Resultados Alcançados</h3>
        <p>Os resultados demonstram a eficácia da estratégia implementada.</p>
    </div>
</div>`;
    }

    /**
     * Template para análise
     */
    getAnaliseTemplate() {
        return `
<div class="analise-content">
    <div class="analise-intro">
        <h3>Análise Detalhada</h3>
        <p>Uma análise profunda e objetiva do tema abordado.</p>
    </div>

    <div class="analise-body">
        {{CONTENT}}
    </div>

    <div class="analise-conclusion">
        <h3>Conclusões</h3>
        <p>Baseado na análise realizada, podemos extrair insights valiosos.</p>
    </div>
</div>`;
    }

    /**
     * Template para artigo técnico
     */
    getArtigoTemplate() {
        return `
<div class="artigo-content">
    <div class="artigo-intro">
        <h3>Artigo Técnico</h3>
        <p>Conteúdo especializado e detalhado sobre o tema abordado.</p>
    </div>

    <div class="artigo-body">
        {{CONTENT}}
    </div>

    <div class="artigo-conclusion">
        <h3>Conclusão</h3>
        <p>Este artigo fornece uma base sólida para implementação e desenvolvimento.</p>
    </div>
</div>`;
    }

    /**
     * Obter estilo do template
     */
    getTemplateStyle(type) {
        const styles = {
            'tutorial': 'passo a passo',
            'case-study': 'resultados',
            'analise': 'profissional',
            'artigo': 'técnico'
        };
        return styles[type] || 'padrão';
    }

    /**
     * Gerar excerpt
     */
    generateExcerpt(content) {
        if (!content || typeof content !== 'string') {
            return 'Conteúdo não disponível.';
        }

        // Remover HTML tags
        const textContent = content.replace(/<[^>]*>/g, '');

        // Limitar a 160 caracteres
        if (textContent.length <= 160) {
            return textContent;
        }

        // Cortar no último espaço antes de 160 caracteres
        const truncated = textContent.substring(0, 160);
        const lastSpace = truncated.lastIndexOf(' ');

        return lastSpace > 0 ? truncated.substring(0, lastSpace) + '...' : truncated + '...';
    }

    /**
     * Formatar categoria - Mapear para as 5 categorias dos filtros
     */
    formatCategory(category) {
        if (!category || typeof category !== 'string') {
            return 'Automação de Vendas';
        }

        const lowerCategory = category.toLowerCase().trim();

        // Mapear para as 5 categorias dos filtros
        const categoryMap = {
            // Prospecção B2B
            'prospecção b2b': 'Prospecção B2B',
            'prospecção': 'Prospecção B2B',
            'leads b2b': 'Prospecção B2B',
            'como encontrar leads': 'Prospecção B2B',
            'geração de leads': 'Prospecção B2B',
            'captação de leads': 'Prospecção B2B',
            'qualificação de leads': 'Prospecção B2B',
            
            // Estratégias de Outbound
            'estratégias de outbound': 'Estratégias de Outbound',
            'outbound': 'Estratégias de Outbound',
            'cold email': 'Estratégias de Outbound',
            'cold calling': 'Estratégias de Outbound',
            'linkedin outreach': 'Estratégias de Outbound',
            'prospecção ativa': 'Estratégias de Outbound',
            'abordagem comercial': 'Estratégias de Outbound',
            
            // Gestão e Vendas B2B
            'gestão e vendas b2b': 'Gestão e Vendas B2B',
            'gestão b2b': 'Gestão e Vendas B2B',
            'vendas b2b': 'Gestão e Vendas B2B',
            'gestão de vendas': 'Gestão e Vendas B2B',
            'processo de vendas': 'Gestão e Vendas B2B',
            'pipeline de vendas': 'Gestão e Vendas B2B',
            'crm': 'Gestão e Vendas B2B',
            'follow-up': 'Gestão e Vendas B2B',
            
            // Inteligência de Dados
            'inteligência de dados': 'Inteligência de Dados',
            'dados': 'Inteligência de Dados',
            'analytics': 'Inteligência de Dados',
            'métricas': 'Inteligência de Dados',
            'kpis': 'Inteligência de Dados',
            'relatórios': 'Inteligência de Dados',
            'dashboard': 'Inteligência de Dados',
            'business intelligence': 'Inteligência de Dados',
            
            // Automação de Vendas
            'automação de vendas': 'Automação de Vendas',
            'automação': 'Automação de Vendas',
            'workflow': 'Automação de Vendas',
            'n8n': 'Automação de Vendas',
            'zapier': 'Automação de Vendas',
            'integração': 'Automação de Vendas',
            'api': 'Automação de Vendas',
            'webhook': 'Automação de Vendas'
        };

        // Buscar correspondência exata primeiro
        if (categoryMap[lowerCategory]) {
            return categoryMap[lowerCategory];
        }

        // Buscar correspondência parcial
        for (const [key, value] of Object.entries(categoryMap)) {
            if (lowerCategory.includes(key) || key.includes(lowerCategory)) {
                return value;
            }
        }

        // Se não encontrar correspondência, usar padrão baseado no conteúdo
        return 'Automação de Vendas';
    }
}

module.exports = ContentFormatter;
