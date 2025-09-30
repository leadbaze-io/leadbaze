// ==============================================
// SCRIPT PARA VERIFICAR CONFIRMAÇÃO
// ==============================================

import { createClient } from '@supabase/supabase-js'

// Configuração do Supabase com Service Role Key
const supabaseUrl = 'https://lsvwjyhnnzeewuuuykmb.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzdndqeWhubnplZXd1dXV5a21iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDMzNzg1NiwiZXhwIjoyMDY5OTEzODU2fQ.XeXm2_L1IBhytbQPpEnmUgygv22TOcu8SCWelHcW3Mk'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function verifyConfirmation() {
  const userId = '1a79a6e6-c3f4-4d7b-8b7d-53876e0ec59b' // ID do usuário de teste
  const testEmail = 'test-confirm-1757980144322@example.com'
  const testPassword = 'TestPassword123!'
  
  console.log('🔍 Verificando confirmação de email...')
  console.log('=' .repeat(60))

  try {
    // 1. Verificar status do usuário
    console.log('\n1️⃣ Verificando status do usuário...')
    
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId)

    if (userError) {
      console.log('❌ Erro ao consultar usuário:', userError.message)
      return
    }

    if (!userData || !userData.user) {
      console.log('❌ Usuário não encontrado')
      return
    }

    const user = userData.user
    console.log('✅ Usuário encontrado:')
    console.log('   📧 Email:', user.email)
    console.log('   📧 Email confirmado:', user.email_confirmed_at ? 'Sim' : 'Não')
    console.log('   🔒 Senha:', user.encrypted_password ? 'SIM' : 'NÃO')
    console.log('   📅 Última atualização:', user.updated_at)

    // 2. Testar login
    console.log('\n2️⃣ Testando login...')
    
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    })

    if (loginError) {
      console.log('❌ Erro no login:', loginError.message)
      console.log('   🔍 Possíveis causas:')
      console.log('      1. Email não confirmado')
      console.log('      2. Senha incorreta')
      console.log('      3. Senha não salva')
    } else if (loginData.user) {
      console.log('✅ Login realizado com sucesso!')
      console.log('   🆔 User ID:', loginData.user.id)
      console.log('   🎉 CONFIRMAÇÃO FUNCIONANDO!')
    }

    // 3. Resultado final
    console.log('\n3️⃣ Resultado final:')
    
    if (user.email_confirmed_at && user.encrypted_password) {
      console.log('   🎉 SUCESSO COMPLETO!')
      console.log('   ✅ Email confirmado')
      console.log('   ✅ Senha salva')
      console.log('   ✅ Sistema funcionando')
    } else if (user.email_confirmed_at) {
      console.log('   ⚠️  PARCIALMENTE FUNCIONANDO')
      console.log('   ✅ Email confirmado')
      console.log('   ❌ Senha não salva')
      console.log('   🔧 Problema no fluxo de confirmação')
    } else {
      console.log('   ❌ AINDA NÃO FUNCIONANDO')
      console.log('   ❌ Email não confirmado')
      console.log('   ❌ Senha não salva')
      console.log('   📧 Confirme o email primeiro')
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message)
  }
}

// Executar script
verifyConfirmation()

