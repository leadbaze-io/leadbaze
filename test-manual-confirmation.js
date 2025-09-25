// ==============================================
// SCRIPT PARA TESTAR CONFIRMAÇÃO MANUAL
// ==============================================

import { createClient } from '@supabase/supabase-js'

// Configuração do Supabase
const supabaseUrl = 'https://lsvwjyhnnzeewuuuykmb.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzdndqeWhubnplZXd1dXV5a21iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMzc4NTYsImV4cCI6MjA2OTkxMzg1Nn0.jNw-YTXlnbd51l7RHHQpTYgCqxERz6NqPggqMM41Fck'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzdndqeWhubnplZXd1dXV5a21iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDMzNzg1NiwiZXhwIjoyMDY5OTEzODU2fQ.XeXm2_L1IBhytbQPpEnmUgygv22TOcu8SCWelHcW3Mk'

const supabase = createClient(supabaseUrl, supabaseAnonKey)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

async function testManualConfirmation() {
  console.log('🧪 Testando confirmação manual...')
  console.log('=' .repeat(60))

  // Use um email real para teste
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
      console.log('✅ Usuário existente encontrado:')
      console.log('   📧 Email:', user.email)
      console.log('   📧 Email confirmado:', user.email_confirmed_at ? 'Sim' : 'Não')
      console.log('   🔒 Senha:', user.encrypted_password ? 'SIM' : 'NÃO')
      
      if (user.email_confirmed_at) {
        console.log('   ✅ Email já está confirmado!')
        
        // Testar login
        console.log('\n2️⃣ Testando login...')
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email: testEmail,
          password: testPassword
        })

        if (loginError) {
          console.log('❌ Erro no login:', loginError.message)
          console.log('   🔍 Possíveis causas:')
          console.log('      1. Senha incorreta')
          console.log('      2. Usuário não tem senha salva')
          console.log('      3. Problema na autenticação')
        } else if (loginData.user) {
          console.log('✅ Login realizado com sucesso!')
          console.log('   🆔 User ID:', loginData.user.id)
        }
      } else {
        console.log('   📧 Email não confirmado - enviando novo email de confirmação...')
        
        // Enviar novo email de confirmação
        const { error: resendError } = await supabase.auth.resend({
          type: 'signup',
          email: testEmail
        })

        if (resendError) {
          console.log('❌ Erro ao reenviar email:', resendError.message)
        } else {
          console.log('✅ Email de confirmação reenviado!')
          console.log('   📬 Verifique a caixa de entrada de:', testEmail)
          console.log('   🔗 Clique no link de confirmação')
          console.log('   ⏳ Aguarde alguns minutos e execute este script novamente')
        }
      }
    }

    // 2. Criar novo usuário para teste
    console.log('\n3️⃣ Criando novo usuário para teste...')
    
    const newTestEmail = `test-manual-${Date.now()}@example.com`
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: newTestEmail,
      password: testPassword,
      options: {
        emailRedirectTo: 'https://leadbaze.io/auth/callback',
        data: {
          name: 'Usuário Teste Manual'
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
        console.log('   📬 Email de confirmação enviado para:', newTestEmail)
        console.log('   🔗 Clique no link de confirmação no email')
        console.log('   ⏳ Após confirmar, execute este script novamente')
      }
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message)
  }
}

// Executar script
testManualConfirmation()

