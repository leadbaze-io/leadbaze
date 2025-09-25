// ==============================================
// SCRIPT PARA TESTAR CONFIRMAÇÃO DE EMAIL
// ==============================================

import { createClient } from '@supabase/supabase-js'

// Configuração do Supabase
const supabaseUrl = 'https://lsvwjyhnnzeewuuuykmb.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzdndqeWhubnplZXd1dXV5a21iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMzc4NTYsImV4cCI6MjA2OTkxMzg1Nn0.jNw-YTXlnbd51l7RHHQpTYgCqxERz6NqPggqMM41Fck'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzdndqeWhubnplZXd1dXV5a21iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDMzNzg1NiwiZXhwIjoyMDY5OTEzODU2fQ.XeXm2_L1IBhytbQPpEnmUgygv22TOcu8SCWelHcW3Mk'

const supabase = createClient(supabaseUrl, supabaseAnonKey)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

async function testEmailConfirmation() {
  console.log('🧪 Testando confirmação de email...')
  console.log('=' .repeat(60))

  // Use um email real que você pode acessar
  const testEmail = 'creaty123456@gmail.com' // Email que você pode acessar
  const testPassword = 'TestPassword123!'

  console.log(`\n📧 Email de teste: ${testEmail}`)
  console.log(`🔐 Senha de teste: ${testPassword}`)

  try {
    // 1. Verificar usuário existente
    console.log('\n1️⃣ Verificando usuário existente...')
    
    const { data: existingUser, error: existingError } = await supabaseAdmin.auth.admin.getUserById('95ca9cd7-ecbf-445f-a48b-643927d27ccf')
    
    if (existingError) {
      console.log('❌ Erro ao consultar usuário existente:', existingError.message)
      return
    }

    if (existingUser && existingUser.user) {
      const user = existingUser.user
      console.log('✅ Usuário existente:')
      console.log('   📧 Email:', user.email)
      console.log('   📧 Email confirmado:', user.email_confirmed_at ? 'Sim' : 'Não')
      console.log('   🔒 Senha:', user.encrypted_password ? 'SIM' : 'NÃO')
      
      // Testar login
      console.log('\n2️⃣ Testando login...')
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword
      })

      if (loginError) {
        console.log('❌ Erro no login:', loginError.message)
      } else if (loginData.user) {
        console.log('✅ Login realizado com sucesso!')
        console.log('   🆔 User ID:', loginData.user.id)
        console.log('   🎉 SISTEMA FUNCIONANDO!')
      }
    }

    // 2. Criar novo usuário para teste de confirmação
    console.log('\n3️⃣ Criando novo usuário para teste...')
    
    const newTestEmail = `test-confirm-${Date.now()}@example.com`
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: newTestEmail,
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

    if (authData.user) {
      console.log('✅ Novo usuário criado:')
      console.log('   🆔 ID:', authData.user.id)
      console.log('   📧 Email:', authData.user.email)
      console.log('   📧 Email confirmado:', authData.user.email_confirmed_at ? 'Sim' : 'Não')
      
      if (!authData.user.email_confirmed_at) {
        console.log('\n4️⃣ INSTRUÇÕES PARA TESTE MANUAL:')
        console.log('   📬 1. Verifique o email:', newTestEmail)
        console.log('   🔗 2. Clique no link de confirmação')
        console.log('   ⏳ 3. Aguarde o redirecionamento')
        console.log('   🧪 4. Execute este script novamente para verificar')
        
        // Aguardar um pouco e verificar novamente
        console.log('\n5️⃣ Aguardando 10 segundos e verificando novamente...')
        await new Promise(resolve => setTimeout(resolve, 10000))
        
        const { data: updatedUser, error: updatedError } = await supabaseAdmin.auth.admin.getUserById(authData.user.id)
        
        if (updatedError) {
          console.log('❌ Erro ao verificar usuário atualizado:', updatedError.message)
        } else if (updatedUser && updatedUser.user) {
          const updated = updatedUser.user
          console.log('   📧 Email confirmado:', updated.email_confirmed_at ? 'Sim' : 'Não')
          console.log('   🔒 Senha:', updated.encrypted_password ? 'SIM' : 'NÃO')
          
          if (updated.email_confirmed_at && updated.encrypted_password) {
            console.log('   🎉 SUCESSO! Email confirmado e senha salva!')
          } else if (updated.email_confirmed_at) {
            console.log('   ⚠️  Email confirmado mas senha não salva')
          } else {
            console.log('   ⏳ Email ainda não confirmado')
          }
        }
      }
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message)
  }
}

// Executar script
testEmailConfirmation()

