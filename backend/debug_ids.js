require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkIds() {
    console.log('--- Checking ID Relations ---');

    // 1. Get a record from leads_usage_history
    const { data: history, error: historyError } = await supabase
        .from('leads_usage_history')
        .select('*')
        .limit(1)
        .single();

    if (historyError) {
        console.log('No history found or error:', historyError);
        return;
    }

    const historyUserId = history.user_id; // This is the ID we are querying by
    console.log(`History Record ID: ${history.id}`);
    console.log(`History User_ID: ${historyUserId}`);

    // 2. Check if this ID exists in user_profiles as 'id' (Profile ID)
    const { data: profileById, error: errorById } = await supabase
        .from('user_profiles')
        .select('id, user_id, full_name, email')
        .eq('id', historyUserId)
        .maybeSingle();

    if (profileById) {
        console.log('MATCH FOUND: history.user_id matches match user_profiles.id (Profile ID)');
        console.log('Profile:', profileById);
    } else {
        console.log('NO MATCH: history.user_id does NOT match user_profiles.id');
    }

    // 3. Check if this ID exists in user_profiles as 'user_id' (Auth ID)
    const { data: profileByAuthId, error: errorByAuthId } = await supabase
        .from('user_profiles')
        .select('id, user_id, full_name, email')
        .eq('user_id', historyUserId)
        .maybeSingle();

    if (profileByAuthId) {
        console.log('MATCH FOUND: history.user_id matches user_profiles.user_id (Auth ID)');
        console.log('Profile:', profileByAuthId);
    } else {
        console.log('NO MATCH: history.user_id does NOT match user_profiles.user_id');
    }
}

checkIds();
