# 🚀 Guia Completo - Testar Performance com Lighthouse

## 📋 Índice
1. [Preparação](#preparação)
2. [Método 1: Chrome DevTools (Recomendado)](#método-1-chrome-devtools)
3. [Método 2: Lighthouse CLI](#método-2-lighthouse-cli)
4. [Método 3: PageSpeed Insights Online](#método-3-pagespeed-insights)
5. [O Que Analisar](#o-que-analisar)
6. [Métricas Esperadas](#métricas-esperadas)

---

## 🎯 Preparação

### 1. Build de Produção
```bash
# Fazer build otimizado
npm run build

# Servir o build de produção (escolha um)
npm run preview
# OU
npx serve dist -s
```

### 2. Ambiente Ideal para Testes
- ✅ Fechar outras abas do navegador
- ✅ Desabilitar extensões (use modo anônimo)
- ✅ Conectar à internet estável
- ✅ Fechar programas pesados
- ✅ Usar laptop conectado (não em bateria)

---

## 🔧 Método 1: Chrome DevTools (Recomendado)

### Passo a Passo:

#### 1. **Iniciar o Servidor**
```bash
# Na pasta do projeto
npm run preview

# Servidor iniciará em: http://localhost:4173
```

#### 2. **Abrir Chrome DevTools**
1. Abrir Chrome/Edge em **modo anônimo** (Ctrl+Shift+N)
2. Navegar para: `http://localhost:4173`
3. Pressionar `F12` ou `Ctrl+Shift+I`
4. Ir para aba **"Lighthouse"**

#### 3. **Configurar o Teste**

##### Opção A: Teste Completo (Desktop)
```
✅ Performance
✅ Accessibility
✅ Best Practices
✅ SEO
Device: Desktop
```

##### Opção B: Teste Mobile
```
✅ Performance
Device: Mobile
Throttling: Simulated 4G
```

##### Opção C: Teste Conexão Lenta (3G)
```
✅ Performance
Device: Mobile
Throttling: Slow 3G
```

#### 4. **Executar o Teste**
- Clicar em **"Analyze page load"** ou **"Generate report"**
- Aguardar ~30-60 segundos
- ⚠️ Não interagir com a página durante o teste

#### 5. **Páginas para Testar**

Teste todas estas páginas importantes:

```
1. Landing Page:     http://localhost:4173/
2. Login:            http://localhost:4173/login
3. Dashboard:        http://localhost:4173/dashboard
4. Gerador de Leads: http://localhost:4173/gerador
5. Disparador:       http://localhost:4173/disparador
6. Blog:             http://localhost:4173/blog
```

---

## 💻 Método 2: Lighthouse CLI

### Instalação:
```bash
# Instalar Lighthouse globalmente
npm install -g lighthouse

# Ou usar npx (sem instalar)
npx lighthouse --version
```

### Uso Básico:

#### 1. **Teste Desktop**
```bash
# Servir o projeto
npm run preview

# Em outro terminal, executar Lighthouse
lighthouse http://localhost:4173 \
  --output html \
  --output-path ./lighthouse-report-desktop.html \
  --view
```

#### 2. **Teste Mobile**
```bash
lighthouse http://localhost:4173 \
  --output html \
  --output-path ./lighthouse-report-mobile.html \
  --emulated-form-factor=mobile \
  --throttling.cpuSlowdownMultiplier=4 \
  --view
```

#### 3. **Teste com 3G Lento**
```bash
lighthouse http://localhost:4173 \
  --output html \
  --output-path ./lighthouse-report-3g.html \
  --emulated-form-factor=mobile \
  --throttling-method=devtools \
  --throttling.rttMs=150 \
  --throttling.throughputKbps=1638 \
  --throttling.cpuSlowdownMultiplier=4 \
  --view
```

#### 4. **Teste Múltiplas Páginas**
```bash
# Criar script para testar todas as páginas
# Salvar como: test-all-pages.sh (Linux/Mac) ou test-all-pages.ps1 (Windows)

# Windows PowerShell:
$pages = @(
    "http://localhost:4173/",
    "http://localhost:4173/login",
    "http://localhost:4173/dashboard"
)

foreach ($page in $pages) {
    $filename = $page -replace "http://localhost:4173", "" -replace "/", "-"
    if ($filename -eq "") { $filename = "home" }
    lighthouse $page --output html --output-path "lighthouse-$filename.html"
}
```

---

## 🌐 Método 3: PageSpeed Insights (Online)

### Para Testar em Produção:

1. **Deploy o projeto** (Vercel, Netlify, etc.)
2. Acessar: https://pagespeed.web.dev/
3. Inserir a URL do seu site
4. Clicar em **"Analyze"**

### Vantagens:
- ✅ Testa em servidor real
- ✅ Dados de usuários reais (CrUX)
- ✅ Testa Desktop e Mobile automaticamente

### Desvantagens:
- ❌ Precisa estar em produção
- ❌ Não testa localhost

---

## 📊 O Que Analisar

### 1. **Core Web Vitals** (Mais Importante!)

#### Largest Contentful Paint (LCP)
```
✅ BOM:      < 2.5s
⚠️ PRECISA MELHORAR: 2.5s - 4.0s
❌ RUIM:     > 4.0s

Meta do Projeto: < 1.8s
```

#### First Input Delay (FID) / Total Blocking Time (TBT)
```
✅ BOM:      < 100ms (TBT < 200ms)
⚠️ PRECISA MELHORAR: 100ms - 300ms
❌ RUIM:     > 300ms

Meta do Projeto: < 150ms
```

#### Cumulative Layout Shift (CLS)
```
✅ BOM:      < 0.1
⚠️ PRECISA MELHORAR: 0.1 - 0.25
❌ RUIM:     > 0.25

Meta do Projeto: < 0.1
```

### 2. **Outras Métricas Importantes**

#### First Contentful Paint (FCP)
```
✅ BOM:      < 1.8s
Meta do Projeto: < 1.2s
```

#### Speed Index
```
✅ BOM:      < 3.4s
Meta do Projeto: < 2.0s
```

#### Time to Interactive (TTI)
```
✅ BOM:      < 3.8s
Meta do Projeto: < 2.5s
```

### 3. **Score Geral**

```
Performance Score:
✅ EXCELENTE:  90-100  (Verde)
⚠️ BOM:        50-89   (Laranja)
❌ PRECISA MELHORAR: 0-49 (Vermelho)

Meta do Projeto: > 90
```

---

## 🎯 Métricas Esperadas (Após Otimizações)

### Desktop (Conexão Rápida):
| Métrica | Antes | Depois | Meta |
|---------|-------|--------|------|
| **Performance Score** | 70 | 90+ | 90+ |
| **FCP** | 2.5s | 1.0s | < 1.2s |
| **LCP** | 3.5s | 1.5s | < 1.8s |
| **TBT** | 500ms | 150ms | < 200ms |
| **CLS** | 0.15 | 0.05 | < 0.1 |
| **Speed Index** | 3.2s | 1.8s | < 2.0s |

### Mobile (4G):
| Métrica | Antes | Depois | Meta |
|---------|-------|--------|------|
| **Performance Score** | 60 | 85+ | 85+ |
| **FCP** | 3.2s | 1.5s | < 1.8s |
| **LCP** | 5.0s | 2.3s | < 2.5s |
| **TBT** | 800ms | 250ms | < 300ms |
| **CLS** | 0.15 | 0.05 | < 0.1 |

---

## 🔍 Como Interpretar os Resultados

### 1. **Performance Opportunities**
Mostra o que ainda pode ser melhorado:

```
✅ Serve images in next-gen formats - Já fizemos! (WebP)
✅ Properly size images - Já fizemos! (width/height)
✅ Reduce unused JavaScript - Já fizemos! (code splitting)
✅ Remove duplicate modules - Já fizemos! (vite config)

⚠️ Se aparecer algo aqui, pode ser melhorado ainda
```

### 2. **Diagnostics**
Informações técnicas:

```
- Total Blocking Time: < 200ms ✅
- Largest Contentful Paint: < 2.5s ✅
- Cumulative Layout Shift: < 0.1 ✅
- First Contentful Paint: < 1.8s ✅
```

### 3. **Passed Audits**
O que já está bom:

```
✅ Uses efficient cache policy
✅ Avoids enormous network payloads
✅ Minimizes main-thread work
✅ JavaScript execution time
✅ Avoids long main-thread tasks
```

---

## 🎬 Comandos Práticos

### Setup Rápido para Teste:
```bash
# 1. Build de produção
npm run build

# 2. Servir e testar
npm run preview

# 3. Em outro terminal (CLI)
npx lighthouse http://localhost:4173 \
  --output html \
  --output json \
  --output-path ./lighthouse-report.html \
  --view

# 4. Ver relatório
# Abre automaticamente no navegador com --view
```

### Script PowerShell para Windows:
```powershell
# Salvar como: test-lighthouse.ps1

Write-Host "🚀 Iniciando testes Lighthouse..." -ForegroundColor Green

# Build
Write-Host "`n📦 Fazendo build..." -ForegroundColor Yellow
npm run build

# Iniciar servidor em background
Write-Host "`n🌐 Iniciando servidor..." -ForegroundColor Yellow
$server = Start-Process npm -ArgumentList "run preview" -PassThru -NoNewWindow

Start-Sleep -Seconds 3

# Testar Desktop
Write-Host "`n🖥️  Testando Desktop..." -ForegroundColor Cyan
npx lighthouse http://localhost:4173 `
  --output html `
  --output-path ./reports/lighthouse-desktop.html `
  --view

# Testar Mobile
Write-Host "`n📱 Testando Mobile..." -ForegroundColor Cyan
npx lighthouse http://localhost:4173 `
  --output html `
  --output-path ./reports/lighthouse-mobile.html `
  --emulated-form-factor=mobile `
  --view

Write-Host "`n✅ Testes concluídos!" -ForegroundColor Green
Write-Host "📊 Relatórios salvos em: ./reports/" -ForegroundColor Yellow

# Parar servidor
Stop-Process -Id $server.Id
```

Executar:
```powershell
# Criar pasta para relatórios
mkdir reports

# Executar script
.\test-lighthouse.ps1
```

---

## 📈 Comparando Antes e Depois

### Fazer Benchmark:

#### 1. **Antes das Otimizações** (se possível)
```bash
# Se tiver uma branch antiga
git checkout main-before-optimization
npm run build
npm run preview

# Testar e salvar
npx lighthouse http://localhost:4173 \
  --output json \
  --output-path ./reports/before.json
```

#### 2. **Depois das Otimizações**
```bash
git checkout main
npm run build
npm run preview

# Testar e salvar
npx lighthouse http://localhost:4173 \
  --output json \
  --output-path ./reports/after.json
```

#### 3. **Comparar**
```bash
# Instalar ferramenta de comparação
npm install -g lighthouse-ci

# Comparar resultados
lhci compare --base ./reports/before.json --head ./reports/after.json
```

---

## 🎯 Checklist de Teste

### Antes de Testar:
- [ ] Build de produção feito (`npm run build`)
- [ ] Servidor rodando (`npm run preview`)
- [ ] Chrome em modo anônimo
- [ ] Extensões desabilitadas
- [ ] Conexão estável

### Páginas para Testar:
- [ ] Landing Page (/)
- [ ] Login (/login)
- [ ] Dashboard (/dashboard)
- [ ] Gerador (/gerador)
- [ ] Disparador (/disparador)
- [ ] Blog (/blog)

### Condições para Testar:
- [ ] Desktop - Conexão rápida
- [ ] Mobile - 4G
- [ ] Mobile - 3G lento

### Após os Testes:
- [ ] Score de Performance > 90 (desktop)
- [ ] Score de Performance > 85 (mobile)
- [ ] LCP < 2.5s
- [ ] TBT < 200ms
- [ ] CLS < 0.1
- [ ] Salvar relatórios
- [ ] Documentar resultados

---

## 🚨 Troubleshooting

### Problema: "Port already in use"
```bash
# Windows
netstat -ano | findstr :4173
taskkill /PID <PID> /F

# Ou usar outra porta
npm run preview -- --port 3000
```

### Problema: Lighthouse não abre
```bash
# Instalar/atualizar Chrome
# Ou especificar Chrome path
lighthouse http://localhost:4173 \
  --chrome-path="C:\Program Files\Google\Chrome\Application\chrome.exe"
```

### Problema: Scores baixos em teste local
- ⚠️ Testes locais podem ter scores diferentes
- ✅ O importante é a **comparação** antes/depois
- ✅ Teste em produção para scores reais

---

## 📱 Teste em Dispositivos Reais

### Android (Chrome):
1. Conectar dispositivo via USB
2. Habilitar "Depuração USB"
3. Chrome DevTools → More tools → Remote devices
4. Abrir página e testar

### iOS (Safari):
1. Conectar dispositivo via USB
2. Habilitar "Web Inspector"
3. Safari → Develop → [Dispositivo]
4. Usar Web Inspector

---

## 📊 Salvando e Compartilhando Resultados

### Exportar Relatório:
```bash
# HTML (visual)
lighthouse http://localhost:4173 --output html --output-path report.html

# JSON (dados)
lighthouse http://localhost:4173 --output json --output-path report.json

# Múltiplos formatos
lighthouse http://localhost:4173 \
  --output html \
  --output json \
  --output csv \
  --output-path report
```

### Criar README com Resultados:
```markdown
# Performance Report - LeadFlow

## Resultados Lighthouse (17/10/2025)

### Desktop
- Performance: 92/100 ✅
- LCP: 1.5s ✅
- TBT: 150ms ✅
- CLS: 0.05 ✅

### Mobile (4G)
- Performance: 87/100 ✅
- LCP: 2.2s ✅
- TBT: 240ms ✅
- CLS: 0.06 ✅

[Ver relatório completo](./reports/lighthouse-desktop.html)
```

---

## 🎉 Conclusão

### Comando Mais Simples:
```bash
# 1. Build e serve
npm run build && npm run preview

# 2. Em outro terminal
npx lighthouse http://localhost:4173 --view
```

### Análise Rápida:
1. Abrir Chrome DevTools (F12)
2. Aba Lighthouse
3. Clicar "Generate report"
4. Verificar score > 90 ✅

---

**Data:** 17/10/2025  
**Autor:** Otimizações LeadFlow  
**Versão:** 1.0

