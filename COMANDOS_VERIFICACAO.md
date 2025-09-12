# 🔍 COMANDOS DE VERIFICAÇÃO DO SISTEMA ESTÁVEL

## 📋 **Verificação Rápida**

### **1. Verificar se o sistema está rodando:**
```bash
# Backend
pm2 status

# Frontend (em outro terminal)
npm run dev
```

### **2. Verificar no navegador (F12 Console):**
```javascript
// Copiar e colar o conteúdo do arquivo verificar-sistema-estavel.js
// Ou executar:
fetch('/verificar-sistema-estavel.js').then(r => r.text()).then(eval)
```

### **3. Verificar logs específicos:**
```javascript
// Verificar logs de WhatsApp
console.log('Logs WhatsApp:', console.log.toString().includes('[WHATSAPP]'))

// Verificar logs de campanha
console.log('Logs Campanha:', console.log.toString().includes('[CAMPAIGN]'))

// Verificar se há erros
console.log('Erros:', console.error.toString())
```

---

## 🧪 **Testes Funcionais**

### **1. Teste de Campanha:**
1. Criar nova campanha
2. Adicionar nome
3. Ir para próxima etapa
4. Selecionar listas
5. Verificar estatísticas
6. Salvar campanha

### **2. Teste de Operações em Massa:**
1. Abrir campanha existente
2. Clicar "Adicionar Todas"
3. Verificar se todas as listas foram adicionadas
4. Clicar "Remover Todas"
5. Verificar se todas as listas foram removidas

### **3. Teste de WhatsApp:**
1. Clicar "Conectar WhatsApp"
2. Verificar se QR Code aparece
3. Escanear QR Code
4. Verificar se status muda para "Conectado"
5. Verificar se status persiste ao recarregar página

### **4. Teste de Estatísticas:**
1. Selecionar algumas listas
2. Verificar contadores:
   - Total de Leads
   - Leads Únicos
   - Leads Duplicados Ignorados
3. Adicionar/remover listas
4. Verificar se contadores atualizam em tempo real

---

## 🚨 **Sinais de Problema**

### **❌ Se algo não estiver funcionando:**

1. **Campanhas não carregam:**
   - Verificar console para erros
   - Verificar se backend está rodando
   - Verificar conexão com Supabase

2. **Operações em massa não funcionam:**
   - Verificar se BulkCampaignService está carregado
   - Verificar logs de erro no console
   - Verificar se useBulkCampaignOperations está funcionando

3. **WhatsApp não conecta:**
   - Verificar se Evolution API está acessível
   - Verificar logs [WHATSAPP] no console
   - Verificar se instâncias estão sendo criadas

4. **Estatísticas incorretas:**
   - Verificar se LeadDeduplicationService está funcionando
   - Verificar se cálculos estão sendo executados
   - Verificar se dados estão sendo carregados corretamente

---

## 🔧 **Comandos de Diagnóstico**

### **Verificar banco de dados:**
```sql
-- Verificar campanhas
SELECT COUNT(*) FROM campaigns;

-- Verificar instâncias WhatsApp
SELECT status, COUNT(*) FROM whatsapp_instances GROUP BY status;

-- Verificar leads
SELECT COUNT(*) FROM campaign_unique_leads;
```

### **Verificar logs do sistema:**
```bash
# Logs do PM2
pm2 logs

# Logs do frontend (no console do navegador)
console.log('Sistema funcionando:', window.sistemaVerificado)
```

### **Verificar arquivos principais:**
```bash
# Verificar se arquivos existem
ls -la src/components/campaign/
ls -la src/hooks/
ls -la src/lib/
ls -la src/services/
```

---

## ✅ **Checklist de Funcionamento**

- [ ] Backend rodando (PM2 status)
- [ ] Frontend rodando (npm run dev)
- [ ] Campanhas carregam
- [ ] Listas são exibidas
- [ ] Operações manuais funcionam
- [ ] Operações em massa funcionam
- [ ] WhatsApp conecta
- [ ] Estatísticas são calculadas
- [ ] Interface responde
- [ ] Sem erros no console

---

## 🎯 **Resultado Esperado**

Se tudo estiver funcionando, você deve ver:
- ✅ Interface carregada sem erros
- ✅ Campanhas listadas
- ✅ Listas disponíveis
- ✅ Botões funcionais
- ✅ WhatsApp conectável
- ✅ Estatísticas corretas
- ✅ Logs informativos no console

**Se todos os itens estiverem ✅, o sistema está estável e pronto para uso!** 🚀



