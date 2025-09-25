# 🔧 Guia para Corrigir Erro 401

## 🚨 **Problema Identificado**

O erro 401 (não autorizado) ocorre porque:
- Durante o signup, o usuário ainda não está "logado" no contexto do Supabase
- A tabela `user_profiles` tem Row Level Security (RLS) ativado
- O RLS impede a inserção direta na tabela

## ✅ **Solução Implementada**

Criamos uma **função RPC** que:
- Executa com privilégios elevados (`SECURITY DEFINER`)
- Bypassa o RLS para criar o perfil
- Pode ser chamada durante o signup

## 📋 **Passos para Resolver**

### **1. Executar SQL no Supabase Dashboard**

1. **Acesse**: https://supabase.com/dashboard/project/lsvwjyhnnzeewuuuykmb/sql
2. **Cole o SQL** abaixo no editor
3. **Execute** o SQL

### **2. SQL para Executar**

```sql
-- Função RPC para criar perfil de usuário
-- Esta função pode ser chamada durante o signup com privilégios elevados

CREATE OR REPLACE FUNCTION create_user_profile(
  p_user_id UUID,
  p_tax_type TEXT,
  p_cpf TEXT DEFAULT NULL,
  p_cnpj TEXT DEFAULT NULL,
  p_full_name TEXT,
  p_email TEXT,
  p_phone TEXT,
  p_birth_date DATE DEFAULT NULL,
  p_company_name TEXT DEFAULT NULL,
  p_billing_street TEXT,
  p_billing_number TEXT,
  p_billing_complement TEXT DEFAULT NULL,
  p_billing_neighborhood TEXT,
  p_billing_city TEXT,
  p_billing_state TEXT,
  p_billing_zip_code TEXT,
  p_billing_country TEXT DEFAULT 'BR',
  p_accepted_payment_methods TEXT[] DEFAULT ARRAY['credit_card', 'pix'],
  p_billing_cycle TEXT DEFAULT 'monthly',
  p_auto_renewal BOOLEAN DEFAULT true,
  p_lgpd_consent BOOLEAN DEFAULT true,
  p_lgpd_consent_ip TEXT DEFAULT '127.0.0.1',
  p_lgpd_consent_user_agent TEXT DEFAULT 'Signup Form'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER -- Executa com privilégios do criador da função
AS $$
DECLARE
  result JSON;
BEGIN
  -- Inserir o perfil
  INSERT INTO user_profiles (
    user_id,
    tax_type,
    cpf,
    cnpj,
    full_name,
    email,
    phone,
    birth_date,
    company_name,
    billing_street,
    billing_number,
    billing_complement,
    billing_neighborhood,
    billing_city,
    billing_state,
    billing_zip_code,
    billing_country,
    accepted_payment_methods,
    billing_cycle,
    auto_renewal,
    lgpd_consent,
    lgpd_consent_date,
    lgpd_consent_ip,
    lgpd_consent_user_agent
  ) VALUES (
    p_user_id,
    p_tax_type,
    p_cpf,
    p_cnpj,
    p_full_name,
    p_email,
    p_phone,
    p_birth_date,
    p_company_name,
    p_billing_street,
    p_billing_number,
    p_billing_complement,
    p_billing_neighborhood,
    p_billing_city,
    p_billing_state,
    p_billing_zip_code,
    p_billing_country,
    p_accepted_payment_methods,
    p_billing_cycle,
    p_auto_renewal,
    p_lgpd_consent,
    NOW(),
    p_lgpd_consent_ip,
    p_lgpd_consent_user_agent
  )
  RETURNING to_json(user_profiles.*) INTO result;
  
  RETURN result;
END;
$$;

-- Conceder permissão para a função ser executada por usuários autenticados
GRANT EXECUTE ON FUNCTION create_user_profile TO authenticated;
```

### **3. Verificar se Funcionou**

Após executar o SQL, teste criando uma nova conta. O erro 401 deve desaparecer.

## 🔍 **Como Funciona**

1. **Usuário preenche formulário** → Dados validados
2. **Conta criada no Auth** → Usuário existe no Supabase
3. **Função RPC chamada** → `create_user_profile()`
4. **Perfil criado** → Com privilégios elevados (bypassa RLS)
5. **Sucesso** → Perfil criado com dados reais

## 🎯 **Resultado Esperado**

- ✅ **Sem erro 401**: Função RPC bypassa RLS
- ✅ **Perfil criado**: Com dados reais do formulário
- ✅ **Signup completo**: Usuário pode fazer login
- ✅ **Sem erro 406**: Perfil sempre existe

## 🚀 **Próximos Passos**

1. **Execute o SQL** no Supabase Dashboard
2. **Teste criando** uma nova conta
3. **Verifique** se o perfil foi criado corretamente
4. **Confirme** que não há mais erro 401

---

**Status**: ⏳ Aguardando execução do SQL  
**Prioridade**: 🔴 Alta (bloqueia signup)

