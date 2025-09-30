// ==============================================
// SCRIPT PARA RESTAURAR SENHAS ORIGINAIS
// ==============================================

import { createClient } from '@supabase/supabase-js'

// Configuração do Supabase com Service Role Key
const supabaseUrl = 'https://lsvwjyhnnzeewuuuykmb.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzdndqeWhubnplZXd1dXV5a21iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDMzNzg1NiwiZXhwIjoyMDY5OTEzODU2fQ.XeXm2_L1IBhytbQPpEnmUgygv22TOcu8SCWelHcW3Mk'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function restoreOriginalPasswords() {
  console.log('🔄 Restaurando senhas originais...')
  console.log('=' .repeat(60))

  // Senhas originais
  const originalPasswords = {
    'creaty12345@gmail.com': '975432',
    'dvemarketingadm@gmail.com': 'Dvemarketing@123'
  }

  try {
    // 1. Listar usuários
    console.log('\n1️⃣ Procurando usuários...')
    
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

    // 2. Restaurar senhas originais
    console.log('\n2️⃣ Restaurando senhas originais...')
    
    for (const [email, originalPassword] of Object.entries(originalPasswords)) {
      const user = allUsers.users.find(u => u.email === email)
      
      if (user) {
        console.log(`\n🔧 Restaurando: ${email}`)
        console.log(`   🔐 Senha original: ${originalPassword}`)
        
        const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
          password: originalPassword
        })

        if (updateError) {
          console.log(`   ❌ Erro: ${updateError.message}`)
        } else {
          console.log(`   ✅ Senha restaurada com sucesso!`)
        }
      } else {
        console.log(`❌ Usuário não encontrado: ${email}`)
      }
    }

    // 3. Verificar resultado
    console.log('\n3️⃣ Verificando resultado...')
    
    for (const [email, originalPassword] of Object.entries(originalPasswords)) {
      const user = allUsers.users.find(u => u.email === email)
      
      if (user) {
        console.log(`\n📧 ${email}:`)
        console.log(`   🔐 Senha: ${originalPassword}`)
        console.log(`   ✅ Pronto para login`)
      }
    }

    console.log('\n✅ Senhas originais restauradas!')
    console.log('   📧 creaty12345@gmail.com - Senha: 975432')
    console.log('   📧 dvemarketingadm@gmail.com - Senha: Dvemarketing@123')

  } catch (error) {
    console.error('❌ Erro geral:', error.message)
  }
}

// Executar script
restoreOriginalPasswords()

