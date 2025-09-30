# Correção dos Campos de Campanhas - Disparador V2

## 🚨 Problema Identificado

**Erro**: `Could not find the 'ignored_lists' column of 'campaigns' in the schema cache`

**Causa**: O código estava tentando atualizar campos que não existem na nova estrutura da tabela `campaigns`.

## 📋 Estrutura da Tabela

### ❌ Campos Antigos (não existem)
```sql
selected_lists    -- Array de IDs
ignored_lists     -- Array de IDs
```

### ✅ Campos Novos (estrutura atual)
```sql
selected_lists_count    -- Contador (INTEGER)
ignored_lists_count     -- Contador (INTEGER)
```

### 📊 Tabelas Relacionadas
```sql
-- Dados das listas são armazenados em:
campaign_lists
├── campaign_id
├── list_id
└── status ('selected' | 'ignored')
```

## 🔧 Correções Aplicadas

### 1. **CampaignWizard.tsx**
```typescript
// ❌ Antes
await campaignHook.updateCampaign({
  selected_lists: selectedLists,
  ignored_lists: ignoredLists,
  total_leads: campaignLeads.length
})

// ✅ Depois
await campaignHook.updateCampaign({
  total_leads: campaignLeads.length,
  unique_leads: campaignLeads.length,
  selected_lists_count: selectedLists.length,
  ignored_lists_count: ignoredLists.length
})
```

### 2. **useCampaignState.ts**
```typescript
// ❌ Antes
setSelectedLists(freshCampaign.selected_lists || [])
setIgnoredLists(freshCampaign.ignored_lists || [])

// ✅ Depois
const campaignLists = await CampaignLeadsService.getCampaignLists(campaign.id)
setSelectedLists(campaignLists.selected || [])
setIgnoredLists(campaignLists.ignored || [])
```

### 3. **campaignService.ts**
```typescript
// ❌ Antes
selectedLists: data?.selected_lists,
ignoredLists: data?.ignored_lists

// ✅ Depois
selectedLists: [], // Será carregado da tabela campaign_lists
ignoredLists: [] // Será carregado da tabela campaign_lists
```

### 4. **types/index.ts**
```typescript
// ❌ Antes
selected_lists: string[] // IDs das listas selecionadas
ignored_lists: string[] // IDs das listas ignoradas

// ✅ Depois
selected_lists_count: number // Contador de listas selecionadas
ignored_lists_count: number // Contador de listas ignoradas
```

## 🎯 Resultado Esperado

**✅ Agora o sistema deve**:
1. **Salvar campanhas** sem erros de schema
2. **Atualizar contadores** corretamente
3. **Carregar listas** da tabela `campaign_lists`
4. **Manter dados** consistentes entre tabelas

## 🔍 Verificação

**Teste os seguintes cenários**:
1. ✅ Criar nova campanha
2. ✅ Adicionar listas à campanha
3. ✅ Salvar campanha automaticamente
4. ✅ Editar campanha existente
5. ✅ Verificar contadores na interface

## 📊 Logs para Monitorar

```javascript
// Verificar se não há mais erros de schema
console.log('✅ Campanha salva com sucesso')

// Verificar contadores
console.log('📊 Contadores:', {
  total_leads: X,
  selected_lists_count: Y,
  ignored_lists_count: Z
})
```

---
**Status**: ✅ **CORREÇÕES APLICADAS**
**Data**: $(date)
**Sistema**: Disparador V2 - Campaign System



















