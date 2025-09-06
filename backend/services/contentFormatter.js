const ValidationRules = require('./validationRules');

class ContentFormatter {
    constructor() {
        this.validationRules = new ValidationRules();
        this.templates = {
            technical: {
                structure: 'profissional',
                tone: 'técnico',
                format: 'estruturado'
            },
            marketing: {
                structure: 'persuasivo',
                tone: 'comercial',
                format: 'engajante'
            },
            news: {
                structure: 'informativo',
                tone: 'neutro',
                format: 'direto'
            }
        };
    }

    /**
     * Validar dados do post
     */
    validatePost(postData) {
        const errors = [];

        // Validar título
        const titleError = this.validationRules.validateTitle(postData.title);
        if (titleError) errors.push(titleError);

        // Validar conteúdo
        const contentError = this.validationRules.validateContent(postData.content);
        if (contentError) errors.push(contentError);

        // Validar categoria
        const categoryError = this.validationRules.validateCategory(postData.category);
        if (categoryError) errors.push(categoryError);

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Formatar post completo com validação
     */
    formatPost(postData) {
        // Validar dados primeiro
        const validation = this.validatePost(postData);
        if (!validation.isValid) {
            throw new Error(`Dados inválidos: ${validation.errors.join(', ')}`);
        }

        const {
            title,
            content,
            category,
            type = null,
            imageurl,
            autor,
            date
        } = postData;

        console.log(`�� [ContentFormatter] Detectado: ${type || 'ARTIGO TÉCNICO'} (padrão)`);

        // Determinar tipo de conteúdo
        const contentType = this.determineContentType(content, type);
        console.log(`�� [ContentFormatter] Aplicando template: ${contentType} (${this.templates[contentType]?.structure || 'padrão'})`);

        // Estruturar conteúdo
        const structuredContent = this.structureContent(content, contentType);

        // Gerar excerpt
        const excerpt = this.generateExcerpt(content);

        // Validar e formatar categoria
        console.log(`��️ [ContentFormatter] Categoria fornecida: "${category}"`);
        const formattedCategory = this.formatCategory(category);
        console.log(`��️ [ContentFormatter] Categoria mapeada: "${formattedCategory}"`);
        console.log(`��️ [ContentFormatter] ✅ Categoria segura e organizada!`);

        return {
            title: this.formatTitle(title),
            content: structuredContent,
            excerpt: excerpt,
            category: formattedCategory,
            type: contentType,
            featured_image: imageurl,  // Corrigido: mapear para featured_image
            author_name: autor,        // Corrigido: mapear para author_name
            published_at: date,        // Corrigido: mapear para published_at
            formatted: true,
            validation: {
                passed: true,
                timestamp: new Date().toISOString()
            }
        };
    }

    /**
     * Formatar título
     */
    formatTitle(title) {
        if (!title || typeof title !== 'string') {
            throw new Error('Título é obrigatório e deve ser uma string');
        }

        // Limpar e formatar título
        let formattedTitle = title.trim();
        
        // Capitalizar primeira letra
        formattedTitle = formattedTitle.charAt(0).toUpperCase() + formattedTitle.slice(1);
        
        // Remover caracteres especiais excessivos
        formattedTitle = formattedTitle.replace(/[^\w\s\-.,!?]/g, '');
        
        // Limitar tamanho
        if (formattedTitle.length > 100) {
            formattedTitle = formattedTitle.substring(0, 97) + '...';
        }

        return formattedTitle;
    }

    /**
     * Determinar tipo de conteúdo
     */
    determineContentType(content, type) {
        if (type && this.templates[type]) {
            return type;
        }

        // Análise automática baseada no conteúdo
        const contentLower = content.toLowerCase();
        
        if (contentLower.includes('tutorial') || contentLower.includes('como fazer') || contentLower.includes('passo a passo')) {
            return 'technical';
        }
        
        if (contentLower.includes('promoção') || contentLower.includes('oferta') || contentLower.includes('desconto')) {
            return 'marketing';
        }
        
        if (contentLower.includes('notícia') || contentLower.includes('atualização') || contentLower.includes('lançamento')) {
            return 'news';
        }

        return 'technical'; // Padrão
    }

    /**
     * Estruturar conteúdo
     */
    structureContent(content, contentType) {
        if (!content || typeof content !== 'string') {
            throw new Error('Conteúdo é obrigatório e deve ser uma string');
        }

        const template = this.templates[contentType] || this.templates.technical;
        
        // Aplicar estrutura baseada no template
        let structuredContent = content.trim();
        
        // Adicionar quebras de linha para melhor legibilidade
        structuredContent = structuredContent.replace(/\n\s*\n/g, '\n\n');
        
        // Garantir que não está vazio
        if (structuredContent.length < 50) {
            throw new Error('Conteúdo muito curto para ser um post válido');
        }

        return structuredContent;
    }

    /**
     * Gerar excerpt
     */
    generateExcerpt(content) {
        if (!content || typeof content !== 'string') {
            return '';
        }

        // Limpar conteúdo
        let excerpt = content.trim();
        
        // Remover quebras de linha excessivas
        excerpt = excerpt.replace(/\n+/g, ' ');
        
        // Limitar tamanho
        if (excerpt.length > 200) {
            excerpt = excerpt.substring(0, 197) + '...';
        }

        return excerpt;
    }

    /**
     * Formatar categoria
     */
    formatCategory(category) {
        if (!category || typeof category !== 'string') {
            throw new Error('Categoria é obrigatória e deve ser uma string');
        }

        // Mapear categorias para valores seguros
        const categoryMap = {
            'prospecção b2b': 'Prospecção B2B',
            'prospecção': 'Prospecção B2B',
            'b2b': 'Prospecção B2B',
            'estratégias de outbound': 'Estratégias de Outbound',
            'outbound': 'Estratégias de Outbound',
            'gestão e vendas b2b': 'Gestão e Vendas B2B',
            'gestão': 'Gestão e Vendas B2B',
            'vendas': 'Gestão e Vendas B2B',
            'inteligência de dados': 'Inteligência de Dados',
            'dados': 'Inteligência de Dados',
            'analytics': 'Inteligência de Dados',
            'automação de vendas': 'Automação de Vendas',
            'automação': 'Automação de Vendas',
            'crm': 'Automação de Vendas'
        };

        const categoryLower = category.toLowerCase().trim();
        return categoryMap[categoryLower] || 'Automação de Vendas'; // Padrão seguro
    }
}

module.exports = ContentFormatter;
