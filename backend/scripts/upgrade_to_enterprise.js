const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../.env' }); // Adjust path to .env if running from backend/scripts

async function upgradeUserToEnterprise() {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
        console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment variables.');
        // Try to load from default .env if not found (fallback logic)
        // But usually process.env is enough if we run with `node --env-file=.env` or dotenv config
        process.exit(1);
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const targetUserId = '77ec1d2e-ba61-4f42-b357-f4649c9cc245';

    // Enterprise Plan Details
    const LEADS_BALANCE = 900000;
    const EXPIRATION_DATE = '2099-12-31T23:59:59.999Z';

    // 0. Fetch Enterprise Plan ID
    console.log('🔍 Fetching Enterprise plan details...');
    const { data: plans, error: plansError } = await supabase
        .from('payment_plans')
        .select('*');

    if (plansError) throw new Error(`Error fetching plans: ${plansError.message}`);

    // console.log('Available plans:', plans.map(p => ({ id: p.id, name: p.name, display_name: p.display_name })));

    const enterprisePlan = plans.find(p =>
        p.name?.toLowerCase().includes('enterprise') ||
        p.display_name?.toLowerCase().includes('enterprise') ||
        p.price_cents === 99700 // Fallback to price check
    );

    if (!enterprisePlan) {
        throw new Error('❌ Enterprise plan not found in database.');
    }

    const PLAN_ID = enterprisePlan.id;
    console.log(`✅ Found Enterprise Plan: ${enterprisePlan.display_name} (ID: ${PLAN_ID})`);

    console.log(`🚀 Starting manual upgrade for user: ${targetUserId}`);

    try {
        // 1. Check if subscription exists
        const { data: existingSubscription, error: fetchError } = await supabase
            .from('user_payment_subscriptions')
            .select('*')
            .eq('user_id', targetUserId)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "Row not found"
            throw new Error(`Error fetching subscription: ${fetchError.message}`);
        }

        let result;

        if (existingSubscription) {
            console.log('📝 Found existing subscription. Updating...');
            const { data, error } = await supabase
                .from('user_payment_subscriptions')
                .update({
                    plan_id: PLAN_ID,
                    leads_balance: LEADS_BALANCE,
                    current_period_end: EXPIRATION_DATE,
                    status: 'active',
                    updated_at: new Date().toISOString()
                })
                .eq('id', existingSubscription.id)
                .select()
                .single();

            if (error) throw error;
            result = data;
        } else {
            console.log('🆕 No existing subscription found. Creating new one...');
            const { data, error } = await supabase
                .from('user_payment_subscriptions')
                .insert({
                    user_id: targetUserId,
                    plan_id: PLAN_ID,
                    leads_balance: LEADS_BALANCE,
                    current_period_end: EXPIRATION_DATE,
                    status: 'active',
                    current_period_start: new Date().toISOString(),
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .select()
                .single();

            if (error) throw error;
            result = data;
        }

        console.log('✅ Success! User upgraded to Enterprise Plan.');
        console.log('DETAILS:', {
            id: result.id,
            plan_id: result.plan_id,
            leads_balance: result.leads_balance,
            current_period_end: result.current_period_end,
            status: result.status
        });

    } catch (error) {
        console.error('❌ Error upgrading user:', error.message);
        process.exit(1);
    }
}

upgradeUserToEnterprise();
