# 🚀 Guia de Inicialização do Servidor LeadBaze

## 📋 Pré-requisitos

- **Node.js** (versão 18 ou superior)
- **npm** (vem com Node.js)
- **PM2** (será instalado automaticamente se não estiver presente)
- **PowerShell** (Windows)

## 🎯 Inicialização Rápida

### 1. **Iniciar Servidor Completo**
```powershell
# No diretório: C:\Gaveta 2\Projetos\leadflow
.\start-dev.ps1
```

Este comando irá:
- ✅ Verificar e instalar dependências
- ✅ Parar processos PM2 existentes
- ✅ Iniciar backend com PM2
- ✅ Iniciar frontend em modo desenvolvimento

### 2. **Gerenciar Servidor**
```powershell
# Abrir menu interativo com comandos úteis
.\comandos-servidor.ps1
```

## 🔧 Comandos Manuais

### **Backend (PM2)**
```powershell
# Iniciar backend
pm2 start ecosystem.config.cjs

# Parar backend
pm2 stop leadbaze-backend

# Reiniciar backend
pm2 restart leadbaze-backend

# Ver status
pm2 status

# Ver logs
pm2 logs leadbaze-backend

# Ver logs em tempo real
pm2 logs leadbaze-backend --follow

# Parar todos os processos
pm2 delete all
```

### **Frontend**
```powershell
# Instalar dependências
npm install

# Iniciar em modo desenvolvimento
npm run dev

# Build para produção
npm run build
```

## 📁 Estrutura de Arquivos

```
leadflow/
├── start-dev.ps1              # Script de inicialização completa
├── comandos-servidor.ps1      # Menu interativo de comandos
├── ecosystem.config.cjs       # Configuração PM2 (raiz)
├── backend/
│   ├── server.js              # Servidor backend
│   ├── ecosystem.config.js    # Configuração PM2 (backend)
│   └── package.json           # Dependências backend
├── package.json               # Dependências frontend
└── README-SERVIDOR.md         # Este arquivo
```

## 🌐 URLs do Servidor

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3001

## ⚙️ Configuração PM2

### **Arquivo Principal**: `ecosystem.config.cjs`
- **Nome do processo**: `leadbaze-backend`
- **Script**: `backend/server.js`
- **Porta**: 3001
- **Ambiente**: production

### **Variáveis de Ambiente**
- `NODE_ENV`: production
- `PORT`: 3001
- `CORS_ORIGIN`: URLs permitidas para CORS
- `SUPABASE_URL`: URL do Supabase
- `SUPABASE_SERVICE_ROLE_KEY`: Chave de serviço do Supabase
- `EVOLUTION_API_URL`: URL da API Evolution
- `EVOLUTION_API_KEY`: Chave da API Evolution

## 🐛 Solução de Problemas

### **Erro: PM2 não encontrado**
```powershell
npm install -g pm2
```

### **Erro: Porta já em uso**
```powershell
# Parar todos os processos PM2
pm2 delete all

# Ou parar processo específico
pm2 stop leadbaze-backend
```

### **Erro: Dependências não instaladas**
```powershell
# Frontend
npm install

# Backend
cd backend
npm install
cd ..
```

### **Erro: Permissão PowerShell**
```powershell
# Executar como administrador ou alterar política de execução
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## 📊 Monitoramento

### **Status dos Processos**
```powershell
pm2 status
```

### **Logs em Tempo Real**
```powershell
pm2 logs leadbaze-backend --follow
```

### **Monitoramento Web**
```powershell
pm2 web
# Acesse: http://localhost:9615
```

## 🔄 Fluxo de Desenvolvimento

1. **Iniciar servidor**: `.\start-dev.ps1`
2. **Fazer alterações** no código
3. **Frontend**: Recarrega automaticamente
4. **Backend**: Reiniciar com `pm2 restart leadbaze-backend`
5. **Ver logs**: `pm2 logs leadbaze-backend`

## 📝 Notas Importantes

- **Sempre execute** os scripts no diretório raiz (`leadflow`)
- **PM2** gerencia o backend automaticamente
- **Frontend** roda em modo desenvolvimento com hot-reload
- **Logs** são salvos automaticamente pelo PM2
- **CORS** está configurado para localhost e domínios de produção

---
*Última atualização: 10/09/2025*



















