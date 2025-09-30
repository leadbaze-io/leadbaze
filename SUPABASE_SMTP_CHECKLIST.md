# 🔧 Checklist para Verificar Configuração SMTP no Supabase

## 🚨 **PROBLEMA IDENTIFICADO:**
- ❌ Emails de confirmação não são enviados
- ❌ Senhas não são salvas durante signup
- ✅ Confirmação manual funciona

## 📋 **CHECKLIST DE VERIFICAÇÃO:**

### **1. Acessar Configurações de Auth**
1. **Acesse**: https://supabase.com/dashboard/project/lsvwjyhnnzeewuuuykmb/auth/settings
2. **Verifique** se está na aba "Auth"

### **2. Verificar Configuração SMTP**
1. **Role para baixo** até "SMTP Settings"
2. **Verifique se está configurado**:
   - ✅ **Enable custom SMTP**: Deve estar **ATIVADO**
   - ✅ **SMTP Host**: Deve estar preenchido
   - ✅ **SMTP Port**: Deve estar preenchido (geralmente 587 ou 465)
   - ✅ **SMTP User**: Deve estar preenchido
   - ✅ **SMTP Password**: Deve estar preenchido
   - ✅ **SMTP Sender Name**: Deve estar preenchido
   - ✅ **SMTP Sender Email**: Deve estar preenchido

### **3. Verificar Configuração de Email**
1. **Role para baixo** até "Email Templates"
2. **Verifique**:
   - ✅ **Confirm signup**: Template deve estar ativo
   - ✅ **Reset password**: Template deve estar ativo
   - ✅ **Magic Link**: Template deve estar ativo

### **4. Verificar Redirect URLs**
1. **Role para baixo** até "URL Configuration"
2. **Verifique**:
   - ✅ **Site URL**: `https://leadbaze.io`
   - ✅ **Redirect URLs**: Deve incluir:
     - `https://leadbaze.io/auth/callback`
     - `https://leadbaze.io/dashboard`
     - `http://localhost:5173/auth/callback` (para desenvolvimento)
     - `https://leadflow-indol.vercel.app/auth/callback`

### **5. Verificar Configuração de Email Confirmation**
1. **Role para baixo** até "User Signups"
2. **Verifique**:
   - ✅ **Enable email confirmations**: Deve estar **ATIVADO**
   - ✅ **Enable phone confirmations**: Pode estar desativado
   - ✅ **Enable email change confirmations**: Deve estar ativado

## 🔍 **POSSÍVEIS PROBLEMAS:**

### **Problema 1: SMTP Desabilitado**
- **Sintoma**: Emails não são enviados
- **Solução**: Ativar "Enable custom SMTP"

### **Problema 2: Credenciais SMTP Incorretas**
- **Sintoma**: Erro ao enviar emails
- **Solução**: Verificar host, port, user, password

### **Problema 3: Redirect URLs Incorretas**
- **Sintoma**: Links de confirmação não funcionam
- **Solução**: Adicionar URLs corretas

### **Problema 4: Email Confirmation Desabilitado**
- **Sintoma**: Usuários são criados mas não confirmados
- **Solução**: Ativar "Enable email confirmations"

## 🧪 **TESTE APÓS CORREÇÕES:**

1. **Salve as configurações**
2. **Execute o teste**:
   ```bash
   node diagnose-auth-issue.js
   ```
3. **Verifique se**:
   - ✅ Emails são enviados
   - ✅ Senhas são salvas
   - ✅ Confirmação automática funciona

## 🚨 **SE NADA FUNCIONAR:**

### **Opção 1: Desabilitar Confirmação de Email**
1. **Acesse**: Auth Settings
2. **Desative**: "Enable email confirmations"
3. **Resultado**: Login imediato sem confirmação

### **Opção 2: Usar Sistema Manual**
- ✅ **Manter sistema atual**: Função RPC + confirmação manual
- ✅ **Funciona perfeitamente**: Após confirmação manual
- ⚠️ **Requer intervenção**: Para cada novo usuário

## 📞 **SUPORTE SUPABASE:**

Se nada funcionar, contate o suporte do Supabase:
- **Email**: support@supabase.com
- **Documentação**: https://supabase.com/docs/guides/auth/email-auth
- **Status**: https://status.supabase.com

---

**Status**: 🔍 Aguardando verificação das configurações  
**Prioridade**: 🔴 Alta (afeta todos os novos usuários)

