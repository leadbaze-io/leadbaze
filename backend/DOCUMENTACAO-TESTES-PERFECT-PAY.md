# =====================================================
# DOCUMENTAÇÃO - TESTES PERFECT PAY
# =====================================================
# Este arquivo documenta todos os testes disponíveis
# para o sistema Perfect Pay
# =====================================================

## 🎯 OBJETIVO DOS TESTES

Verificar se todo o sistema Perfect Pay está funcionando corretamente:
- ✅ **Assinaturas** (Start, Scale, Enterprise)
- ✅ **Pacotes de leads** extras
- ✅ **Webhooks** de processamento
- ✅ **Banco de dados** e configurações
- ✅ **APIs** e endpoints

## 📁 ARQUIVOS DE TESTE CRIADOS

### 🧪 **Testes JavaScript:**
- `test-complete-perfect-pay-system.js` - **TESTE PRINCIPAL** - Testa todo o sistema
- `test-perfect-pay-start.js` - Teste específico de assinatura Start
- `test-package-purchase-flow.js` - Teste de compra de pacotes
- `test-perfect-pay-complete.js` - Teste completo alternativo

### 📊 **Verificação do Banco:**
- `verificacao-completa-perfect-pay.sql` - Verifica estado do banco de dados

### 🚀 **Scripts de Execução:**
- `executar-testes-perfect-pay.ps1` - **POWERSHELL** (Windows)
- `executar-testes-perfect-pay.sh` - **BASH** (Linux/Mac)

## 🔧 COMO EXECUTAR OS TESTES

### **Opção 1: Script Automático (Recomendado)**
```powershell
# No PowerShell (Windows)
.\backend\executar-testes-perfect-pay.ps1
```

### **Opção 2: Comandos Manuais**

#### **1. Verificar Banco de Dados:**
```sql
psql $env:DATABASE_URL -f backend/verificacao-completa-perfect-pay.sql
```

#### **2. Teste Completo JavaScript:**
```bash
cd backend
node test-complete-perfect-pay-system.js
```

#### **3. Testes Específicos:**
```bash
# Teste de assinatura Start
node test-perfect-pay-start.js

# Teste de compra de pacotes
node test-package-purchase-flow.js
```

## 📋 O QUE OS TESTES VERIFICAM

### **🔍 TESTE 1: Configuração do Banco**
- ✅ Existência das tabelas essenciais
- ✅ Usuário de teste disponível
- ✅ Conexão com Supabase

### **🔍 TESTE 2: Planos de Assinatura**
- ✅ Planos configurados no banco
- ✅ Preços e leads corretos
- ✅ Códigos Perfect Pay válidos

### **🔍 TESTE 3: Pacotes de Leads**
- ✅ Pacotes disponíveis
- ✅ Preços e quantidades corretas
- ✅ Códigos Perfect Pay válidos

### **🔍 TESTE 4: Webhook de Assinatura**
- ✅ Processamento de webhook Start
- ✅ Criação de assinatura
- ✅ Atualização de saldo de leads

### **🔍 TESTE 5: Webhook de Pacote**
- ✅ Processamento de webhook de pacote
- ✅ Adição de leads ao saldo
- ✅ Registro de transação

### **🔍 TESTE 6: Assinatura do Usuário**
- ✅ Verificação de assinatura ativa
- ✅ Saldo de leads disponível
- ✅ Próxima data de cobrança

### **🔍 TESTE 7: Endpoints da API**
- ✅ API de planos funcionando
- ✅ API de pacotes funcionando
- ✅ API de assinatura funcionando

## 🎯 CONFIGURAÇÕES DE TESTE

### **👤 Usuário de Teste:**
```
ID: 66875e05-eace-49ac-bf07-0e794dbab8fd
Email: creaty123456@gmail.com
Nome: Jean Lopes
```

### **💰 Planos de Produção:**
| Plano | Código | Preço | Leads |
|-------|--------|-------|-------|
| Start | PPLQQNGCO | R$ 197,00 | 1.000 |
| Scale | PPLQQNGCM | R$ 497,00 | 4.000 |
| Enterprise | PPLQQNGCN | R$ 997,00 | 10.000 |

### **📦 Pacotes de Leads:**
| Pacote | ID | Preço | Leads |
|--------|----|----|-------|
| 500 Leads | leads_500 | R$ 99,00 | 500 |
| 1000 Leads | leads_1000 | R$ 197,00 | 1.000 |
| 2000 Leads | leads_2000 | R$ 397,00 | 2.000 |

## 🚨 PRÉ-REQUISITOS

### **✅ Antes de Executar:**
1. **Backend rodando** na porta 3001
2. **Banco de dados** conectado
3. **Variáveis de ambiente** configuradas
4. **Node.js** instalado
5. **psql** disponível (para verificação do banco)

### **🔧 Variáveis de Ambiente Necessárias:**
```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
DATABASE_URL=your_database_url
```

## 📊 INTERPRETAÇÃO DOS RESULTADOS

### **✅ SUCESSO:**
```
🎉 TODOS OS TESTES PASSARAM! Sistema Perfect Pay funcionando perfeitamente!
```

### **⚠️ FALHAS PARCIAIS:**
```
🎯 RESULTADO FINAL: 5/7 testes passaram
⚠️ Alguns testes falharam. Verifique os logs acima.
```

### **❌ FALHAS CRÍTICAS:**
- **Banco não conectado** → Verificar DATABASE_URL
- **Backend não rodando** → Executar `npm start` no backend
- **Tabelas não existem** → Executar migrações do banco
- **Webhooks falhando** → Verificar configuração Perfect Pay

## 🔄 TROUBLESHOOTING

### **Problema: Backend não está rodando**
```bash
cd backend
npm install
npm start
```

### **Problema: Banco não conecta**
```bash
# Verificar variáveis de ambiente
echo $DATABASE_URL
echo $SUPABASE_URL
```

### **Problema: Webhooks falham**
1. Verificar se Perfect Pay está configurado
2. Verificar URLs dos webhooks
3. Verificar tokens de autenticação

### **Problema: Tabelas não existem**
```sql
-- Executar migrações necessárias
\i migrations/create_tables.sql
```

## 📈 PRÓXIMOS PASSOS APÓS OS TESTES

### **✅ Se todos os testes passaram:**
1. ✅ Sistema está funcionando perfeitamente
2. ✅ Pode prosseguir com produção
3. ✅ Documentar resultados

### **⚠️ Se alguns testes falharam:**
1. 🔍 Analisar logs de erro
2. 🔧 Corrigir problemas identificados
3. 🔄 Executar testes novamente
4. 📝 Documentar correções

### **❌ Se muitos testes falharam:**
1. 🚨 Verificar configuração básica
2. 🔧 Corrigir problemas críticos primeiro
3. 🔄 Executar testes incrementais
4. 📞 Buscar suporte se necessário

## 📝 LOGS E MONITORAMENTO

### **📊 Logs Importantes:**
- **Console do backend** - Erros de API
- **Logs do Supabase** - Erros de banco
- **Logs do Perfect Pay** - Erros de webhook
- **Console do navegador** - Erros de frontend

### **🔍 Monitoramento Contínuo:**
- Verificar assinaturas ativas diariamente
- Monitorar transações falhadas
- Acompanhar saldo de leads dos usuários
- Verificar webhooks processados

---
*Documentação criada para testes completos do sistema Perfect Pay*
*Última atualização: $(Get-Date)*
