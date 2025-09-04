# 📝 Blog LeadBaze - Documentação Completa

## 🎯 Visão Geral

O Blog LeadBaze é uma plataforma completa e profissional para criação, gerenciamento e publicação de conteúdo, integrada ao ecossistema LeadBaze. Desenvolvido com foco em performance, SEO e integração com N8N para automação.

## 🏗️ Arquitetura

### Estrutura de Pastas

```
src/
├── components/blog/           # Componentes específicos do blog
│   ├── BlogPostCard.tsx      # Card de post (3 variantes)
│   ├── BlogCategoryFilter.tsx # Filtros e busca
│   └── BlogSidebar.tsx       # Sidebar com widgets
├── pages/
│   ├── BlogPage.tsx          # Página principal do blog
│   └── BlogPostPage.tsx      # Página de post individual
├── types/
│   └── blog.ts               # Tipos TypeScript
├── lib/
│   ├── blogService.ts        # Serviço principal do blog
│   └── n8nWebhookService.ts  # Integração com N8N
├── styles/
│   └── blog.css              # Estilos específicos do blog
└── docs/
    └── BLOG_README.md        # Esta documentação
```

## 🚀 Funcionalidades

### ✅ Implementado

#### 🎨 Interface do Usuário
- **Design Responsivo**: Mobile-first, adaptado ao design LeadBaze
- **Dark Mode**: Suporte completo ao tema escuro
- **Variantes de Layout**: Cards featured, default e compact
- **Animações**: Smooth transitions e micro-interações
- **Loading States**: Skeletons e loading screens

#### 📊 Gestão de Conteúdo
- **Categorias**: Sistema completo com ícones e cores
- **Tags**: Sistema de tags para organização
- **Busca**: Busca em tempo real por título e conteúdo
- **Filtros**: Por categoria, tag, ordenação
- **Paginação**: Sistema robusto de paginação

#### 📈 Métricas e Analytics
- **Visualizações**: Contador de views por post
- **Likes**: Sistema de likes/favoritos
- **Tempo de Leitura**: Cálculo automático
- **Estatísticas**: Dashboard com métricas gerais

#### 🔗 Compartilhamento Social
- **Facebook**: Compartilhamento direto
- **Twitter**: Com hashtags personalizadas
- **LinkedIn**: Para conteúdo B2B
- **Copy Link**: Cópia automática do link

#### 🎯 SEO
- **Meta Tags**: Title, description, keywords
- **Structured Data**: Schema.org para posts
- **Slugs Amigáveis**: URLs otimizadas
- **Open Graph**: Integração para redes sociais

### 🔮 Integração N8N

#### Webhooks Configurados
```typescript
// Criar post
POST /webhook/leadbaze-blog
{
  "action": "create_post",
  "data": {
    "title": "Título do Post",
    "content": "<p>Conteúdo HTML</p>",
    "excerpt": "Resumo do post",
    "category": "category-slug",
    "tags": ["tag1", "tag2"],
    "author": {
      "name": "Nome do Autor",
      "email": "email@exemplo.com"
    },
    "featuredImage": "https://exemplo.com/imagem.jpg",
    "published": true
  }
}
```

#### Fluxos de Automação
1. **Auto-Publish**: Publicação automática via webhook
2. **Content Sync**: Sincronização bidirecional
3. **SEO Automation**: Geração automática de meta tags
4. **Social Media**: Publicação automática nas redes

## 📱 Componentes Principais

### BlogPostCard
Componente versátil com 3 variantes:

```tsx
// Featured - Para posts em destaque
<BlogPostCard post={post} variant="featured" />

// Default - Para listagem normal
<BlogPostCard post={post} variant="default" />

// Compact - Para sidebar e listas compactas
<BlogPostCard post={post} variant="compact" />
```

### BlogCategoryFilter
Sistema completo de filtros:

```tsx
<BlogCategoryFilter
  filters={filters}
  onFiltersChange={setFilters}
  showSearch={true}
/>
```

### BlogSidebar
Widgets informativos:
- Posts populares
- Posts recentes
- Categorias
- Tags populares
- Newsletter signup
- CTA do LeadBaze

## 🛠️ Configuração

### Variáveis de Ambiente

```env
# N8N Integration
VITE_N8N_WEBHOOK_URL=https://your-n8n.com/webhook/leadbaze-blog
VITE_N8N_API_KEY=your_api_key
VITE_N8N_ENABLED=true

# Blog Settings
VITE_BLOG_ENABLED=true
VITE_BLOG_POSTS_PER_PAGE=9
VITE_BLOG_AUTO_SYNC=true
```

### Roteamento

