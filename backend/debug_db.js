require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const knownUserId = '5060d388-ecde-45a1-b9ab-44dd0ad26791'; // From previous debug

async function testHistoryQuery() {
    console.log(`Testing history for user: ${knownUserId}`);

    const { data: leadsHistory, error: leadsError } = await supabase
        .from('leads_usage_history')
        .select('*')
        .eq('user_id', knownUserId)
        .order('created_at', { ascending: false })
        .limit(50);

    if (leadsError) {
        console.error('Error fetching:', leadsError);
        return;
    }

    console.log(`Found ${leadsHistory.length} records.`);
    if (leadsHistory.length > 0) {
        console.log('Sample raw record:', leadsHistory[0]);

        // Test normalization logic matches adminRoutes.js
        const events = leadsHistory.map(item => ({
            id: item.id,
            type: item.leads_generated > 0 ? 'credit' : 'debit',
            source: 'leads',
            amount: Math.abs(item.leads_generated),
            description: item.operation_type === 'bonus' ? 'Bônus Adicionado' :
                item.operation_type === 'plan_renewal' ? 'Renovação de Plano' :
                    item.operation_type === 'manual_adjustment' ? 'Ajuste Manual' :
                        (item.operation_reason || 'Consumo de Leads'),
            date: item.created_at,
            meta: {
                reason: item.operation_reason,
                remaining: item.remaining_leads
            }
        }));
        console.log('Normalized events:', JSON.stringify(events, null, 2));
    }
}

testHistoryQuery();
