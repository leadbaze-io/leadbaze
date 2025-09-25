// ==============================================
// SCRIPT PARA TESTAR O FLUXO COMPLETO DE SIGNUP
// ==============================================

import { createClient } from '@supabase/supabase-js'

// Configuração do Supabase
const supabaseUrl = 'https://lsvwjyhnnzeewuuuykmb.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzdndqeWhubnplZXd1dXV5a21iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMzc4NTYsImV4cCI6MjA2OTkxMzg1Nn0.jNw-YTXlnbd51l7RHHQpTYgCqxERz6NqPggqMM41Fck'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testSignupFlow() {
  console.log('🧪 Testando fluxo completo de criação de usuário...')
  console.log('=' .repeat(60))

  // Dados de teste
  const testEmail = `test-signup-${Date.now()}@example.com`
  const testPassword = 'TestPassword123!'
  const testName = 'Usuário Teste'

  console.log(`\n📧 Email de teste: ${testEmail}`)
  console.log(`🔐 Senha de teste: ${testPassword}`)

  try {
    // 1. Testar criação de usuário
    console.log('\n1️⃣ Criando usuário...')
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        emailRedirectTo: 'https://leadbaze.io/auth/callback',
        data: {
          name: testName
        }
      }
    })

    if (authError) {
      console.log('❌ Erro ao criar usuário:', authError.message)
      console.log('   Código do erro:', authError.status)
      return
    }

    if (!authData.user) {
      console.log('❌ Usuário não foi criado')
      return
    }

    console.log('✅ Usuário criado com sucesso!')
    console.log('   🆔 ID:', authData.user.id)
    console.log('   📧 Email:', authData.user.email)
    console.log('   📧 Email confirmado:', authData.user.email_confirmed_at ? 'Sim' : 'Não')
    console.log('   🔐 Confirmação necessária:', !authData.user.email_confirmed_at)

    // 2. Verificar se a senha foi salva (usando service role)
    console.log('\n2️⃣ Verificando se a senha foi salva...')
    
    const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzdndqeWhubnplZXd1dXV5a21iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDMzNzg1NiwiZXhwIjoyMDY5OTEzODU2fQ.XeXm2_L1IBhytbQPpEnmUgygv22TOcu8SCWelHcW3Mk'
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
    
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(authData.user.id)
    
    if (userError) {
      console.log('❌ Erro ao consultar usuário:', userError.message)
    } else if (userData && userData.user) {
      const user = userData.user
      console.log('   🔒 Senha criptografada:', user.encrypted_password ? 'SIM' : 'NÃO')
      if (user.encrypted_password) {
        console.log('   🔐 Hash da senha:', user.encrypted_password.substring(0, 50) + '...')
      }
    }

    // 3. Testar login imediatamente (se email não precisar de confirmação)
    if (authData.user.email_confirmed_at) {
      console.log('\n3️⃣ Testando login imediato...')
      
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
    } else {
      console.log('\n3️⃣ Login não testado - email precisa de confirmação')
    }

    // 4. Verificar configurações de email
    console.log('\n4️⃣ Verificando configurações de email...')
    console.log('   📧 Email de confirmação necessário:', !authData.user.email_confirmed_at)
    console.log('   🔄 URL de redirecionamento:', 'https://leadbaze.io/auth/callback')

    // 5. Limpar usuário de teste (se possível)
    console.log('\n5️⃣ Limpando usuário de teste...')
    try {
      // Nota: Não podemos deletar via client, apenas via admin
      console.log('   ⚠️  Usuário de teste mantido para análise manual')
      console.log(`   🆔 ID para deletar manualmente: ${authData.user.id}`)
    } catch (cleanupError) {
      console.log('   ⚠️  Não foi possível limpar o usuário de teste')
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message)
  }
}

// Executar script
testSignupFlow()

