# 🔑 Configuração de Chave SSH no Servla

## 📋 **Passo a Passo Completo**

### **1. Conectar no Servidor Servla**

```bash
# Via SSH (se já tiver chave configurada)
ssh root@SEU_IP_SERVLA

# Via Console Web (Servla)
# Acesse o painel da Servla e use o console web
```

### **2. Verificar Chaves SSH Existentes**

```bash
# Verificar se já existem chaves
ls -la ~/.ssh/

# Se existir, você verá arquivos como:
# id_rsa (chave privada)
# id_rsa.pub (chave pública)
# authorized_keys (chaves autorizadas)
```

### **3. Se NÃO Existem Chaves SSH**

```bash
# Gerar nova chave SSH
ssh-keygen -t rsa -b 4096 -C "leadbaze@gmail.com"

# Pressione ENTER para aceitar o local padrão
# Deixe a senha em branco (pressione ENTER duas vezes)
```

### **4. Se JÁ Existem Chaves SSH**

```bash
# Ver chave pública
cat ~/.ssh/id_rsa.pub

# Ver chave privada (para o GitHub Actions)
cat ~/.ssh/id_rsa
```

### **5. Configurar Chave Pública**

```bash
# Adicionar chave pública ao authorized_keys
cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys

# Configurar permissões corretas
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
chmod 600 ~/.ssh/id_rsa
chmod 644 ~/.ssh/id_rsa.pub
```

### **6. Testar Conexão SSH**

```bash
# Testar conexão local
ssh localhost

# Se funcionar, você está conectado via SSH
# Digite 'exit' para sair
```

## 🔐 **Configuração para GitHub Actions**

### **1. Copiar Chave Privada**

```bash
# No servidor Servla, execute:
cat ~/.ssh/id_rsa
```

**Copie TODO o conteúdo** (incluindo as linhas):
```
-----BEGIN OPENSSH PRIVATE KEY-----
[conteúdo da chave]
-----END OPENSSH PRIVATE KEY-----
```

### **2. Configurar no GitHub**

1. **Acesse**: https://github.com/leadbaze-io/leadbaze/settings/secrets/actions
2. **Clique em "New repository secret"**
3. **Name**: `SERVLA_SSH_KEY`
4. **Value**: Cole a chave privada completa
5. **Clique em "Add secret"**

## 🚀 **Comandos Rápidos**

### **Script Completo para Servla**

```bash
#!/bin/bash
# Execute este script no servidor Servla

echo "🔑 Configurando SSH para LeadBaze..."

# 1. Verificar/criar diretório .ssh
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# 2. Gerar chave SSH (se não existir)
if [ ! -f ~/.ssh/id_rsa ]; then
    echo "📝 Gerando nova chave SSH..."
    ssh-keygen -t rsa -b 4096 -C "leadbaze@gmail.com" -f ~/.ssh/id_rsa -N ""
fi

# 3. Configurar authorized_keys
if [ ! -f ~/.ssh/authorized_keys ]; then
    touch ~/.ssh/authorized_keys
fi

cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys

# 4. Configurar permissões
chmod 600 ~/.ssh/authorized_keys
chmod 600 ~/.ssh/id_rsa
chmod 644 ~/.ssh/id_rsa.pub

# 5. Mostrar chave privada para GitHub Actions
echo "🔐 CHAVE PRIVADA (copie para GitHub Actions):"
echo "================================================"
cat ~/.ssh/id_rsa
echo "================================================"

echo "✅ Configuração SSH concluída!"
```

## 📊 **Verificação**

### **1. Verificar Configuração**

```bash
# Verificar arquivos
ls -la ~/.ssh/

# Verificar permissões
stat ~/.ssh/authorized_keys
stat ~/.ssh/id_rsa
```

### **2. Testar Conexão**

```bash
# Testar SSH local
ssh -o StrictHostKeyChecking=no localhost "echo 'SSH funcionando!'"
```

### **3. Verificar Logs**

```bash
# Ver logs SSH
tail -f /var/log/auth.log

# Ou no CentOS/RHEL
tail -f /var/log/secure
```

## 🔧 **Troubleshooting**

### **Problema: Permission denied**
```bash
# Verificar permissões
ls -la ~/.ssh/
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
chmod 600 ~/.ssh/id_rsa
```

### **Problema: Chave não encontrada**
```bash
# Verificar se a chave existe
ls -la ~/.ssh/id_rsa*

# Se não existir, gerar nova
ssh-keygen -t rsa -b 4096 -C "leadbaze@gmail.com"
```

### **Problema: SSH não inicia**
```bash
# Verificar status do SSH
systemctl status sshd

# Reiniciar SSH
systemctl restart sshd
```

## 📞 **Suporte**

Se tiver problemas:
- **Email**: contato@mindflowdigital.com.br
- **WhatsApp**: 31 97266-1278

---

**Desenvolvido com ❤️ pela MindFlow Digital**
