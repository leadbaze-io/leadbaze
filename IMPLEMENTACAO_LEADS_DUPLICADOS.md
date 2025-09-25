# Implementação de Leads Duplicados - Disparador V2

## 📋 Resumo da Implementação

Este documento descreve a implementação completa da funcionalidade de exibição de leads duplicados ignorados no sistema Disparador V2.

## 🎯 Objetivo

Exibir no card de estatísticas quantos leads duplicados foram ignorados durante o processo de deduplicação, com o layout:
- **Título:** "Leads Duplicados"
- **Número:** Valor centralizado
- **Texto:** "Ignorados" ao lado do número

## 🔧 Implementações Realizadas

### 1. **Banco de Dados**

#### **Script SQL:** `add-duplicates-count-column.sql`
```sql
-- Adicionar coluna para contagem de leads duplicados ignorados
ALTER TABLE campaigns 
ADD COLUMN IF NOT EXISTS duplicates_count INTEGER DEFAULT 0;

-- Comentário para documentar a coluna
COMMENT ON COLUMN campaigns.duplicates_count IS 'Número de leads duplicados que foram ignorados durante a deduplicação';
```

### 2. **Tipos TypeScript**

#### **Arquivo:** `src/types/index.ts`
```typescript
export interface BulkCampaign {
  // ... outros campos
  total_leads: number
  unique_leads: number
  duplicates_count: number  // ✅ NOVO CAMPO
  status: 'draft' | 'active' | 'scheduled' | 'sending' | 'completed' | 'failed' | 'paused'
  // ... outros campos
}
```

### 3. **Serviço de Deduplicação**

#### **Arquivo:** `src/services/LeadDeduplicationService.ts`

**Novo método adicionado:**
```typescript
/**
 * Deduplicar leads com contagem de duplicados
 */
static deduplicateLeadsWithCount(leads: Lead[], listId: string): { 
  uniqueLeads: CampaignLead[], 
  duplicatesCount: number 
} {
  const phoneMap = new Map<string, CampaignLead>()
  const uniqueLeads: CampaignLead[] = []
  let duplicatesCount = 0

  for (const lead of leads) {
    const normalizedPhone = this.normalizePhone(lead.phone)
    
    if (!normalizedPhone) continue

    const phoneHash = this.generatePhoneHash(lead.phone || '')
    
    // Se já existe um lead com este telefone, contar como duplicado
    if (phoneMap.has(phoneHash)) {
      duplicatesCount++  // ✅ CONTAR DUPLICADOS
      continue
    }

    const campaignLead = this.convertToCampaignLead(lead, listId)
    phoneMap.set(phoneHash, campaignLead)
    uniqueLeads.push(campaignLead)
  }

  return { uniqueLeads, duplicatesCount }
}
```

### 4. **Serviço de Operações em Massa**

#### **Arquivo:** `src/lib/bulkCampaignService.ts`

**Modificações:**
```typescript
// Processar todos os leads de uma vez
let newLeads = [...currentLeads]
let totalDuplicates = 0  // ✅ CONTAR TOTAL DE DUPLICADOS

for (const list of availableLists) {
  const { uniqueLeads, duplicatesCount } = LeadDeduplicationService.deduplicateLeadsWithCount(list.leads, list.id)
  newLeads = LeadDeduplicationService.addLeadsWithDeduplication(newLeads, uniqueLeads)
  totalDuplicates += duplicatesCount  // ✅ SOMAR DUPLICADOS
}

// Salvar todas as listas de uma vez no banco
await this.updateCampaignLists(campaignId, newSelectedLists, currentIgnoredLists)
await this.addLeadsToCampaign(campaignId, newLeads)
await this.updateDuplicatesCount(campaignId, totalDuplicates)  // ✅ SALVAR CONTADOR
```

**Novo método:**
```typescript
/**
 * Atualizar contador de duplicados
 */
private static async updateDuplicatesCount(campaignId: string, duplicatesCount: number): Promise<void> {
  const { error } = await supabase
    .from('campaigns')
    .update({ duplicates_count: duplicatesCount })
    .eq('id', campaignId)

  if (error) {
    throw new Error(`Erro ao atualizar contador de duplicados: ${error.message}`)
  }
}
```

