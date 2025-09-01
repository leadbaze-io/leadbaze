# 🚀 Guia de Deploy Automatizado - LeadFlow na Servla

## 📋 **Opções de Deploy Automatizado**

Existem **5 maneiras** de implementar o LeadFlow de forma automatizada:

### **1. 🐙 GitHub Actions (Recomendado)**
**Tempo**: 5 minutos de configuração + deploy automático

### **2. 🔧 Script de Deploy Remoto**
**Tempo**: 1 comando + 10 minutos

### **3. 🐳 Docker Compose**
**Tempo**: 1 comando + 5 minutos

### **4. ⚙️ Ansible**
**Tempo**: 5 minutos de configuração + deploy automático

### **5. 🔄 CI/CD Pipeline**
**Tempo**: Configuração única + deploy contínuo

---

## 🐙 **1. GitHub Actions (Mais Fácil)**

### **Configuração (5 minutos)**

#### **1.1 Configurar Secrets no GitHub**
Vá para `Settings > Secrets and variables > Actions` e adicione:

```bash
SERVLA_HOST=seu_ip_servla
SERVLA_USERNAME=root
SERVLA_SSH_KEY=sua_chave_ssh_privada
SERVLA_PORT=22
VITE_SUPABASE_URL=https://lsvwjyhnnzeewuuuykmb.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_N8N_WEBHOOK_URL=https://n8n-n8n-start.kof6cn.easypanel.host/webhook-test/leadflow-extraction
```

#### **1.2 Deploy Automático**
```bash
# Apenas faça push para main/master
git push origin main
```

**✅ Pronto!** O deploy acontece automaticamente.

---

## 🔧 **2. Script de Deploy Remoto**

### **Uso (1 comando)**

```bash
# Dar permissão
chmod +x deploy-remote-servla.sh

# Executar deploy
./deploy-remote-servla.sh SEU_IP_SERVLA root ~/.ssh/id_rsa 22
```

**✅ Pronto!** Deploy completo em 10 minutos.

---

## 🐳 **3. Docker Compose**

### **Uso (1 comando)**

```bash
# Configurar variáveis de ambiente
cp env.example .env
nano .env

# Deploy com Docker
docker-compose up -d
```

**✅ Pronto!** Deploy completo em 5 minutos.

### **Vantagens do Docker:**
- ✅ Isolamento completo
- ✅ Fácil rollback
- ✅ Monitoramento integrado
- ✅ Backup automático
- ✅ Escalabilidade

---

## ⚙️ **4. Ansible**

### **Configuração (5 minutos)**

#### **4.1 Instalar Ansible**
```bash
# Ubuntu/Debian
sudo apt install ansible

# macOS
brew install ansible

# Windows (WSL)
sudo apt install ansible
```

#### **4.2 Configurar Inventário**
Crie `ansible/inventory.ini`:
```ini
[servla_servers]
seu_ip_servla ansible_user=root ansible_ssh_private_key_file=~/.ssh/id_rsa
```

#### **4.3 Configurar Vault**
```bash
# Criar arquivo de variáveis seguras
ansible-vault create ansible/vars/vault.yml
```

Adicione as variáveis:
```yaml
vault_vite_supabase_url: https://lsvwjyhnnzeewuuuykmb.supabase.co
vault_vite_supabase_anon_key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
vault_vite_n8n_webhook_url: https://n8n-n8n-start.kof6cn.easypanel.host/webhook-test/leadflow-extraction
```

#### **4.4 Executar Deploy**
```bash
# Deploy com Ansible
ansible-playbook -i ansible/inventory.ini ansible/deploy.yml --ask-vault-pass
```

**✅ Pronto!** Deploy completo e idempotente.

---

## 🔄 **5. CI/CD Pipeline Completo**

### **Configuração Avançada**

#### **5.1 Jenkins Pipeline**
```groovy
pipeline {
    agent any
    
    stages {
        stage('Build') {
            steps {
                sh 'npm ci'
                sh 'npm run build:prod'
            }
        }
        
        stage('Test') {
            steps {
                sh 'npm run type-check'
            }
        }
        
        stage('Deploy to Servla') {
            steps {
                sh './deploy-remote-servla.sh $SERVLA_HOST $SERVLA_USER $SSH_KEY'
            }
        }
        
        stage('Verify') {
            steps {
                sh 'curl -f http://$SERVLA_HOST/health'
            }
        }
    }
    
    post {
        always {
            emailext (
                subject: "Deploy ${currentBuild.result}",
                body: "Deploy do LeadFlow ${currentBuild.result}",
                to: 'contato@mindflowdigital.com.br'
            )
        }
    }
}
```

