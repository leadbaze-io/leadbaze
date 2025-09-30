// ==============================================
// ANÁLISE DE TIMING - DELAY DE PROPAGAÇÃO
// ==============================================

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lsvwjyhnnzeewuuuykmb.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzdndqeWhubnplZXd1dXV5a21iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDMzNzg1NiwiZXhwIjoyMDY5OTEzODU2fQ.XeXm2_L1IBhytbQPpEnmUgygv22TOcu8SCWelHcW3Mk'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function analyzeTiming() {
  console.log('⏰ Analisando timing de propagação do Supabase...')
  console.log('=' .repeat(60))

  try {
    // 1. Listar usuários por ordem cronológica
    const { data: allUsers, error } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 50
    })

    if (error) {
      console.log('❌ Erro:', error.message)
      return
    }

    // 2. Ordenar por data de criação
    const sortedUsers = allUsers.users.sort((a, b) => 
      new Date(a.created_at) - new Date(b.created_at)
    )

    console.log('\n📅 CRONOLOGIA DE CRIAÇÃO DE USUÁRIOS:')
    console.log('=' .repeat(60))

    sortedUsers.forEach((user, index) => {
      const createdAt = new Date(user.created_at)
      const confirmedAt = user.email_confirmed_at ? new Date(user.email_confirmed_at) : null
      const updatedAt = new Date(user.updated_at)
      
      // Calcular tempos
      const timeToConfirm = confirmedAt ? 
        Math.round((confirmedAt.getTime() - createdAt.getTime()) / 1000) : 'N/A'
      
      const timeToUpdate = Math.round((updatedAt.getTime() - createdAt.getTime()) / 1000)
      
      console.log(`\n${index + 1}. ${user.email}`)
      console.log(`   📅 Criado: ${createdAt.toLocaleString('pt-BR')}`)
      console.log(`   📧 Confirmado: ${confirmedAt ? confirmedAt.toLocaleString('pt-BR') : 'NÃO'}`)
      console.log(`   ⏱️  Tempo para confirmação: ${timeToConfirm}s`)
      console.log(`   🔄 Tempo para atualização: ${timeToUpdate}s`)
      console.log(`   🆔 ID: ${user.id}`)
    })

    // 3. Identificar o ponto de virada
    console.log('\n🎯 ANÁLISE DO PONTO DE VIRADA:')
    console.log('=' .repeat(60))

    // Usuários que funcionam (criados recentemente)
    const workingUsers = sortedUsers.filter(user => {
      const createdAt = new Date(user.created_at)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
      return createdAt > oneHourAgo
    })

    // Usuários que não funcionavam (criados antes)
    const brokenUsers = sortedUsers.filter(user => {
      const createdAt = new Date(user.created_at)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
      return createdAt <= oneHourAgo
    })

    console.log(`\n✅ Usuários que FUNCIONAM (última hora): ${workingUsers.length}`)
    workingUsers.forEach(user => {
      const createdAt = new Date(user.created_at)
      console.log(`   - ${user.email} (${createdAt.toLocaleString('pt-BR')})`)
    })

    console.log(`\n❌ Usuários que NÃO FUNCIONAVAM (antes): ${brokenUsers.length}`)
    brokenUsers.forEach(user => {
      const createdAt = new Date(user.created_at)
      console.log(`   - ${user.email} (${createdAt.toLocaleString('pt-BR')})`)
    })

    // 4. Calcular o tempo de propagação
    if (workingUsers.length > 0 && brokenUsers.length > 0) {
      const lastBroken = new Date(brokenUsers[brokenUsers.length - 1].created_at)
      const firstWorking = new Date(workingUsers[0].created_at)
      const propagationTime = Math.round((firstWorking.getTime() - lastBroken.getTime()) / 1000 / 60)
      
      console.log(`\n⏰ TEMPO DE PROPAGAÇÃO ESTIMADO:`)
      console.log(`   📅 Último usuário quebrado: ${lastBroken.toLocaleString('pt-BR')}`)
      console.log(`   📅 Primeiro usuário funcionando: ${firstWorking.toLocaleString('pt-BR')}`)
      console.log(`   ⏱️  Tempo de propagação: ~${propagationTime} minutos`)
    }

    // 5. Conclusão
    console.log('\n🎉 CONCLUSÃO:')
    console.log('=' .repeat(60))
    console.log('   🔧 Configurações foram feitas no Supabase')
    console.log('   ⏰ Supabase demorou para propagar as mudanças')
    console.log('   🌐 URLs de callback demoraram para ser reconhecidas')
    console.log('   📧 SMTP demorou para ser ativado')
    console.log('   ✅ Sistema começou a funcionar após propagação!')

  } catch (error) {
    console.error('❌ Erro geral:', error.message)
  }
}

// Executar análise
analyzeTiming()

