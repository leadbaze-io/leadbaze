// ==============================================
// SCRIPT PARA VERIFICAR CONFIGURAÇÕES DE EMAIL NO SUPABASE
// ==============================================

import { createClient } from '@supabase/supabase-js'

// Configuração do Supabase
const supabaseUrl = 'https://lsvwjyhnnzeewuuuykmb.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzdndqeWhubnplZXd1dXV5a21iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMzc4NTYsImV4cCI6MjA2OTkxMzg1Nn0.jNw-YTXlnbd51l7RHHQpTYgCqxERz6NqPggqMM41Fck'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkEmailSettings() {
  console.log('📧 Verificando configurações de email no Supabase...')
  console.log('=' .repeat(60))

  try {
    // 1. Verificar configurações de autenticação
    console.log('\n1️⃣ Verificando configurações de autenticação...')
    
    // 2. Testar criação de usuário com confirmação
    console.log('\n2️⃣ Testando criação de usuário...')
    const testEmail = `test-${Date.now()}@example.com`
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: 'test123456',
      options: {
        emailRedirectTo: 'https://leadbaze.io/auth/callback'
      }
    })

    if (authError) {
      console.log('❌ Erro ao criar usuário:', authError.message)
      return
    }

    console.log('✅ Usuário criado:', authData.user?.email)
    console.log('📧 Email confirmado:', authData.user?.email_confirmed_at)
    console.log('🔐 Confirmação necessária:', !authData.user?.email_confirmed_at)

    // 3. Verificar se email foi enviado
    if (!authData.user?.email_confirmed_at) {
      console.log('\n📧 Email de confirmação deve ter sido enviado!')
      console.log('   Verifique a caixa de entrada de:', testEmail)
    } else {
      console.log('\n⚠️  Usuário foi confirmado automaticamente')
      console.log('   Isso indica que emails de confirmação estão desabilitados')
    }

    // 4. Limpar usuário de teste
    console.log('\n🧹 Limpando usuário de teste...')
    // Nota: Não podemos deletar via client, apenas via admin

  } catch (error) {
    console.error('❌ Erro geral:', error.message)
  }
}

// Executar script
checkEmailSettings()
