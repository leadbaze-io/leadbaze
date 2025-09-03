# 🚀 Instruções para Configurar o GitHub - LeadFlow

## 📋 Passo a Passo Completo

### **1. Instalar Git (se necessário)**

Se o Git não estiver instalado, você tem duas opções:

#### **Opção A: Instalação Automática**
```powershell
# Execute o script como Administrador
.\setup-github.ps1
```

#### **Opção B: Instalação Manual**
1. Acesse: https://git-scm.com/download/win
2. Baixe e instale o Git para Windows
3. Reinicie o PowerShell após a instalação

### **2. Executar o Script de Configuração**

```powershell
# Navegar para o diretório do projeto
cd "C:\Gaveta 2\Projetos\leadflow"

# Executar o script (como Administrador)
.\setup-github.ps1
```

### **3. Criar Token do GitHub (Recomendado)**

Para automatizar a criação do repositório:

1. **Acesse**: https://github.com/settings/tokens
2. **Clique em**: "Generate new token (classic)"
3. **Configure**:
   - Note: LeadFlow Setup
   - Expiration: 90 days
   - **Selecione**:
     - ✅ repo (todos os subitens)
     - ✅ workflow
4. **Clique em**: "Generate token"
5. **Copie o token** (você não verá novamente!)

### **4. Executar o Script com Token**

Quando o script pedir o token, cole o token gerado.

### **5. Configuração Manual (Alternativa)**

Se preferir criar manualmente:

1. **Acesse**: https://github.com/new
2. **Configure**:
   - Repository name: `leadflow`
   - Description: `🚀 LeadFlow - Gerador de Leads Profissional`
   - Visibility: Public
   - **NÃO marque**: "Add a README file"
3. **Clique em**: "Create repository"
4. **Copie a URL** do repositório criado
5. **Cole no script** quando solicitado

## 🔧 Configuração Pós-GitHub

### **1. Configurar Secrets**

Após o repositório ser criado:

1. **Vá para**: Settings > Secrets and variables > Actions
2. **Adicione os secrets**:
   ```
   VITE_SUPABASE_URL=https://lsvwjyhnnzeewuuuykmb.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   VITE_N8N_WEBHOOK_URL=https://n8n-n8n-start.kof6cn.easypanel.host/webhook-test/...
   ```

### **2. Configurar Deploy (Vercel)**

1. **Acesse**: https://vercel.com
2. **Clique em**: "New Project"
3. **Import from Git**: Selecione o repositório leadflow
4. **Configure**:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. **Adicione Environment Variables** (mesmas do GitHub)
6. **Deploy**

### **3. Testar Funcionalidades**

Após o deploy:

1. **Teste a landing page**
2. **Teste o cadastro/login**
3. **Teste a geração de leads**
4. **Teste o disparador**

## 🚨 Solução de Problemas

### **Git não encontrado**
```powershell
# Verificar se Git está instalado
git --version

# Se não estiver, instalar via winget
winget install --id Git.Git -e --source winget
```

### **Erro de autenticação**
```powershell
# Configurar credenciais
git config --global user.name "MindFlow Digital"
git config --global user.email "mindflow.ai.tests@gmail.com"
```

### **Erro de push**
```powershell
# Verificar remote
git remote -v

# Se necessário, adicionar remote
git remote add origin https://github.com/seu-usuario/leadflow.git

# Fazer push
git push -u origin main
```

### **Token inválido**
- Verifique se o token tem as permissões corretas
- Gere um novo token se necessário
- Certifique-se de que o token não expirou

## 📞 Suporte

Se encontrar problemas:

- **Email**: contato@mindflowdigital.com.br
- **Telefone**: 31 97266-1278
- **Documentação**: Consulte os arquivos README.md e DEPLOYMENT.md

## 🎉 Próximos Passos

Após a configuração bem-sucedida:

1. **Compartilhe o repositório** com sua equipe
2. **Configure CI/CD** para deploy automático
3. **Monitore** o funcionamento em produção
4. **Receba contribuições** da comunidade

---

**🚀 Sucesso! Seu projeto LeadFlow está no GitHub e pronto para o mundo!** 