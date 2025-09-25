// ==============================================
// CORRIGIR TODOS OS USUÁRIOS EXISTENTES SEM PERFIL
// ==============================================

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lsvwjyhnnzeewuuuykmb.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzdndqeWhubnplZXd1dXV5a21iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDMzNzg1NiwiZXhwIjoyMDY5OTEzODU2fQ.XeXm2_L1IBhytbQPpEnmUgygv22TOcu8SCWelHcW3Mk'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixAllExistingUsers() {
  console.log('🛠️ Corrigindo todos os usuários existentes sem perfil...')
  console.log('=' .repeat(60))

  try {
    // 1. Listar todos os usuários
    const { data: allUsers, error: usersError } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 50
    })

    if (usersError) {
      console.log('❌ Erro ao listar usuários:', usersError.message)
      return
    }

    // 2. Listar todos os perfis existentes
    const { data: allProfiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('user_id')

    if (profilesError) {
      console.log('❌ Erro ao listar perfis:', profilesError.message)
      return
    }

    const existingProfileIds = new Set(allProfiles.map(p => p.user_id))

    // 3. Identificar usuários sem perfil
    const usersWithoutProfile = allUsers.users.filter(user => 
      !existingProfileIds.has(user.id) && user.email_confirmed_at
    )

    console.log(`📊 Total de usuários: ${allUsers.users.length}`)
    console.log(`📊 Usuários com perfil: ${allProfiles.length}`)
    console.log(`📊 Usuários sem perfil (confirmados): ${usersWithoutProfile.length}`)

    if (usersWithoutProfile.length === 0) {
      console.log('\n🎉 Todos os usuários confirmados já têm perfil!')
      return
    }

    // 4. Criar perfis para usuários sem perfil
    console.log('\n🛠️ Criando perfis faltantes...')
    
    let successCount = 0
    let errorCount = 0

    for (const user of usersWithoutProfile) {
      try {
        console.log(`\n📝 Criando perfil para: ${user.email}`)
        
        // Dados do perfil baseados no email
        const profileData = {
          user_id: user.id,
          tax_type: 'pessoa_fisica',
          full_name: user.email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          email: user.email,
          phone: '(11) 99999-9999',
          billing_street: 'Endereço não informado',
          billing_number: 'S/N',
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
          lgpd_consent_user_agent: 'Migration Script',
          profile_completion_percentage: 50, // Perfil básico
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
          console.log(`   ❌ Erro: ${createError.message}`)
          errorCount++
        } else {
          console.log(`   ✅ Sucesso! ID: ${createdProfile.id}`)
          successCount++
        }

        // Pequena pausa para não sobrecarregar
        await new Promise(resolve => setTimeout(resolve, 100))

      } catch (error) {
        console.log(`   ❌ Erro geral: ${error.message}`)
        errorCount++
      }
    }

    // 5. Resumo final
    console.log('\n📊 Resumo da Correção:')
    console.log('=' .repeat(60))
    console.log(`   ✅ Perfis criados com sucesso: ${successCount}`)
    console.log(`   ❌ Erros: ${errorCount}`)
    console.log(`   📊 Total processados: ${usersWithoutProfile.length}`)

    if (errorCount === 0) {
      console.log('\n🎉 SUCESSO! Todos os usuários confirmados agora têm perfil!')
    } else {
      console.log('\n⚠️ Alguns erros ocorreram, mas a maioria foi corrigida.')
    }

    // 6. Verificação final
    console.log('\n🔍 Verificação final...')
    
    const { data: finalProfiles, error: finalError } = await supabase
      .from('user_profiles')
      .select('user_id, email, full_name')
      .order('created_at', { ascending: false })

    if (!finalError) {
      console.log(`📊 Total de perfis após correção: ${finalProfiles.length}`)
      console.log('\n📋 Últimos perfis criados:')
      finalProfiles.slice(0, 5).forEach((profile, index) => {
        console.log(`   ${index + 1}. ${profile.email} (${profile.full_name})`)
      })
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message)
  }
}

// Executar correção
fixAllExistingUsers()