#### **5.2 GitLab CI/CD**
```yaml
stages:
  - build
  - test
  - deploy

build:
  stage: build
  script:
    - npm ci
    - npm run build:prod
  artifacts:
    paths:
      - dist/

test:
  stage: test
  script:
    - npm run type-check

deploy:
  stage: deploy
  script:
    - chmod +x deploy-remote-servla.sh
    - ./deploy-remote-servla.sh $SERVLA_HOST $SERVLA_USER $SSH_KEY
  only:
    - main
```

---

## 📊 **Comparativo das Opções**

| Método | Configuração | Deploy | Manutenção | Complexidade |
|--------|-------------|--------|------------|--------------|
| **GitHub Actions** | 5 min | 1 comando | Baixa | ⭐⭐ |
| **Script Remoto** | 0 min | 1 comando | Baixa | ⭐ |
| **Docker** | 2 min | 1 comando | Média | ⭐⭐ |
| **Ansible** | 5 min | 1 comando | Baixa | ⭐⭐⭐ |
| **CI/CD** | 15 min | Automático | Alta | ⭐⭐⭐⭐ |

---

## 🎯 **Recomendação por Cenário**

### **🚀 Para Início Rápido**
**Use: Script de Deploy Remoto**
```bash
./deploy-remote-servla.sh SEU_IP_SERVLA root ~/.ssh/id_rsa
```

### **🏢 Para Empresas**
**Use: GitHub Actions + Docker**
- Deploy automático
- Rollback fácil
- Monitoramento integrado

### **🔧 Para DevOps**
**Use: Ansible + CI/CD**
- Infraestrutura como código
- Deploy idempotente
- Pipeline completo

### **📈 Para Escalabilidade**
**Use: Docker + Kubernetes**
- Orquestração automática
- Auto-scaling
- Load balancing

---

## ⚡ **Deploy Ultra-Rápido (2 minutos)**

### **Opção 1: Docker (Mais Fácil)**
```bash
# 1. Configurar variáveis
cp env.example .env
nano .env

# 2. Deploy
docker-compose up -d

# 3. Verificar
curl http://localhost/health
```

### **Opção 2: Script Remoto**
```bash
# 1. Executar deploy
./deploy-remote-servla.sh SEU_IP_SERVLA root ~/.ssh/id_rsa

# 2. Pronto!
```

### **Opção 3: GitHub Actions**
```bash
# 1. Configurar secrets no GitHub
# 2. Fazer push
git push origin main

# 3. Pronto!
```

---

## 🔧 **Configurações Avançadas**

### **Monitoramento Automático**
```bash
# Grafana Dashboard
http://localhost:3001
# Usuário: admin
# Senha: admin123

# Prometheus
http://localhost:9090
```

### **Backup Automático**
```bash
# Backup diário às 2h
# Retenção: 7 dias
# Local: /backup/leadflow/
```

### **SSL Automático**
```bash
# Configurar domínio
sudo certbot --nginx -d seu-dominio.com

# Renovação automática
sudo crontab -e
# Adicionar: 0 12 * * * /usr/bin/certbot renew --quiet
```

---

## 📞 **Suporte**

### **Contatos**
- **Email**: contato@mindflowdigital.com.br
- **WhatsApp**: 31 97266-1278

### **Documentação**
- **GitHub Actions**: [deploy-servla.yml](.github/workflows/deploy-servla.yml)
- **Docker**: [docker-compose.yml](docker-compose.yml)
- **Ansible**: [deploy.yml](ansible/deploy.yml)
- **Script Remoto**: [deploy-remote-servla.sh](deploy-remote-servla.sh)

---

## 🎉 **Conclusão**

**Escolha sua opção:**

1. **🚀 Início Rápido**: Script Remoto (2 min)
2. **🏢 Produção**: GitHub Actions + Docker (5 min)
3. **🔧 DevOps**: Ansible + CI/CD (15 min)

**Todas as opções são 100% automatizadas!**

---

**Desenvolvido com ❤️ pela MindFlow Digital**

