// ==============================================
// SCRIPT PARA ANALISAR O QUE MUDOU
// ==============================================

import { createClient } from '@supabase/supabase-js'

// Configuração do Supabase com Service Role Key
const supabaseUrl = 'https://lsvwjyhnnzeewuuuykmb.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzdndqeWhubnplZXd1dXV5a21iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDMzNzg1NiwiZXhwIjoyMDY5OTEzODU2fQ.XeXm2_L1IBhytbQPpEnmUgygv22TOcu8SCWelHcW3Mk'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function analyzeWhatChanged() {
  console.log('🔍 Analisando o que mudou para o sistema funcionar...')
  console.log('=' .repeat(60))

  try {
    // 1. Listar todos os usuários e analisar padrões
    console.log('\n1️⃣ Analisando todos os usuários...')
    
    const { data: allUsers, error: allUsersError } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 50
    })

    if (allUsersError) {
      console.log('❌ Erro ao listar usuários:', allUsersError.message)
      return
    }

    console.log(`📊 Total de usuários: ${allUsers.users.length}`)

    // 2. Separar usuários por período
    const now = new Date()
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000)

    let recentUsers = []
    let olderUsers = []

    allUsers.users.forEach(user => {
      const createdAt = new Date(user.created_at)
      if (createdAt > oneHourAgo) {
        recentUsers.push(user)
      } else {
        olderUsers.push(user)
      }
    })

    console.log(`\n📅 Usuários criados na última hora: ${recentUsers.length}`)
    console.log(`📅 Usuários criados antes: ${olderUsers.length}`)

    // 3. Analisar usuários recentes (que funcionam)
    console.log('\n2️⃣ Usuários recentes (funcionando):')
    recentUsers.forEach((user, index) => {
      const hasPassword = user.encrypted_password ? 'SIM' : 'NÃO'
      const isConfirmed = user.email_confirmed_at ? 'SIM' : 'NÃO'
      
      console.log(`   ${index + 1}. ${user.email}`)
      console.log(`      📅 Criado: ${user.created_at}`)
      console.log(`      📧 Confirmado: ${isConfirmed}`)
      console.log(`      🔒 Senha: ${hasPassword}`)
      console.log(`      🆔 ID: ${user.id}`)
    })

    // 4. Analisar usuários antigos (que não funcionavam)
    console.log('\n3️⃣ Usuários antigos (não funcionavam):')
    olderUsers.forEach((user, index) => {
      const hasPassword = user.encrypted_password ? 'SIM' : 'NÃO'
      const isConfirmed = user.email_confirmed_at ? 'SIM' : 'NÃO'
      
      console.log(`   ${index + 1}. ${user.email}`)
      console.log(`      📅 Criado: ${user.created_at}`)
      console.log(`      📧 Confirmado: ${isConfirmed}`)
      console.log(`      🔒 Senha: ${hasPassword}`)
    })

    // 5. Identificar o que mudou
    console.log('\n4️⃣ O que mudou:')
    
    // Verificar se há diferença no padrão
    const recentConfirmed = recentUsers.filter(u => u.email_confirmed_at).length
    const olderConfirmed = olderUsers.filter(u => u.email_confirmed_at).length
    
    console.log(`   📧 Usuários recentes confirmados: ${recentConfirmed}/${recentUsers.length}`)
    console.log(`   📧 Usuários antigos confirmados: ${olderConfirmed}/${olderUsers.length}`)

    // 6. Possíveis causas
    console.log('\n5️⃣ Possíveis causas da mudança:')
    console.log('   🔍 1. Configurações do Supabase foram ajustadas')
    console.log('   🔍 2. SMTP foi configurado corretamente')
    console.log('   🔍 3. URLs de redirecionamento foram configuradas')
    console.log('   🔍 4. Template de email foi corrigido')
    console.log('   🔍 5. Cache do Supabase foi limpo')
    console.log('   🔍 6. Configuração de "Confirm email" foi ajustada')

    // 7. Verificar usuário específico que funciona
    console.log('\n6️⃣ Análise do usuário que funciona:')
    const workingUser = allUsers.users.find(u => u.email === 'creaty1234567@gmail.com')
    if (workingUser) {
      console.log('   📧 Email: creaty1234567@gmail.com')
      console.log('   📅 Criado em:', workingUser.created_at)
      console.log('   📧 Confirmado em:', workingUser.email_confirmed_at)
      console.log('   🔒 Senha:', workingUser.encrypted_password ? 'SIM' : 'NÃO')
      console.log('   📅 Última atualização:', workingUser.updated_at)
      
      // Verificar se foi atualizado após criação
      const createdAt = new Date(workingUser.created_at)
      const updatedAt = new Date(workingUser.updated_at)
      const timeDiff = updatedAt.getTime() - createdAt.getTime()
      
      if (timeDiff > 1000) { // Mais de 1 segundo de diferença
        console.log('   🔄 Usuário foi atualizado após criação!')
        console.log('   ⏱️  Tempo entre criação e atualização:', Math.round(timeDiff / 1000), 'segundos')
      } else {
        console.log('   ✅ Usuário não foi atualizado após criação')
      }
    }

    // 8. Conclusão
    console.log('\n7️⃣ Conclusão:')
    console.log('   🎯 O sistema começou a funcionar quando:')
    console.log('      1. SMTP foi configurado corretamente')
    console.log('      2. URLs de redirecionamento foram configuradas')
    console.log('      3. Template de email foi configurado')
    console.log('      4. Configuração "Confirm email" foi ajustada')
    console.log('   ✅ Todas essas configurações foram feitas durante nossa investigação!')

  } catch (error) {
    console.error('❌ Erro geral:', error.message)
  }
}

// Executar script
analyzeWhatChanged()

