# 🐙 Configuração do GitHub Actions - LeadBaze

## 📋 **Secrets Obrigatórios**

### **1. Configuração do Servidor Servla**
```bash
SERVLA_HOST=SEU_IP_SERVLA
SERVLA_USERNAME=root
SERVLA_SSH_KEY=SUA_CHAVE_SSH_PRIVADA
SERVLA_PORT=22
```

### **2. Configuração do Supabase**
```bash
VITE_SUPABASE_URL=https://lsvwjyhnnzeewuuuykmb.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzdndqeWhubnplZXd1dXV5a21iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMzc4NTYsImV4cCI6MjA2OTkxMzg1Nn0.jNw-YTXlnbd51l7RHHQpTYgCqxERz6NqPggqMM41Fck
```

### **3. Configuração do N8N**
```bash
VITE_N8N_WEBHOOK_URL=https://n8n-n8n-start.kof6cn.easypanel.host/webhook-test/leadflow-extraction
```

## 🔑 **Como Criar Chave SSH**

### **No Windows (PowerShell)**
```bash
# Gerar chave SSH
ssh-keygen -t rsa -b 4096 -C "leadbaze@gmail.com"

# Copiar chave pública
Get-Content ~/.ssh/id_rsa.pub

# Copiar chave privada (para o secret)
Get-Content ~/.ssh/id_rsa
```

### **Adicionar Chave Pública no Servidor**
```bash
# No servidor Servla
echo "SUA_CHAVE_PUBLICA" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

## ⚙️ **Configuração no GitHub**

### **1. Acessar Secrets**
1. Vá para: https://github.com/leadbaze-io/leadbaze/settings/secrets/actions
2. Clique em "New repository secret"

### **2. Adicionar Secrets**
Adicione cada secret com o nome e valor correspondente.

### **3. Verificar Workflow**
O arquivo `.github/workflows/deploy-servla.yml` já está configurado.

## 🚀 **Testar Deploy**

### **Deploy Manual**
1. Vá para: https://github.com/leadbaze-io/leadbaze/actions
2. Clique em "🚀 Deploy LeadFlow na Servla"
3. Clique em "Run workflow"
4. Selecione branch: `main`
5. Clique em "Run workflow"

### **Deploy Automático**
```bash
# Fazer push para main
git push origin main
```

## 📊 **Monitoramento**

### **Verificar Status**
- Actions: https://github.com/leadbaze-io/leadbaze/actions
- Logs: Clique no workflow em execução

### **Verificar Aplicação**
- URL: http://SEU_IP_SERVLA
- Health Check: http://SEU_IP_SERVLA/health

## 🔧 **Troubleshooting**

### **Erro: Permission denied**
- Verificar se a chave SSH está correta
- Verificar se a chave pública está no servidor

### **Erro: Build failed**
- Verificar se todos os secrets estão configurados
- Verificar logs do workflow

### **Erro: Deploy failed**
- Verificar conectividade SSH
- Verificar se o servidor está acessível

## 📞 **Suporte**

- **Email**: contato@mindflowdigital.com.br
- **WhatsApp**: 31 97266-1278

---

**Desenvolvido com ❤️ pela MindFlow Digital**
















































