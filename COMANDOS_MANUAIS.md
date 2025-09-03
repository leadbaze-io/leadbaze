# 🔧 Comandos Manuais para GitHub - LeadFlow

## 📋 Comandos para Executar Manualmente

### **1. Abrir PowerShell como Administrador**

1. Pressione `Windows + X`
2. Selecione "Windows PowerShell (Admin)" ou "Terminal (Admin)"

### **2. Navegar para o Projeto**

```powershell
cd "C:\Gaveta 2\Projetos\leadflow"
```

### **3. Verificar Git**

```powershell
git --version
```

Se não funcionar, tente:
```powershell
& "C:\Program Files\Git\cmd\git.exe" --version
```

### **4. Configurar Git**

```powershell
git config --global user.name "MindFlow Digital"
git config --global user.email "mindflow.ai.tests@gmail.com"
git config --global init.defaultBranch main
```

### **5. Inicializar Repositório**

```powershell
git init
```

### **6. Adicionar Arquivos**

```powershell
git add .
```

### **7. Primeiro Commit**

```powershell
git commit -m "feat: initial commit - LeadFlow project setup"
```

### **8. Criar Repositório no GitHub**

1. Acesse: https://github.com/new
2. Repository name: `leadflow`
3. Description: `🚀 LeadFlow - Gerador de Leads Profissional`
4. Visibility: Public
5. **NÃO marque** "Add a README file"
6. Clique em "Create repository"

### **9. Conectar e Fazer Push**

Substitua `seu-usuario` pelo seu nome de usuário do GitHub:

```powershell
git remote add origin https://github.com/seu-usuario/leadflow.git
git branch -M main
git push -u origin main
```

## 🔑 Autenticação

### **Opção A: Token de Acesso Pessoal (Recomendado)**

1. Acesse: https://github.com/settings/tokens
2. Clique em "Generate new token (classic)"
3. Configure:
   - Note: LeadFlow Setup
   - Expiration: 90 days
   - **Selecione**: repo (todos os subitens) e workflow
4. Clique em "Generate token"
5. Copie o token
6. Use o token como senha quando solicitado

### **Opção B: Credenciais do GitHub**

Use seu email e senha do GitHub quando solicitado.

## 🚨 Solução de Problemas

### **Git não encontrado**
```powershell
# Instalar Git
winget install --id Git.Git -e --source winget

# Ou baixar manualmente: https://git-scm.com/download/win
```

### **Erro de autenticação**
```powershell
# Verificar configuração
git config --global --list

# Reconfigurar se necessário
git config --global user.name "MindFlow Digital"
git config --global user.email "mindflow.ai.tests@gmail.com"
```

### **Erro de push**
```powershell
# Verificar remote
git remote -v

# Remover e adicionar novamente se necessário
git remote remove origin
git remote add origin https://github.com/seu-usuario/leadflow.git
```

### **Erro de branch**
```powershell
# Verificar branch atual
git branch

# Mudar para main se necessário
git checkout -b main
```

## 📝 Scripts Alternativos

### **Script Batch (.bat)**
Execute o arquivo `setup-github-simple.bat` clicando duas vezes nele.

### **Script PowerShell (.ps1)**
Execute o arquivo `setup-github.ps1` como Administrador.

## 🔧 Configuração Pós-GitHub

### **1. Configurar Secrets**

Após o repositório ser criado:

1. Vá para: Settings > Secrets and variables > Actions
2. Adicione os secrets:
   ```
   VITE_SUPABASE_URL=https://lsvwjyhnnzeewuuuykmb.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   VITE_N8N_WEBHOOK_URL=https://n8n-n8n-start.kof6cn.easypanel.host/webhook-test/...
   ```

### **2. Configurar Deploy**

1. Acesse: https://vercel.com
2. New Project > Import from Git
3. Selecione o repositório leadflow
4. Configure:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Adicione Environment Variables
6. Deploy

## 📞 Suporte

- **Email**: contato@mindflowdigital.com.br
- **Telefone**: 31 97266-1278
- **Documentação**: README.md e DEPLOYMENT.md

---

**🚀 Sucesso! Seu projeto LeadFlow está no GitHub!** 