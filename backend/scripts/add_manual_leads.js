require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Erro: Variáveis de ambiente SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não encontradas.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function addManualLeads() {
    const userId = 'f20ceb6a-0e59-477c-9a85-afc39ea90afe';
    const listName = 'Leads Manuais - Suporte';

    const manualLeads = [
        { name: 'Jean', phone: '31 983323121', originalPhone: '31 983323121' },
        { name: 'Moura', phone: '31 9976-6846', originalPhone: '31 9976-6846' }
    ];

    console.log(`🚀 Iniciando adição de leads para o usuário: ${userId}`);

    try {
        // 1. Verificar se o usuário existe
        const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);

        if (userError || !userData.user) {
            console.error('❌ Usuário não encontrado:', userError ? userError.message : 'ID inválido');
            return;
        }
        console.log(`✅ Usuário confirmado: ${userData.user.email}`);

        // 2. Criar ou obter a lista
        let listId;

        // Verificar se a lista já existe
        const { data: existingLists } = await supabase
            .from('lead_lists')
            .select('id')
            .eq('user_id', userId)
            .eq('name', listName)
            .single();

        if (existingLists) {
            listId = existingLists.id;
            console.log(`ℹ️ Usando lista existente: "${listName}" (ID: ${listId})`);
        } else {
            // Criar nova lista
            const { data: newList, error: createError } = await supabase
                .from('lead_lists')
                .insert({
                    user_id: userId,
                    name: listName,
                    description: 'Leads adicionados manualmente pelo suporte',

                })
                .select()
                .single();

            if (createError) {
                throw new Error(`Erro ao criar lista: ${createError.message}`);
            }
            listId = newList.id;
            console.log(`✅ Nova lista criada: "${listName}" (ID: ${listId})`);
        }

        // 3. Adicionar leads
        user_id: userId,
            list_id: listId,
                name: lead.name,
                    phone: lead.phone

        const { data: insertedLeads, error: insertError } = await supabase
            .from('leads')
            .insert(leadsToAdd)
            .select();

        if (insertError) {
            console.error('Detalhe do erro:', insertError);
            throw new Error(`Erro ao inserir leads: ${insertError ? insertError.message : 'Erro desconhecido'}`);
        }

        console.log('\n🎉 SUCESSO! Leads adicionados:');
        insertedLeads.forEach(lead => {
            console.log(`- ${lead.name} (${lead.phone})`);
        });

    } catch (error) {
        console.error('❌ Erro inesperado:', error.message);
    }
}

addManualLeads();
