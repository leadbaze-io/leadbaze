// =====================================================
// SCRIPT NODE.JS PARA COPIAR LISTA DE LEADS ENTRE USUÁRIOS
// =====================================================
// Este script copia a lista "Teste Disparo" do usuário creaty12345@gmail.com
// para o usuário dvemarketingadm@gmail.com

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Chave de serviço para bypass RLS

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente não encontradas!');
  console.error('Certifique-se de que REACT_APP_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY estão definidas no .env');
  process.exit(1);
}

// Criar cliente Supabase com chave de serviço
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function copyLeadList() {
  try {
    console.log('🚀 Iniciando cópia da lista de leads...\n');

    // =====================================================
    // 1. VERIFICAR USUÁRIOS
    // =====================================================
    console.log('📋 Verificando usuários...');
    
    const { data: users, error: usersError } = await supabase
      .from('auth.users')
      .select('id, email, created_at')
      .in('email', ['creaty12345@gmail.com', 'dvemarketingadm@gmail.com']);

    if (usersError) {
      console.error('❌ Erro ao buscar usuários:', usersError);
      return;
    }

    if (users.length !== 2) {
      console.error('❌ Não foram encontrados os dois usuários necessários');
      console.log('Usuários encontrados:', users.map(u => u.email));
      return;
    }

    const sourceUser = users.find(u => u.email === 'creaty12345@gmail.com');
    const targetUser = users.find(u => u.email === 'dvemarketingadm@gmail.com');

    console.log('✅ Usuários encontrados:');
    console.log(`   - Origem: ${sourceUser.email} (ID: ${sourceUser.id})`);
    console.log(`   - Destino: ${targetUser.email} (ID: ${targetUser.id})\n`);

    // =====================================================
    // 2. BUSCAR LISTA ORIGINAL
    // =====================================================
    console.log('🔍 Buscando lista "Teste Disparo"...');
    
    const { data: originalList, error: listError } = await supabase
      .from('lead_lists')
      .select('*')
      .eq('user_id', sourceUser.id)
      .eq('name', 'Teste Disparo')
      .single();

    if (listError) {
      console.error('❌ Erro ao buscar lista original:', listError);
      return;
    }

    if (!originalList) {
      console.error('❌ Lista "Teste Disparo" não encontrada para o usuário creaty12345@gmail.com');
      return;
    }

    console.log('✅ Lista original encontrada:');
    console.log(`   - Nome: ${originalList.name}`);
    console.log(`   - Total de leads: ${originalList.total_leads}`);
    console.log(`   - Status: ${originalList.status}`);
    console.log(`   - Criada em: ${originalList.created_at}\n`);

    // =====================================================
    // 3. VERIFICAR SE JÁ EXISTE CÓPIA
    // =====================================================
    console.log('🔍 Verificando se já existe cópia...');
    
    const { data: existingCopy, error: copyCheckError } = await supabase
      .from('lead_lists')
      .select('id, name')
      .eq('user_id', targetUser.id)
      .like('name', '%Teste Disparo%');

    if (copyCheckError) {
      console.error('❌ Erro ao verificar cópias existentes:', copyCheckError);
      return;
    }

    if (existingCopy && existingCopy.length > 0) {
      console.log('⚠️  Já existem listas com nome similar:');
      existingCopy.forEach(list => {
        console.log(`   - ${list.name} (ID: ${list.id})`);
      });
      console.log('');
    }

    // =====================================================
    // 4. CRIAR CÓPIA DA LISTA
    // =====================================================
    console.log('📋 Criando cópia da lista...');
    
    const newListData = {
      user_id: targetUser.id,
      name: `${originalList.name} (Cópia)`,
      description: `${originalList.description || ''} - Cópia da lista original de ${sourceUser.email}`,
      leads: originalList.leads,
      total_leads: originalList.total_leads,
      tags: originalList.tags,
      status: originalList.status,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: newList, error: insertError } = await supabase
      .from('lead_lists')
      .insert([newListData])
      .select()
      .single();

    if (insertError) {
      console.error('❌ Erro ao criar cópia da lista:', insertError);
      return;
    }

    console.log('✅ Lista copiada com sucesso!');
    console.log(`   - Novo ID: ${newList.id}`);
    console.log(`   - Nome: ${newList.name}`);
    console.log(`   - Total de leads: ${newList.total_leads}\n`);

    // =====================================================
    // 5. VERIFICAÇÃO FINAL
    // =====================================================
    console.log('🔍 Verificação final...');
    
    const { data: finalCheck, error: finalError } = await supabase
      .from('lead_lists')
      .select(`
        id,
        name,
        total_leads,
        status,
        created_at,
        user:auth.users(email)
      `)
      .eq('id', newList.id)
      .single();

    if (finalError) {
      console.error('❌ Erro na verificação final:', finalError);
      return;
    }

    console.log('✅ Verificação final concluída:');
    console.log(`   - Lista: ${finalCheck.name}`);
    console.log(`   - Proprietário: ${finalCheck.user.email}`);
    console.log(`   - Leads: ${finalCheck.total_leads}`);
    console.log(`   - Status: ${finalCheck.status}`);
    console.log(`   - Criada em: ${finalCheck.created_at}\n`);

    // =====================================================
    // 6. RESUMO FINAL
    // =====================================================
    console.log('📊 RESUMO FINAL:');
    console.log('================');
    console.log(`✅ Lista "Teste Disparo" copiada com sucesso!`);
    console.log(`📤 De: ${sourceUser.email}`);
    console.log(`📥 Para: ${targetUser.email}`);
    console.log(`📋 Nome da cópia: ${newList.name}`);
    console.log(`🔢 Total de leads: ${newList.total_leads}`);
    console.log(`🆔 ID da nova lista: ${newList.id}\n`);

    console.log('🎉 Cópia concluída com sucesso!');

  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }
}

// Executar o script
copyLeadList();











