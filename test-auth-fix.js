// ==============================================
// SCRIPT PARA TESTAR SE O BUG DE AUTENTICAÇÃO FOI CORRIGIDO
// ==============================================

import { createClient } from '@supabase/supabase-js'

// Configuração do Supabase
const supabaseUrl = 'https://lsvwjyhnnzeewuuuykmb.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzdndqeWhubnplZXd1dXV5a21iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMzc4NTYsImV4cCI6MjA2OTkxMzg1Nn0.jNw-YTXlnbd51l7RHHQpTYgCqxERz6NqPggqMM41Fck'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzdndqeWhubnplZXd1dXV5a21iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDMzNzg1NiwiZXhwIjoyMDY5OTEzODU2fQ.XeXm2_L1IBhytbQPpEnmUgygv22TOcu8SCWelHcW3Mk'

const supabase = createClient(supabaseUrl, supabaseAnonKey)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

async function testAuthFix() {
  console.log('🧪 Testando se o bug de autenticação foi corrigido...')
  console.log('=' .repeat(60))

  // Dados de teste
  const testEmail = `test-fix-${Date.now()}@example.com`
  const testPassword = 'TestPassword123!'
  const testName = 'Usuário Teste Fix'

  console.log(`\n📧 Email de teste: ${testEmail}`)
  console.log(`🔐 Senha de teste: ${testPassword}`)

  try {
    // 1. Criar usuário de teste
    console.log('\n1️⃣ Criando usuário de teste...')
    
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

    // 2. Verificar se a senha foi salva
    console.log('\n2️⃣ Verificando se a senha foi salva...')
    
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(authData.user.id)
    
    if (userError) {
      console.log('❌ Erro ao consultar usuário:', userError.message)
    } else if (userData && userData.user) {
      const user = userData.user
      const hasPassword = user.encrypted_password ? 'SIM' : 'NÃO'
      console.log(`   🔒 Senha criptografada: ${hasPassword}`)
      
      if (user.encrypted_password) {
        console.log('   🔐 Hash da senha:', user.encrypted_password.substring(0, 50) + '...')
        console.log('   ✅ BUG CORRIGIDO! Senha está sendo salva.')
      } else {
        console.log('   ❌ BUG AINDA EXISTE! Senha não foi salva.')
        console.log('   🔧 Verifique as configurações do Supabase:')
        console.log('      1. Email confirmations habilitado?')
        console.log('      2. SMTP configurado?')
        console.log('      3. Templates de email configurados?')
      }
    }

    // 3. Testar login (se email não precisar de confirmação)
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
      console.log('   📧 Verifique seu email para confirmar a conta')
      console.log('   🔗 Após confirmar, teste o login manualmente')
    }

    // 4. Verificar configurações de email
    console.log('\n4️⃣ Status das configurações:')
    console.log('   📧 Email de confirmação necessário:', !authData.user.email_confirmed_at)
    console.log('   🔄 URL de redirecionamento:', 'https://leadbaze.io/auth/callback')
    
    if (!authData.user.email_confirmed_at) {
      console.log('   ✅ Configuração correta: Email de confirmação é necessário')
    } else {
      console.log('   ⚠️  Configuração pode estar incorreta: Email confirmado automaticamente')
    }

    // 5. Resultado final
    console.log('\n5️⃣ Resultado do teste:')
    
    if (userData && userData.user && userData.user.encrypted_password) {
      console.log('   🎉 SUCESSO! O bug foi corrigido!')
      console.log('   ✅ Senhas estão sendo salvas corretamente')
      console.log('   ✅ Sistema de autenticação funcionando')
    } else {
      console.log('   ❌ FALHA! O bug ainda existe.')
      console.log('   🔧 Ações necessárias:')
      console.log('      1. Configure SMTP no Supabase Dashboard')
      console.log('      2. Habilite email confirmations')
      console.log('      3. Configure templates de email')
      console.log('      4. Teste novamente')
    }

    // 6. Limpar usuário de teste
    console.log('\n6️⃣ Limpando usuário de teste...')
    console.log(`   🆔 ID para deletar manualmente: ${authData.user.id}`)
    console.log('   ⚠️  Execute no Supabase Dashboard: Authentication → Users → Delete')

  } catch (error) {
    console.error('❌ Erro geral:', error.message)
  }
}

// Executar script
testAuthFix()

