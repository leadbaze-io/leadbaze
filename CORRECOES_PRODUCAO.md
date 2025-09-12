# 🔧 CORREÇÕES NECESSÁRIAS PARA PRODUÇÃO

## 📋 **Checklist para Deploy em Produção**

### 1. **Banco de Dados - Tabela `campaigns`**
```sql
-- Adicionar colunas faltantes na tabela campaigns
ALTER TABLE campaigns 
ADD COLUMN IF NOT EXISTS success_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS failed_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

-- Atualizar campanhas existentes
UPDATE campaigns 
SET 
    success_count = 0,
    failed_count = 0
WHERE success_count IS NULL OR failed_count IS NULL;
```

### 2. **Backend - Arquivo `campaignStatus.js`**
- ✅ **Remover todos os `.single()`** dos endpoints
- ✅ **Corrigir uso de `data`** para `data[0]` quando necessário
- ✅ **Adicionar verificações** de `data.length === 0`

### 3. **N8N - URLs dos Nós**
Alterar URLs de `localhost:3001` para produção:

#### **Nó "Atualizar Progresso":**
- ❌ `http://localhost:3001/api/campaign/status/progress`
- ✅ `https://leadbaze.io/api/campaign/status/progress`

#### **Nó "Finalizar Campanha":**
- ❌ `http://localhost:3001/api/campaign/status/complete`
- ✅ `https://leadbaze.io/api/campaign/status/complete`

#### **Nó "Iniciar Rastreamento":**
- ✅ `https://leadbaze.io/api/campaign/status/start` (já configurado)

### 4. **Verificações Pós-Deploy**
- [ ] Testar endpoint `/api/campaign/status/complete`
- [ ] Testar endpoint `/api/campaign/status/progress`
- [ ] Testar endpoint `/api/campaign/status/start`
- [ ] Verificar se colunas existem na tabela `campaigns`
- [ ] Testar envio completo de campanha

### 5. **Logs para Monitoramento**
- [ ] Verificar logs do servidor de produção
- [ ] Monitorar erros de "JSON object requested, multiple (or no) rows returned"
- [ ] Verificar se SSE está funcionando

## 🚨 **IMPORTANTE**
- **Nunca fazer deploy** sem executar o SQL da tabela `campaigns`
- **Sempre testar** os endpoints após deploy
- **Verificar logs** do servidor de produção
- **Manter backup** do estado atual antes do deploy

## 📝 **Status Atual**
- ✅ Backend local funcionando
- ✅ Colunas adicionadas localmente
- ✅ Endpoints corrigidos localmente
- ❌ Produção precisa das mesmas correções
