// ==============================================
// SCRIPT PARA INVESTIGAR BUG NO SIGNUP
// ==============================================

import { createClient } from '@supabase/supabase-js'

// Configuração do Supabase
const supabaseUrl = 'https://lsvwjyhnnzeewuuuykmb.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzdndqeWhubnplZXd1dXV5a21iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMzc4NTYsImV4cCI6MjA2OTkxMzg1Nn0.jNw-YTXlnbd51l7RHHQpTYgCqxERz6NqPggqMM41Fck'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzdndqeWhubnplZXd1dXV5a21iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDMzNzg1NiwiZXhwIjoyMDY5OTEzODU2fQ.XeXm2_L1IBhytbQPpEnmUgygv22TOcu8SCWelHcW3Mk'

const supabase = createClient(supabaseUrl, supabaseAnonKey)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

async function investigateSignupBug() {
  console.log('🔍 Investigando bug no signup...')
  console.log('=' .repeat(60))

  try {
    // 1. Verificar configurações atuais
    console.log('\n1️⃣ Verificando configurações atuais...')
    
    // Listar usuários para análise
    const { data: allUsers, error: allUsersError } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 20
    })

    if (allUsersError) {
      console.log('❌ Erro ao listar usuários:', allUsersError.message)
      return
    }

    console.log(`📊 Total de usuários: ${allUsers.users.length}`)

    // 2. Analisar padrões
    console.log('\n2️⃣ Analisando padrões...')
    
    let confirmedWithPassword = 0
    let confirmedWithoutPassword = 0
    let unconfirmed = 0

    allUsers.users.forEach((user, index) => {
      const hasPassword = user.encrypted_password ? 'SIM' : 'NÃO'
      const isConfirmed = user.email_confirmed_at ? 'SIM' : 'NÃO'
      
      if (user.email_confirmed_at && user.encrypted_password) {
        confirmedWithPassword++
      } else if (user.email_confirmed_at && !user.encrypted_password) {
        confirmedWithoutPassword++
      } else {
        unconfirmed++
      }
      
      console.log(`   ${index + 1}. ${user.email}`)
      console.log(`      📧 Confirmado: ${isConfirmed}`)
      console.log(`      🔒 Senha: ${hasPassword}`)
      console.log(`      📅 Criado: ${user.created_at}`)
    })

    console.log('\n📈 Estatísticas:')
    console.log(`   ✅ Confirmados com senha: ${confirmedWithPassword}`)
    console.log(`   ❌ Confirmados sem senha: ${confirmedWithoutPassword}`)
    console.log(`   ⏳ Não confirmados: ${unconfirmed}`)

    // 3. Testar criação com diferentes configurações
    console.log('\n3️⃣ Testando criação com diferentes configurações...')
    
    const testEmail = `test-bug-${Date.now()}@example.com`
    const testPassword = 'TestPassword123!'

    console.log(`📧 Email de teste: ${testEmail}`)
    console.log(`🔐 Senha de teste: ${testPassword}`)

    // Teste 1: Criação básica
    console.log('\n🧪 Teste 1: Criação básica...')
    const { data: authData1, error: authError1 } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword
    })

    if (authError1) {
      console.log('❌ Erro no teste 1:', authError1.message)
    } else if (authData1.user) {
      console.log('✅ Usuário criado no teste 1')
      console.log('   📧 Email confirmado:', authData1.user.email_confirmed_at ? 'Sim' : 'Não')
      
      // Verificar se senha foi salva
      const { data: userData1, error: userError1 } = await supabaseAdmin.auth.admin.getUserById(authData1.user.id)
      if (userData1 && userData1.user) {
        const hasPassword = userData1.user.encrypted_password ? 'SIM' : 'NÃO'
        console.log('   🔒 Senha salva:', hasPassword)
      }
    }

    // 4. Verificar logs de autenticação
    console.log('\n4️⃣ Verificando logs de autenticação...')
    console.log('   📋 Para ver logs detalhados:')
    console.log('   1. Acesse Supabase Dashboard')
    console.log('   2. Vá para Authentication → Logs')
    console.log('   3. Procure por erros relacionados ao usuário de teste')

    // 5. Possíveis causas do bug
    console.log('\n5️⃣ Possíveis causas do bug:')
    console.log('   🔍 1. Configuração de email confirmations')
    console.log('   🔍 2. Template de email mal configurado')
    console.log('   🔍 3. URL de callback não processando senha')
    console.log('   🔍 4. Configuração de SMTP')
    console.log('   🔍 5. Políticas de RLS (Row Level Security)')
    console.log('   🔍 6. Configuração de redirect URLs')

    // 6. Próximos passos
    console.log('\n6️⃣ Próximos passos para investigação:')
    console.log('   📋 1. Verificar logs no Supabase Dashboard')
    console.log('   📋 2. Testar com email real (acessível)')
    console.log('   📋 3. Verificar configurações de email')
    console.log('   📋 4. Testar fluxo completo manualmente')

  } catch (error) {
    console.error('❌ Erro geral:', error.message)
  }
}

// Executar script
investigateSignupBug()

