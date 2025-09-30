# 🔍 Verificação de Cadastro do Usuário

## Email: `creaty123456@gmail.com`

### 📋 Passos para Verificar os Dados

#### 1️⃣ **Verificar se as Tabelas Existem**
Execute o script `check-tables-exist.sql` no SQL Editor do Supabase:

```sql
-- Verificar se as tabelas existem
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'user_profiles',
    'user_verifications', 
    'user_documents',
    'user_payment_methods'
)
ORDER BY table_name;
```

**Resultado esperado:**
- ✅ `user_profiles` - deve existir
- ✅ `user_verifications` - deve existir  
- ✅ `user_documents` - deve existir
- ✅ `user_payment_methods` - deve existir

#### 2️⃣ **Verificação Rápida**
Execute o script `quick-verify-user.sql` no SQL Editor do Supabase:

```sql
SELECT 
    au.id as user_id,
    au.email,
    au.email_confirmed_at,
    au.created_at as user_created_at,
    
    -- Dados do perfil
    up.tax_type,
    up.full_name,
    up.cpf,
    up.cnpj,
    up.birth_date,
    up.phone,
    up.email as profile_email,
    up.billing_street,
    up.billing_number,
    up.billing_city,
    up.billing_state,
    up.billing_zip_code,
    up.profile_completion_percentage,
    up.is_verified,
    up.lgpd_consent,
    up.lgpd_consent_date,
    up.created_at as profile_created_at,
    
    -- Contadores
    (SELECT COUNT(*) FROM user_verifications uv WHERE uv.user_id = au.id) as total_verifications,
    (SELECT COUNT(*) FROM user_documents ud WHERE ud.user_id = au.id) as total_documents,
    (SELECT COUNT(*) FROM user_payment_methods upm WHERE upm.user_id = au.id) as total_payment_methods

FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.user_id
WHERE au.email = 'creaty123456@gmail.com';
```

#### 3️⃣ **Verificação Completa**
Execute o script `verify-user-registration.sql` para uma análise detalhada.

### 📊 O que Verificar

#### ✅ **Dados Básicos:**
- [ ] Usuário criado na tabela `auth.users`
- [ ] Email confirmado (`email_confirmed_at` não nulo)
- [ ] Perfil criado na tabela `user_profiles`

#### ✅ **Dados Pessoais:**
- [ ] `tax_type` (pessoa_fisica ou pessoa_juridica)
- [ ] `full_name` preenchido
- [ ] `cpf` ou `cnpj` preenchido (dependendo do tipo)
- [ ] `phone` preenchido
- [ ] `email` preenchido

#### ✅ **Dados de Endereço:**
- [ ] `billing_street` preenchido
- [ ] `billing_number` preenchido
- [ ] `billing_city` preenchido
- [ ] `billing_state` preenchido
- [ ] `billing_zip_code` preenchido

#### ✅ **Dados de Compliance:**
- [ ] `lgpd_consent` = true
- [ ] `lgpd_consent_date` preenchido
- [ ] `profile_completion_percentage` > 0

### 🚨 **Possíveis Problemas**

#### ❌ **Se o usuário não for encontrado:**
1. Verificar se o email está correto
2. Verificar se o cadastro foi concluído
3. Verificar se há erros no console do navegador

#### ❌ **Se o perfil não for encontrado:**
1. Verificar se o formulário foi submetido corretamente
2. Verificar se há erros no backend
3. Verificar se as tabelas foram criadas

#### ❌ **Se dados estiverem faltando:**
1. Verificar se o formulário foi preenchido completamente
2. Verificar se as validações estão funcionando
3. Verificar se o `profile_completion_percentage` está sendo calculado

### 🔧 **Comandos Úteis**

#### Verificar todos os usuários:
```sql
SELECT email, created_at FROM auth.users ORDER BY created_at DESC LIMIT 10;
```

#### Verificar todos os perfis:
```sql
SELECT up.full_name, up.email, up.profile_completion_percentage, up.created_at 
FROM user_profiles up 
ORDER BY up.created_at DESC LIMIT 10;
```

#### Verificar logs de erro:
```sql
SELECT * FROM auth.audit_log_entries 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'creaty123456@gmail.com')
ORDER BY created_at DESC;
```

### 📞 **Próximos Passos**

1. **Execute os scripts** na ordem sugerida
2. **Verifique os resultados** contra a lista de verificação
3. **Reporte qualquer problema** encontrado
4. **Confirme se todos os dados** estão corretos

---

**💡 Dica:** Se você não conseguir executar os scripts SQL, posso ajudar a criar uma interface web para verificar os dados ou um script Node.js que você pode executar localmente.
