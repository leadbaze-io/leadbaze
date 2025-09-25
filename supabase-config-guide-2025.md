# 🔧 GUIA ATUALIZADO - CONFIGURAÇÃO SUPABASE 2025

## 🎯 LOCALIZAÇÃO DAS CONFIGURAÇÕES

### **1. Acessar o Dashboard**
1. **Acesse:** https://supabase.com/dashboard
2. **Faça login** na sua conta
3. **Selecione o projeto:** LeadBaze

### **2. Navegar para Authentication**
1. **No menu lateral esquerdo:** Clique em "Authentication"
2. **Você verá:** Overview, Users, Policies, Settings

### **3. Configurações de URL (Settings)**
1. **Clique em:** "Settings" (dentro de Authentication)
2. **Você verá várias abas:**
   - General
   - Email
   - Templates
   - SMTP Settings
   - OAuth Providers

### **4. Aba "General" - Configurações de URL**
Na aba "General", procure por:

#### **Site URL:**
```
https://leadbaze.io
```

#### **Redirect URLs:**
Adicione estas URLs (uma por linha):
```
https://leadbaze.io/auth/callback
http://localhost:3000/auth/callback
https://leadbaze.io/**
http://localhost:3000/**
```

### **5. Aba "Email" - Configurações de Email**
Na aba "Email", verifique:

```
✅ Enable email confirmations
✅ Enable email change confirmations  
✅ Enable password reset emails
```

### **6. Aba "Templates" - Templates de Email**
Na aba "Templates", configure:

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

### **7. Aba "SMTP Settings" - Configuração SMTP**
Na aba "SMTP Settings":
```
✅ Enable Custom SMTP: ON
Host: smtp.gmail.com
Port: 587
Username: leadbaze@gmail.com
Password: [sua senha de app do Gmail]
```

## 🔍 SE NÃO ENCONTRAR AS CONFIGURAÇÕES

### **Alternativa 1: Buscar por "URL"**
1. **Use Ctrl+F** para buscar por "URL" na página
2. **Procure por:** "Site URL" ou "Redirect URL"

### **Alternativa 2: Verificar seção "General"**
1. **Na aba "General"** procure por:
   - "Site URL"
   - "Redirect URLs" 
   - "Allowed URLs"

### **Alternativa 3: Verificar seção "Email"**
1. **Na aba "Email"** procure por:
   - "Email confirmations"
   - "Email change confirmations"

## 📱 INTERFACE MOBILE/DESKTOP

Se estiver usando mobile ou a interface estiver diferente:

1. **Procure por:** "Settings" ou "Configurações"
2. **Dentro de Authentication**
3. **Procure por:** "General" ou "Email"

## 🆘 SE AINDA NÃO ENCONTRAR

### **Opção 1: Screenshot**
Tire um screenshot da tela de Settings e me mostre

### **Opção 2: Listar abas disponíveis**
Me diga quais abas você vê em Authentication → Settings

### **Opção 3: Buscar por texto**
Use Ctrl+F e busque por:
- "URL"
- "redirect"
- "callback"
- "email"
- "confirm"

## 🎯 CONFIGURAÇÕES CRÍTICAS

**As configurações mais importantes são:**
1. **Site URL:** `https://leadbaze.io`
2. **Redirect URLs:** URLs de callback
3. **Email confirmations:** Habilitado
4. **SMTP:** Configurado e funcionando

**Me diga quais dessas configurações você consegue encontrar!**

