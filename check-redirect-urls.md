# 🔗 VERIFICAR URLs DE REDIRECIONAMENTO

## 🚨 PROBLEMA IDENTIFICADO

O teste mostra que:
- ✅ Email de confirmação está sendo enviado
- ❌ Senha não está sendo salva
- ❌ Usuário não pode fazer login

## 🔧 SOLUÇÃO: CONFIGURAR URLs DE REDIRECIONAMENTO

### **PASSO 1: Acessar Configurações de URL**
1. **Acesse:** https://supabase.com/dashboard
2. **Vá para:** Authentication → Settings → General
3. **Procure por:** "Site URL" e "Redirect URLs"

### **PASSO 2: Configurar Site URL**
```
Site URL: https://leadbaze.io
```

### **PASSO 3: Configurar Redirect URLs**
Adicione estas URLs:
```
https://leadbaze.io/auth/callback
http://localhost:3000/auth/callback
https://leadbaze.io/**
http://localhost:3000/**
```

### **PASSO 4: Verificar Configurações de Email**
Na seção "Email" (Authentication → Settings → General):
```
✅ Enable email confirmations: ON
✅ Enable email change confirmations: ON
✅ Enable password reset emails: ON
```

### **PASSO 5: Verificar Templates de Email**
Na seção "Email Templates" (Authentication → Settings → Email Templates):

#### **Confirm Signup Template:**
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

## 🧪 TESTE APÓS CONFIGURAR

1. **Salve todas as configurações**
2. **Execute o teste novamente:**
   ```bash
   node test-smtp-config.js
   ```
3. **Verifique se a senha é salva após confirmação**

## 🔍 POSSÍVEIS CAUSAS DO PROBLEMA

1. **URLs de redirecionamento incorretas**
2. **Templates de email mal configurados**
3. **Site URL não configurado**
4. **Problema no fluxo de callback**

## 📋 CHECKLIST DE VERIFICAÇÃO

- [ ] Site URL configurado: `https://leadbaze.io`
- [ ] Redirect URLs configuradas
- [ ] Email confirmations habilitado
- [ ] Templates de email configurados
- [ ] SMTP funcionando
- [ ] Teste realizado com sucesso

