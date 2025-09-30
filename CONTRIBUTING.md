# 🤝 Guia de Contribuição - LeadFlow

Obrigado por considerar contribuir com o LeadFlow! Este documento fornece diretrizes para contribuições.

## 📋 Índice

- [🚀 Como Contribuir](#-como-contribuir)
- [🐛 Reportando Bugs](#-reportando-bugs)
- [💡 Sugerindo Melhorias](#-sugerindo-melhorias)
- [🔧 Configuração do Ambiente](#-configuração-do-ambiente)
- [📝 Padrões de Código](#-padrões-de-código)
- [🧪 Testes](#-testes)
- [📦 Deploy](#-deploy)

## 🚀 Como Contribuir

### 1. **Fork o Projeto**
```bash
# Clone o repositório
git clone https://github.com/seu-usuario/leadflow.git
cd leadflow

# Adicione o repositório original como upstream
git remote add upstream https://github.com/original-owner/leadflow.git
```

### 2. **Crie uma Branch**
```bash
# Crie uma branch para sua feature
git checkout -b feature/nova-funcionalidade

# Ou para correção de bugs
git checkout -b fix/correcao-bug
```

### 3. **Faça suas Alterações**
- Escreva código limpo e bem documentado
- Siga os padrões de código estabelecidos
- Adicione testes quando apropriado
- Atualize a documentação se necessário

### 4. **Commit suas Mudanças**
```bash
# Adicione as mudanças
git add .

# Faça o commit com mensagem descritiva
git commit -m "feat: adiciona nova funcionalidade de exportação"

# Push para sua branch
git push origin feature/nova-funcionalidade
```

### 5. **Abra um Pull Request**
- Vá para o repositório original no GitHub
- Clique em "New Pull Request"
- Selecione sua branch
- Preencha o template do PR

## 🐛 Reportando Bugs

### Template para Issues de Bug

```markdown
**Descrição do Bug**
Uma descrição clara e concisa do bug.

**Passos para Reproduzir**
1. Vá para '...'
2. Clique em '...'
3. Role até '...'
4. Veja o erro

**Comportamento Esperado**
Uma descrição do que deveria acontecer.

**Comportamento Atual**
Uma descrição do que está acontecendo.

**Screenshots**
Se aplicável, adicione screenshots para ajudar a explicar o problema.

**Ambiente**
- OS: [ex: Windows 10, macOS, Ubuntu]
- Navegador: [ex: Chrome, Firefox, Safari]
- Versão: [ex: 22]

**Informações Adicionais**
Qualquer outra informação sobre o problema.
```

## 💡 Sugerindo Melhorias

### Template para Feature Requests

```markdown
**Problema que a Feature Resolve**
Uma descrição clara do problema que a feature resolve.

**Solução Proposta**
Uma descrição clara da solução que você gostaria.

**Alternativas Consideradas**
Uma descrição de outras soluções que você considerou.

**Contexto Adicional**
Qualquer contexto adicional, screenshots, etc.
```

## 🔧 Configuração do Ambiente

### Pré-requisitos
- Node.js 18+
- npm ou yarn
- Git

### Setup Local
```bash
# Clone o repositório
git clone https://github.com/seu-usuario/leadflow.git
cd leadflow

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas credenciais

# Execute o projeto
npm run dev
```

### Scripts Disponíveis
```bash
# Desenvolvimento
npm run dev

# Build de produção
npm run build

# Preview do build
npm run preview

# Linting
npm run lint

# Linting com correção automática
npm run lint:fix

# Type checking
npm run type-check
```

## 📝 Padrões de Código

### TypeScript
- Use TypeScript para todos os arquivos
- Defina interfaces para props de componentes
- Use tipos específicos em vez de `any`

### React
- Use functional components com hooks
- Use React.memo para otimização quando necessário
- Mantenha componentes pequenos e focados

### Estilização
- Use Tailwind CSS para estilização
- Mantenha classes organizadas
- Use componentes reutilizáveis

### Nomenclatura
```typescript
// Componentes: PascalCase
const UserProfile = () => { ... }

// Funções: camelCase
const getUserData = () => { ... }

// Constantes: UPPER_SNAKE_CASE
const API_ENDPOINTS = { ... }

// Interfaces: PascalCase com I prefix
interface IUserData { ... }

// Tipos: PascalCase
type UserStatus = 'active' | 'inactive'
```

### Commits
Use [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Tipos de commit
feat: nova funcionalidade
fix: correção de bug
docs: documentação
style: formatação
refactor: refatoração
test: testes
chore: tarefas de manutenção

# Exemplos
git commit -m "feat: adiciona sistema de notificações"
git commit -m "fix: corrige erro de validação no formulário"
git commit -m "docs: atualiza README com instruções de instalação"
```

## 🧪 Testes

### Executando Testes
```bash
# Testes unitários
npm run test

# Testes com coverage
npm run test:coverage

# Testes em modo watch
npm run test:watch
```

### Escrevendo Testes
- Teste componentes isoladamente
- Use mocks para dependências externas
- Mantenha testes simples e legíveis
- Cubra casos de sucesso e erro

## 📦 Deploy

### Verificação Pré-Deploy
```bash
# Build de produção
npm run build

# Verificação de tipos
npm run type-check

# Linting
npm run lint

# Testes
npm run test
```

### Deploy Automático
- O projeto usa GitHub Actions para CI/CD
- Deploy automático em push para `main`
- Deploy de preview em pull requests

## 📞 Suporte

### Canais de Comunicação
- **Issues**: [GitHub Issues](https://github.com/seu-usuario/leadflow/issues)
- **Email**: contato@mindflowdigital.com.br
- **Telefone**: 31 97266-1278

### Recursos Úteis
- [Documentação do React](https://reactjs.org/docs/)
- [Documentação do TypeScript](https://www.typescriptlang.org/docs/)
- [Documentação do Tailwind CSS](https://tailwindcss.com/docs)
- [Documentação do Supabase](https://supabase.com/docs)

## 🎉 Agradecimentos

Obrigado por contribuir com o LeadFlow! Suas contribuições ajudam a tornar o projeto melhor para todos.

---

**Desenvolvido com ❤️ pela MindFlow Digital** 