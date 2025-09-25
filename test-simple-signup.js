// ==============================================
// SCRIPT PARA TESTAR SIGNUP SIMPLES (COMO O ANTIGO)
// ==============================================

import { createClient } from '@supabase/supabase-js'

// Configuração do Supabase
const supabaseUrl = 'https://lsvwjyhnnzeewuuuykmb.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzdndqeWhubnplZXd1dXV5a21iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMzc4NTYsImV4cCI6MjA2OTkxMzg1Nn0.jNw-YTXlnbd51l7RHHQpTYgCqxERz6NqPggqMM41Fck'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzdndqeWhubnplZXd1dXV5a21iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDMzNzg1NiwiZXhwIjoyMDY5OTEzODU2fQ.XeXm2_L1IBhytbQPpEnmUgygv22TOcu8SCWelHcW3Mk'

const supabase = createClient(supabaseUrl, supabaseAnonKey)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

async function testSimpleSignup() {
  console.log('🧪 Testando signup simples (como o antigo)...')
  console.log('=' .repeat(60))

  const testEmail = `test-simple-${Date.now()}@example.com`
  const testPassword = 'TestPassword123!'

  console.log(`📧 Email de teste: ${testEmail}`)
  console.log(`🔐 Senha de teste: ${testPassword}`)

  try {
    // 1. Teste 1: Signup simples (sem options)
    console.log('\n1️⃣ Teste 1: Signup simples (sem options)...')
    
    const { data: authData1, error: authError1 } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword
    })

    if (authError1) {
      console.log('❌ Erro no teste 1:', authError1.message)
    } else if (authData1.user) {
      console.log('✅ Usuário criado no teste 1')
      console.log('   🆔 ID:', authData1.user.id)
      console.log('   📧 Email confirmado:', authData1.user.email_confirmed_at ? 'Sim' : 'Não')
      
      // Verificar se senha foi salva
      const { data: userData1, error: userError1 } = await supabaseAdmin.auth.admin.getUserById(authData1.user.id)
      if (userData1 && userData1.user) {
        const hasPassword = userData1.user.encrypted_password ? 'SIM' : 'NÃO'
        console.log('   🔒 Senha salva:', hasPassword)
        
        if (hasPassword === 'SIM') {
          console.log('   🎉 SUCESSO! Senha foi salva no teste simples!')
        }
      }
    }

    // 2. Teste 2: Signup com options (como o EnhancedSignupForm)
    console.log('\n2️⃣ Teste 2: Signup com options (como o EnhancedSignupForm)...')
    
    const testEmail2 = `test-options-${Date.now()}@example.com`
    const { data: authData2, error: authError2 } = await supabase.auth.signUp({
      email: testEmail2,
      password: testPassword,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          name: 'Usuário Teste Options'
        }
      }
    })

    if (authError2) {
      console.log('❌ Erro no teste 2:', authError2.message)
    } else if (authData2.user) {
      console.log('✅ Usuário criado no teste 2')
      console.log('   🆔 ID:', authData2.user.id)
      console.log('   📧 Email confirmado:', authData2.user.email_confirmed_at ? 'Sim' : 'Não')
      
      // Verificar se senha foi salva
      const { data: userData2, error: userError2 } = await supabaseAdmin.auth.admin.getUserById(authData2.user.id)
      if (userData2 && userData2.user) {
        const hasPassword = userData2.user.encrypted_password ? 'SIM' : 'NÃO'
        console.log('   🔒 Senha salva:', hasPassword)
        
        if (hasPassword === 'SIM') {
          console.log('   🎉 SUCESSO! Senha foi salva no teste com options!')
        } else {
          console.log('   ❌ PROBLEMA! Senha não foi salva no teste com options!')
        }
      }
    }

    // 3. Comparação
    console.log('\n3️⃣ Comparação dos testes:')
    console.log('   📋 Teste 1 (simples): Verificar se senha foi salva')
    console.log('   📋 Teste 2 (com options): Verificar se senha foi salva')
    console.log('   🔍 Se teste 1 funcionar e teste 2 não, o problema está nas options')

  } catch (error) {
    console.error('❌ Erro geral:', error.message)
  }
}

// Executar script
testSimpleSignup()

