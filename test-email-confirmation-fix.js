// ==============================================
// SCRIPT PARA TESTAR CORREÇÃO DO FLUXO DE CONFIRMAÇÃO
// ==============================================

import { createClient } from '@supabase/supabase-js'

// Configuração do Supabase
const supabaseUrl = 'https://lsvwjyhnnzeewuuuykmb.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzdndqeWhubnplZXd1dXV5a21iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMzc4NTYsImV4cCI6MjA2OTkxMzg1Nn0.jNw-YTXlnbd51l7RHHQpTYgCqxERz6NqPggqMM41Fck'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzdndqeWhubnplZXd1dXV5a21iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDMzNzg1NiwiZXhwIjoyMDY5OTEzODU2fQ.XeXm2_L1IBhytbQPpEnmUgygv22TOcu8SCWelHcW3Mk'

const supabase = createClient(supabaseUrl, supabaseAnonKey)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

async function testEmailConfirmationFix() {
  console.log('🧪 Testando correção do fluxo de confirmação...')
  console.log('=' .repeat(60))

  const testEmail = `test-confirm-fix-${Date.now()}@example.com`
  const testPassword = 'TestPassword123!'

  console.log(`📧 Email de teste: ${testEmail}`)
  console.log(`🔐 Senha de teste: ${testPassword}`)

  try {
    // 1. Criar usuário com confirmação de email
    console.log('\n1️⃣ Criando usuário com confirmação de email...')
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        emailRedirectTo: 'https://leadbaze.io/auth/callback',
        data: {
          name: 'Usuário Teste Confirmação'
        }
      }
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

    // 2. Verificar senha antes da confirmação
    console.log('\n2️⃣ Verificando senha antes da confirmação...')
    
    const { data: userDataBefore, error: userErrorBefore } = await supabaseAdmin.auth.admin.getUserById(authData.user.id)
    
    if (userErrorBefore) {
      console.log('❌ Erro ao consultar usuário:', userErrorBefore.message)
    } else if (userDataBefore && userDataBefore.user) {
      const user = userDataBefore.user
      const hasPassword = user.encrypted_password ? 'SIM' : 'NÃO'
      console.log('   🔒 Senha salva antes da confirmação:', hasPassword)
    }

    // 3. Simular confirmação de email (usando admin)
    console.log('\n3️⃣ Simulando confirmação de email...')
    
    const { data: confirmData, error: confirmError } = await supabaseAdmin.auth.admin.updateUserById(authData.user.id, {
      email_confirm: true
    })

    if (confirmError) {
      console.log('❌ Erro ao confirmar email:', confirmError.message)
    } else {
      console.log('✅ Email confirmado via admin')
    }

    // 4. Verificar senha após confirmação
    console.log('\n4️⃣ Verificando senha após confirmação...')
    
    const { data: userDataAfter, error: userErrorAfter } = await supabaseAdmin.auth.admin.getUserById(authData.user.id)
    
    if (userErrorAfter) {
      console.log('❌ Erro ao consultar usuário:', userErrorAfter.message)
    } else if (userDataAfter && userDataAfter.user) {
      const user = userDataAfter.user
      const hasPassword = user.encrypted_password ? 'SIM' : 'NÃO'
      console.log('   🔒 Senha salva após confirmação:', hasPassword)
      
      if (hasPassword === 'SIM') {
        console.log('   🎉 SUCESSO! Senha foi salva após confirmação!')
      } else {
        console.log('   ❌ PROBLEMA! Senha ainda não foi salva')
      }
    }

    // 5. Testar login
    console.log('\n5️⃣ Testando login...')
    
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

  } catch (error) {
    console.error('❌ Erro geral:', error.message)
  }
}

// Executar script
testEmailConfirmationFix()

