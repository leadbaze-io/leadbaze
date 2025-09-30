# 📧 CONFIGURAR EMAILS NO SUPABASE - GUIA PASSO A PASSO

## 🚨 PROBLEMA ATUAL
- **Usuários são criados** mas não recebem email de confirmação
- **Login automático** acontece sem confirmação
- **Emails não são enviados** pelo Supabase

---

## 🎯 SOLUÇÃO: CONFIGURAR SMTP NO SUPABASE

### **PASSO 1: Acessar o Supabase Dashboard**
1. **Acesse:** https://supabase.com/dashboard
2. **Faça login** na sua conta
3. **Selecione o projeto:** LeadBaze

### **PASSO 2: Configurar SMTP**
1. **Vá para:** Authentication → Settings
2. **Clique na aba:** "SMTP Settings"
3. **Habilite:** "Enable custom SMTP"

### **PASSO 3: Configurar Gmail SMTP (Recomendado)**

#### **3.1 Criar Senha de App no Gmail:**
1. **Acesse:** https://myaccount.google.com/security
2. **Ative:** 2-Step Verification (se não estiver ativo)
3. **Vá para:** App passwords
4. **Gere uma senha** para "Mail"
5. **Copie a senha** gerada (16 caracteres)

#### **3.2 Configurar no Supabase:**
```yaml
SMTP Host: smtp.gmail.com
SMTP Port: 587
SMTP User: seu-email@gmail.com
SMTP Pass: senha-de-app-gerada
SMTP Admin Email: seu-email@gmail.com
SMTP Sender Name: LeadBaze
```

### **PASSO 4: Habilitar Confirmações de Email**
1. **Vá para:** Authentication → Settings → General
2. **Configure:**
   ```yaml
   Enable email confirmations: ✅ ON
   Enable email change confirmations: ✅ ON
   Enable password reset emails: ✅ ON
   ```

### **PASSO 5: Configurar URLs**
1. **Site URL:** `https://leadbaze.io`
2. **Redirect URLs:**
   ```
   https://leadbaze.io/auth/callback
   http://localhost:3000/auth/callback
   ```

---

## 🎨 PERSONALIZAR TEMPLATES DE EMAIL

### **PASSO 6: Customizar Templates**
1. **Vá para:** Authentication → Settings → Email Templates
2. **Configure os templates:**

#### **Confirm Signup:**
```html
<h1>🎉 Bem-vindo ao LeadBaze!</h1>
<p>Olá {{ .Email }},</p>
<p>Sua conta foi criada com sucesso!</p>
<p>Clique no botão abaixo para confirmar seu email:</p>
<a href="{{ .ConfirmationURL }}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
  Confirmar Email
</a>
<p>Se você não criou esta conta, ignore este email.</p>
<p>Equipe LeadBaze</p>
```

#### **Reset Password:**
```html
<h1>🔐 Redefinir Senha</h1>
<p>Olá {{ .Email }},</p>
<p>Você solicitou a redefinição de sua senha.</p>
<p>Clique no botão abaixo para criar uma nova senha:</p>
<a href="{{ .ConfirmationURL }}" style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
  Redefinir Senha
</a>
<p>Se você não solicitou isso, ignore este email.</p>
<p>Equipe LeadBaze</p>
```

---

## 🧪 TESTAR CONFIGURAÇÃO

### **PASSO 7: Testar Envio de Email**
1. **Crie uma nova conta** no formulário
2. **Verifique se email** é enviado
3. **Confirme a conta** via email
4. **Faça login** normalmente

### **PASSO 8: Verificar Logs**
1. **Vá para:** Authentication → Logs
2. **Verifique se há erros** de envio
3. **Confirme que emails** estão sendo enviados

---

## 🔧 ALTERNATIVAS SE GMAIL NÃO FUNCIONAR

### **OPÇÃO 1: SendGrid (Recomendado)**
```yaml
SMTP Host: smtp.sendgrid.net
SMTP Port: 587
SMTP User: apikey
SMTP Pass: sua-api-key-sendgrid
```

### **OPÇÃO 2: Mailgun**
```yaml
SMTP Host: smtp.mailgun.org
SMTP Port: 587
SMTP User: postmaster@seu-dominio.mailgun.org
SMTP Pass: sua-senha-mailgun
```

### **OPÇÃO 3: Amazon SES**
```yaml
SMTP Host: email-smtp.us-east-1.amazonaws.com
SMTP Port: 587
SMTP User: sua-access-key
SMTP Pass: sua-secret-key
```

---

## 📋 CHECKLIST DE CONFIGURAÇÃO

- [ ] **SMTP configurado** (Gmail ou outro)
- [ ] **Email confirmations habilitado**
- [ ] **Email change confirmations habilitado**
- [ ] **Password reset emails habilitado**
- [ ] **Templates personalizados** configurados
- [ ] **Site URL configurado**
- [ ] **Redirect URLs configurados**
- [ ] **Teste de envio** realizado
- [ ] **Logs verificados**

---

## 🎯 RESULTADO ESPERADO

**✅ Após configuração:**
- **Usuários recebem email** de confirmação
- **Login só funciona** após confirmação
- **Emails personalizados** com branding LeadBaze
- **Fluxo de autenticação** completo e seguro

** Configuração deve levar menos de 10 minutos!**

---

## 🚨 TROUBLESHOOTING

### **Problema: Emails não chegam**
- **Verifique:** Spam/Lixo eletrônico
- **Confirme:** SMTP configurado corretamente
- **Teste:** Com email diferente

### **Problema: Erro de SMTP**
- **Verifique:** Senha de app do Gmail
- **Confirme:** 2-Step Verification ativo
- **Teste:** Credenciais em cliente de email

### **Problema: Usuário confirmado automaticamente**
- **Verifique:** Email confirmations está ON
- **Confirme:** Configurações salvas
- **Teste:** Nova conta

---

## 📞 SUPORTE

Se precisar de ajuda:
1. **Verifique os logs** no Supabase
2. **Teste com email diferente**
3. **Confirme todas as configurações**
4. **Entre em contato** se necessário
