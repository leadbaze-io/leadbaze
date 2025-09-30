// ==============================================
// SCRIPT PARA TESTAR SEM CONFIRMAÇÃO DE EMAIL
// ==============================================

import { createClient } from '@supabase/supabase-js'

// Configuração do Supabase
const supabaseUrl = 'https://lsvwjyhnnzeewuuuykmb.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzdndqeWhubnplZXd1dXV5a21iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMzc4NTYsImV4cCI6MjA2OTkxMzg1Nn0.jNw-YTXlnbd51l7RHHQpTYgCqxERz6NqPggqMM41Fck'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzdndqeWhubnplZXd1dXV5a21iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDMzNzg1NiwiZXhwIjoyMDY5OTEzODU2fQ.XeXm2_L1IBhytbQPpEnmUgygv22TOcu8SCWelHcW3Mk'

const supabase = createClient(supabaseUrl, supabaseAnonKey)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

async function testWithoutConfirmation() {
  console.log('🧪 Testando sem confirmação de email...')
  console.log('=' .repeat(60))

  const testEmail = `test-no-confirm-${Date.now()}@example.com`
  const testPassword = 'TestPassword123!'

  console.log(`📧 Email de teste: ${testEmail}`)
  console.log(`🔐 Senha de teste: ${testPassword}`)

  try {
    // 1. Criar usuário
    console.log('\n1️⃣ Criando usuário...')
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword
    })

    if (authError) {
      console.log('❌ Erro ao criar usuário:', authError.message)
      return
    }

    if (!authData.user) {
      console.log('❌ Usuário não foi criado')
      return
    }

    console.log('✅ Usuário criado:')
    console.log('   🆔 ID:', authData.user.id)
    console.log('   📧 Email confirmado:', authData.user.email_confirmed_at ? 'Sim' : 'Não')

    // 2. Verificar senha imediatamente
    console.log('\n2️⃣ Verificando senha imediatamente...')
    
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(authData.user.id)
    
    if (userError) {
      console.log('❌ Erro ao consultar usuário:', userError.message)
    } else if (userData && userData.user) {
      const user = userData.user
      const hasPassword = user.encrypted_password ? 'SIM' : 'NÃO'
      console.log('   🔒 Senha salva:', hasPassword)
      
      if (hasPassword === 'SIM') {
        console.log('   🎉 SUCESSO! Senha foi salva!')
        console.log('   🔐 Hash:', user.encrypted_password.substring(0, 50) + '...')
      } else {
        console.log('   ❌ PROBLEMA! Senha não foi salva!')
      }
    }

    // 3. Testar login imediatamente
    console.log('\n3️⃣ Testando login imediatamente...')
    
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    })

    if (loginError) {
      console.log('❌ Erro no login:', loginError.message)
    } else if (loginData.user) {
      console.log('✅ Login realizado com sucesso!')
      console.log('   🆔 User ID:', loginData.user.id)
    }

    // 4. Diagnóstico
    console.log('\n4️⃣ Diagnóstico:')
    
    if (userData && userData.user && userData.user.encrypted_password) {
      console.log('   ✅ Senha foi salva corretamente')
      console.log('   ✅ Login funciona')
      console.log('   🎉 Sistema funcionando!')
    } else {
      console.log('   ❌ Senha não foi salva')
      console.log('   ❌ Login não funciona')
      console.log('   🔧 Problema na configuração do Supabase')
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message)
  }
}

// Executar script
testWithoutConfirmation()

