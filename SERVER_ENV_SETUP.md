# Configuração de Variáveis de Ambiente - Servidor

## 📋 Variáveis que Precisam ser Configuradas no Servidor

### 1. Evolution API (OBRIGATÓRIO)
```bash
EVOLUTION_API_URL=https://sua-evolution-api.com:8080
EVOLUTION_API_KEY=sua-api-key-aqui
```

### 2. N8N Webhook (OBRIGATÓRIO)
```bash
N8N_WEBHOOK_URL=https://n8n-n8n-start.kof6cn.easypanel.host/webhook/b1b11d27-2dfa-42a6-bbaf-b0fa456c0bae
```

### 3. API Secret (OBRIGATÓRIO)
```bash
API_SECRET=sua-chave-secreta-aqui
```

## 🔧 Como Configurar no Servidor

### Opção 1: Editar ecosystem.config.cjs diretamente
```bash
# No servidor, edite o arquivo:
nano /var/www/leadbaze/ecosystem.config.cjs

# Substitua os valores:
EVOLUTION_API_URL: 'https://SUA-EVOLUTION-API-URL:8080',
EVOLUTION_API_KEY: 'SUA-API-KEY-AQUI',
API_SECRET: 'SUA-CHAVE-SECRETA-AQUI',
```

### Opção 2: Criar arquivo .env no servidor
```bash
# Criar arquivo .env no diretório do projeto
nano /var/www/leadbaze/.env

# Adicionar as variáveis:
EVOLUTION_API_URL=https://sua-evolution-api.com:8080
EVOLUTION_API_KEY=sua-api-key-aqui
N8N_WEBHOOK_URL=https://n8n-n8n-start.kof6cn.easypanel.host/webhook/b1b11d27-2dfa-42a6-bbaf-b0fa456c0bae
API_SECRET=sua-chave-secreta-aqui
```

## 🚀 Comandos para Aplicar as Configurações

```bash
# 1. Parar o PM2
pm2 stop leadbaze-backend

# 2. Recarregar configurações
pm2 reload ecosystem.config.cjs

# 3. Verificar status
pm2 status

# 4. Ver logs
pm2 logs leadbaze-backend
```

## ✅ Verificação das Configurações

```bash
# Testar se o backend está funcionando
curl -X GET https://leadbaze.io/api/health

# Verificar logs do PM2
pm2 logs leadbaze-backend --lines 50
```

## 📝 Notas Importantes

1. **Evolution API**: Substitua pela URL real da sua Evolution API
2. **API Key**: Use a chave real da Evolution API
3. **N8N Webhook**: A URL já está configurada corretamente
4. **API Secret**: Crie uma chave secreta forte para segurança
5. **CORS**: Já configurado para `https://leadbaze.io`

## 🔒 Segurança

- Nunca commite as chaves reais no GitHub
- Use variáveis de ambiente no servidor
- Mantenha as chaves em local seguro
- Rotacione as chaves periodicamente

