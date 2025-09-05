/**
 * =====================================================
 * CONTENT FORMATTER SERVICE - LeadFlow
 * Serviço para formatação automática de conteúdo de posts
 * =====================================================
 */

class ContentFormatter {
    constructor() {
        // Templates de formatação para diferentes tipos de conteúdo
        this.templates = {
            // Template para narrativas/depoimentos
            narrative: {
                structure: 'story + experience + results',
                sections: ['Introdução', 'Jornada', 'Resultados', 'Conclusão'],
                style: 'fluido e pessoal',
                paragraphStyle: 'mb-6 text-black leading-relaxed text-lg',
                emphasisStyle: 'font-semibold text-gray-800'
            },
            // Template para artigos técnicos
            technical: {
                structure: 'intro + sections + conclusion',
                sections: ['Introdução', 'Desenvolvimento', 'Conclusão'],
                style: 'profissional',
                paragraphStyle: 'mb-4 text-black leading-relaxed',
                emphasisStyle: 'font-semibold text-gray-800'
            },
            // Template para tutoriais
            tutorial: {
                structure: 'intro + steps + tips + conclusion',
                sections: ['Introdução', 'Passo a Passo', 'Dicas', 'Conclusão'],
                style: 'didático',
                paragraphStyle: 'mb-4 text-black leading-relaxed',
                emphasisStyle: 'font-semibold text-gray-800'
            },
            // Template para notícias
            news: {
                structure: 'lead + body + context',
                sections: ['Resumo', 'Detalhes', 'Contexto'],
                style: 'jornalístico',
                paragraphStyle: 'mb-4 text-black leading-relaxed',
                emphasisStyle: 'font-semibold text-gray-800'
            },
            // Template para listas
            list: {
                structure: 'intro + items + conclusion',
                sections: ['Introdução', 'Lista', 'Conclusão'],
                style: 'organizado',
                paragraphStyle: 'mb-4 text-black leading-relaxed',
                emphasisStyle: 'font-semibold text-gray-800'
            }
        };

        // Validação de dados
        this.validationRules = {
            // Validar título
            validateTitle: (title) => {
                if (!title || typeof title !== 'string') {
                    return 'Título é obrigatório';
                }
                if (title.length < 10) {
                    return 'Título deve ter pelo menos 10 caracteres';
                }
                if (title.length > 100) {
                    return 'Título deve ter no máximo 100 caracteres';
                }
                return null;
            },
            
            // Validar conteúdo
            validateContent: (content) => {
                if (!content || typeof content !== 'string') {
                    return 'Conteúdo é obrigatório';
                }
                if (content.length < 100) {
                    return 'Conteúdo deve ter pelo menos 100 caracteres';
                }
                if (content.length > 50000) {
                    return 'Conteúdo deve ter no máximo 50.000 caracteres';
                }
                return null;
            },
            
            // Validar categoria (mais flexível)
            validateCategory: (category) => {
                if (!category || typeof category !== 'string') {
                    return 'Categoria é obrigatória';
                }
                
                // Aceitar qualquer categoria - o formatCategory vai fazer o mapeamento
                return null;
            }
        };

        // Padrões de formatação
        this.formattingRules = {
            // Limpeza de texto
            cleanText: (text) => {
                return text
                    .replace(/\s+/g, ' ') // Múltiplos espaços em um
                    .replace(/\n\s*\n/g, '\n\n') // Múltiplas quebras de linha em duas
                    .trim();
            },
            
            // Formatação de títulos
            formatTitles: (text) => {
                return text.replace(/^(#{1,6})\s*(.+)$/gm, (match, hashes, title) => {
                    const level = hashes.length;
                    const sizeClass = this.getTitleSize(level);
                    return `<h${level} class="text-${sizeClass} font-bold text-gray-900 dark:text-white mb-4 mt-6">${title.trim()}</h${level}>`;
                });
            },
            
            // Formatação de listas
            formatLists: (text) => {
                // Listas não ordenadas
                text = text.replace(/^[\s]*[-*+]\s+(.+)$/gm, '<li class="mb-2">$1</li>');
                text = text.replace(/(<li class="mb-2">.*<\/li>)/s, '<ul class="list-disc list-inside space-y-2 mb-4">$1</ul>');
                
                // Listas ordenadas
                text = text.replace(/^[\s]*\d+\.\s+(.+)$/gm, '<li class="mb-2">$1</li>');
                text = text.replace(/(<li class="mb-2">.*<\/li>)/s, '<ol class="list-decimal list-inside space-y-2 mb-4">$1</ol>');
                
                return text;
            },
            
            // Formatação de parágrafos
            formatParagraphs: (text) => {
                return text.replace(/^(?!<[h|u|o|l])(.+)$/gm, '<p class="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">$1</p>');
            },
            
            // Formatação de código
            formatCode: (text) => {
                // Blocos de código
                text = text.replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto mb-4"><code class="text-sm">$1</code></pre>');
                
                // Código inline
                text = text.replace(/`([^`]+)`/g, '<code class="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm font-mono">$1</code>');
                
                return text;
            },
            
            // Formatação de links
            formatLinks: (text) => {
                return text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">$1</a>');
            },
            
            // Formatação de ênfase
            formatEmphasis: (text) => {
                // Negrito
                text = text.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold">$1</strong>');
                text = text.replace(/__([^_]+)__/g, '<strong class="font-semibold">$1</strong>');
                
                // Itálico
                text = text.replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>');
                text = text.replace(/_([^_]+)_/g, '<em class="italic">$1</em>');
                
                return text;
            }
        };
    }

    /**
     * Obter tamanho do título baseado no nível
     */
    getTitleSize(level) {
        const sizes = {
            1: '3xl',
            2: '2xl', 
            3: 'xl',
            4: 'lg',
            5: 'base',
            6: 'sm'
        };
        return sizes[level] || 'lg';
    }

    /**
     * Detectar tipo de conteúdo de forma mais inteligente
     */
    detectContentType(content) {
        const lowerContent = content.toLowerCase();
        
        // Detectar narrativas/depoimentos (texto fluido, sem muitas listas)
        const narrativeIndicators = [
            'minha jornada', 'minha experiência', 'minha história', 'depoimento',
            'testemunho', 'case study', 'como consegui', 'como tripliquei',
            'como aumentei', 'transformação', 'evolução', 'crescimento pessoal'
        ];
        
        const hasNarrativeIndicators = narrativeIndicators.some(indicator => 
            lowerContent.includes(indicator)
        );
        
        // Contar elementos de lista
        const listCount = (content.match(/^\s*[-*+]\s/gm) || []).length + 
                         (content.match(/^\s*\d+\.\s/gm) || []).length;
        
        // Contar parágrafos longos (mais de 200 caracteres)
        const paragraphs = content.split('\n\n');
        const longParagraphs = paragraphs.filter(p => p.trim().length > 200).length;
        
        // Detectar se é principalmente narrativo
        if (hasNarrativeIndicators && longParagraphs > listCount && longParagraphs > 2) {
            console.log('�� [ContentFormatter] Detectado: NARRATIVA/DEPOIMENTO');
            return 'narrative';
        }
        
        // Detectar listas simples primeiro
        if (lowerContent.includes('lista') || lowerContent.includes('top') || 
            lowerContent.includes('melhores') || (listCount > 3 && listCount < 8)) {
            console.log('�� [ContentFormatter] Detectado: LISTA');
            return 'list';
        }
        
        // Detectar tutoriais (muitos passos numerados)
        if (lowerContent.includes('passo') || lowerContent.includes('tutorial') || 
            lowerContent.includes('como fazer') || listCount >= 8) {
            console.log('�� [ContentFormatter] Detectado: TUTORIAL/LISTA');
            return 'tutorial';
        }
        
        // Detectar notícias
        if (lowerContent.includes('notícia') || lowerContent.includes('anúncio') || 
            lowerContent.includes('lançamento') || lowerContent.includes('novidade')) {
            console.log('�� [ContentFormatter] Detectado: NOTÍCIA');
            return 'news';
        }
        
        console.log('�� [ContentFormatter] Detectado: ARTIGO TÉCNICO (padrão)');
        return 'technical';
    }

    /**
     * Estruturar conteúdo automaticamente
     */
    structureContent(content, type = null) {
        if (!type) {
            type = this.detectContentType(content);
        }

        // Usar formatação com estrutura melhorada baseada no tipo detectado
        const structuredContent = this.formatContentWithStructure(content, type);
        
        return structuredContent;
    }

    /**
     * Formatar conteúdo com estrutura melhorada baseada no tipo detectado
     */
    formatContentWithStructure(content, contentType = null) {
        // Detectar tipo de conteúdo se não fornecido
        if (!contentType) {
            contentType = this.detectContentType(content);
        }
        
        // Obter template para o tipo detectado
        const template = this.templates[contentType] || this.templates.technical;
        
        console.log(`�� [ContentFormatter] Aplicando template: ${contentType} (${template.style})`);
        
        // Primeiro, dividir o conteúdo em seções baseadas em títulos
        const sections = this.parseContentSections(content);
        
        let formattedContent = '';
        
        sections.forEach((section, index) => {
            if (section.type === 'title') {
                formattedContent += `<h2 class="text-2xl font-bold text-black mb-6 mt-8">${section.content}</h2>`;
            } else if (section.type === 'subtitle') {
                formattedContent += `<h3 class="text-xl font-semibold text-black mb-4 mt-6">${section.content}</h3>`;
            } else if (section.type === 'numbered_list') {
                formattedContent += this.formatNumberedList(section.content);
            } else if (section.type === 'bullet_list') {
                formattedContent += this.formatBulletList(section.content);
            } else if (section.type === 'paragraph') {
                // Usar estilo do template detectado
                formattedContent += `<p class="${template.paragraphStyle}">${this.formatInlineText(section.content)}</p>`;
            }
        });
        
        return formattedContent;
    }

    /**
     * Analisar seções do conteúdo
     */
    parseContentSections(content) {
        const sections = [];
        const lines = content.split('\n');
        
        let i = 0;
        while (i < lines.length) {
            const line = lines[i].trim();
            
            if (!line) {
                i++;
                continue;
            }
            
            // Título principal (##)
            if (line.startsWith('## ')) {
                sections.push({
                    type: 'title',
                    content: line.substring(3).trim()
                });
            }
            // Subtítulo (###)
            else if (line.startsWith('### ')) {
                sections.push({
                    type: 'subtitle',
                    content: line.substring(4).trim()
                });
            }
            // Lista numerada
            else if (/^\d+\.\s/.test(line)) {
                const listItems = [];
                while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
                    const item = lines[i].trim();
                    listItems.push(item.replace(/^\d+\.\s/, ''));
                    i++;
                }
                sections.push({
                    type: 'numbered_list',
                    content: listItems
                });
                continue; // Não incrementar i aqui pois já foi incrementado no loop
            }
            // Lista com bullets
            else if (line.startsWith('- ') || line.startsWith('* ')) {
                const listItems = [];
                while (i < lines.length && (lines[i].trim().startsWith('- ') || lines[i].trim().startsWith('* '))) {
                    const item = lines[i].trim();
                    listItems.push(item.substring(2));
                    i++;
                }
                sections.push({
                    type: 'bullet_list',
                    content: listItems
                });
                continue; // Não incrementar i aqui pois já foi incrementado no loop
            }
            // Parágrafo - combinar linhas relacionadas
            else {
                // Se já existe um parágrafo anterior, combinar com ele
                if (sections.length > 0 && sections[sections.length - 1].type === 'paragraph') {
                    sections[sections.length - 1].content += ' ' + line;
                } else {
                    sections.push({
                        type: 'paragraph',
                        content: line
                    });
                }
            }
            
            i++;
        }
        
        return sections;
    }

    /**
     * Formatar lista numerada
     */
    formatNumberedList(items) {
        const listItems = items.map(item => 
            `<li class="mb-2 text-black">${this.formatInlineText(item)}</li>`
        ).join('');
        
        return `<ol class="list-decimal list-inside space-y-2 mb-6 pl-4">${listItems}</ol>`;
    }

    /**
     * Formatar lista com bullets
     */
    formatBulletList(items) {
        const listItems = items.map(item => 
            `<li class="mb-2 text-black">${this.formatInlineText(item)}</li>`
        ).join('');
        
        return `<ul class="list-disc list-inside space-y-2 mb-6 pl-4">${listItems}</ul>`;
    }

    /**
     * Formatar texto inline (negrito, itálico, etc.)
     */
    formatInlineText(text) {
        // Formatar negrito
        text = text.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-black">$1</strong>');
        text = text.replace(/__([^_]+)__/g, '<strong class="font-semibold text-black">$1</strong>');
        
        // Formatar itálico
        text = text.replace(/\*([^*]+)\*/g, '<em class="italic text-black">$1</em>');
        text = text.replace(/_([^_]+)_/g, '<em class="italic text-black">$1</em>');
        
        // Formatar links
        text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:text-blue-800 underline font-medium" target="_blank" rel="noopener noreferrer">$1</a>');
        
        return text;
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
            type = null
        } = postData;
        
        // Detectar tipo se não especificado
        const contentType = type || this.detectContentType(content);
        
        // Estruturar conteúdo
        const structuredContent = this.structureContent(content, contentType);
        
        // Gerar excerpt
        const excerpt = this.generateExcerpt(content);
        
        return {
            title: this.formatTitle(title),
            content: structuredContent,
            excerpt: excerpt,
            category: this.formatCategory(category),
            type: contentType,
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
        return title
            .trim()
            .replace(/\s+/g, ' ')
            .replace(/^[a-z]/, (match) => match.toUpperCase());
    }

    /**
     * Formatar categoria (SISTEMA INTELIGENTE - mapeia para 5 categorias principais)
     */
    formatCategory(category) {
        // 5 categorias principais do blog (sempre existem no banco)
        const mainCategories = [
            'Prospecção B2B',
            'Estratégias de Outbound', 
            'Gestão e Vendas B2B',
            'Inteligência de Dados',
            'Automação de Vendas'
        ];
        
        // Mapeamento inteligente baseado em palavras-chave
        const smartMapping = {
            // Prospecção B2B
            'prospecção': 'Prospecção B2B',
            'prospect': 'Prospecção B2B',
            'lead': 'Prospecção B2B',
            'leads': 'Prospecção B2B',
            'qualificação': 'Prospecção B2B',
            'cold': 'Prospecção B2B',
            'outreach': 'Prospecção B2B',
            'contato': 'Prospecção B2B',
            'prospecção b2b': 'Prospecção B2B',
            
            // Estratégias de Outbound
            'outbound': 'Estratégias de Outbound',
            'estratégias': 'Estratégias de Outbound',
            'campanhas': 'Estratégias de Outbound',
            'email': 'Estratégias de Outbound',
            'linkedin': 'Estratégias de Outbound',
            'sequência': 'Estratégias de Outbound',
            'follow': 'Estratégias de Outbound',
            'nurturing': 'Estratégias de Outbound',
            'estratégias de outbound': 'Estratégias de Outbound',
            
            // Gestão e Vendas B2B
            'vendas': 'Gestão e Vendas B2B',
            'sales': 'Gestão e Vendas B2B',
            'gestão': 'Gestão e Vendas B2B',
            'crm': 'Gestão e Vendas B2B',
            'pipeline': 'Gestão e Vendas B2B',
            'negociação': 'Gestão e Vendas B2B',
            'fechamento': 'Gestão e Vendas B2B',
            'conversão': 'Gestão e Vendas B2B',
            'gestão e vendas b2b': 'Gestão e Vendas B2B',
            
            // Inteligência de Dados
            'dados': 'Inteligência de Dados',
            'analytics': 'Inteligência de Dados',
            'métricas': 'Inteligência de Dados',
            'kpi': 'Inteligência de Dados',
            'relatórios': 'Inteligência de Dados',
            'dashboard': 'Inteligência de Dados',
            'inteligência': 'Inteligência de Dados',
            'ia': 'Inteligência de Dados',
            'ai': 'Inteligência de Dados',
            'inteligência de dados': 'Inteligência de Dados',
            
            // Automação de Vendas
            'automação': 'Automação de Vendas',
            'automation': 'Automação de Vendas',
            'workflow': 'Automação de Vendas',
            'zapier': 'Automação de Vendas',
            'hubspot': 'Automação de Vendas',
            'pipedrive': 'Automação de Vendas',
            'automatizar': 'Automação de Vendas',
            'automação de vendas': 'Automação de Vendas',
            
            // Fallbacks inteligentes
            'marketing': 'Estratégias de Outbound',
            'business': 'Gestão e Vendas B2B',
            'tech': 'Inteligência de Dados',
            'tutorial': 'Automação de Vendas',
            'news': 'Prospecção B2B',
            'seo': 'Estratégias de Outbound',
            'geral': 'Gestão e Vendas B2B'
        };
        
        // Normalizar categoria de entrada
        const normalizedCategory = category.toLowerCase().trim();
        
        // Tentar mapeamento direto
        let mappedCategory = smartMapping[normalizedCategory];
        
        // Se não encontrou mapeamento direto, tentar busca por palavras-chave
        if (!mappedCategory) {
            for (const [keyword, targetCategory] of Object.entries(smartMapping)) {
                if (normalizedCategory.includes(keyword) || keyword.includes(normalizedCategory)) {
                    mappedCategory = targetCategory;
                    break;
                }
            }
        }
        
        // Se ainda não encontrou, usar categoria padrão baseada no conteúdo
        if (!mappedCategory) {
            mappedCategory = 'Gestão e Vendas B2B'; // Categoria mais genérica
        }
        
        console.log(`��️ [ContentFormatter] Categoria fornecida: "${category}"`);
        console.log(`��️ [ContentFormatter] Categoria mapeada: "${mappedCategory}"`);
        console.log(`��️ [ContentFormatter] ✅ Categoria segura e organizada!`);
        
        return mappedCategory;
    }

    /**
     * Gerar excerpt automático
     */
    generateExcerpt(content, maxLength = 160) {
        // Remover HTML tags
        const plainText = content.replace(/<[^>]*>/g, '');
        
        // Limpar texto
        const cleanText = plainText
            .replace(/\s+/g, ' ')
            .trim();
        
        // Cortar no tamanho máximo
        if (cleanText.length <= maxLength) {
            return cleanText;
        }
        
        // Cortar na última palavra completa
        const truncated = cleanText.substring(0, maxLength);
        const lastSpace = truncated.lastIndexOf(' ');
        
        return lastSpace > 0 
            ? truncated.substring(0, lastSpace) + '...'
            : truncated + '...';
    }
}

module.exports = ContentFormatter;
