# 🧪 GUIA DE TESTE SMTP - LEADBAZE

## 🎯 **MÉTODOS PARA TESTAR SMTP SEM CRIAR CONTAS**

### **✅ Implementados:**
1. **Script de teste direto** (Node.js)
2. **Página de teste** no frontend
3. **API endpoints** para teste
4. **Script de terminal** interativo
5. **Teste via cURL** (HTTP)

---

## 🚀 **MÉTODO 1: SCRIPT DIRETO (Mais Rápido)**

### **Executar:**
```bash
cd leadflow
node test-smtp-direct.js
```

### **O que faz:**
- ✅ Testa conexão SMTP
- ✅ Envia email de teste
- ✅ Mostra resultado detalhado
- ✅ Não precisa de interface

### **Resultado esperado:**
```
🧪 Testando SMTP diretamente...
============================================================

1️⃣ Criando transporter SMTP...

2️⃣ Verificando conexão SMTP...
✅ Conexão SMTP verificada com sucesso!

3️⃣ Enviando email de teste...
✅ Email de teste enviado com sucesso!
📧 Message ID: <message-id>
📬 Verifique a caixa de entrada de: leadbaze@gmail.com
```

---

## 🌐 **MÉTODO 2: PÁGINA DE TESTE (Interface Visual)**

### **Acessar:**
```
http://localhost:3000/test-smtp
```

### **Funcionalidades:**
- ✅ Interface visual amigável
- ✅ Configurar email de destino
- ✅ Histórico de testes
- ✅ Resultados em tempo real
- ✅ Múltiplos tipos de teste

### **Como usar:**
1. **Acesse a página** `/test-smtp`
2. **Digite o email** de destino
3. **Clique em** "Executar Teste SMTP"
4. **Verifique os resultados** na tela
5. **Confirme o email** na caixa de entrada

---

## 🔧 **MÉTODO 3: API ENDPOINTS (Desenvolvedores)**

### **Teste de Conexão:**
```bash
curl -X GET http://localhost:3001/api/test-smtp/test-connection
```

### **Enviar Email de Teste:**
```bash
curl -X POST http://localhost:3001/api/test-smtp/send-test-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "seu-email@gmail.com",
    "subject": "Teste SMTP",
    "type": "test"
  }'
```

### **Teste Completo:**
```bash
curl -X POST http://localhost:3001/api/test-smtp/full-test \
  -H "Content-Type: application/json" \
  -d '{
    "to": "seu-email@gmail.com"
  }'
```

---

## 💻 **MÉTODO 4: SCRIPT DE TERMINAL (Interativo)**

### **Executar:**
```bash
cd leadflow
node test-smtp-terminal.js
```

### **Funcionalidades:**
- ✅ Interface interativa
- ✅ Escolher tipo de email
- ✅ Múltiplos testes
- ✅ Feedback em tempo real

### **Exemplo de uso:**
```
🧪 TESTE SMTP - LEADBAZE
==================================================

1️⃣ Verificando conexão SMTP...
✅ Conexão SMTP verificada com sucesso!

📧 Digite o email de destino (ou Enter para leadbaze@gmail.com): 
teste@exemplo.com

📋 Tipos de teste disponíveis:
1. Teste básico
2. Email de confirmação
3. Email de redefinição de senha

Escolha o tipo de teste (1-3): 1

2️⃣ Enviando email para: teste@exemplo.com
📝 Assunto: 🧪 Teste SMTP - LeadBaze
✅ Email enviado com sucesso!
📧 Message ID: <message-id>
📬 Verifique a caixa de entrada de: teste@exemplo.com

🔄 Deseja enviar outro email de teste? (s/n): n
```

---

## 📋 **TIPOS DE TESTE DISPONÍVEIS**

### **1. Teste Básico:**
- **Assunto:** 🧪 Teste SMTP - LeadBaze
- **Conteúdo:** Email simples de teste
- **Uso:** Verificar se SMTP funciona

### **2. Email de Confirmação:**
- **Assunto:** 🎉 Confirme sua conta no LeadBaze
- **Conteúdo:** Template de confirmação de conta
- **Uso:** Testar template de cadastro

### **3. Email de Redefinição:**
- **Assunto:** 🔐 Redefinir senha - LeadBaze
- **Conteúdo:** Template de redefinição de senha
- **Uso:** Testar template de recuperação

---

## 🔍 **VERIFICAÇÃO DE RESULTADOS**

### **✅ Sucesso:**
- **Conexão SMTP** verificada
- **Email enviado** com sucesso
- **Message ID** gerado
- **Email chega** na caixa de entrada

### **❌ Erro Comum:**
- **EAUTH:** Problema de autenticação
- **ECONNECTION:** Problema de conexão
- **ETIMEDOUT:** Timeout na conexão

### **💡 Soluções:**
1. **Verificar senha de app** do Gmail
2. **Confirmar 2-Step Verification** ativo
3. **Testar conexão** de rede
4. **Verificar porta 587** liberada

---

## 🎯 **TESTE RÁPIDO (30 segundos)**

### **Passo 1:**
```bash
cd leadflow
node test-smtp-direct.js
```

### **Passo 2:**
- **Verifique** se apareceu "✅ Conexão SMTP verificada"
- **Confirme** se apareceu "✅ Email de teste enviado"
- **Verifique** a caixa de entrada do Gmail

### **Passo 3:**
- **Se funcionou:** SMTP configurado corretamente
- **Se deu erro:** Verificar configurações

---

## 🚨 **TROUBLESHOOTING**

### **Problema: "Authentication failed"**
```bash
# Solução:
1. Verificar senha de app do Gmail
2. Confirmar 2-Step Verification ativo
3. Gerar nova senha de app
```

### **Problema: "Connection timeout"**
```bash
# Solução:
1. Verificar conexão com internet
2. Testar porta 587
3. Verificar firewall
```

### **Problema: "Email não chega"**
```bash
# Solução:
1. Verificar spam/lixo eletrônico
2. Confirmar email de destino
3. Testar com email diferente
```

---

## 📊 **MONITORAMENTO**

### **Logs do Backend:**
```bash
# Ver logs em tempo real
pm2 logs leadbaze-backend

# Ver logs específicos
grep "SMTP" /var/log/leadbaze/backend.log
```

### **Logs do Supabase:**
1. **Acesse:** Supabase Dashboard
2. **Vá para:** Authentication → Logs
3. **Verifique:** Emails enviados

---

## 🎉 **RESULTADO ESPERADO**

### **✅ SMTP Funcionando:**
- **Conexão** verificada com sucesso
- **Emails** enviados sem erro
- **Templates** renderizados corretamente
- **Confirmação** de entrega

### **✅ Pronto para Produção:**
- **Cadastro** com confirmação de email
- **Login** apenas após confirmação
- **Recuperação** de senha funcionando
- **Templates** personalizados

---

## 🚀 **PRÓXIMOS PASSOS**

1. **Execute um teste** usando qualquer método
2. **Verifique** se o email chegou
3. **Confirme** que SMTP está funcionando
4. **Teste** o fluxo de cadastro real
5. **Monitore** logs de produção

**Agora você pode testar SMTP sem criar contas! 🎯**














