# 🔧 Troubleshooting Evolution API - LeadFlow

## 🚨 Problema Identificado

**Erro**: `Failed to load resource: the server responded with a status of 500 ()`

**Localização**: Frontend tentando conectar com Evolution API via backend

## ✅ Status Atual

### **Backend**: ✅ Funcionando
- ✅ Health check: OK
- ✅ Criação de instâncias: OK
- ✅ QR Code generation: OK
- ✅ Evolution API connection: OK

### **Frontend**: ⚠️ Erro 500
- ❌ Erro ao criar instância
- ❌ Falha na requisição POST

## 🔍 Diagnóstico

### **Testes Realizados**
1. ✅ **Backend direto**: Funcionando perfeitamente
2. ✅ **Simulação frontend**: Funcionando perfeitamente
3. ✅ **Evolution API**: Conectividade OK
4. ✅ **CORS**: Configuração correta

### **Possíveis Causas**
1. **Cache do navegador** (mais provável)
2. **Problema de rede temporário**
3. **Configuração específica do ambiente**

## 🛠️ Soluções

### **1. Limpar Cache do Navegador**
```bash
# Chrome/Edge
Ctrl + Shift + R (Hard Refresh)
Ctrl + F5 (Force Refresh)

# Ou limpar cache completamente:
# Configurações > Privacidade > Limpar dados de navegação
```

### **2. Verificar Console do Navegador**
```javascript
// No console do navegador, verificar:
// 1. Se há erros de CORS
// 2. Se há erros de rede
// 3. Se há erros de JavaScript
```

### **3. Testar em Modo Incógnito**
- Abrir o site em modo incógnito/privado
- Tentar conectar novamente
- Verificar se o problema persiste

### **4. Verificar Network Tab**
```javascript
// No DevTools > Network:
// 1. Filtrar por "create-instance-and-qrcode"
// 2. Verificar detalhes da requisição
// 3. Verificar headers e payload
```

### **5. Verificar Variáveis de Ambiente**
```bash
# Backend (.env)
EVOLUTION_API_URL=https://n8n-evolution.kof6cn.easypanel.host
EVOLUTION_API_KEY=qwSYwLlijZOh+FaBHrK0tfGzxG6W/J4O

# Frontend (production)
BACKEND_URL=https://leadflow-dtev.onrender.com
```

## 🧪 Scripts de Teste

### **Teste Backend**
```bash
node test-backend-connection.js
```

### **Teste Evolution API**
```bash
node test-evolution-api.js
```

### **Simulação Frontend**
```bash
node test-frontend-simulation.js
```

## 📋 Checklist de Verificação

### **Antes de Testar**
- [ ] Limpar cache do navegador
- [ ] Verificar console do navegador
- [ ] Testar em modo incógnito
- [ ] Verificar network tab

### **Durante o Teste**
- [ ] Monitorar console do navegador
- [ ] Verificar network requests
- [ ] Verificar response status
- [ ] Verificar error messages

### **Após o Teste**
- [ ] Verificar logs do backend
- [ ] Verificar conectividade Evolution API
- [ ] Verificar configurações CORS

## 🎯 Próximos Passos

### **Se o problema persistir:**
1. **Verificar logs do backend** em tempo real
2. **Testar com diferentes navegadores**
3. **Verificar se há problemas de rede**
4. **Considerar deploy do backend**

### **Se o problema for resolvido:**
1. **Documentar a solução**
2. **Implementar melhorias de cache**
3. **Adicionar retry logic**
4. **Melhorar error handling**

## 📞 Suporte

### **Logs Úteis**
```javascript
// Frontend logs
console.log('🔄 Iniciando conexão WhatsApp...');
console.log('🔄 Criando instância:', instanceName);
console.log('❌ Erro ao criar instância:', error);

// Backend logs
console.log('🌐 Origin da requisição:', origin);
console.log('✅ Origin permitida:', origin);
console.log('❌ Origin bloqueada:', origin);
```

### **Informações para Debug**
- **URL do frontend**: https://leadflow-indol.vercel.app
- **URL do backend**: https://leadflow-dtev.onrender.com
- **URL da Evolution API**: https://n8n-evolution.kof6cn.easypanel.host
- **Timestamp do erro**: [Incluir quando ocorrer]

---

**Status**: ⚠️ **PROBLEMA IDENTIFICADO - AGUARDANDO RESOLUÇÃO** 