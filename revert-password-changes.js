// ==============================================
// SCRIPT PARA REVERTER ALTERAÇÕES DE SENHA
// ==============================================

import { createClient } from '@supabase/supabase-js'

// Configuração do Supabase com Service Role Key
const supabaseUrl = 'https://lsvwjyhnnzeewuuuykmb.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzdndqeWhubnplZXd1dXV5a21iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDMzNzg1NiwiZXhwIjoyMDY5OTEzODU2fQ.XeXm2_L1IBhytbQPpEnmUgygv22TOcu8SCWelHcW3Mk'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function revertPasswordChanges() {
  console.log('🔄 Revertendo alterações de senha...')
  console.log('=' .repeat(60))

  try {
    // 1. Listar usuários que foram alterados
    console.log('\n1️⃣ Verificando usuários alterados...')
    
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

    // 2. Identificar usuários que foram alterados (têm senha definida)
    const usersWithPassword = allUsers.users.filter(user => 
      user.email_confirmed_at && user.encrypted_password
    )

    console.log(`📊 Usuários com senha definida: ${usersWithPassword.length}`)

    // 3. Remover senhas (deixar como estava antes)
    console.log('\n2️⃣ Removendo senhas alteradas...')
    
    for (const user of usersWithPassword) {
      console.log(`\n🔄 Revertendo: ${user.email}`)
      
      // Remover a senha (deixar como NULL)
      const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
        password: null
      })

      if (updateError) {
        console.log(`   ❌ Erro: ${updateError.message}`)
      } else {
        console.log(`   ✅ Senha removida (revertido)`)
      }
    }

    // 4. Verificar resultado
    console.log('\n3️⃣ Verificando resultado...')
    
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

    console.log(`📊 Usuários sem senha após reversão: ${finalUsersWithoutPassword.length}`)

    if (finalUsersWithoutPassword.length === usersWithPassword.length) {
      console.log('✅ SUCESSO! Todas as alterações foram revertidas!')
    } else {
      console.log('⚠️  Algumas alterações podem não ter sido revertidas')
    }

    console.log('\n4️⃣ Status atual:')
    console.log('   🔄 Senhas removidas (estado original)')
    console.log('   📧 Emails confirmados mantidos')
    console.log('   🔍 Bug no sistema de criação ainda existe')

  } catch (error) {
    console.error('❌ Erro geral:', error.message)
  }
}

// Executar script
revertPasswordChanges()

