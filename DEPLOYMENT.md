# 🚀 Guia de Deployment - LeadFlow

Este guia fornece instruções detalhadas para fazer o deploy do LeadFlow em diferentes plataformas.

## 📋 Índice

- [🎯 Pré-requisitos](#-pré-requisitos)
- [☁️ Vercel (Recomendado)](#️-vercel-recomendado)
- [🌐 Netlify](#-netlify)
- [🔥 Firebase Hosting](#-firebase-hosting)
- [☁️ AWS S3 + CloudFront](#️-aws-s3--cloudfront)
- [📱 GitHub Pages](#-github-pages)
- [🔧 Configuração de Ambiente](#-configuração-de-ambiente)
- [🔒 Variáveis de Ambiente](#-variáveis-de-ambiente)
- [📊 Monitoramento](#-monitoramento)

## 🎯 Pré-requisitos

### **Antes do Deploy**

1. **Configurar Supabase**
   - Criar projeto no Supabase
   - Executar script SQL (`supabase-setup.sql`)
   - Configurar políticas RLS

2. **Configurar N8N**
   - Deploy do N8N (local ou cloud)
   - Configurar webhook
   - Testar conectividade

3. **Preparar Assets**
   - Logo: `public/lflogo1.png`
   - Favicon: `public/faviconlf.png`
   - Verificar todos os arquivos estáticos

## ☁️ Vercel (Recomendado)

### **1. Preparação**

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login no Vercel
vercel login
```

### **2. Deploy Manual**

```bash
# Build do projeto
npm run build

# Deploy
vercel --prod
```

### **3. Deploy Automático via GitHub**

1. **Conectar Repositório**
   - Vá para [vercel.com](https://vercel.com)
   - Clique em "New Project"
   - Importe o repositório do GitHub

2. **Configurar Variáveis de Ambiente**
   ```env
   VITE_SUPABASE_URL=sua_url_do_supabase
   VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
   VITE_N8N_WEBHOOK_URL=sua_url_do_webhook_n8n
   ```

3. **Configurar Build Settings**
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### **4. Configuração Avançada**

O arquivo `vercel.json` já está configurado com:

```json
{
  "version": 2,
  "name": "leadflow",
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/assets/(.*)",
      "dest": "/assets/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

## 🌐 Netlify

### **1. Deploy Manual**

```bash
# Build do projeto
npm run build

# Deploy via drag & drop
# Arraste a pasta 'dist' para o Netlify
```

### **2. Deploy Automático**

1. **Conectar Repositório**
   - Vá para [netlify.com](https://netlify.com)
   - Clique em "New site from Git"
   - Conecte o repositório

2. **Configurar Build Settings**
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Node version**: `18`

3. **Variáveis de Ambiente**
   - Vá em Site settings > Environment variables
   - Adicione as variáveis necessárias

### **3. Configuração de Redirecionamento**

Crie um arquivo `public/_redirects`:

```
/*    /index.html   200
```

## 🔥 Firebase Hosting

### **1. Instalação**

```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Inicializar projeto
firebase init hosting
```

### **2. Configuração**

```bash
# Build do projeto
npm run build

# Deploy
firebase deploy
```

### **3. firebase.json**

```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "/assets/**",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000, immutable"
          }
        ]
      }
    ]
  }
}
```

## ☁️ AWS S3 + CloudFront

### **1. Configurar S3**

```bash
# Instalar AWS CLI
aws configure

# Criar bucket
aws s3 mb s3://leadflow-app

# Upload dos arquivos
aws s3 sync dist/ s3://leadflow-app --delete
```

### **2. Configurar CloudFront**

1. **Criar Distribution**
   - Origin: S3 bucket
   - Behaviors: Cache based on selected request headers
   - Error pages: Redirect to index.html

2. **Configurar Cache**
   - **TTL**: 31536000 (1 ano) para assets
   - **TTL**: 0 para HTML files

### **3. Script de Deploy**

```bash
#!/bin/bash
# deploy.sh

echo "🚀 Building project..."
npm run build

echo "📦 Uploading to S3..."
aws s3 sync dist/ s3://leadflow-app --delete

echo "🔄 Invalidating CloudFront cache..."
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"

echo "✅ Deploy completed!"
```

## 📱 GitHub Pages

### **1. Configuração**

```bash
# Adicionar gh-pages
npm install --save-dev gh-pages

# Adicionar script no package.json
{
  "scripts": {
    "deploy": "gh-pages -d dist"
  }
}
```

### **2. Deploy**

```bash
# Build
npm run build

# Deploy
npm run deploy
```

### **3. Configurar GitHub Actions**

O arquivo `.github/workflows/deploy.yml` já está configurado.

## 🔧 Configuração de Ambiente

### **1. Variáveis de Desenvolvimento**

```env
# .env.development
VITE_APP_ENV=development
VITE_DEBUG_MODE=true
VITE_API_URL=http://localhost:3000
```

### **2. Variáveis de Produção**

```env
# .env.production
VITE_APP_ENV=production
VITE_DEBUG_MODE=false
VITE_API_URL=https://api.leadflow.com
```

### **3. Scripts de Build**

```json
{
  "scripts": {
    "build": "vite build",
    "build:dev": "vite build --mode development",
    "build:prod": "vite build --mode production",
    "preview": "vite preview"
  }
}
```

## 🔒 Variáveis de Ambiente

### **Obrigatórias**

```env
VITE_SUPABASE_URL=https://lsvwjyhnnzeewuuuykmb.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_N8N_WEBHOOK_URL=https://n8n-n8n-start.kof6cn.easypanel.host/webhook-test/...
```

### **Opcionais**

```env
VITE_EVOLUTION_API_URL=https://api.evolutionapi.com
VITE_EVOLUTION_API_KEY=sua_chave_da_evolution_api
VITE_EVOLUTION_INSTANCE_NAME=sua_instancia
VITE_APP_ENV=production
VITE_DEBUG_MODE=false
```

### **Configuração por Plataforma**

#### **Vercel**
- Vá em Project Settings > Environment Variables
- Adicione cada variável

#### **Netlify**
- Vá em Site Settings > Environment Variables
- Configure para cada branch

#### **Firebase**
```bash
firebase functions:config:set supabase.url="sua_url" supabase.key="sua_chave"
```

## 📊 Monitoramento

### **1. Analytics**

```typescript
// Google Analytics
import { Analytics } from '@vercel/analytics/react';

function App() {
  return (
    <>
      <Analytics />
      {/* resto da aplicação */}
    </>
  );
}
```

### **2. Error Tracking**

```typescript
// Sentry
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "sua_dsn_do_sentry",
  environment: import.meta.env.VITE_APP_ENV,
});
```

### **3. Performance Monitoring**

```typescript
// Web Vitals
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
  // Enviar métricas para seu analytics
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

## 🔍 Troubleshooting

### **Problemas Comuns**

#### **1. Build Fails**
```bash
# Verificar dependências
npm ci

# Limpar cache
npm run clean

# Verificar TypeScript
npm run type-check
```

#### **2. Variáveis de Ambiente**
```bash
# Verificar se estão definidas
echo $VITE_SUPABASE_URL

# Testar build local
npm run build
```

#### **3. CORS Issues**
- Configurar CORS no Supabase
- Verificar configurações do N8N
- Testar endpoints manualmente

#### **4. Performance**
```bash
# Analisar bundle
npm run build -- --analyze

# Verificar tamanho dos assets
ls -la dist/
```

## 📞 Suporte

- **Email**: contato@mindflowdigital.com.br
- **Telefone**: 31 97266-1278
- **Documentação**: [README.md](./README.md)

---

**Desenvolvido com ❤️ pela MindFlow Digital**