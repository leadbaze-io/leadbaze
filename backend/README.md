# 🚀 LeadFlow Backend - Evolution API

Backend Node.js para integração com Evolution API do WhatsApp.

## 📋 Pré-requisitos

- Node.js 18+
- Evolution API rodando
- API Key válida

## 🔧 Configuração Local

### 1. Instalar Dependências
```bash
cd backend
npm install
```

### 2. Configurar Variáveis de Ambiente
```bash
# Copiar arquivo de configuração
cp config.env.example config.env

# Editar com suas configurações
nano config.env
```

### 3. Executar
```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

## 🌐 Deploy

### Railway (Recomendado)
1. Acesse [railway.app](https://railway.app)
2. Conecte GitHub
3. Selecione este repositório
4. Configure variáveis de ambiente
5. Deploy automático!

### Variáveis de Ambiente Necessárias
```env
EVOLUTION_API_URL=https://sua-evolution-api.com
EVOLUTION_API_KEY=sua-api-key
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://seu-frontend.com
API_SECRET=sua-chave-secreta
```

## 📡 Endpoints

- `POST /api/create-instance-and-qrcode` - Criar instância e QR Code
- `GET /api/qrcode/:instanceName` - Buscar QR Code
- `GET /api/connection-state/:instanceName` - Status da conexão
- `DELETE /api/delete-instance/:instanceName` - Deletar instância
- `GET /api/health` - Saúde da API

## 🧪 Testes

```bash
# Testar conexão com Evolution API
node test-connection.js

# Testar servidor
node test-server.js
```

## 📁 Estrutura

```
backend/
├── server.js              # Servidor principal
├── package.json           # Dependências
├── config.env             # Configurações (não commitado)
├── test-connection.js     # Teste de conexão
└── DEPLOY_INSTRUCTIONS.md # Instruções detalhadas
``` 