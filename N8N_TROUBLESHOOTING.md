# 🔧 Troubleshooting - N8N e Geração de Leads

## 📋 Problemas Comuns e Soluções

### ❌ **Problema: "N8N retornou resposta vazia"**

**Sintomas:**
- Erro: `N8N retornou resposta vazia. Verifique se o webhook está configurado corretamente.`
- Console mostra: `📄 Estrutura da resposta: ""`

**Causas Possíveis:**
1. **Webhook N8N não está ativo**
2. **Workflow não está configurado corretamente**
3. **URL do webhook incorreta**
4. **N8N não está processando a requisição**

**Soluções:**

#### **1. Verificar Status do N8N**
```bash
# Testar se o webhook está respondendo
curl -X POST https://n8n-n8n-start.kof6cn.easypanel.host/webhook/842e7854-35df-4b20-9a6e-994fd934505e \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

#### **2. Verificar Configuração do Webhook**
- Acesse o painel do N8N
- Verifique se o workflow está **ativo**
- Confirme se o webhook está **habilitado**
- Verifique se a URL está correta

#### **3. Testar Workflow Manualmente**
1. Abra o N8N
2. Execute o workflow manualmente
3. Verifique se há erros nos logs
4. Confirme se o webhook está retornando dados

### ❌ **Problema: "Nenhum lead encontrado"**

**Sintomas:**
- Erro: `Nenhum lead encontrado. Formato recebido: string`
- Console mostra estrutura de resposta inesperada

**Causas Possíveis:**
1. **Formato de resposta incorreto do N8N**
2. **Workflow não está extraindo dados corretamente**
3. **URL do Google Maps inválida**

**Soluções:**

#### **1. Verificar Formato de Resposta Esperado**
O N8N deve retornar um dos seguintes formatos:

```json
// Formato 1: Array direto
[
  {
    "name": "Nome do Estabelecimento",
    "address": "Endereço",
    "phone": "Telefone",
    "rating": 4.5
  }
]

// Formato 2: Objeto com propriedade 'leads'
{
  "leads": [
    {
      "name": "Nome do Estabelecimento",
      "address": "Endereço",
      "phone": "Telefone",
      "rating": 4.5
    }
  ]
}

// Formato 3: Objeto com propriedade 'data'
{
  "data": [
    {
      "name": "Nome do Estabelecimento",
      "address": "Endereço",
      "phone": "Telefone",
      "rating": 4.5
    }
  ]
}
```

#### **2. Verificar Workflow do N8N**
1. **Google Maps Scraper**: Deve estar funcionando
2. **Data Processing**: Deve estar formatando dados corretamente
3. **Webhook Response**: Deve retornar dados estruturados

### ❌ **Problema: "Timeout"**

**Sintomas:**
- Erro: `Timeout: A extração está demorando mais que o esperado`
- Requisição demora mais de 2 minutos

**Soluções:**
1. **Reduzir quantidade de leads** (tente 5-10 em vez de 20+)
2. **Verificar performance do N8N**
3. **Usar URLs mais específicas**

### ❌ **Problema: "Erro de CORS"**

**Sintomas:**
- Erro: `CORS` ou `Network Error`
- Requisição bloqueada pelo navegador

**Soluções:**
1. **Verificar configuração CORS no N8N**
2. **Usar proxy se necessário**
3. **Verificar se o domínio está permitido**

## 🔍 **Diagnóstico Passo a Passo**

### **1. Verificar Logs do Console**
```javascript
// No console do navegador, procure por:
🔍 Resposta completa do N8N: [dados]
🔍 Tipo da resposta: object
🔍 Status da resposta: 200
```

### **2. Testar URL do Google Maps**
```javascript
// URLs válidas:
https://www.google.com/maps/search/restaurantes+sp
https://www.google.com/maps/place/Restaurante+Exemplo
https://www.google.com/maps/search/pizzarias+rio+de+janeiro
```

### **3. Verificar Configuração do Webhook**
```javascript
// URL atual configurada:
const N8N_WEBHOOK_URL = 'https://n8n-n8n-start.kof6cn.easypanel.host/webhook/842e7854-35df-4b20-9a6e-994fd934505e'
```

## 🛠️ **Soluções Temporárias**

### **Modo Demo Ativo**
Se o N8N não estiver funcionando, o sistema automaticamente:
1. **Detecta o problema**
2. **Usa dados de demonstração**
3. **Mostra aviso ao usuário**
4. **Permite testar a funcionalidade**

### **Dados de Demonstração**
- ✅ Funcionam sem N8N
- ✅ Permitem testar interface
- ✅ Não requerem configuração
- ⚠️ Não são dados reais

## 📞 **Suporte**

### **Para Problemas de N8N:**
1. Verificar status do servidor N8N
2. Consultar logs do workflow
3. Testar webhook manualmente
4. Verificar configurações

### **Para Problemas de Frontend:**
1. Verificar console do navegador
2. Testar com URLs diferentes
3. Verificar conectividade
4. Usar modo demo temporariamente

## 🚀 **Próximos Passos**

### **Se N8N não funcionar:**
1. **Configurar novo servidor N8N**
2. **Importar workflow correto**
3. **Configurar webhook**
4. **Testar conectividade**

### **Se precisar de dados reais:**
1. **Configurar Google Maps API**
2. **Implementar scraper alternativo**
3. **Usar serviço de terceiros**
4. **Desenvolver solução customizada**

---

## ✅ **Status Atual**

- ✅ **Sistema detecta problemas automaticamente**
- ✅ **Modo demo funciona como fallback**
- ✅ **Logs detalhados para diagnóstico**
- ✅ **Mensagens de erro claras**
- ⚠️ **N8N precisa ser configurado corretamente**

**O sistema está funcionando, mas precisa de N8N configurado para dados reais!** 🔧 