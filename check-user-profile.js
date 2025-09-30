// ==============================================
// VERIFICAR PERFIL DO USUÁRIO
// ==============================================

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lsvwjyhnnzeewuuuykmb.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzdndqeWhubnplZXd1dXV5a21iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDMzNzg1NiwiZXhwIjoyMDY5OTEzODU2fQ.XeXm2_L1IBhytbQPpEnmUgygv22TOcu8SCWelHcW3Mk'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkUserProfile() {
  console.log('🔍 Verificando perfil do usuário creaty1234567@gmail.com...')
  console.log('=' .repeat(60))

  try {
    // 1. Buscar usuário pelo email
    const userId = '058f1602-2885-47e1-bc0e-dce84521f326' // ID do usuário creaty1234567@gmail.com
    
    console.log(`\n1️⃣ Verificando usuário: ${userId}`)
    
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId)
    
    if (userError) {
      console.log('❌ Erro ao buscar usuário:', userError.message)
      return
    }

    if (userData.user) {
      console.log('✅ Usuário encontrado:')
      console.log(`   📧 Email: ${userData.user.email}`)
      console.log(`   📅 Criado: ${userData.user.created_at}`)
      console.log(`   📧 Confirmado: ${userData.user.email_confirmed_at ? 'SIM' : 'NÃO'}`)
    }

    // 2. Verificar se existe perfil na tabela user_profiles
    console.log('\n2️⃣ Verificando perfil na tabela user_profiles...')
    
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (profileError) {
      console.log('❌ Erro ao buscar perfil:', profileError.message)
      console.log('   Código:', profileError.code)
      console.log('   Detalhes:', profileError.details)
      
      if (profileError.code === 'PGRST116') {
        console.log('\n🎯 PROBLEMA IDENTIFICADO:')
        console.log('   O usuário NÃO tem perfil criado na tabela user_profiles!')
        console.log('   Isso acontece quando o email não é confirmado durante o signup.')
      }
    } else {
      console.log('✅ Perfil encontrado:')
      console.log(`   🆔 ID: ${profileData.id}`)
      console.log(`   👤 Nome: ${profileData.full_name}`)
      console.log(`   📧 Email: ${profileData.email}`)
      console.log(`   📅 Criado: ${profileData.created_at}`)
    }

    // 3. Verificar todos os perfis existentes
    console.log('\n3️⃣ Listando todos os perfis existentes...')
    
    const { data: allProfiles, error: allProfilesError } = await supabase
      .from('user_profiles')
      .select('user_id, full_name, email, created_at')
      .order('created_at', { ascending: false })

    if (allProfilesError) {
      console.log('❌ Erro ao listar perfis:', allProfilesError.message)
    } else {
      console.log(`📊 Total de perfis: ${allProfiles.length}`)
      allProfiles.forEach((profile, index) => {
        console.log(`   ${index + 1}. ${profile.email} (${profile.full_name}) - ${profile.created_at}`)
      })
    }

    // 4. Verificar se o problema é no fluxo de signup
    console.log('\n4️⃣ Análise do problema:')
    console.log('   🔍 O usuário foi criado no Supabase Auth')
    console.log('   🔍 O usuário confirmou o email')
    console.log('   ❌ Mas o perfil NÃO foi criado na tabela user_profiles')
    console.log('\n   🎯 CAUSA PROVÁVEL:')
    console.log('   O EnhancedSignupForm só cria o perfil se o email for confirmado')
    console.log('   DURANTE o processo de signup. Como o usuário confirmou depois,')
    console.log('   o perfil não foi criado.')

    // 5. Solução
    console.log('\n5️⃣ SOLUÇÃO:')
    console.log('   Precisamos criar o perfil manualmente para este usuário')
    console.log('   ou ajustar o fluxo para criar o perfil após confirmação.')

  } catch (error) {
    console.error('❌ Erro geral:', error.message)
  }
}

// Executar verificação
checkUserProfile()