### 5. **Hook de Campanha**

#### **Arquivo:** `src/hooks/useCampaign.ts`

**Modificação:**
```typescript
const newCampaign = await CampaignService.createCampaign({
  name,
  message: message || '',
  status: 'draft',
  selected_lists_count: 0,
  ignored_lists_count: 0,
  total_leads: 0,
  unique_leads: 0,
  duplicates_count: 0,  // ✅ INICIALIZAR CONTADOR
  success_count: 0,
  failed_count: 0,
  user_id: ''
})
```

### 6. **Componente de Estatísticas**

#### **Arquivo:** `src/components/campaign/StatsCard.tsx`

**Modificações:**
```typescript
interface CampaignStatsProps {
  stats: {
    totalLeads: number
    uniqueLeads: number
    selectedLists: number
    ignoredLists: number
    duplicates: number  // ✅ NOVO CAMPO
  }
  className?: string
}

// Grid atualizado para 5 colunas
<div className={cn('grid grid-cols-2 lg:grid-cols-5 gap-4', className)}>
  {/* ... outros cards ... */}
  
  {/* ✅ NOVO CARD DE DUPLICADOS */}
  <Card className="stats-card-claro stats-card-escuro transition-all duration-200 hover:shadow-md dark:hover:shadow-lg">
    <CardContent className="p-4">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-lg transition-colors stats-icon-warning-claro stats-icon-warning-escuro">
          <div className="w-5 h-5">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate stats-text-claro stats-text-escuro">
            Leads Duplicados
          </p>
          <div className="flex items-baseline gap-2">
            <p className="text-xl font-bold stats-value-claro stats-value-escuro">
              {stats.duplicates.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Ignorados
            </p>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
</div>
```

### 7. **Wizard de Campanha**

#### **Arquivo:** `src/components/campaign/CampaignWizard.tsx`

**Modificação:**
```typescript
// Calcular estatísticas
const stats = {
  totalLeads: campaignLeads.length,
  uniqueLeads: campaignLeads.length,
  selectedLists: selectedLists.length,
  ignoredLists: ignoredLists.length,
  duplicates: campaign?.duplicates_count || 0,  // ✅ USAR VALOR DO BANCO
  duplicatePercentage: 0
}
```

## 🚀 Como Funciona

### **Fluxo de Deduplicação:**

1. **Usuário adiciona listas** → Botão "Adicionar Todas"
2. **Sistema processa cada lista** → `deduplicateLeadsWithCount()`
3. **Conta duplicados** → Incrementa `duplicatesCount`
4. **Soma total de duplicados** → `totalDuplicates += duplicatesCount`
5. **Salva no banco** → `updateDuplicatesCount(campaignId, totalDuplicates)`
6. **Exibe no card** → `stats.duplicates = campaign?.duplicates_count || 0`

### **Layout do Card:**
```
┌─────────────────────────────┐
│  ⚠️  Leads Duplicados       │
│      185  Ignorados         │
└─────────────────────────────┘
```

## ✅ Benefícios

1. **Transparência:** Usuário vê quantos leads foram ignorados
2. **Controle:** Entende a qualidade dos dados
3. **Performance:** Não afeta funcionamento existente
4. **Escalabilidade:** Sistema preparado para futuras melhorias

## 🔄 Compatibilidade

- ✅ **Não afeta** funcionamento existente
- ✅ **Mantém** todas as funcionalidades atuais
- ✅ **Adiciona** apenas nova informação
- ✅ **Backward compatible** com campanhas existentes

## 📝 Próximos Passos

1. **Executar script SQL** para adicionar coluna
2. **Testar funcionalidade** com operações em massa
3. **Verificar exibição** no card de estatísticas
4. **Validar contadores** em diferentes cenários

---

**Status:** ✅ Implementação Completa  
**Data:** 10/09/2025  
**Versão:** Disparador V2


















