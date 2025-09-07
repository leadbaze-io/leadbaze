# 🚀 Instruções para Push no GitHub - LeadBaze

## 📋 **Problema Identificado**
O Git está usando credenciais antigas do usuário `mindflowai1`. Precisamos configurar as credenciais corretas do `leadbaze@gmail.com`.

## 🔧 **Solução Manual**

### **Passo 1: Limpar Credenciais Antigas**
```bash
# No Windows (PowerShell)
git config --global --unset credential.helper
git config --global --unset user.name
git config --global --unset user.email

# Ou deletar arquivo de credenciais
Remove-Item "$env:USERPROFILE\.git-credentials" -Force -ErrorAction SilentlyContinue
```

### **Passo 2: Configurar Novas Credenciais**
```bash
# Configurar usuário
git config --global user.name "LeadBaze"
git config --global user.email "leadbaze@gmail.com"

# Configurar remote
git remote set-url origin https://github.com/leadbaze-io/leadbaze.git
```

### **Passo 3: Fazer Push**
```bash
# Fazer push (vai pedir usuário e senha)
git push -u origin main --force
```

**Quando pedir as credenciais:**
- **Username**: `leadbaze@gmail.com`
- **Password**: `Leadbaze@270825`

## 🔐 **Solução com Token (Recomendado)**

### **Passo 1: Criar Token no GitHub**
1. Acesse: https://github.com/settings/tokens
2. Clique em "Generate new token (classic)"
3. Selecione escopo: `repo` (todos os repositórios)
4. Copie o token gerado

### **Passo 2: Usar Token**
```bash
# Fazer push com token
git push -u origin main --force
```

**Quando pedir credenciais:**
- **Username**: `leadbaze@gmail.com`
- **Password**: `SEU_TOKEN_GERADO` (não a senha)

## 🚀 **Comandos Completos**

```bash
# 1. Limpar credenciais
git config --global --unset credential.helper

# 2. Configurar usuário
git config --global user.name "LeadBaze"
git config --global user.email "leadbaze@gmail.com"

# 3. Configurar remote
git remote set-url origin https://github.com/leadbaze-io/leadbaze.git

# 4. Fazer push
git push -u origin main --force
```

## 📁 **Arquivos que Serão Enviados**

✅ **Frontend React/TypeScript**
- `src/` - Código fonte da aplicação
- `public/` - Arquivos públicos
- `package.json` - Dependências

✅ **Deploy Automatizado**
- `.github/workflows/deploy-servla.yml` - GitHub Actions
- `deploy-full-servla.sh` - Script de deploy
- `deploy-remote-servla.sh` - Deploy remoto
- `docker-compose.yml` - Docker
- `Dockerfile` - Container
- `ansible/deploy.yml` - Ansible

✅ **Configurações**
- `nginx-servla.conf` - Nginx
- `env.example` - Variáveis de ambiente
- `check-deployment.sh` - Verificação

✅ **Documentação**
- `README.md` - Documentação principal
- `AUTOMATED_DEPLOY_GUIDE.md` - Guia de deploy
- `SERVLA_IMPLEMENTATION_GUIDE.md` - Implementação

## 🎯 **Resultado Esperado**

Após o push bem-sucedido:
- ✅ Repositório: https://github.com/leadbaze-io/leadbaze
- ✅ Branch: `main`
- ✅ Todos os arquivos do LeadFlow
- ✅ GitHub Actions configurado
- ✅ Deploy automatizado pronto

## 📞 **Suporte**

Se tiver problemas:
- **Email**: contato@mindflowdigital.com.br
- **WhatsApp**: 31 97266-1278

---

**Desenvolvido com ❤️ pela MindFlow Digital**



















