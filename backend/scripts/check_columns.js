const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../config.env') });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkColumns() {
    console.log("🔍 Checking 'user_profiles' columns...");
    const { data: users, error: userError } = await supabase.from('user_profiles').select('*').limit(1);
    if (userError) console.error("Error users:", userError);
    else if (users.length > 0) console.log("User Keys:", Object.keys(users[0]));
    else console.log("User table empty or valid");

    console.log("\n🔍 Checking 'user_payment_subscriptions' columns...");
    const { data: subs, error: subError } = await supabase.from('user_payment_subscriptions').select('*').limit(1);
    if (subError) console.error("Error subs:", subError);
    else if (subs.length > 0) console.log("Sub Keys:", Object.keys(subs[0]));
    else console.log("Sub table empty or valid");
}

checkColumns();