```tsx
// Rotas configuradas
/blog                    # Lista de posts
/blog?category=slug      # Filtro por categoria
/blog?tag=slug          # Filtro por tag
/blog?search=termo      # Busca
/blog/post-slug         # Post individual
```

## 🎨 Customização

### Cores das Categorias
```typescript
const categories = [
  {
    name: 'Prospecção B2B',
    color: 'bg-blue-500',    # Azul
    icon: '🎯'
  },
  {
    name: 'Automação',
    color: 'bg-purple-500',  # Roxo
    icon: '🤖'
  }
  // ...
]
```

### Estilos CSS
Classes personalizadas em `src/styles/blog.css`:
- `.prose` - Estilização de conteúdo
- `.hover-lift` - Efeitos hover
- `.line-clamp-*` - Truncamento de texto
- `.skeleton` - Loading states

## 🔄 Workflow N8N Exemplo

```json
{
  "name": "LeadBaze Blog Automation",
  "nodes": [
    {
      "name": "Webhook Trigger",
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "path": "leadbaze-blog",
        "httpMethod": "POST"
      }
    },
    {
      "name": "Process Content",
      "type": "n8n-nodes-base.function",
      "parameters": {
        "functionCode": "// Processar conteúdo"
      }
    },
    {
      "name": "Save to Database",
      "type": "n8n-nodes-base.supabase",
      "parameters": {
        "operation": "insert",
        "table": "blog_posts"
      }
    }
  ]
}
```

## 📊 Banco de Dados

### Tabela: blog_posts
```sql
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT,
  featured_image TEXT,
  category_id UUID REFERENCES blog_categories(id),
  author_id UUID REFERENCES auth.users(id),
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  read_time INTEGER,
  seo_title TEXT,
  seo_description TEXT,
  seo_keywords TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Tabela: blog_categories
```sql
CREATE TABLE blog_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  color TEXT,
  icon TEXT,
  post_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Tabela: blog_tags
```sql
CREATE TABLE blog_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  post_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Tabela: blog_post_tags (Many-to-Many)
```sql
CREATE TABLE blog_post_tags (
  post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES blog_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);
```

## 🚀 Próximos Passos

### Fase 1 - Implementação Básica ✅
- [x] Estrutura de componentes
- [x] Sistema de roteamento
- [x] Design responsivo
- [x] Integração com N8N (estrutura)

### Fase 2 - Base de Dados
- [ ] Criação das tabelas no Supabase
- [ ] Implementação do CRUD
- [ ] Sistema de autenticação para admin
- [ ] API endpoints

### Fase 3 - Automação N8N
- [ ] Workflow de publicação
- [ ] Sincronização de conteúdo
- [ ] Automação de SEO
- [ ] Integração com redes sociais

### Fase 4 - Features Avançadas
- [ ] Editor WYSIWYG
- [ ] Upload de imagens
- [ ] Sistema de comentários
- [ ] Newsletter automation
- [ ] Analytics avançado

## 🤝 Como Usar

### 1. Desenvolvimento Local
```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env.local

# Executar projeto
npm run dev

# Acessar blog
http://localhost:5173/blog
```

### 2. Criar Novo Post (via N8N)
```javascript
// Exemplo de payload para N8N
const newPost = {
  action: 'create_post',
  data: {
    title: 'Como Gerar 1000+ Leads com Google Maps',
    content: '<h2>Introdução</h2><p>Conteúdo...</p>',
    excerpt: 'Aprenda estratégias avançadas...',
    category: 'prospeccao-b2b',
    tags: ['leads', 'google-maps', 'prospeccao'],
    author: {
      name: 'João Silva',
      email: 'joao@leadbaze.com'
    },
    featuredImage: 'https://exemplo.com/imagem.jpg',
    published: true
  }
}
```

### 3. Personalizar Design
```tsx
// Personalizar cores das categorias
const customCategories = [
  {
    name: 'Sua Categoria',
    color: 'bg-green-500',  // Cor personalizada
    icon: '🎯',            // Ícone personalizado
    slug: 'sua-categoria'
  }
]
```

## 🐛 Troubleshooting

### Problema: Posts não carregam
**Solução**: Verificar conexão com N8N e variáveis de ambiente

### Problema: Estilos quebrados
**Solução**: Verificar import do `blog.css` no `index.css`

### Problema: Roteamento não funciona
**Solução**: Verificar se as rotas foram adicionadas no `App.tsx`

## 📞 Suporte

Para dúvidas e suporte:
- **Email**: suporte@leadbaze.com
- **Documentação**: [LeadBaze Docs](https://docs.leadbaze.com)
- **GitHub**: [LeadBaze Repository](https://github.com/leadbaze-io/leadbaze)

---

🚀 **Blog LeadBaze** - Transforme conhecimento em leads qualificados!
