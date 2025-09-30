// ==============================================
// SCRIPT PARA TESTAR SENHAS DO USUÁRIO
// ==============================================

import { createClient } from '@supabase/supabase-js'

// Configuração do Supabase
const supabaseUrl = 'https://lsvwjyhnnzeewuuuykmb.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzdndqeWhubnplZXd1dXV5a21iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMzc4NTYsImV4cCI6MjA2OTkxMzg1Nn0.jNw-YTXlnbd51l7RHHQpTYgCqxERz6NqPggqMM41Fck'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testUserPassword() {
  const userEmail = 'creaty123456@gmail.com'
  
  console.log('🔐 Testando senhas para o usuário:', userEmail)
  console.log('=' .repeat(60))

  // Lista de senhas comuns para testar
  const commonPasswords = [
    '123456',
    '123456789',
    'password',
    'senha123',
    'creaty123',
    'creaty123456',
    'admin123',
    'test123',
    'leadbaze123',
    'leadflow123',
    '12345678',
    'qwerty',
    'abc123',
    'password123',
    'senha',
    '123',
    '1234',
    '12345',
    '1234567',
    '1234567890'
  ]

  console.log(`\n🧪 Testando ${commonPasswords.length} senhas comuns...`)
  console.log('⏳ Isso pode levar alguns segundos...\n')

  let foundPassword = null
  let attempts = 0

  for (const password of commonPasswords) {
    attempts++
    process.stdout.write(`\r🔄 Tentativa ${attempts}/${commonPasswords.length}: ${password}...`)
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: password
      })

      if (data.user && !error) {
        foundPassword = password
        console.log(`\n\n✅ SENHA ENCONTRADA!`)
        console.log(`   📧 Email: ${userEmail}`)
        console.log(`   🔐 Senha: ${password}`)
        console.log(`   🆔 User ID: ${data.user.id}`)
        break
      }
    } catch (err) {
      // Ignorar erros de senha incorreta
    }
    
    // Pequena pausa para não sobrecarregar o servidor
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  if (!foundPassword) {
    console.log(`\n\n❌ Nenhuma das senhas testadas funcionou.`)
    console.log(`\n🔍 Possíveis causas:`)
    console.log(`   1. A senha não está na lista de senhas comuns`)
    console.log(`   2. O usuário foi criado com uma senha personalizada`)
    console.log(`   3. Há um problema no sistema de autenticação`)
    console.log(`   4. O usuário pode ter sido criado via OAuth (Google, etc.)`)
    
    console.log(`\n💡 Próximos passos:`)
    console.log(`   1. Verifique se você lembra da senha que definiu`)
    console.log(`   2. Teste manualmente no frontend`)
    console.log(`   3. Use o reset de senha se necessário`)
    console.log(`   4. Verifique os logs do Supabase para erros`)
  }

  console.log(`\n📊 Resumo:`)
  console.log(`   🧪 Senhas testadas: ${attempts}`)
  console.log(`   ✅ Senha encontrada: ${foundPassword ? 'Sim' : 'Não'}`)
  if (foundPassword) {
    console.log(`   🔐 Senha atual: ${foundPassword}`)
  }
}

// Executar script
testUserPassword()

