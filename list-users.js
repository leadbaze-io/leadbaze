// Script para listar usuários e encontrar o ID correto
import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://lsvwjyhnnzeewuuuykmb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzdndqeWhubnplZXd1dXV5a21iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDMzNzg1NiwiZXhwIjoyMDY5OTEzODU2fQ.XeXm2_L1IBhytbQPpEnmUgygv22TOcu8SCWelHcW3Mk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function listUsers() {
  console.log('👥 Listando usuários...\n');

  try {
    // Listar usuários da tabela user_profiles (que tem referência para auth.users)
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('user_id, full_name, email')
      .order('created_at', { ascending: false })
      .limit(10);

    if (profilesError) {
      console.error('❌ Erro ao buscar perfis:', profilesError);
      return;
    }

    console.log(`✅ Encontrados ${profiles.length} perfis de usuário:`);
    profiles.forEach((profile, index) => {
      console.log(`   ${index + 1}. ${profile.full_name || 'Nome não informado'} (${profile.email})`);
      console.log(`      ID: ${profile.user_id}`);
      console.log('');
    });

    // Verificar se creaty1234567@gmail.com está na lista
    const creatyProfile = profiles.find(p => p.email === 'creaty1234567@gmail.com');
    if (creatyProfile) {
      console.log('🎯 Usuário creaty1234567@gmail.com encontrado!');
      console.log(`   ID correto: ${creatyProfile.user_id}`);
    } else {
      console.log('⚠️ Usuário creaty1234567@gmail.com não encontrado nos perfis.');
      console.log('💡 Você pode usar qualquer um dos IDs listados acima para teste.');
    }

  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }
}

// Executar listagem
listUsers();









