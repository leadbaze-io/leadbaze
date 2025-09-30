// ==============================================
// SCRIPT PARA CORRIGIR USUÁRIO EXISTENTE
// ==============================================

import { createClient } from '@supabase/supabase-js'

// Configuração do Supabase com Service Role Key
const supabaseUrl = 'https://lsvwjyhnnzeewuuuykmb.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzdndqeWhubnplZXd1dXV5a21iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDMzNzg1NiwiZXhwIjoyMDY5OTEzODU2fQ.XeXm2_L1IBhytbQPpEnmUgygv22TOcu8SCWelHcW3Mk'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixExistingUser() {
  const userId = '95ca9cd7-ecbf-445f-a48b-643927d27ccf'
  const userEmail = 'creaty123456@gmail.com'
  const newPassword = 'TestPassword123!'
  
  console.log('🔧 Corrigindo usuário existente...')
  console.log('=' .repeat(60))

  try {
    // 1. Verificar usuário atual
    console.log('\n1️⃣ Verificando usuário atual...')
    
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId)

    if (userError) {
      console.log('❌ Erro ao consultar usuário:', userError.message)
      return
    }

    if (!userData || !userData.user) {
      console.log('❌ Usuário não encontrado')
      return
    }

    const user = userData.user
    console.log('✅ Usuário encontrado:')
    console.log('   📧 Email:', user.email)
    console.log('   📧 Email confirmado:', user.email_confirmed_at ? 'Sim' : 'Não')
    console.log('   🔒 Senha atual:', user.encrypted_password ? 'SIM' : 'NÃO')

    // 2. Definir nova senha
    console.log('\n2️⃣ Definindo nova senha...')
    
    const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(userId, {
      password: newPassword
    })

    if (updateError) {
      console.log('❌ Erro ao atualizar senha:', updateError.message)
      return
    }

    if (updateData && updateData.user) {
      console.log('✅ Senha atualizada com sucesso!')
      console.log('   🔐 Nova senha:', newPassword)
    }

    // 3. Verificar se a senha foi salva
    console.log('\n3️⃣ Verificando se a senha foi salva...')
    
    const { data: verifyData, error: verifyError } = await supabase.auth.admin.getUserById(userId)

    if (verifyError) {
      console.log('❌ Erro ao verificar usuário:', verifyError.message)
    } else if (verifyData && verifyData.user) {
      const updatedUser = verifyData.user
      const hasPassword = updatedUser.encrypted_password ? 'SIM' : 'NÃO'
      console.log(`   🔒 Senha criptografada: ${hasPassword}`)
      
      if (updatedUser.encrypted_password) {
        console.log('   🎉 SUCESSO! Senha foi salva!')
        console.log('   🔐 Hash da senha:', updatedUser.encrypted_password.substring(0, 50) + '...')
      } else {
        console.log('   ❌ PROBLEMA! Senha ainda não foi salva.')
      }
    }

    // 4. Testar login
    console.log('\n4️⃣ Testando login...')
    
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: userEmail,
      password: newPassword
    })

    if (loginError) {
      console.log('❌ Erro no login:', loginError.message)
    } else if (loginData.user) {
      console.log('✅ Login realizado com sucesso!')
      console.log('   🆔 User ID:', loginData.user.id)
      console.log('   🎉 PROBLEMA RESOLVIDO!')
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message)
  }
}

// Executar script
fixExistingUser()

