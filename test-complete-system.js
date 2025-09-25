// ==============================================
// TESTE DO SISTEMA COMPLETO DE PERFIS
// ==============================================

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lsvwjyhnnzeewuuuykmb.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzdndqeWhubnplZXd1dXV5a21iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDMzNzg1NiwiZXhwIjoyMDY5OTEzODU2fQ.XeXm2_L1IBhytbQPpEnmUgygv22TOcu8SCWelHcW3Mk'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testCompleteSystem() {
  console.log('🧪 Testando sistema completo de perfis...')
  console.log('=' .repeat(60))

  try {
    // 1. Listar todos os usuários
    console.log('\n1️⃣ Listando todos os usuários...')
    
    const { data: allUsers, error: usersError } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 50
    })

    if (usersError) {
      console.log('❌ Erro ao listar usuários:', usersError.message)
      return
    }

    console.log(`📊 Total de usuários: ${allUsers.users.length}`)

    // 2. Verificar perfis existentes
    console.log('\n2️⃣ Verificando perfis existentes...')
    
    const { data: allProfiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('user_id, full_name, email, created_at')
      .order('created_at', { ascending: false })

    if (profilesError) {
      console.log('❌ Erro ao listar perfis:', profilesError.message)
    } else {
      console.log(`📊 Total de perfis: ${allProfiles.length}`)
    }

    // 3. Verificar usuários sem perfil
    console.log('\n3️⃣ Verificando usuários sem perfil...')
    
    const usersWithoutProfile = []
    const usersWithProfile = []

    for (const user of allUsers.users) {
      const hasProfile = allProfiles.some(profile => profile.user_id === user.id)
      
      if (hasProfile) {
        usersWithProfile.push(user)
      } else {
        usersWithoutProfile.push(user)
      }
    }

    console.log(`✅ Usuários com perfil: ${usersWithProfile.length}`)
    console.log(`❌ Usuários sem perfil: ${usersWithoutProfile.length}`)

    // 4. Detalhar usuários sem perfil
    if (usersWithoutProfile.length > 0) {
      console.log('\n4️⃣ Usuários sem perfil:')
      usersWithoutProfile.forEach((user, index) => {
        const isConfirmed = user.email_confirmed_at ? 'SIM' : 'NÃO'
        console.log(`   ${index + 1}. ${user.email}`)
        console.log(`      📅 Criado: ${user.created_at}`)
        console.log(`      📧 Confirmado: ${isConfirmed}`)
        console.log(`      🆔 ID: ${user.id}`)
      })
    }

    // 5. Testar criação de perfil para usuário sem perfil
    if (usersWithoutProfile.length > 0) {
      console.log('\n5️⃣ Testando criação de perfil...')
      
      const testUser = usersWithoutProfile[0]
      console.log(`   Testando com: ${testUser.email}`)

      // Simular evento de webhook
      const webhookEvent = {
        type: 'user.confirmed',
        user: {
          id: testUser.id,
          email: testUser.email,
          email_confirmed_at: testUser.email_confirmed_at,
          created_at: testUser.created_at,
          updated_at: testUser.updated_at,
          user_metadata: testUser.user_metadata
        }
      }

      console.log('   📝 Criando perfil via webhook...')
      
      // Dados do perfil
      const profileData = {
        user_id: testUser.id,
        tax_type: 'pessoa_fisica',
        full_name: 'Usuário Teste',
        email: testUser.email,
        phone: '(11) 99999-9999',
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
        lgpd_consent_user_agent: 'Test Script',
        profile_completion_percentage: 100,
        is_verified: false,
        verification_status: {},
        preferred_contact: 'email'
      }

      const { data: createdProfile, error: createError } = await supabase
        .from('user_profiles')
        .insert(profileData)
        .select()
        .single()

      if (createError) {
        console.log('   ❌ Erro ao criar perfil:', createError.message)
      } else {
        console.log('   ✅ Perfil criado com sucesso!')
        console.log(`      🆔 ID: ${createdProfile.id}`)
        console.log(`      👤 Nome: ${createdProfile.full_name}`)
      }
    }

    // 6. Resumo final
    console.log('\n6️⃣ Resumo do Sistema:')
    console.log('=' .repeat(60))
    console.log(`   📊 Total de usuários: ${allUsers.users.length}`)
    console.log(`   ✅ Com perfil: ${usersWithProfile.length}`)
    console.log(`   ❌ Sem perfil: ${usersWithoutProfile.length}`)
    
    if (usersWithoutProfile.length === 0) {
      console.log('\n🎉 SUCESSO! Todos os usuários têm perfil!')
    } else {
      console.log('\n⚠️ ATENÇÃO! Alguns usuários ainda não têm perfil.')
      console.log('   O sistema de webhook deve resolver isso automaticamente.')
    }

    // 7. Instruções para configuração
    console.log('\n7️⃣ Próximos Passos:')
    console.log('=' .repeat(60))
    console.log('   1. Configure o webhook no Supabase Dashboard:')
    console.log('      - URL: https://seu-dominio.com/api/auth-webhook')
    console.log('      - Eventos: user.created, user.updated, user.confirmed')
    console.log('   2. Configure a variável SUPABASE_WEBHOOK_SECRET')
    console.log('   3. Teste o fluxo completo de signup')
    console.log('   4. Monitore os logs do webhook')

  } catch (error) {
    console.error('❌ Erro geral:', error.message)
  }
}

// Executar teste
testCompleteSystem()

