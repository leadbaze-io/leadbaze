# Debug do Carregamento de Listas - Disparador V2

## 🚨 Problema Identificado

**Problema**: Listas selecionadas não são carregadas quando o usuário volta à campanha, mesmo após serem salvas.

**Possíveis causas**:
1. ❌ Dados não estão sendo salvos na tabela `campaign_lists`
2. ❌ Dados não estão sendo carregados da tabela `campaign_lists`
3. ❌ Estado local não está sendo atualizado com os dados carregados
4. ❌ Conflito entre hooks ou componentes

## 🔧 Correções Aplicadas

### 1. **CampaignWizard.tsx** - Reatividade aos dados do hook
```typescript
// ✅ Adicionado dependências para reagir às mudanças
useEffect(() => {
  if (campaign) {
    setSelectedLists(campaignHook.selectedLists)
    setIgnoredLists(campaignHook.ignoredLists)
    setCampaignLeads(campaignHook.leads)
  }
}, [campaign, campaignHook.selectedLists, campaignHook.ignoredLists, campaignHook.leads])
```

### 2. **Logs de Debug Adicionados**

#### **CampaignWizard.tsx**:
```typescript
console.log('🔄 CampaignWizard - Carregando dados da campanha:', {
  campaignId: campaign.id,
  selectedLists: campaignHook.selectedLists,
  ignoredLists: campaignHook.ignoredLists,
  leads: campaignHook.leads.length
})
```

#### **useCampaign.ts**:
```typescript
console.log('🔄 useCampaign - Carregando dados:', {
  campaignId,
  selectedLists: listsData.selected,
  ignoredLists: listsData.ignored,
  leads: leadsData.length
})
```

#### **CampaignService.ts**:
```typescript
console.log('🔍 CampaignService.getCampaignLists - Buscando listas para campanha:', campaignId)
console.log('📊 CampaignService.getCampaignLists - Dados brutos:', data)
console.log('✅ CampaignService.getCampaignLists - Resultado:', { selected, ignored })
```

## 🔍 Plano de Debug

### **Passo 1: Verificar Salvamento**
1. ✅ Selecionar uma lista
2. ✅ Verificar logs de salvamento
3. ✅ Verificar se dados foram salvos na tabela `campaign_lists`

### **Passo 2: Verificar Carregamento**
1. ✅ Sair da campanha
2. ✅ Voltar à campanha
3. ✅ Verificar logs de carregamento
4. ✅ Verificar se dados foram carregados da tabela `campaign_lists`

### **Passo 3: Verificar Estado**
1. ✅ Verificar se `useCampaign` retorna dados corretos
2. ✅ Verificar se `CampaignWizard` recebe dados corretos
3. ✅ Verificar se estado local é atualizado

## 📊 Logs Esperados

### **Ao Salvar Lista**:
```
💾 Salvando listas na tabela campaign_lists
📋 Listas salvas: { selected: ['list-id-1'], ignored: [] }
```

### **Ao Carregar Campanha**:
```
🔍 CampaignService.getCampaignLists - Buscando listas para campanha: campaign-id
📊 CampaignService.getCampaignLists - Dados brutos: [{ list_id: 'list-id-1', status: 'selected' }]
✅ CampaignService.getCampaignLists - Resultado: { selected: ['list-id-1'], ignored: [] }
🔄 useCampaign - Carregando dados: { selectedLists: ['list-id-1'], ignoredLists: [] }
🔄 CampaignWizard - Carregando dados da campanha: { selectedLists: ['list-id-1'] }
```

## 🎯 Teste Agora

**Execute os seguintes passos**:
1. ✅ Abra uma campanha existente
2. ✅ Verifique logs no console
3. ✅ Selecione uma lista
4. ✅ Verifique se aparece nos logs de salvamento
5. ✅ Saia da campanha
6. ✅ Volte à campanha
7. ✅ Verifique se a lista ainda está selecionada
8. ✅ Verifique logs de carregamento

## 🚨 Se Ainda Não Funcionar

**Verificar**:
1. ✅ Se dados estão na tabela `campaign_lists` (SQL direto)
2. ✅ Se `getCampaignLists` está sendo chamado
3. ✅ Se `useCampaign` está retornando dados
4. ✅ Se `CampaignWizard` está recebendo dados

---
**Status**: 🔍 **DEBUG ATIVADO**
**Data**: $(date)
**Sistema**: Disparador V2 - List Loading Debug



















