# 🚀 Guia de Configuração do GitHub - LeadFlow

Este guia fornece instruções passo a passo para configurar o projeto LeadFlow no GitHub.

## 📋 Índice

- [🎯 Pré-requisitos](#-pré-requisitos)
- [📁 Preparação do Repositório](#-preparação-do-repositório)
- [🔧 Configuração do GitHub](#-configuração-do-github)
- [🔒 Secrets e Variáveis](#-secrets-e-variáveis)
- [🚀 Primeiro Deploy](#-primeiro-deploy)
- [📊 Configurações Avançadas](#-configurações-avançadas)

## 🎯 Pré-requisitos

### **Antes de Começar**

1. **Conta no GitHub**
   - Criar conta em [github.com](https://github.com)
   - Configurar SSH keys (recomendado)

2. **Git Local**
   ```bash
   # Verificar se Git está instalado
   git --version
   
   # Configurar Git (se necessário)
   git config --global user.name "Seu Nome"
   git config --global user.email "seu@email.com"
   ```

3. **Projeto Pronto**
   - Todos os arquivos criados
   - Build funcionando localmente
   - Testes passando

## 📁 Preparação do Repositório

### **1. Inicializar Git Local**

```bash
# Navegar para o diretório do projeto
cd leadflow

# Inicializar repositório Git
git init

# Adicionar todos os arquivos
git add .

# Primeiro commit
git commit -m "feat: initial commit - LeadFlow project setup"
```

### **2. Verificar Arquivos Incluídos**

Certifique-se que os seguintes arquivos estão no repositório:

```
leadflow/
├── 📄 README.md
├── 📄 LICENSE
├── 📄 CONTRIBUTING.md
├── 📄 CHANGELOG.md
├── 📄 DEPLOYMENT.md
├── 📄 .gitignore
├── 📄 package.json
├── 📄 vite.config.ts
├── 📄 vercel.json
├── 📁 .github/
│   ├── 📄 ISSUE_TEMPLATE.md
│   ├── 📄 PULL_REQUEST_TEMPLATE.md
│   └── 📁 workflows/
│       └── 📄 deploy.yml
├── 📁 public/
│   ├── 📄 lflogo1.png
│   ├── 📄 faviconlf.png
│   └── 📄 index.html
├── 📁 src/
│   ├── 📁 components/
│   ├── 📁 pages/
│   ├── 📁 lib/
│   ├── 📁 types/
│   └── 📄 App.tsx
└── 📄 supabase-setup.sql
```

### **3. Verificar .gitignore**

Confirme que o `.gitignore` está excluindo:

```bash
# Verificar arquivos que serão ignorados
git status --ignored

# Verificar se arquivos sensíveis não estão sendo trackeados
git check-ignore .env.local
git check-ignore node_modules/
git check-ignore dist/
```

## 🔧 Configuração do GitHub

### **1. Criar Repositório**

1. **Acesse GitHub**
   - Vá para [github.com](https://github.com)
   - Clique em "New repository"

2. **Configurar Repositório**
   ```
   Repository name: leadflow
   Description: 🚀 LeadFlow - Gerador de Leads Profissional
   Visibility: Public (ou Private)
   Initialize with: NÃO marcar nenhuma opção
   ```

3. **Criar Repositório**
   - Clique em "Create repository"

### **2. Conectar Repositório Local**

```bash
# Adicionar remote origin
git remote add origin https://github.com/seu-usuario/leadflow.git

# Verificar remote
git remote -v

# Push inicial
git branch -M main
git push -u origin main
```

### **3. Configurar Branch Protection**

1. **Vá para Settings > Branches**
2. **Add rule para `main`**
3. **Configurar:**
   - ✅ Require a pull request before merging
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - ✅ Include administrators

## 🔒 Secrets e Variáveis

### **1. Configurar Secrets**

Vá para **Settings > Secrets and variables > Actions**

#### **Secrets Obrigatórios:**

```bash
# Supabase
VITE_SUPABASE_URL=https://lsvwjyhnnzeewuuuykmb.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# N8N Webhook
VITE_N8N_WEBHOOK_URL=https://n8n-n8n-start.kof6cn.easypanel.host/webhook-test/...

# Vercel (se usar)
VERCEL_TOKEN=seu_token_do_vercel
VERCEL_ORG_ID=seu_org_id_do_vercel
VERCEL_PROJECT_ID=seu_project_id_do_vercel

# Slack (opcional)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
```

### **2. Como Obter Secrets**

#### **Vercel Token:**
```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Obter token
vercel whoami
```

#### **Supabase Keys:**
1. Acesse [supabase.com](https://supabase.com)
2. Vá para seu projeto
3. Settings > API
4. Copie URL e anon key

### **3. Configurar Environment Variables**

Para diferentes ambientes:

```bash
# Development
VITE_APP_ENV=development
VITE_DEBUG_MODE=true

# Production
VITE_APP_ENV=production
VITE_DEBUG_MODE=false
```

## 🚀 Primeiro Deploy

### **1. Testar Localmente**

```bash
# Verificar se tudo funciona
npm run build
npm run lint
npm run type-check

# Testar localmente
npm run dev
```

### **2. Push para GitHub**

```bash
# Adicionar mudanças
git add .

# Commit
git commit -m "feat: prepare for first deployment"

# Push
git push origin main
```

### **3. Verificar GitHub Actions**

1. **Vá para Actions tab**
2. **Verifique se o workflow está rodando**
3. **Aguarde conclusão dos testes**

### **4. Configurar Deploy**

#### **Opção A: Vercel (Recomendado)**

1. **Conectar Vercel**
   - Vá para [vercel.com](https://vercel.com)
   - Import from Git
   - Selecione o repositório

2. **Configurar Build**
   ```
   Framework Preset: Vite
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

3. **Adicionar Environment Variables**
   - Vá em Project Settings > Environment Variables
   - Adicione as mesmas variáveis dos secrets

#### **Opção B: Netlify**

1. **Conectar Netlify**
   - Vá para [netlify.com](https://netlify.com)
   - New site from Git
   - Selecione o repositório

2. **Configurar Build**
   ```
   Build command: npm run build
   Publish directory: dist
   ```

## 📊 Configurações Avançadas

### **1. Configurar Issues**

O template de issues já está configurado em `.github/ISSUE_TEMPLATE.md`

### **2. Configurar Pull Requests**

O template de PR já está configurado em `.github/PULL_REQUEST_TEMPLATE.md`

### **3. Configurar Labels**

Criar labels padrão:

```bash
# Bug
bug: 🐛 Bug report

# Enhancement
enhancement: ✨ New feature

# Documentation
documentation: 📚 Documentation

# Good first issue
good first issue: 🎯 Good for newcomers

# Help wanted
help wanted: 💡 Help needed
```

### **4. Configurar Milestones**

Criar milestones para organização:

```
v1.0.0 - Initial Release
v1.1.0 - Performance Improvements
v1.2.0 - New Features
```

### **5. Configurar Projects**

1. **Criar Project**
   - Vá para Projects tab
   - New project
   - Board template

2. **Configurar Columns:**
   ```
   📋 Backlog
   🔄 In Progress
   👀 Review
   ✅ Done
   ```

## 🔍 Verificações Finais

### **1. Checklist de Verificação**

- [ ] ✅ Repositório criado no GitHub
- [ ] ✅ Código enviado para o repositório
- [ ] ✅ Secrets configurados
- [ ] ✅ GitHub Actions funcionando
- [ ] ✅ Deploy configurado (Vercel/Netlify)
- [ ] ✅ Issues e PRs configurados
- [ ] ✅ README.md atualizado
- [ ] ✅ LICENSE adicionado
- [ ] ✅ .gitignore configurado

### **2. Testes de Funcionamento**

```bash
# Clone em novo diretório para testar
git clone https://github.com/seu-usuario/leadflow.git
cd leadflow
npm install
npm run dev

# Verificar se tudo funciona
```

### **3. Verificar Deploy**

1. **Acesse a URL de produção**
2. **Teste todas as funcionalidades:**
   - ✅ Landing page carrega
   - ✅ Login/registro funciona
   - ✅ Dashboard funciona
   - ✅ Geração de leads funciona
   - ✅ Disparador funciona

## 📞 Suporte

### **Problemas Comuns**

#### **1. Push Rejeitado**
```bash
# Atualizar repositório local
git pull origin main

# Resolver conflitos se houver
# Fazer push novamente
git push origin main
```

#### **2. Build Falha**
```bash
# Verificar logs do GitHub Actions
# Testar localmente
npm run build

# Verificar variáveis de ambiente
```

#### **3. Secrets Não Funcionam**
- Verificar se estão configurados corretamente
- Verificar se os nomes estão corretos
- Verificar se não há espaços extras

### **Recursos Úteis**

- [GitHub Docs](https://docs.github.com)
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Vercel Docs](https://vercel.com/docs)
- [Netlify Docs](https://docs.netlify.com)

---

## 🎉 Parabéns!

Seu projeto LeadFlow está agora configurado no GitHub com:

- ✅ **Repositório profissional** com documentação completa
- ✅ **CI/CD automático** com GitHub Actions
- ✅ **Deploy automático** para produção
- ✅ **Templates** para issues e pull requests
- ✅ **Proteção de branches** e code review
- ✅ **Monitoramento** e analytics

**🚀 Próximo passo: Compartilhar o projeto e começar a receber contribuições!**

---

**Desenvolvido com ❤️ pela MindFlow Digital** 