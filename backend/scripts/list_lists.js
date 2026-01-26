require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function listLists() {
    const { data, error } = await supabase
        .from('lead_lists')
        .select('*')
        .eq('user_id', 'f20ceb6a-0e59-477c-9a85-afc39ea90afe')
        .order('created_at', { ascending: false });

    if (error) console.error(error);
    else console.log(JSON.stringify(data, null, 2));
}

listLists();
