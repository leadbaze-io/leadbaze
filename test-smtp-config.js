// ==============================================
// SCRIPT PARA TESTAR CONFIGURAÇÃO SMTP
// ==============================================

import { createClient } from '@supabase/supabase-js'

// Configuração do Supabase
const supabaseUrl = 'https://lsvwjyhnnzeewuuuykmb.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzdndqeWhubnplZXd1dXV5a21iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMzc4NTYsImV4cCI6MjA2OTkxMzg1Nn0.jNw-YTXlnbd51l7RHHQpTYgCqxERz6NqPggqMM41Fck'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzdndqeWhubnplZXd1dXV5a21iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDMzNzg1NiwiZXhwIjoyMDY5OTEzODU2fQ.XeXm2_L1IBhytbQPpEnmUgygv22TOcu8SCWelHcW3Mk'

const supabase = createClient(supabaseUrl, supabaseAnonKey)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

async function testSMTPConfig() {
  console.log('🧪 Testando configuração SMTP...')
  console.log('=' .repeat(60))

  // Dados de teste
  const testEmail = `test-smtp-${Date.now()}@example.com`
  const testPassword = 'TestPassword123!'
  const testName = 'Usuário Teste SMTP'

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
      
      if (authError.message.includes('rate limit')) {
        console.log('   ⚠️  Rate limit atingido. Aguarde alguns minutos.')
        console.log('   💡 Use um email diferente ou aguarde.')
      }
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
        console.log('   🎉 SUCESSO! Senha está sendo salva!')
      } else {
        console.log('   ❌ PROBLEMA! Senha não foi salva.')
        console.log('   🔍 Verifique se email confirmations está habilitado')
      }
    }

    // 3. Verificar status do email
    console.log('\n3️⃣ Status do email de confirmação:')
    
    if (authData.user.email_confirmed_at) {
      console.log('   ✅ Email confirmado automaticamente')
      console.log('   ⚠️  Isso pode indicar que email confirmations está desabilitado')
    } else {
      console.log('   📧 Email de confirmação enviado!')
      console.log('   ✅ Configuração correta: Email precisa de confirmação')
      console.log('   📬 Verifique a caixa de entrada de:', testEmail)
    }

    // 4. Testar login (se email confirmado)
    if (authData.user.email_confirmed_at) {
      console.log('\n4️⃣ Testando login imediato...')
      
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
      console.log('\n4️⃣ Login não testado - email precisa de confirmação')
      console.log('   📧 Confirme o email primeiro, depois teste o login')
    }

    // 5. Resultado final
    console.log('\n5️⃣ Resultado do teste:')
    
    if (userData && userData.user && userData.user.encrypted_password) {
      console.log('   🎉 SUCESSO! Configuração SMTP funcionando!')
      console.log('   ✅ Senhas estão sendo salvas')
      console.log('   ✅ Sistema de autenticação funcionando')
    } else {
      console.log('   ❌ PROBLEMA! Configuração ainda não está funcionando.')
      console.log('   🔧 Verifique:')
      console.log('      1. Email confirmations está habilitado?')
      console.log('      2. SMTP está configurado corretamente?')
      console.log('      3. Senha do Gmail está correta?')
    }

    // 6. Limpar usuário de teste
    console.log('\n6️⃣ Limpando usuário de teste...')
    console.log(`   🆔 ID para deletar: ${authData.user.id}`)
    console.log('   ⚠️  Delete manualmente no Supabase Dashboard se necessário')

  } catch (error) {
    console.error('❌ Erro geral:', error.message)
  }
}

// Executar script
testSMTPConfig()

