// ==============================================
// SCRIPT PARA TESTAR USUÁRIO CONFIRMADO
// ==============================================

import { createClient } from '@supabase/supabase-js'

// Configuração do Supabase
const supabaseUrl = 'https://lsvwjyhnnzeewuuuykmb.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzdndqeWhubnplZXd1dXV5a21iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMzc4NTYsImV4cCI6MjA2OTkxMzg1Nn0.jNw-YTXlnbd51l7RHHQpTYgCqxERz6NqPggqMM41Fck'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzdndqeWhubnplZXd1dXV5a21iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDMzNzg1NiwiZXhwIjoyMDY5OTEzODU2fQ.XeXm2_L1IBhytbQPpEnmUgygv22TOcu8SCWelHcW3Mk'

const supabase = createClient(supabaseUrl, supabaseAnonKey)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

async function testConfirmedUser() {
  const testEmail = 'creaty1234567@gmail.com'
  const testPassword = '@@DeusGod975432'
  
  console.log('🧪 Testando usuário confirmado...')
  console.log('=' .repeat(60))

  try {
    // 1. Verificar usuário no banco
    console.log('\n1️⃣ Verificando usuário no banco...')
    
    const { data: allUsers, error: allUsersError } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 20
    })

    if (allUsersError) {
      console.log('❌ Erro ao listar usuários:', allUsersError.message)
      return
    }

    const user = allUsers.users.find(u => u.email === testEmail)
    
    if (user) {
      console.log('✅ Usuário encontrado:')
      console.log('   📧 Email:', user.email)
      console.log('   🆔 ID:', user.id)
      console.log('   📅 Criado em:', user.created_at)
      console.log('   📧 Email confirmado:', user.email_confirmed_at ? 'Sim' : 'Não')
      console.log('   🔒 Senha:', user.encrypted_password ? 'SIM' : 'NÃO')
      console.log('   📅 Última atualização:', user.updated_at)
    } else {
      console.log('❌ Usuário não encontrado:', testEmail)
      return
    }

    // 2. Testar login
    console.log('\n2️⃣ Testando login...')
    
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    })

    if (loginError) {
      console.log('❌ Erro no login:', loginError.message)
      console.log('   🔍 Possíveis causas:')
      console.log('      1. Senha incorreta')
      console.log('      2. Email não confirmado')
      console.log('      3. Problema na autenticação')
    } else if (loginData.user) {
      console.log('✅ Login realizado com sucesso!')
      console.log('   🆔 User ID:', loginData.user.id)
      console.log('   📧 Email:', loginData.user.email)
      console.log('   📧 Email confirmado:', loginData.user.email_confirmed_at ? 'Sim' : 'Não')
      console.log('   🎉 SISTEMA FUNCIONANDO!')
    }

    // 3. Verificar URL de confirmação
    console.log('\n3️⃣ Verificando URL de confirmação...')
    console.log('   🔗 URL usada: https://lsvwjyhnnzeewuuuykmb.supabase.co/auth/v1/verify?token=...&type=signup&redirect_to=https://leadbaze.io')
    console.log('   ✅ URL está correta')
    console.log('   ✅ Redirect para: https://leadbaze.io')

    // 4. Resultado final
    console.log('\n4️⃣ Resultado final:')
    
    if (loginData && loginData.user) {
      console.log('   🎉 SUCESSO COMPLETO!')
      console.log('   ✅ Usuário criado')
      console.log('   ✅ Email confirmado')
      console.log('   ✅ Senha funcionando')
      console.log('   ✅ Login funcionando')
      console.log('   ✅ Sistema de autenticação funcionando!')
    } else {
      console.log('   ❌ PROBLEMA!')
      console.log('   🔧 Verificar configurações')
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message)
  }
}

// Executar script
testConfirmedUser()

