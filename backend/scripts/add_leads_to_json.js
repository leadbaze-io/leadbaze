require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function addLeadsTojson() {
    const listName = 'REstaurante Italiano Contagem';
    const userId = 'f20ceb6a-0e59-477c-9a85-afc39ea90afe';

    console.log(`Buscando lista "${listName}" para o usuário ${userId}...`);

    // 1. Buscar lista atual por nome e usuário
    const { data: list, error: fetchError } = await supabase
        .from('lead_lists')
        .select('*')
        .eq('user_id', userId)
        .ilike('name', '%Italiano%')
        .maybeSingle();

    if (fetchError) {
        console.error('Erro ao buscar lista:', fetchError);
        return;
    }

    if (!list) {
        console.error('❌ Lista não encontrada!');
        return;
    }

    console.log(`Lista encontrada: "${list.name}". Total atual: ${list.leads ? list.leads.length : 0}`);

    // 2. Preparar novos leads
    const newLeads = [
        {
            id: `manual_${Date.now()}_1`,
            name: 'Jean',
            phone: '31 983323121',
            original_phone: '31 983323121',
            address: 'Adicionado Manualmente',
            business_type: 'Manual',
            rating: 5.0,
            reviews_count: 1,
            manual: true,
            created_at: new Date().toISOString()
        },
        {
            id: `manual_${Date.now()}_2`,
            name: 'Moura',
            phone: '31 9976-6846',
            original_phone: '31 9976-6846',
            address: 'Adicionado Manualmente',
            business_type: 'Manual',
            rating: 5.0,
            reviews_count: 1,
            manual: true,
            created_at: new Date().toISOString()
        }
    ];

    // 3. Combinar e atualizar
    const updatedLeads = [...(list.leads || []), ...newLeads];
    const totalLeads = updatedLeads.length;

    const { data: updated, error: updateError } = await supabase
        .from('lead_lists')
        .update({
            leads: updatedLeads,
            total_leads: totalLeads,
            updated_at: new Date().toISOString()
        })
        .eq('id', list.id)
        .select();

    if (updateError) {
        console.error('Erro ao atualizar lista:', updateError);
    } else {
        console.log(`\n✅ Sucesso! Leads adicionados.`);
        console.log(`Novo total: ${totalLeads}`);
        console.log(`Leads adicionados:`);
        newLeads.forEach(l => console.log(`- ${l.name} (${l.phone})`));
    }
}

addLeadsTojson();
