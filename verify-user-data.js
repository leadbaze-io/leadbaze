// ==============================================
// SCRIPT PARA VERIFICAR DADOS DO USUÁRIO
// Email: creaty123456@gmail.com
// ==============================================

import { createClient } from '@supabase/supabase-js'

// Configuração do Supabase
const supabaseUrl = 'https://your-project.supabase.co' // Substitua pela sua URL
const supabaseKey = 'your-anon-key' // Substitua pela sua chave

const supabase = createClient(supabaseUrl, supabaseKey)

async function verifyUserRegistration() {
  const userEmail = 'creaty123456@gmail.com'
  
  console.log('🔍 Verificando cadastro do usuário:', userEmail)
  console.log('=' .repeat(60))

  try {
    // 1. Verificar usuário na tabela auth.users
    console.log('\n1️⃣ Verificando usuário na tabela auth.users...')
    const { data: authUser, error: authError } = await supabase
      .from('auth.users')
      .select('*')
      .eq('email', userEmail)
      .single()

    if (authError) {
      console.log('❌ Erro ao buscar usuário:', authError.message)
    } else if (authUser) {
      console.log('✅ Usuário encontrado:')
      console.log('   - ID:', authUser.id)
      console.log('   - Email:', authUser.email)
      console.log('   - Email confirmado:', authUser.email_confirmed_at ? 'Sim' : 'Não')
      console.log('   - Criado em:', authUser.created_at)
      console.log('   - Último login:', authUser.last_sign_in_at || 'Nunca')
    } else {
      console.log('❌ Usuário não encontrado na tabela auth.users')
      return
    }

    // 2. Verificar perfil na tabela user_profiles
    console.log('\n2️⃣ Verificando perfil na tabela user_profiles...')
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', authUser.id)
      .single()

    if (profileError) {
      console.log('❌ Erro ao buscar perfil:', profileError.message)
    } else if (profile) {
      console.log('✅ Perfil encontrado:')
      console.log('   - Tipo:', profile.tax_type)
      console.log('   - Nome:', profile.full_name)
      console.log('   - CPF/CNPJ:', profile.cpf || profile.cnpj || 'Não informado')
      console.log('   - Telefone:', profile.phone)
      console.log('   - Email:', profile.email)
      console.log('   - Endereço:', `${profile.billing_street}, ${profile.billing_number}`)
      console.log('   - Cidade:', profile.billing_city)
      console.log('   - Estado:', profile.billing_state)
      console.log('   - CEP:', profile.billing_zip_code)
      console.log('   - Completude:', profile.profile_completion_percentage + '%')
      console.log('   - Verificado:', profile.is_verified ? 'Sim' : 'Não')
      console.log('   - LGPD aceito:', profile.lgpd_consent ? 'Sim' : 'Não')
      console.log('   - Criado em:', profile.created_at)
    } else {
      console.log('❌ Perfil não encontrado na tabela user_profiles')
    }

    // 3. Verificar verificações na tabela user_verifications
    console.log('\n3️⃣ Verificando verificações na tabela user_verifications...')
    const { data: verifications, error: verificationsError } = await supabase
      .from('user_verifications')
      .select('*')
      .eq('user_id', authUser.id)

    if (verificationsError) {
      console.log('❌ Erro ao buscar verificações:', verificationsError.message)
    } else if (verifications && verifications.length > 0) {
      console.log('✅ Verificações encontradas:', verifications.length)
      verifications.forEach((verification, index) => {
        console.log(`   ${index + 1}. Tipo: ${verification.verification_type}`)
        console.log(`      Status: ${verification.status}`)
        console.log(`      Método: ${verification.verification_method}`)
        console.log(`      Criado em: ${verification.created_at}`)
      })
    } else {
      console.log('ℹ️ Nenhuma verificação encontrada')
    }

    // 4. Verificar documentos na tabela user_documents
    console.log('\n4️⃣ Verificando documentos na tabela user_documents...')
    const { data: documents, error: documentsError } = await supabase
      .from('user_documents')
      .select('*')
      .eq('user_id', authUser.id)

    if (documentsError) {
      console.log('❌ Erro ao buscar documentos:', documentsError.message)
    } else if (documents && documents.length > 0) {
      console.log('✅ Documentos encontrados:', documents.length)
      documents.forEach((document, index) => {
        console.log(`   ${index + 1}. Tipo: ${document.document_type}`)
        console.log(`      Nome: ${document.document_name}`)
        console.log(`      Status: ${document.status}`)
        console.log(`      Upload em: ${document.uploaded_at}`)
      })
    } else {
      console.log('ℹ️ Nenhum documento encontrado')
    }

    // 5. Verificar métodos de pagamento na tabela user_payment_methods
    console.log('\n5️⃣ Verificando métodos de pagamento na tabela user_payment_methods...')
    const { data: paymentMethods, error: paymentError } = await supabase
      .from('user_payment_methods')
      .select('*')
      .eq('user_id', authUser.id)

    if (paymentError) {
      console.log('❌ Erro ao buscar métodos de pagamento:', paymentError.message)
    } else if (paymentMethods && paymentMethods.length > 0) {
      console.log('✅ Métodos de pagamento encontrados:', paymentMethods.length)
      paymentMethods.forEach((method, index) => {
        console.log(`   ${index + 1}. Tipo: ${method.payment_type}`)
        console.log(`      Padrão: ${method.is_default ? 'Sim' : 'Não'}`)
        console.log(`      Ativo: ${method.is_active ? 'Sim' : 'Não'}`)
        console.log(`      Verificado: ${method.is_verified ? 'Sim' : 'Não'}`)
        console.log(`      Criado em: ${method.created_at}`)
      })
    } else {
      console.log('ℹ️ Nenhum método de pagamento encontrado')
    }

    // 6. Resumo geral
    console.log('\n📊 RESUMO GERAL:')
    console.log('=' .repeat(60))
    console.log('✅ Usuário criado:', authUser ? 'Sim' : 'Não')
    console.log('✅ Perfil criado:', profile ? 'Sim' : 'Não')
    console.log('✅ Verificações:', verifications ? verifications.length : 0)
    console.log('✅ Documentos:', documents ? documents.length : 0)
    console.log('✅ Métodos de pagamento:', paymentMethods ? paymentMethods.length : 0)
    
    if (profile) {
      console.log('\n📋 DADOS PRINCIPAIS:')
      console.log('   - Nome:', profile.full_name)
      console.log('   - Email:', profile.email)
      console.log('   - Telefone:', profile.phone)
      console.log('   - Tipo:', profile.tax_type)
      console.log('   - Completude:', profile.profile_completion_percentage + '%')
      console.log('   - LGPD aceito:', profile.lgpd_consent ? 'Sim' : 'Não')
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message)
  }
}

// Executar verificação
verifyUserRegistration()
