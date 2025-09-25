class ValidationRules {
    validateTitle(title) {
        if (!title || typeof title !== 'string') {
            return 'Título é obrigatório e deve ser uma string';
        }
        if (title.length < 5) {
            return 'Título deve ter pelo menos 5 caracteres';
        }
        if (title.length > 100) {
            return 'Título deve ter no máximo 100 caracteres';
        }
        return null;
    }

    validateContent(content) {
        if (!content || typeof content !== 'string') {
            return 'Conteúdo é obrigatório e deve ser uma string';
        }
        if (content.length < 100) {
            return 'Conteúdo deve ter pelo menos 100 caracteres';
        }
        return null;
    }

    validateCategory(category) {
        if (!category || typeof category !== 'string') {
            return 'Categoria é obrigatória e deve ser uma string';
        }
        return null;
    }
}

module.exports = ValidationRules;






























