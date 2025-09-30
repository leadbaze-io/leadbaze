// ==============================================
// SCRIPT PARA CORRIGIR TODOS OS USUÁRIOS
// ==============================================

import { createClient } from '@supabase/supabase-js'

// Configuração do Supabase com Service Role Key
const supabaseUrl = 'https://lsvwjyhnnzeewuuuykmb.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzdndqeWhubnplZXd1dXV5a21iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDMzNzg1NiwiZXhwIjoyMDY5OTEzODU2fQ.XeXm2_L1IBhytbQPpEnmUgygv22TOcu8SCWelHcW3Mk'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixAllUsers() {
  console.log('🔧 Corrigindo todos os usuários...')
  console.log('=' .repeat(60))

  try {
    // 1. Listar todos os usuários
    console.log('\n1️⃣ Listando todos os usuários...')
    
    const { data: allUsers, error: allUsersError } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 50
    })

    if (allUsersError) {
      console.log('❌ Erro ao listar usuários:', allUsersError.message)
      return
    }

    if (!allUsers || !allUsers.users) {
      console.log('❌ Nenhum usuário encontrado')
      return
    }

    console.log(`📊 Total de usuários: ${allUsers.users.length}`)

    // 2. Identificar usuários sem senha
    const usersWithoutPassword = allUsers.users.filter(user => 
      user.email_confirmed_at && !user.encrypted_password
    )

    console.log(`\n2️⃣ Usuários sem senha: ${usersWithoutPassword.length}`)

    if (usersWithoutPassword.length === 0) {
      console.log('✅ Todos os usuários têm senha!')
      return
    }

    // 3. Corrigir cada usuário
    console.log('\n3️⃣ Corrigindo usuários...')
    
    for (const user of usersWithoutPassword) {
      console.log(`\n🔧 Corrigindo: ${user.email}`)
      
      const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
        password: 'TestPassword123!'
      })

      if (updateError) {
        console.log(`   ❌ Erro: ${updateError.message}`)
      } else {
        console.log(`   ✅ Senha definida: TestPassword123!`)
      }
    }

    // 4. Verificar resultado
    console.log('\n4️⃣ Verificando resultado...')
    
    const { data: finalUsers, error: finalError } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 50
    })

    if (finalError) {
      console.log('❌ Erro ao verificar usuários:', finalError.message)
      return
    }

    const finalUsersWithoutPassword = finalUsers.users.filter(user => 
      user.email_confirmed_at && !user.encrypted_password
    )

    console.log(`📊 Usuários sem senha após correção: ${finalUsersWithoutPassword.length}`)

    if (finalUsersWithoutPassword.length === 0) {
      console.log('🎉 SUCESSO! Todos os usuários foram corrigidos!')
    } else {
      console.log('⚠️  Alguns usuários ainda precisam de correção')
    }

    // 5. Listar credenciais
    console.log('\n5️⃣ Credenciais para login:')
    console.log('   📧 Email: [email do usuário]')
    console.log('   🔐 Senha: TestPassword123!')
    console.log('\n   Usuários corrigidos:')
    usersWithoutPassword.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email}`)
    })

  } catch (error) {
    console.error('❌ Erro geral:', error.message)
  }
}

// Executar script
fixAllUsers()

