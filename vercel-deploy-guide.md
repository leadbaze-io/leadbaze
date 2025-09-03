# 🚀 Guia de Deploy no Vercel - LeadFlow

## 📋 Por que Vercel?

O LeadFlow é uma aplicação React dinâmica que **NÃO funciona** no GitHub Pages. O Vercel é a melhor opção porque:

- ✅ **Suporte completo** a React/TypeScript
- ✅ **Variáveis de ambiente** seguras
- ✅ **Deploy automático** a cada push
- ✅ **SSL automático** e CDN global
- ✅ **Analytics integrado**
- ✅ **Domínio personalizado**

## 🚫 Por que não GitHub Pages?

1. **React SPA** - Precisa de servidor para roteamento
2. **Supabase** - Requer variáveis de ambiente
3. **N8N Webhook** - Comunicação com API externa
4. **Funcionalidades dinâmicas** - Banco de dados e autenticação

## 🚀 Deploy no Vercel

### **1. Conectar Repositório**

1. **Acesse**: https://vercel.com
2. **Faça login** com sua conta GitHub
3. **Clique em**: "New Project"
4. **Import from Git**: Selecione `mindflowai1/leadflow`

### **2. Configurar Build**

```bash
# Configurações automáticas detectadas:
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### **3. Configurar Environment Variables**

⚠️ **IMPORTANTE**: As variáveis de ambiente devem ser configuradas no painel do Vercel, não no arquivo `vercel.json`.

**No painel do Vercel:**

1. **Vá para**: Project Settings > Environment Variables
2. **Adicione cada variável**:

```env
# Supabase
VITE_SUPABASE_URL=https://lsvwjyhnnzeewuuuykmb.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# N8N Webhook
VITE_N8N_WEBHOOK_URL=https://n8n-n8n-start.kof6cn.easypanel.host/webhook-test/...

# Opcionais
VITE_APP_ENV=production
VITE_DEBUG_MODE=false
```

3. **Selecione os ambientes**: Production, Preview, Development
4. **Clique em**: "Save"

### **4. Deploy**

1. **Clique em**: "Deploy"
2. **Aguarde** o build (2-3 minutos)
3. **Acesse** a URL fornecida

## 🔧 Configuração Avançada

### **Domínio Personalizado**

1. **Vá para**: Project Settings > Domains
2. **Adicione**: `leadflow.mindflowdigital.com.br`
3. **Configure DNS** conforme instruções

### **Deploy Automático**

- ✅ **Push para main** = Deploy automático
- ✅ **Pull Request** = Preview deployment
- ✅ **Rollback** = Versões anteriores

### **Monitoramento**

1. **Analytics**: Integrado automaticamente
2. **Logs**: Acesse em Functions > Logs
3. **Performance**: Lighthouse scores automáticos

## 🧪 Testar Deploy

Após o deploy, teste:

1. **Landing Page**: https://seu-projeto.vercel.app
2. **Cadastro**: /login
3. **Dashboard**: /dashboard (após login)
4. **Gerador**: /gerador
5. **Disparador**: /disparador

## 🚨 Solução de Problemas

### **Build Falha**
```bash
# Verificar logs no Vercel
# Testar localmente:
npm run build
```

### **Variáveis de Ambiente**
- Verificar se estão configuradas no Vercel
- Reiniciar deploy após adicionar variáveis

### **CORS Issues**
- Configurar CORS no Supabase
- Verificar URLs permitidas

### **Performance**
- Otimizar imagens
- Verificar bundle size
- Usar lazy loading

## 📊 Alternativas

### **Netlify**
- Similar ao Vercel
- Funções serverless
- Formulários integrados

### **Railway**
- Plataforma completa
- Banco de dados incluído
- Deploy full-stack

### **Render**
- Alternativa ao Heroku
- Suporte a aplicações dinâmicas

## 🎉 Benefícios do Vercel

- ✅ **Deploy automático** a cada push
- ✅ **Preview deployments** para PRs
- ✅ **Rollback** instantâneo
- ✅ **Analytics** integrado
- ✅ **SSL automático**
- ✅ **CDN global**
- ✅ **Domínio personalizado**
- ✅ **Variáveis de ambiente** seguras

## 📞 Suporte

- **Vercel Docs**: https://vercel.com/docs
- **Email**: contato@mindflowdigital.com.br
- **Telefone**: 31 97266-1278

---

**🚀 Vercel é a escolha perfeita para o LeadFlow!** 