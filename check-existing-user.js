// ==============================================
// SCRIPT PARA VERIFICAR USUÁRIO EXISTENTE
// ==============================================

import { createClient } from '@supabase/supabase-js'

// Configuração do Supabase com Service Role Key
const supabaseUrl = 'https://lsvwjyhnnzeewuuuykmb.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzdndqeWhubnplZXd1dXV5a21iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDMzNzg1NiwiZXhwIjoyMDY5OTEzODU2fQ.XeXm2_L1IBhytbQPpEnmUgygv22TOcu8SCWelHcW3Mk'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkExistingUser() {
  const userId = '95ca9cd7-ecbf-445f-a48b-643927d27ccf'
  
  console.log('🔍 Verificando usuário existente...')
  console.log('=' .repeat(60))

  try {
    // 1. Consultar usuário específico
    console.log('\n1️⃣ Consultando usuário específico...')
    
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
    console.log('   🆔 ID:', user.id)
    console.log('   📅 Criado em:', user.created_at)
    console.log('   📧 Email confirmado:', user.email_confirmed_at ? 'Sim' : 'Não')
    console.log('   🔐 Último login:', user.last_sign_in_at || 'Nunca')

    // 2. Verificar senha
    console.log('\n2️⃣ Verificando senha...')
    
    if (user.encrypted_password) {
      console.log('   🔒 Senha criptografada: SIM')
      console.log('   🔐 Hash da senha:', user.encrypted_password.substring(0, 50) + '...')
      console.log('   ✅ Este usuário tem senha salva!')
    } else {
      console.log('   ❌ Senha criptografada: NÃO')
      console.log('   ⚠️  Este usuário NÃO tem senha salva!')
    }

    // 3. Verificar outros usuários
    console.log('\n3️⃣ Verificando outros usuários...')
    
    // Listar todos os usuários (limitado a 10)
    const { data: allUsers, error: allUsersError } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 10
    })

    if (allUsersError) {
      console.log('❌ Erro ao listar usuários:', allUsersError.message)
    } else if (allUsers && allUsers.users) {
      console.log(`   📊 Total de usuários encontrados: ${allUsers.users.length}`)
      
      let usersWithPassword = 0
      let usersWithoutPassword = 0
      
      allUsers.users.forEach((u, index) => {
        const hasPassword = u.encrypted_password ? 'SIM' : 'NÃO'
        if (u.encrypted_password) usersWithPassword++
        else usersWithoutPassword++
        
        console.log(`   ${index + 1}. ${u.email} - Senha: ${hasPassword}`)
      })
      
      console.log(`\n   📈 Estatísticas:`)
      console.log(`   ✅ Usuários com senha: ${usersWithPassword}`)
      console.log(`   ❌ Usuários sem senha: ${usersWithoutPassword}`)
    }

    // 4. Diagnóstico
    console.log('\n4️⃣ Diagnóstico do problema:')
    
    if (user.encrypted_password) {
      console.log('   ✅ Este usuário específico tem senha salva')
      console.log('   🔍 O problema pode ser específico deste usuário')
    } else {
      console.log('   ❌ Este usuário não tem senha salva')
      console.log('   🔍 Possíveis causas:')
      console.log('      1. Email confirmations desabilitados no Supabase')
      console.log('      2. SMTP não configurado')
      console.log('      3. Usuário criado via OAuth (Google, etc.)')
      console.log('      4. Bug no sistema de criação de usuários')
    }

    // 5. Próximos passos
    console.log('\n5️⃣ Próximos passos:')
    console.log('   1. Configure SMTP no Supabase Dashboard')
    console.log('   2. Habilite email confirmations')
    console.log('   3. Teste criando uma nova conta')
    console.log('   4. Execute este script novamente para verificar')

  } catch (error) {
    console.error('❌ Erro geral:', error.message)
  }
}

// Executar script
checkExistingUser()

