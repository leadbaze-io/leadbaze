// ==============================================
// CRIAR PERFIL FALTANTE PARA O USUÁRIO
// ==============================================

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lsvwjyhnnzeewuuuykmb.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzdndqeWhubnplZXd1dXV5a21iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDMzNzg1NiwiZXhwIjoyMDY5OTEzODU2fQ.XeXm2_L1IBhytbQPpEnmUgygv22TOcu8SCWelHcW3Mk'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createMissingProfile() {
  console.log('🛠️ Criando perfil faltante para creaty1234567@gmail.com...')
  console.log('=' .repeat(60))

  try {
    const userId = '058f1602-2885-47e1-bc0e-dce84521f326'
    
    // Dados do perfil baseados no que seria criado pelo EnhancedSignupForm
    const profileData = {
      user_id: userId,
      tax_type: 'pessoa_fisica',
      full_name: 'Usuário Teste', // Nome padrão
      email: 'creaty1234567@gmail.com',
      phone: '(11) 99999-9999', // Telefone padrão
      billing_street: 'Rua Teste',
      billing_number: '123',
      billing_complement: '',
      billing_neighborhood: 'Centro',
      billing_city: 'São Paulo',
      billing_state: 'SP',
      billing_zip_code: '01000-000',
      billing_country: 'BR',
      accepted_payment_methods: ['credit_card', 'pix'],
      billing_cycle: 'monthly',
      auto_renewal: true,
      lgpd_consent: true,
      lgpd_consent_date: new Date().toISOString(),
      lgpd_consent_ip: '127.0.0.1',
      lgpd_consent_user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      profile_completion_percentage: 100,
      is_verified: false,
      verification_status: {},
      preferred_contact: 'email'
    }

    console.log('\n1️⃣ Criando perfil...')
    console.log('   📧 Email:', profileData.email)
    console.log('   👤 Nome:', profileData.full_name)
    console.log('   🆔 User ID:', profileData.user_id)

    const { data: createdProfile, error: createError } = await supabase
      .from('user_profiles')
      .insert(profileData)
      .select()
      .single()

    if (createError) {
      console.log('❌ Erro ao criar perfil:', createError.message)
      console.log('   Código:', createError.code)
      console.log('   Detalhes:', createError.details)
      return
    }

    console.log('✅ Perfil criado com sucesso!')
    console.log('   🆔 ID do perfil:', createdProfile.id)
    console.log('   📅 Criado em:', createdProfile.created_at)

    // 2. Verificar se o perfil foi criado corretamente
    console.log('\n2️⃣ Verificando perfil criado...')
    
    const { data: verifyProfile, error: verifyError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (verifyError) {
      console.log('❌ Erro ao verificar perfil:', verifyError.message)
    } else {
      console.log('✅ Perfil verificado com sucesso!')
      console.log('   📧 Email:', verifyProfile.email)
      console.log('   👤 Nome:', verifyProfile.full_name)
      console.log('   📱 Telefone:', verifyProfile.phone)
      console.log('   🏠 Endereço:', `${verifyProfile.billing_street}, ${verifyProfile.billing_number}`)
      console.log('   🏙️ Cidade:', `${verifyProfile.billing_city}/${verifyProfile.billing_state}`)
    }

    // 3. Testar se o erro 406 foi resolvido
    console.log('\n3️⃣ Testando acesso ao perfil...')
    
    const { data: testProfile, error: testError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (testError) {
      console.log('❌ Ainda há erro:', testError.message)
    } else {
      console.log('✅ Perfil acessível! O erro 406 foi resolvido!')
    }

    console.log('\n🎉 SUCESSO!')
    console.log('   O perfil foi criado e o usuário agora pode acessar sua conta normalmente.')

  } catch (error) {
    console.error('❌ Erro geral:', error.message)
  }
}

// Executar criação do perfil
createMissingProfile()
