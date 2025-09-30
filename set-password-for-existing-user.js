// ==============================================
// SCRIPT PARA DEFINIR SENHA PARA USUÁRIO EXISTENTE
// Email: creaty123456@gmail.com
// ==============================================

import { createClient } from '@supabase/supabase-js'

// Configuração do Supabase
const supabaseUrl = 'https://your-project.supabase.co' // Substitua pela sua URL
const supabaseKey = 'your-service-role-key' // Use a service role key para admin operations

const supabase = createClient(supabaseUrl, supabaseKey)

async function setPasswordForUser() {
  const userEmail = 'creaty123456@gmail.com'
  const newPassword = '123456' // Senha temporária - o usuário pode alterar depois
  
  console.log('🔐 Definindo senha para o usuário:', userEmail)
  console.log('=' .repeat(60))

  try {
    // 1. Buscar o usuário
    console.log('\n1️⃣ Buscando usuário...')
    const { data: users, error: searchError } = await supabase.auth.admin.listUsers()
    
    if (searchError) {
      console.log('❌ Erro ao buscar usuários:', searchError.message)
      return
    }

    const user = users.users.find(u => u.email === userEmail)
    
    if (!user) {
      console.log('❌ Usuário não encontrado')
      return
    }

    console.log('✅ Usuário encontrado:', user.id)

    // 2. Atualizar a senha do usuário
    console.log('\n2️⃣ Atualizando senha...')
    const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { password: newPassword }
    )

    if (updateError) {
      console.log('❌ Erro ao atualizar senha:', updateError.message)
      return
    }

    console.log('✅ Senha atualizada com sucesso!')
    console.log('📧 Email:', updateData.user.email)
    console.log('🔐 Nova senha:', newPassword)
    console.log('\n💡 O usuário pode fazer login com:')
    console.log('   Email:', userEmail)
    console.log('   Senha:', newPassword)

  } catch (error) {
    console.error('❌ Erro geral:', error.message)
  }
}

// Executar script
setPasswordForUser()
