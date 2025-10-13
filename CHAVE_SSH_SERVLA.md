qua## 🎉 **Perfeito! Agora vamos implementar o LeadFlow!**

### ** Passo a Passo para Implementação**

## **1. Acessar o Console da Servla**

### **Acessar o Painel:**
1. **Vá para**: https://servla.com.br
2. **Faça login** com suas credenciais
3. **Clique no seu servidor** (VPS Starter)
4. **Procure por "Console"** ou "Console Web"
5. **Clique em "Abrir Console"**

## **2. Configurar SSH Automaticamente**

### **Execute o Script Automático:**
```bash
<code_block_to_apply_changes_from>
```

### **O que o script fará:**
- ✅ Gerar chave SSH
- ✅ Configurar permissões
- ✅ Mostrar chave privada para GitHub Actions
- ✅ Testar conexão SSH

## **3. Copiar Chave SSH para GitHub**C

### **Após executar o script, você verá:**
```
 CHAVE PRIVADA PARA GITHUB ACTIONS:
===============================================
-----BEGIN OPENSSH PRIVATE KEY-----
[conteúdo da chave]
-----END OPENSSH PRIVATE KEY-----
===============================================
```

### **Configurar no GitHub:**
1. **Acesse**: https://github.com/leadbaze-io/leadbaze/settings/secrets/actions
2. **Clique em "New repository secret"**
3. **Name**: `SERVLA_SSH_KEY`
4. **Value**: Cole a chave privada completa
5. **Clique em "Add secret"**

## **4. Configurar Outros Secrets**

### **Adicionar os secrets obrigatórios:**

#### **SERVLA_HOST**
- **Name**: `SERVLA_HOST`
- **Value**: `SEU_IP_SERVLA` (ver no painel da Servla)

#### **SERVLA_USERNAME**
- **Name**: `SERVLA_USERNAME`
- **Value**: `root`

#### **SERVLA_PORT**
- **Name**: `SERVLA_PORT`
- **Value**: `22`

#### **VITE_SUPABASE_URL**
- **Name**: `VITE_SUPABASE_URL`
- **Value**: `https://lsvwjyhnnzeewuuuykmb.supabase.co`

#### **VITE_SUPABASE_ANON_KEY**
- **Name**: `VITE_SUPABASE_ANON_KEY`
- **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzdndqeWhubnplZXd1dXV5a21iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMzc4NTYsImV4cCI6MjA2OTkxMzg1Nn0.jNw-YTXlnbd51l7RHHQpTYgCqxERz6NqPggqMM41Fck`

#### **VITE_N8N_WEBHOOK_URL**
- **Name**: `VITE_N8N_WEBHOOK_URL`
- **Value**: `https://n8n-n8n-start.kof6cn.easypanel.host/webhook-test/leadflow-extraction`

## **5. Testar Deploy Automático**

### **Deploy Manual (Teste):**
1. **Vá para**: https://github.com/leadbaze-io/leadbaze/actions
2. **Clique em " Deploy LeadFlow na Servla"**
3. **Clique em "Run workflow"**
4. **Selecione branch**: `main`
5. **Clique em "Run workflow"**

### **Acompanhar o Deploy:**
- **Clique no workflow** em execução
- **Acompanhe os logs** em tempo real
- **Verifique se tudo está funcionando**

## **6. Verificar Implementação**

### **Após o deploy bem-sucedido:**

#### **Acessar a Aplicação:**
- **URL**: http://SEU_IP_SERVLA
- **Health Check**: http://SEU_IP_SERVLA/health

#### **Verificar Serviços:**
```bash
# No console da Servla
# Verificar PM2
pm2 status

# Verificar Nginx
systemctl status nginx

# Verificar logs
pm2 logs leadflow
```

## **7. Deploy Automático Futuro**

### **Agora, cada vez que fizer push:**
```bash
# No seu computador
git add .
git commit -m "Atualização"
git push origin main
```

**✅ O deploy acontecerá automaticamente!**

## **📊 Monitoramento**

### **Verificar Status:**
- **GitHub Actions**: https://github.com/leadbaze-io/leadbaze/actions
- **Aplicação**: http://SEU_IP_SERVLA
- **Logs**: No console da Servla

### **Comandos Úteis:**
```bash
# Ver status dos serviços
pm2 status
systemctl status nginx

# Ver logs
pm2 logs leadflow
tail -f /var/log/nginx/access.log

# Ver recursos
htop
df -h
free -h
```

## ** Resultado Esperado**

### **Após 30-60 minutos:**
- ✅ **LeadFlow funcionando**
- ✅ **Deploy automatizado**
- ✅ **Todas as funcionalidades**
- ✅ **Pronto para produção**

## **📞 Suporte**

Se tiver problemas:
- **Email**: contato@mindflowdigital.com.br
- **WhatsApp**: 31 97266-1278

---

**🚀 Vamos começar! Execute o primeiro comando no console da Servla!**